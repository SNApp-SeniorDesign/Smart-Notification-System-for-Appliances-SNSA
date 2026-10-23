from unittest.mock import patch

from fastapi.testclient import TestClient

@patch(
    "app.main.event_service.process_sound_detection",
    return_value=1
)
def test_event_trigger_sends_notification(
    mock_process_sound_detection,
    client: TestClient,
):
    response = client.post(
        "/event",
        json={
            "deviceID": "testSerialNumber123",
            "event": "sound_detected",
            "soundName": "testSound",
            "timestamp": "2026-10-21T12:00:00Z",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data ["success"] is True
    assert data ["message"] == "Event received"
    assert data ["notificationsSent"] == 1
    assert "receiveAt" in data

    mock_process_sound_detection.assert_called_once()