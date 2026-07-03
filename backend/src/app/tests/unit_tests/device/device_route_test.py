from fastapi.testclient import TestClient
from app.core.auth import create_access_token

from app.repository.sound import SoundRepository
from app.models.sound import Sound


def get_auth_headers(client: TestClient, user):
    token = create_access_token(
        data={"sub": str(user.id), "token_version": user.token_version}
    )
    return {"Authorization": f"Bearer {token}"}


# Post


def test_register_device_success(client: TestClient, db, user):
    headers = get_auth_headers(client, user)

    response = client.post(
        "/device/",
        json={"device_name": "Test Device", "serial_number": "TestSerial123"},
        headers=headers,
    )

    assert response.status_code == 201
    data = response.json()

    assert data["id"] is not None
    assert data["is_paired"] is True
    assert data["device_status"] == "online"
    assert data["device_name"] == "Test Device"
    assert data["serial_number"] == "TestSerial123"
    assert data["user_id"] == user.id


def test_register_device_duplicate_serial(client: TestClient, db, user):
    headers = get_auth_headers(client, user)

    payload = {
        "device_name": "Test Device",
        "serial_number": "TestSerial123",
    }

    client.post("/device/", json=payload, headers=headers)

    response = client.post(
        "/device/",
        json={"device_name": "Another Device", "serial_number": "TestSerial123"},
        headers=headers,
    )
    assert response.status_code == 400
    assert response.json() == {"detail": "Device serial number already registered"}


def test_register_device_duplicate_name(client: TestClient, db, user):
    headers = get_auth_headers(client, user)

    payload = {
        "device_name": "Test Device",
        "serial_number": "TestSerial123",
    }

    client.post("/device/", json=payload, headers=headers)

    response = client.post(
        "/device/",
        json={"device_name": "Test Device", "serial_number": "TestSerial321"},
        headers=headers,
    )
    assert response.status_code == 400
    assert response.json() == {"detail": "Device name already registered"}


def test_register_device_unauthorized(client: TestClient):
    response = client.post(
        "/device/",
        json={
            "device_name": "Test Device",
            "serial_number": "TestSerial123",
        },
    )
    assert response.status_code in {401, 403}


# Get


def test_get_all_devices(client: TestClient, db, user):
    headers = get_auth_headers(client, user)

    client.post(
        "/device/",
        json={"device_name": "Test Device 1", "serial_number": "TestSerial123"},
        headers=headers,
    )
    client.post(
        "/device/",
        json={"device_name": "Test Device 2", "serial_number": "TestSerial456"},
        headers=headers,
    )

    response = client.get("/device/all", headers=headers)

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["device_name"] == "Test Device 1"
    assert data[1]["device_name"] == "Test Device 2"


def test_get_all_devices_empty(client: TestClient, db, user):
    headers = get_auth_headers(client, user)

    response = client.get("/device/all", headers=headers)

    assert response.status_code == 200
    data = response.json()
    assert data == []


def test_get_all_devices_unauthorized(client: TestClient):
    response = client.get("/device/all")
    assert response.status_code in (401, 403)


def test_get_device_by_id_success(client: TestClient, db, user):
    headers = get_auth_headers(client, user)

    device_response = client.post(
        "/device/",
        json={"device_name": "Test Device", "serial_number": "TestSerial123"},
        headers=headers,
    )

    device_id = device_response.json()["id"]
    response = client.get(f"/device/{device_id}", headers=headers)

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == device_id
    assert data["device_name"] == "Test Device"
    assert data["serial_number"] == "TestSerial123"
    assert data["user_id"] == user.id
    assert data["is_paired"] is True
    assert data["device_status"] == "online"


def test_get_device_by_id_fail(client: TestClient, db, user):
    headers = get_auth_headers(client, user)

    response = client.get("/device/9999", headers=headers)

    assert response.status_code == 404
    assert response.json() == {"detail": "Device not found"}


def test_get_device_with_sounds_success(client: TestClient, db, user):
    headers = get_auth_headers(client, user)

    device_response = client.post(
        "/device/",
        json={
            "device_name": "Test Device",
            "serial_number": "TestSerial123",
        },
        headers=headers,
    )

    device_id = device_response.json()["id"]

    expected_sounds = [
        ("Microwave Beep", "/uplodas/sound/microwave.wave"),
        ("Dryer Done", "/uploads/sound/dryer.wav"),
        ("Washer Done", "/uploads/sound/washer.wav"),
    ]

    for sound_name, sound_file_url in expected_sounds:
        SoundRepository.create_sound(
            db,
            Sound(
                device_id=device_id,
                sound_name=sound_name,
                sound_file_url=sound_file_url,
                sound_status="monitoring",
                is_on=True,
                is_synced_to_device=False,
                profile_version=1,
            ),
        )
    response = client.get(
        f"/device/{device_id}/sounds",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()
    assert data["id"] == device_id
    assert data["device_name"] == "Test Device"

    actual_sounds = [
        (sound["sound_name"], sound["sound_file_url"]) for sound in data["sounds"]
    ]

    assert set(actual_sounds) == set(expected_sounds)
