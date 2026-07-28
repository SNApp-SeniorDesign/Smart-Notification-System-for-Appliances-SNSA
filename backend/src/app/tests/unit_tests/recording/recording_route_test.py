from fastapi.testclient import TestClient
from app.core.auth import create_access_token


def get_auth_headers(client: TestClient, user):
    token = create_access_token(
        data={"sub": str(user.id), "token_version": user.token_version}
    )
    return {"Authorization": f"Bearer {token}"}


def test_start_recording_success(client: TestClient, user, device):

    headers = get_auth_headers(client, user)

    response = client.post(
        f"/recording/{device.id}/start",
        headers=headers,
    )

    assert response.status_code == 202
    data = response.json()

    assert data["status"] == "accepted"
    assert data["device_id"] == device.id
