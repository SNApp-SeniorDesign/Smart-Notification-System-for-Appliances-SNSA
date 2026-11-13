from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from app.core.device_auth import hash_device_key, normalize_serial
from app.core.settings import settings
from app.repository.device_key import DeviceKeyRepository


def event_payload(device_id: str) -> dict:
    return {
        "deviceID": device_id,
        "event": "sound_detected",
        "soundName": "testSound",
        "timestamp": "2026-10-21T12:00:00Z",
    }


def claim_key(client: TestClient, serial_number: str) -> str:
    response = client.post("/device/claim", json={"serial_number": serial_number})
    assert response.status_code == 201, response.json()
    return response.json()["device_key"]


@pytest.fixture
def require_device_key(monkeypatch):
    monkeypatch.setattr(settings, "require_device_key", True)


# normalize_serial


@pytest.mark.parametrize(
    "raw",
    [
        "AA:BB:CC:DD:EE:FF",
        "aa-bb-cc-dd-ee-ff",
        "AABBCCDDEEFF",
        "aabb.ccdd.eeff",
        "  AA:bb:CC:dd:EE:ff  ",
    ],
)
def test_normalize_serial_mac_formats(raw):
    assert normalize_serial(raw) == "aa:bb:cc:dd:ee:ff"


def test_normalize_serial_leaves_non_mac_unchanged():
    assert normalize_serial("  SNSA-OTHER-001 ") == "SNSA-OTHER-001"


# Claim


def test_claim_device_key_success(client: TestClient, db, device):
    response = client.post(
        "/device/claim", json={"serial_number": device.serial_number}
    )

    assert response.status_code == 201
    data = response.json()
    assert data["device_id"] == device.id
    assert len(data["device_key"]) >= 43

    # Only the hash is stored
    stored_key = DeviceKeyRepository.get_by_device_id(db, device.id)
    assert stored_key.key_hash == hash_device_key(data["device_key"])
    assert stored_key.key_hash != data["device_key"]


def test_claim_device_key_unknown_device(client: TestClient):
    response = client.post("/device/claim", json={"serial_number": "11:22:33:44:55:66"})

    assert response.status_code == 404
    assert response.json() == {"detail": "Device not found"}


def test_claim_device_key_twice(client: TestClient, device):
    claim_key(client, device.serial_number)

    response = client.post(
        "/device/claim", json={"serial_number": device.serial_number}
    )

    assert response.status_code == 409
    assert response.json() == {"detail": "Device key already claimed"}


def test_claim_matches_mac_typed_differently(client: TestClient, headers):
    register_response = client.post(
        "/device/",
        json={"device_name": "Kitchen", "serial_number": "AA-BB-CC-DD-EE-FF"},
        headers=headers,
    )
    assert register_response.status_code == 201
    assert register_response.json()["serial_number"] == "aa:bb:cc:dd:ee:ff"

    response = client.post("/device/claim", json={"serial_number": "AABBCCDDEEFF"})

    assert response.status_code == 201
    assert response.json()["device_id"] == register_response.json()["id"]


def test_register_rejects_same_mac_in_other_format(client: TestClient, headers):
    client.post(
        "/device/",
        json={"device_name": "Kitchen", "serial_number": "AA:BB:CC:DD:EE:FF"},
        headers=headers,
    )

    response = client.post(
        "/device/",
        json={"device_name": "Laundry", "serial_number": "aa-bb-cc-dd-ee-ff"},
        headers=headers,
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "Device serial number already registered"}


# Event with the setting on


@patch("app.main.event_service.process_sound_detection", return_value=1)
def test_event_valid_key(mock_process, client: TestClient, device, require_device_key):
    device_key = claim_key(client, device.serial_number)

    response = client.post(
        "/event",
        json=event_payload(device.serial_number),
        headers={"Authorization": f"Bearer {device_key}"},
    )

    assert response.status_code == 200
    assert response.json()["notificationsSent"] == 1
    mock_process.assert_called_once()


@patch("app.main.event_service.process_sound_detection", return_value=1)
def test_event_wrong_key(mock_process, client: TestClient, device, require_device_key):
    claim_key(client, device.serial_number)

    response = client.post(
        "/event",
        json=event_payload(device.serial_number),
        headers={"Authorization": "Bearer not-the-real-key"},
    )

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid device key"}
    mock_process.assert_not_called()


@patch("app.main.event_service.process_sound_detection", return_value=1)
def test_event_missing_key(
    mock_process, client: TestClient, device, require_device_key
):
    claim_key(client, device.serial_number)

    response = client.post("/event", json=event_payload(device.serial_number))

    assert response.status_code == 401
    mock_process.assert_not_called()


@patch("app.main.event_service.process_sound_detection", return_value=1)
def test_event_key_of_another_device(
    mock_process, client: TestClient, device, another_device, require_device_key
):
    claim_key(client, device.serial_number)
    other_key = claim_key(client, another_device.serial_number)

    response = client.post(
        "/event",
        json=event_payload(device.serial_number),
        headers={"Authorization": f"Bearer {other_key}"},
    )

    assert response.status_code == 401
    mock_process.assert_not_called()


@patch("app.main.event_service.process_sound_detection", return_value=1)
def test_event_unknown_device_is_401(
    mock_process, client: TestClient, require_device_key
):
    response = client.post(
        "/event",
        json=event_payload("11:22:33:44:55:66"),
        headers={"Authorization": "Bearer some-key"},
    )

    assert response.status_code == 401
    mock_process.assert_not_called()


# Event with the setting off (default)


@patch("app.main.event_service.process_sound_detection", return_value=1)
def test_event_missing_key_allowed_when_off(mock_process, client: TestClient, device):
    response = client.post("/event", json=event_payload(device.serial_number))

    assert response.status_code == 200
    mock_process.assert_called_once()


@patch("app.main.event_service.process_sound_detection", return_value=1)
def test_event_wrong_key_rejected_when_off(mock_process, client: TestClient, device):
    claim_key(client, device.serial_number)

    response = client.post(
        "/event",
        json=event_payload(device.serial_number),
        headers={"Authorization": "Bearer not-the-real-key"},
    )

    assert response.status_code == 401
    mock_process.assert_not_called()


# Event flow after authentication is unchanged


@patch("app.services.event.push_notification_service.send_notification", return_value=1)
def test_event_flow_after_auth(
    mock_send, client: TestClient, device, sound, require_device_key
):
    device_key = claim_key(client, device.serial_number)
    auth = {"Authorization": f"Bearer {device_key}"}

    response = client.post(
        "/event", json=event_payload(device.serial_number), headers=auth
    )
    assert response.status_code == 200
    assert response.json()["notificationsSent"] == 1
    mock_send.assert_called_once()
    assert mock_send.call_args.kwargs["user_id"] == device.user_id

    # Other events do not notify
    other_event = event_payload(device.serial_number) | {"event": "heartbeat"}
    response = client.post("/event", json=other_event, headers=auth)
    assert response.status_code == 200
    assert response.json()["notificationsSent"] == 0
    mock_send.assert_called_once()
