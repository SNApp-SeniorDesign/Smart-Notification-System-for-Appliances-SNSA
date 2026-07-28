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


def test_start_recording_unauthorized(client: TestClient, device):
    response = client.post(
        f"/recording/{device.id}/start",
    )

    assert response.status_code == 401


def test_start_recording_device_not_found(
    client: TestClient,
    user,
):
    headers = get_auth_headers(client, user)

    response = client.post(
        "/recording/99999/start",
        headers=headers,
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Device not found"


def test_start_recording_invalid_device_id(
    client: TestClient,
    user,
):
    headers = get_auth_headers(client, user)

    response = client.post(
        "/recording/not-an-integer/start",
        headers=headers,
    )

    assert response.status_code == 422


def test_start_recording_offline_device(
    client: TestClient,
    db,
    user,
    device,
):
    device.is_paired = True
    device.device_status = "offline"

    db.commit()
    db.refresh(device)

    headers = get_auth_headers(client, user)

    response = client.post(
        f"/recording/{device.id}/start",
        headers=headers,
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "Device is offline"


def test_start_recording_not_paired_device(
    client: TestClient,
    db,
    user,
    device,
):
    device.is_paired = False
    device.device_status = "online"

    db.commit()
    db.refresh(device)

    headers = get_auth_headers(client, user)

    response = client.post(
        f"/recording/{device.id}/start",
        headers=headers,
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "Device is not paired"
