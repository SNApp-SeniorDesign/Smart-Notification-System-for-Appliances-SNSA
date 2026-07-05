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
