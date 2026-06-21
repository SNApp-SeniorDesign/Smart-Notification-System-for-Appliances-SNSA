from pydantic import Field, BaseModel
from typing import Literal
from app.schemas.sound import SoundResponse

DeviceStatus = Literal["offline", "online", "pairing", "waiting"]


class DeviceBase(BaseModel):
    "Base that contain all repeated element"

    device_name: str = Field(min_length=1)


class DeviceCreate(DeviceBase):
    "Input accepted from the client when creating a device"

    serial_number: str


class DeviceResponse(DeviceCreate):
    "Data returned to the client when a device is requested"

    id: int
    user_id: int
    serial_number: str
    device_status: DeviceStatus
    is_paired: bool

    model_config = {"from_attributes": True}


class DeviceDB(DeviceCreate):
    "Internal schema used by backend before saving to database"

    user_id: int
    is_paired: bool = False
    device_status: DeviceStatus = "offline"


class DeviceUpdate(BaseModel):
    "Fields that are allowed to be modified after device creation"

    device_name: str | None = None
    device_status: DeviceStatus | None = None
    is_paired: bool | None = None


class DeviceWithSounds(DeviceResponse):
    sounds: list[SoundResponse] = []
