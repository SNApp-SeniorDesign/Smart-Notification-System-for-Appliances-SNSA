from fastapi import APIRouter, status, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.device import device_service
from app.services.user import user_service

from app.schemas.device import DeviceCreate, DeviceResponse

from app.models.user import User

api_router = APIRouter(prefix="/device", tags=["device"])

# Post


@api_router.post(
    "/", response_model=DeviceResponse, status_code=status.HTTP_201_CREATED
)
def create_device(
    data: DeviceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(user_service.get_current_user),
):
    return device_service.register_device(
        db=db, device_db=data, user_id=current_user.id
    )


# Get


@api_router.get(
    "/all", response_model=list[DeviceResponse], status_code=status.HTTP_200_OK
)
def get_all_devices(
    db: Session = Depends(get_db),
    current_user: User = Depends(user_service.get_current_user),
):
    return device_service.get_all_device(db=db, user_id=current_user.id)


@api_router.get(
    "/{device_id}", response_model=DeviceResponse, status_code=status.HTTP_200_OK
)
def get_device_by_id(
    device_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(user_service.get_current_user),
):
    return device_service.get_by_device_id(
        db=db, user_id=current_user.id, device_id=device_id
    )
