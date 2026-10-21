from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db

from app.models.user import User
from app.models.push_subscription import PushSubscription

from app.schemas.push_subscription import (
    PushSubscriptionDelete,
    PushSubscriptionCreate
)
from app.schemas.push_notification import PushNotificationData

from app.services.push_notification import push_notification_service
from app.services.push_subscription import push_subscription_service
from app.services.user import user_service

api_router = APIRouter(
    prefix="/notifications",
    tags=["notifications"],
)

#Post
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

@api_router.post(
    "/test",
    status_code=status.HTTP_200_OK,
)
def send_test_notification(
    data: PushNotificationData,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(user_service.get_current_user)],
):
    sent_count = push_notification_service.send_notification(
        db=db,
        user_id=current_user.id,
        notification=data,
    )

    return {
        "message": "Test notification sent successfully",
        "sent_count": sent_count,
    }

#Delete
@api_router.delete(
    "/unsubscribe",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_subscription(
    data: PushSubscriptionDelete,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(user_service.get_current_user)],
) -> None:
    push_subscription_service.delete_subscription(
        db=db,
        endpoint=data.endpoint,
        user_id=current_user.id,
    )

    return None