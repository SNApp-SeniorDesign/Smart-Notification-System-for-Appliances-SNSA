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
