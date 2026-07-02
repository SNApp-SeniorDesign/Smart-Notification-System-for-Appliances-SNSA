from fastapi.testclient import TestClient
from app.core.auth import create_access_token


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
