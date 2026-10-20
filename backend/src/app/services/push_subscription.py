from sqlalchemy.orm import Session

from app.models.push_subscription import PushSubscription
from app.repository.push_subcription import PushSubscriptionRepository
from app.schemas.push_subscription import PushSubscriptionCreate


class PushSubscriptionService:
    def __init__(self) -> None:
        self.repository = PushSubscriptionRepository

    #Get

    def get_by_endpoint(
        self,
        db: Session,
        endpoint: str,
    ) -> PushSubscription | None:
        return self.repository.get_by_endpoint(
            db,
            endpoint,
        )

    def get_all_subscriptions(
        self,
        db:Session,
        user_id: int,
    ) -> list[PushSubscription]:
        return self.repository.get_all_by_user(
            db,
            user_id,
        )

    # Post
    def create_subscription(
        self,
        db: Session,
        data: PushSubscriptionCreate,
        user_id: int,
    ) -> PushSubscription:
        return self.repository.create_subscription(
            db,
            data,
            user_id,
        )

    # Update
    def update_subscription(
        self,
        db: Session,
        subscription: PushSubscription,
        data: PushSubscriptionCreate,
        user_id: int,
    ) -> PushSubscription:
        return self.repository.update_subscription(
            db,
            subscription,
            data,
            user_id,
        )

    # Delete
    def delete_subscription(
        self,
        db: Session,
        endpoint: str,
        user_id: int,
    ) -> None:
        self.repository.delete_subscription(
            db,
            endpoint,
            user_id,
        )


push_subscription_service = PushSubscriptionService()
