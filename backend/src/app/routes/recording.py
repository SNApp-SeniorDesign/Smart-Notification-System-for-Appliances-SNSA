from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import Annotated

from app.core.database import get_db
from app.models.user import User
from app.schemas.recording import RecordingStartResponse
from app.services.device import device_service
from app.services.recording import recording_service
from app.services.user import user_service

api_router = APIRouter(
    prefix="/recording",
    tags=["Recording"],
)


@api_router.post(
    "/{device_id}/start",
    response_model=RecordingStartResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
def start_recording(
    device_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(user_service.get_current_user)],
) -> RecordingStartResponse:
    device = device_service.get_by_device_id(
        db=db, device_id=device_id, user_id=current_user.id
    )
    result = recording_service.start_recording(device)
    return RecordingStartResponse(**result)
