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

from app.services.user import user_service
from app.services.sound import sound_service
from app.services.device import device_service

from app.models.device import Device
from app.models.user import User

from app.schemas.sound import SoundResponse, SoundCreate

from app.core.database import get_db

api_router = APIRouter(prefix="/sound", tags=["sound"])

# Dependency to get the current device


def get_current_device(
    device_id: int = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(user_service.get_current_user),
) -> Device | None:
    return device_service.get_by_device_id(db, device_id, current_user.id)


# Post


@api_router.post(
    "/register", response_model=SoundResponse, status_code=status.HTTP_201_CREATED
)
async def register_sound(
    db: Annotated[Session, Depends(get_db)],
    device_current: Annotated[Device, Depends(get_current_device)],
    data: Annotated[SoundCreate, Depends(SoundCreate.as_form)],
    file: Annotated[UploadFile, File(...)],
):
    return sound_service.create_sound(db, device_current.id, data.sound_name, file)
