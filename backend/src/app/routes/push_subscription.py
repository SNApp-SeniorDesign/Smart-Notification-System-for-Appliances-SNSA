from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.push_subscription import PushSubscription
from app.schemas.push_subscription import PushSubscriptionCreate
from app.services.push_subscription import push_subscription_service
from app.services.user import user_service

api_router = APIRouter(
    prefix="/notifications",
    tags=["notifications"],
)


@api_router.post(
    "/subscribe",
    status_code=status.HTTP_201_CREATED,
)
def create_subscription(
    data: PushSubscriptionCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(user_service.get_current_user)],
):
    subscription = push_subscription_service.create_subscription(
        db=db,
        data=data,
        user_id=current_user.id,
    )

    return {
        "message": "Push subscription created successfully",
        "subscription_id": subscription.id,
    }