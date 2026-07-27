from types import SimpleNamespace
from app.services.recording import RecordingService
import pytest
from fastapi import HTTPException
from unittest.mock import Mock


def test_start_recording_success():
    transport = Mock()
    service = RecordingService(transport)

    device = SimpleNamespace(
        id=1,
        serial_number="SNSA-001",
        is_paired=True,
        device_status="online",
    )

    result = service.start_recording(device)

    transport.start_recording.assert_called_once_with("SNSA-001")

    assert result == {
        "status": "Recording started",
        "device_id": 1,
    }


def test_start_recording_device_not_paired():
    transport = Mock()
    service = RecordingService(transport)

    device = SimpleNamespace(
        id=1,
        serial_number="SNSA-001",
        is_paired=False,
        device_status="online",
    )

    with pytest.raises(HTTPException) as exc_info:
        service.start_recording(device)

    assert exc_info.value.status_code == 409
    assert exc_info.value.detail == "Device is not paired"

    transport.start_recording.assert_not_called()


def test_start_recording_device_offline():
    transport = Mock()
    service = RecordingService(transport)

    device = SimpleNamespace(
        id=1,
        serial_number="SNSA-001",
        is_paired=True,
        device_status="offline",
    )

    with pytest.raises(HTTPException) as exc_info:
        service.start_recording(device)

    assert exc_info.value.status_code == 409
    assert exc_info.value.detail == "Device is offline"

    transport.start_recording.assert_not_called()


def test_start_recording_transport_failure():
    transport = Mock()
    transport.start_recording.side_effect = RuntimeError("Transport unavailable")

    service = RecordingService(transport)

    device = SimpleNamespace(
        id=1,
        serial_number="SNSA-001",
        is_paired=True,
        device_status="online",
    )

    with pytest.raises(
        RuntimeError,
        match="Transport unavailable",
    ):
        service.start_recording(device)
