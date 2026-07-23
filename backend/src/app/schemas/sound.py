from pydantic import Field, BaseModel
from fastapi import Form
from typing import Literal

SoundStatus = Literal["monitoring", "detecting", "detected", "offline"]
ProcessStatus = Literal[
    "Ready",
    "Recording",
    "Processing",
    "Uploading",
    "Synnchronizing",
    "Complete",
    "Failed",
]


class SoundBase(BaseModel):
    sound_name: str = Field(min_length=1)


class SoundCreate(SoundBase):
    @classmethod
    def as_form(
        cls,
        sound_name: str = Form(...),
    ):
        return cls(sound_name=sound_name)


class SoundResponse(SoundBase):
    id: int
    device_id: int
    sound_file_url: str
    sound_status: SoundStatus
    is_on: bool

    processing_status: str
    is_synced_to_device: bool
    profile_version: int

    model_config = {"from_attributes": True}


class SoundDB(SoundCreate):
    device_id: int
    sound_file_url: str
    is_synced_to_device: bool = False
    sound_status: SoundStatus = "offline"
    profile_version: int = 1


class SoundUpdate(BaseModel):
    sound_name: str | None = None
    sound_status: SoundStatus | None = None
    is_synced_to_device: bool | None = None
    profile_version: int | None = None
    sound_file_url: str | None = None
    processing_status: str | None = None

    @classmethod
    def as_form(
        cls,
        sound_name: str | None = Form(None),
        sound_status: SoundStatus | None = Form(None),
        processing_status: ProcessStatus | None = Form(None),
        sound_file_url: str | None = Form(None),
    ):
        return cls(
            sound_name=sound_name,
            sound_status=sound_status,
            sound_file_url=sound_file_url,
            processing_status=processing_status,
        )
