from fastapi.testclient import TestClient
from app.core.auth import create_access_token


def get_auth_headers(client: TestClient, user):
    token = create_access_token(
        data={"sub": str(user.id), "token_version": user.token_version}
    )
    return {"Authorization": f"Bearer {token}"}


# Post


def test_register_sound_success(client: TestClient, user, device):
    headers = get_auth_headers(client, user)
    data = {"device_id": device.id, "sound_name": "test_sound"}
    file_content = b"test sound content"
    files = {"file": ("test_sound.wav", file_content, "audio/wav")}

    response = client.post("/sound/register", headers=headers, data=data, files=files)
    assert response.status_code == 201
    response_data = response.json()
    assert response_data["sound_name"] == "test_sound"
