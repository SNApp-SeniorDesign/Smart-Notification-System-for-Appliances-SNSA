from types import SimpleNamespace
from app.services.recording import recording_service
import pytest
from fastapi import HTTPException


def test_start_recording_success():
    device = SimpleNamespace(
        id=1,
        is_paired=True,
        device_status="online",
    )

    result = recording_service.start_recording(device)

    assert result == {"status": "Recording started"}


def test_start_recording_device_not_paired():
    device = SimpleNamespace(
        id=1,
        is_paired=False,
        device_status="online",
    )

    with pytest.raises(HTTPException) as exc_info:
        recording_service.start_recording(device)

    assert exc_info.value.status_code == 409
    assert exc_info.value.detail == "Device is not paired"
