from sqlalchemy.orm import Session

from app.models.push_subscription import PushSubscription
from app.repository.push_subcription import PushSubscriptionRepository
from app.schemas.push_subscription import PushSubscriptionCreate


class PushSubscriptionService:
    def __init__(self) -> None:
        self.repository = PushSubscriptionRepository

    def save_subscription(
        self,
        db: Session,
        data: PushSubscriptionCreate,
        user_id: int,
    ) -> PushSubscription:
        existing_subscription = self.repository.get_by_endpoint(
            db,
            data.endpoint,
        )

        if existing_subscription is not None:
            return self.repository.update_subscription(
                db,
                existing_subscription,
                data,
                user_id,
            )

        return self.repository.create_subscription(
            db,
            data,
            user_id,
        )


push_subscription_service = PushSubscriptionService()
