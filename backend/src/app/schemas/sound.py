from pydantic import Field, BaseModel
from typing import Literal

SoundStatus = Literal["monitoring", "detecting", "detected", "offline"]


class SoundBase(BaseModel):
    sound_name: str = Field(min_length=1)


class SoundCreate(SoundBase):
    pass


class SoundResponse(SoundBase):
    id: int
    device_id: int
    sound_file_url: str
    sound_status: SoundStatus
    is_on: bool

    model_config = {"from_attributes": True}


class SoundDB(SoundCreate):
    device_id: int
    is_synced_to_device: bool = False
    sound_status: SoundStatus = "offline"
    profile_version: int = 1


class SoundUpdate(BaseModel):
    sound_name: str | None = None
    sound_status: SoundStatus | None = None
    is_synced_to_device: bool | None = None
    profile_version: int | None = None
