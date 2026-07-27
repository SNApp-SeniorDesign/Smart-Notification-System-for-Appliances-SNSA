from types import SimpleNamespace
from app.services.recording import recording_service


def test_start_recording_success():
    device = SimpleNamespace(
        id=1,
        is_paired=True,
        device_status="online",
    )

    result = recording_service.start_recording(device)

    assert result == {"status": "Recording started"}
