# Device authentication: handoff

Branch: `device-auth` (changes are uncommitted as of 2026-11-06).
All paths below are relative to `backend/src/app/`.

## Goal

A physical SNSA device must prove who it is before its `/event` requests are trusted.
The link between the user and the device is the **MAC address**:

1. The user registers the device in the app with its MAC (`POST /device/`, logged in). This already existed.
2. The device boots and calls `POST /device/claim` with its own MAC. If it matches a registered device, the
   backend returns a unique key **once**. The device stores it (firmware side, handled by Daniel, not in this repo).
3. The device sends `Authorization: Bearer <key>` on every `POST /event`. The backend checks it before running
   the existing event logic.

## Final request flow

```
POST /device/claim {serial_number: "<MAC>"}        no login
  normalize MAC → find device → 404 if none, 409 if already claimed
  key = secrets.token_urlsafe(32) → store SHA-256(key) in device_keys
  → 201 {device_id, device_key}                      plaintext key is sent only here

POST /event  Authorization: Bearer <key>  {deviceID: "<MAC>", event, soundName, timestamp}
  verify_device_key (dependency)
    no header:  REQUIRE_DEVICE_KEY on → 401, off → allowed (legacy)
    header:     normalize deviceID → device → stored hash → hmac.compare_digest → 401 on any mismatch
  → existing flow, unchanged:
    only event == "sound_detected" notifies; soundName must match a Sound of that device; sound must be on
```

---

## Changes, section by section

### 1. `core/device_auth.py` (new): helpers

**What:** Three pure functions:
- `normalize_serial()`: turns any common MAC format (`AA:BB:CC:DD:EE:FF`, `aa-bb-…`, `AABBCCDDEEFF`,
  `aabb.ccdd.eeff`, with or without spaces) into `aa:bb:cc:dd:ee:ff`. Anything that isn't a MAC is only trimmed.
- `generate_device_key()`: `secrets.token_urlsafe(32)`, which gives 256 bits of randomness.
- `hash_device_key()`: SHA-256 hex digest.

**Why:** The user types the MAC in the app and the firmware sends it from code, and the two can differ in case or
separators. Both sides go through the same function so they always match. Non-MAC serials are left alone so
existing data and tests (`testSerialNumber123`, `SNSA-OTHER-001`) don't change. These functions sit in `core/`
next to `core/auth.py` because they're security helpers that don't use the database.

SHA-256 is used instead of argon2 (which passwords use) because the key is 256 random bits and can't be
brute-forced, so a slow hash adds nothing. A fast hash also keeps every `/event` request cheap.

### 2. `models/device_key.py` (new) and `models/__init__.py`: the `device_keys` table

**What:** `DeviceKey` has `id`, `device_id` (FK to `devices.id`, **unique**, `ondelete=CASCADE`),
`key_hash` (String(64)), and `created_at`. It's exported from `models/__init__.py`.

**Why:**
- It's a separate table, so the existing `devices` table didn't change and no migration is needed.
  `create_db_tb()` (`Base.metadata.create_all`) creates the new table on the next startup.
- `create_all` only creates tables for models that have been imported. Adding it to `models/__init__.py`
  makes sure it's always loaded, both in the app and in the test `conftest`.
- `unique=True` on `device_id` means one key per device, enforced by the database. This makes the 409 safe even
  if two claims arrive at the same moment.
- Only the hash is stored, so a database leak doesn't expose usable keys.

### 3. `models/device.py`: relationship to the key

**What:** A `device_key = relationship("DeviceKey", uselist=False, cascade="all, delete-orphan")` on `Device`.

**Why:** Devices are deleted with ORM `db.delete()`. Postgres would cascade through the FK anyway, but SQLite (the
default `DATABASE_URL`) ignores FKs unless they're turned on. The ORM cascade deletes the key with the device on
both databases. This changes the Python model only, not the `devices` table.

### 4. `repository/device_key.py` (new) and `repository/device.py`

**What:**
- `DeviceKeyRepository.get_by_device_id()` and `create_device_key()`, in the same style as the other repositories.
- `DeviceRepository.get_by_serial_number()` now compares case-insensitively (`func.lower(serial_number) == value.lower()`).

**Why:** Repositories only contain queries, as in the rest of the codebase. The case-insensitive lookup covers
devices registered **before** normalization existed (for example a row saved as `AA:BB:CC:DD:EE:FF`), which would
otherwise never match the normalized `aa:bb:…`.

### 5. `services/device.py`: normalize on register and lookup

**What:** `register_device` stores `normalize_serial(serial_number)`. `is_serial_number_taken` and
`get_by_serial_number` normalize their input before querying.

**Why:** This makes the registration MAC and the device's MAC identical. Because `event_service` finds the device
through `device_service.get_by_serial_number(deviceID)`, `/event` gets the same matching without changes to
`services/event.py`. A side benefit: registering the same MAC twice in a different format is now rejected
("Device serial number already registered").

### 6. `services/device_key.py` (new): claim and verify

**What:** `DeviceKeyService` with:
- `claim_device_key(db, serial_number)`: normalize, find the device (404 `Device not found`), reject if a key
  exists (409 `Device key already claimed`), generate a key, store its hash, return
  `{device_id, device_key}`. An `IntegrityError` from the unique constraint (a race) also becomes a 409.
- `verify_device_key(...)`: the FastAPI dependency used by `/event`. It reads the header with
  `HTTPBearer(auto_error=False)`, and its behaviour depends on `settings.require_device_key` (see section 9).

**Why:**
- It follows the existing pattern: `user_service.get_current_user` is also a dependency defined on a service.
- `hmac.compare_digest` takes the same time whether the key is nearly right or completely wrong, so the key can't
  be guessed one character at a time from response times.
- **Every failure returns the same 401** (`Invalid device key`): no key, wrong key, unknown MAC, or another
  device's key. An attacker can't use `/event` to find out which MACs are registered.
- The key is checked against the device named in `deviceID`, so device A's key can't send events as device B.
- `auto_error=False` lets a request without a header through while enforcement is off, instead of FastAPI
  rejecting it automatically.
- The setting is read on **each request**, not once at import, so tests (and a restart with a new `.env`)
  can switch it.

### 7. `routes/device.py` and `schemas/device.py`: `POST /device/claim`

**What:** A new route, `POST /device/claim` → 201, with **no** `get_current_user`. New schemas
`DeviceClaimRequest {serial_number}` and `DeviceClaimResponse {device_id, device_key}`.

**Why:** The device has no user account, so it can't log in. It sits in `routes/device.py` with the other device
endpoints rather than in `main.py`, to keep the routes → services → repository structure.

**Security trade-off:** Whoever claims a registered MAC first gets its key. This is limited because a device must
be registered by its owner first and can only be claimed once. If someone else claims first, there's currently no
way to recover. **Planned follow-up:** an owner-only `DELETE /device/{id}/key` so the user can reset it and the
device can claim again. This also covers a device that loses its stored key.

### 8. `exceptions/device.py`

**What:** `device_key_already_claimed()` (409) and `invalid_device_key()` (401, with `WWW-Authenticate: Bearer`).

**Why:** Same pattern as the existing `device_not_exist()`, so error messages are defined in one place.

### 9. `core/settings.py`: `REQUIRE_DEVICE_KEY`

**What:** `require_device_key: bool = False` (env var `REQUIRE_DEVICE_KEY`).

| Setting | No key sent | Wrong key | Correct key |
|---|---|---|---|
| `false` (default) | allowed (works as before) | 401 | allowed |
| `true` | 401 | 401 | allowed |

**Why:** Devices and the existing test that call `/event` without a key keep working until the firmware is
updated. A key that *is* sent is always checked, so the firmware can be tested for real before enforcement is
on. **To turn it on:** add `REQUIRE_DEVICE_KEY=true` to `.env` (and to the Render environment variables) once
every device sends its key.

### 10. `main.py`

**What:**
- Removed the duplicate `EventMessage` class (and the now-unused `BaseModel` import), so it uses
  `app.schemas.event.EventMessage`.
- `/event` now declares `event_message: Annotated[EventMessage, Depends(device_key_service.verify_device_key)]`.

**Why:** There were two different `EventMessage` classes. `main.py` used its own, while `event_service` was typed
against the schema one. One source of truth avoids them drifting apart. With the dependency, the event body is
validated and authenticated before the endpoint runs, and the endpoint body itself is unchanged.

### 11. Tests: `tests/unit_tests/device/device_key_test.py` (new, 19 cases)

- `normalize_serial`: 5 MAC formats give the same result, and non-MAC values are unchanged.
- Claim: success (and only the hash is stored), unknown MAC gives 404, second claim gives 409, a MAC registered as
  `AA-BB-…` can be claimed as `AABBCCDDEEFF`, and the same MAC in another format can't be registered twice.
- `/event` with the setting **on**: valid key 200, wrong key 401, missing key 401, another device's key 401,
  unknown device 401.
- `/event` with the setting **off**: missing key 200, wrong key 401.
- Event flow after authentication (real `event_service`, push sending mocked): `sound_detected` with a matching
  sound sends 1 notification to the owner, and another event type sends 0.

**Result:** the full suite passes, 187 tests. Note: `conftest.py` hard-codes a local Postgres
(`localhost:5432/snsa_test`) that wasn't running on this machine, so the suite was run against a temporary copy of
`conftest.py` pointed at SQLite. Running it against Postgres is still worth doing.

---

## Not done / follow-ups

- Owner-only key reset (`DELETE /device/{id}/key`), described in section 7.
- Firmware: store the key from `/device/claim` and send `Authorization: Bearer <key>` on `/event` (Daniel).
- Turn on `REQUIRE_DEVICE_KEY=true` after the firmware is updated.
- Unrelated bugs noticed but **not** fixed:
  - `services/device.py` `get_device_with_sounds` calls `get_by_device_id(db, user_id, device_id)` with the
    two IDs swapped (the signature is `db, device_id, user_id`).
  - `services/device.py` `get_by_device_name` calls the repository without the required `user_id`.
  - Several `__pycache__/*.pyc` files are committed to git and change on every test run. They should be in `.gitignore`.
