from fastapi import (
    APIRouter,
    status,
    Depends,
    UploadFile,
    Form,
    File,
)
from sqlalchemy.orm import Session
from typing import Annotated

from app.exceptions.device import device_not_exist
from app.exceptions.sound import sound_not_exist

from app.services.user import user_service
from app.services.sound import sound_service
from app.services.device import device_service

from app.models.device import Device
from app.models.user import User

from app.schemas.sound import SoundResponse, SoundCreate, SoundUpdate

from app.core.database import get_db

api_router = APIRouter(prefix="/sound", tags=["sound"])

# Dependency to get the current device


def get_current_device(
    device_id: int = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(user_service.get_current_user),
) -> Device | None:
    device = device_service.get_by_device_id(db, device_id, current_user.id)

    if device is None:
        device_not_exist()

    return device


def get_current_device_from_query(
    device_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(user_service.get_current_user),
) -> Device | None:
    device = device_service.get_by_device_id(db, device_id, current_user.id)

    if device is None:
        device_not_exist()

    return device


# Post


@api_router.post(
    "/register", response_model=SoundResponse, status_code=status.HTTP_201_CREATED
)
async def register_sound(
    db: Annotated[Session, Depends(get_db)],
    device_current: Annotated[Device, Depends(get_current_device)],
    data: Annotated[SoundCreate, Depends(SoundCreate.as_form)],
    file: Annotated[UploadFile, File(...)],
) -> SoundResponse:
    return sound_service.create_sound(db, device_current.id, data.sound_name, file)


# Get


@api_router.get(
    "/{device_id}/all",
    response_model=list[SoundResponse],
    status_code=status.HTTP_200_OK,
)
async def get_all_sound(
    db: Annotated[Session, Depends(get_db)],
    device_current: Annotated[Device, Depends(get_current_device_from_query)],
) -> list[SoundResponse]:
    return sound_service.get_all_sound(db, device_current.id)


@api_router.get(
    "/{device_id}/{sound_id}",
    response_model=SoundResponse,
    status_code=status.HTTP_200_OK,
)
async def get_sound_by_id(
    sound_id: int,
    db: Annotated[Session, Depends(get_db)],
    device_current: Annotated[Device, Depends(get_current_device_from_query)],
) -> SoundResponse:
    return sound_service.get_sound_by_id(db, sound_id)


@api_router.get(
    "/{device_id}/all/unsynced",
    response_model=list[SoundResponse],
    status_code=status.HTTP_200_OK,
)
async def get_all_unsynced_sound(
    db: Annotated[Session, Depends(get_db)],
    device_current: Annotated[Device, Depends(get_current_device_from_query)],
) -> list[SoundResponse]:
    return sound_service.get_all_unsynced_sound(db, device_current.id)


# Update


@api_router.put(
    "/{device_id}/{sound_id}/update",
    response_model=SoundResponse,
    status_code=status.HTTP_200_OK,
)
def update_sound(
    sound_id: int,
    db: Annotated[Session, Depends(get_db)],
    device_current: Annotated[Device, Depends(get_current_device_from_query)],
    data: Annotated[SoundUpdate, Depends(SoundUpdate.as_form)],
    file: Annotated[UploadFile | None, File()] = None,
) -> SoundResponse | None:
    sound_db = sound_service.get_sound_by_id(db, sound_id)
    if sound_db.device_id != device_current.id:
        sound_not_exist()
    return sound_service.update_sound(db, sound_db, data, file)
