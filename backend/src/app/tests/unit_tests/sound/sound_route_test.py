from fastapi.testclient import TestClient


# Post


def test_register_sound_success(client: TestClient, headers, device):
    data = {"device_id": device.id, "sound_name": "test_sound"}
    file_content = b"test sound content"
    files = {"file": ("test_sound.wav", file_content, "audio/wav")}
    response = client.post("/sound/register", headers=headers, data=data, files=files)
    assert response.status_code == 201
    response_data = response.json()
    assert response_data["sound_name"] == "test_sound"


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
