from pydantic import BaseModel


class EventMessage(BaseModel):
    deviceID: str
    event: str
    soundName: str
    timestamp: str