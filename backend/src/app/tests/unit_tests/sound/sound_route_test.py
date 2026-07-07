from fastapi.testclient import TestClient
from app.schemas.sound import SoundDB
from app.repository.sound import SoundRepository
from sqlalchemy.orm import Session
# Post


def test_register_sound_success(client: TestClient, headers, device):
    data = {"device_id": device.id, "sound_name": "test_sound"}
    file_content = b"test sound content"
    files = {"file": ("test_sound.wav", file_content, "audio/wav")}
    response = client.post("/sound/register", headers=headers, data=data, files=files)
    assert response.status_code == 201
    response_data = response.json()
    assert response_data["sound_name"] == "test_sound"
    assert response_data["sound_file_url"].startswith("/uploads/sounds/")
    assert response_data["sound_file_url"].endswith(".wav")


def test_register_sound_duplicate_name(client: TestClient, headers, device):
    data = {"device_id": device.id, "sound_name": "test_sound"}
    file_content = b"test sound content"
    files = {"file": ("test_sound.wav", file_content, "audio/wav")}

    first = client.post(
        "/sound/register",
        headers=headers,
        data={
            "sound_name": "test_sound",
            "device_id": device.id,
        },
        files={"file": ("test_sound123.wav", b"test sound content", "audio/wav")},
    )

    assert first.status_code == 201

    response = client.post("/sound/register", headers=headers, data=data, files=files)

    assert response.status_code == 409
    assert response.json() == {"detail": "Sound name already registered"}


def test_register_sound_missing_file(client: TestClient, headers, device):
    response = client.post(
        "/sound/register",
        headers=headers,
        data={
            "device_id": device.id,
            "sound_name": "test_sound",
        },
    )
    assert response.status_code == 422


def test_register_sound_missing_sound_name(client: TestClient, headers, device):
    response = client.post(
        "/sound/register",
        headers=headers,
        data={"device_id": device.id},
        files={"file": ("test.wav", b"test sound content", "audio/wav")},
    )

    assert response.status_code == 422


def test_register_sound_missing_device_id(client: TestClient, headers, device):
    response = client.post(
        "/sound/register",
        headers=headers,
        data={"sound_name": "test_sound"},
        files={"file": ("test.wav", b"test sound content", "audio/wav")},
    )

    assert response.status_code == 422


def test_register_sound_unauthorized(client: TestClient, device):
    response = client.post(
        "/sound/register",
        data={"sound_name": "test_sound", "device_id": device.id},
        files={"file": ("test.wav", b"test sound content", "audio/wav")},
    )

    assert response.status_code == 401


def test_register_sound_device_not_found(client: TestClient, headers):
    response = client.post(
        "/sound/register",
        headers=headers,
        data={"device_id": 99999, "sound_name": "test_sound"},
        files={"file": ("test.wav", b"test sound content", "audio/wav")},
    )

    assert response.status_code == 404


# Get


def test_sound_get_by_id_success(client: TestClient, headers, sound):
    response = client.get(f"/sound/{sound.device_id}/{sound.id}", headers=headers)

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sound.id
    assert data["sound_name"] == "testSound"
    assert data["device_id"] == sound.device_id
    assert data["sound_file_url"] == "test-audio-files/testSound.wav"
    assert data["sound_status"] == "monitoring"
    assert data["is_on"] is True


def test_sound_get_by_id_fail(client: TestClient, headers, device):
    sound_response = client.get(f"/sound/{device.id}/9999", headers=headers)
    assert sound_response.status_code == 404
    assert sound_response.json() == {"detail": "Sound not found"}


def test_get_all_sounds(client: TestClient, headers, device, db: Session):
    sound_names = [
        "Doorbell",
        "Microwave",
        "Washing Machine",
    ]

    created = []

    for name in sound_names:
        sound = SoundDB(
            sound_name=name,
            device_id=device.id,
            sound_file_url=f"/uploads/sounds/{name}.wav",
            is_on=True,
            is_synced_to_device=False,
            profile_version=1,
            sound_status="monitoring",
        )

        created.append(SoundRepository.create_sound(db, sound))

    response = client.get(f"/sound/{device.id}/all", headers=headers)

    assert response is not None
    assert response.status_code == 200

    data = response.json()
    assert len(data) == len(created)
    return_names = {sound["sound_name"] for sound in data}

    assert return_names == {"Doorbell", "Microwave", "Washing Machine"}


def test_get_all_sound_empty(client: TestClient, headers, device):
    response = client.get(f"/sound/{device.id}/all", headers=headers)

    assert response.status_code == 200
    data = response.json()
    assert data == []


def test_get_all_sound_unauthorized(client: TestClient, device):
    response = client.get(f"/sound/{device.id}/all")
    assert response.status_code in (401, 403)


# Update


def test_sound_update(client: TestClient, headers, sound):
    response = client.put(
        f"/sound/{sound.device_id}/{sound.id}/update",
        headers=headers,
        data={
            "sound_name": "New Sound",
            "sound_status": "offline",
        },
        files={"file": ("new.wav", b"new test sound content", "audio/wav")},
    )

    assert response.status_code == 200

    data = response.json()
    assert data["id"] == sound.id
    assert data["sound_name"] == "New Sound"
    assert data["sound_status"] == "offline"

    assert data["is_synced_to_device"] is False
    assert data["profile_version"] == 2
    assert data["sound_file_url"].startswith("/uploads/sounds/")
    assert data["sound_file_url"].endswith(".wav")
