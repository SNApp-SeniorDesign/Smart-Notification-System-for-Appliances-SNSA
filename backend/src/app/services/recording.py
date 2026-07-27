from fastapi import HTTPException, status
from app.models.device import Device
from typing import Protocol


# FIXME: Fill in this for the real transport protocol for recording
class RecordingTransport(Protocol):
    def start_recording(self, serial_number: str) -> None: ...


class RecordingService:
    # Action
    def __init__(self, transport: RecordingTransport) -> None:
        self.transport = transport

    def start_recording(self, device: Device) -> dict[str, str]:
        if not device.is_paired:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Device is not paired",
            )

        if device.device_status != "online":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Device is offline",
            )

        self.transport.start_recording(device.serial_number)

        return {
            "status": "Recording started",
            "device_id": device.id,
        }


# FIXME: Replace with the real recording Transport
class FakeRecordingTransport:
    def start_recording(self, serial_number: str) -> None:
        return None


fake_recording_transport = FakeRecordingTransport()
recording_service = RecordingService(transport=fake_recording_transport)
