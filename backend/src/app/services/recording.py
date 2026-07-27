from fastapi import HTTPException, status
from app.models.device import Device


class RecordingService:
    # Action

    def start_recording(seld, device: Device) -> dict[str, str]:
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
        return {"status": "Recording started"}


recording_service = RecordingService()
