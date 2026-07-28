from pydantic import BaseModel


class RecordingStartResponse(BaseModel):
    status: str
    device_id: int
