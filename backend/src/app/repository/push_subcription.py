from sqlalchemy.orm import Session

from app.models.push_subscription import PushSubscription
from app.schemas.push_subscription import PushSubscriptionCreate


class PushSubscriptionRepository:
    # Get

    @staticmethod
    def get_by_endpoint(
        db: Session,
        endpoint: str,
    ) -> PushSubscription | None:
        return (
            db.query(PushSubscription)
            .filter(PushSubscription.endpoint == endpoint)
            .first()
        )

    # Post

    @staticmethod
    def create_subscription(
        db: Session,
        data: PushSubscriptionCreate,
        user_id: int,
    ) -> PushSubscription:
        subscription = PushSubscription(
            user_id=user_id,
            endpoint=data.endpoint,
            p256dh=data.keys.p256dh,
            auth=data.keys.auth,
        )

        db.add(subscription)
        db.commit()
        db.refresh(subscription)
        return subscription

    # Update
    @staticmethod
    def update_subscription(
        db: Session,
        subscription: PushSubscription,
        data: PushSubscriptionCreate,
        user_id: int,
    ) -> PushSubscription:
        subscription.user_id = user_id
        subscription.p256dh = data.keys.p256dh
        subscription.auth = data.keys.auth

        db.commit()
        db.refresh(subscription)

        return subscription
