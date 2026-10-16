from sqlalchemy.orm import Session

from app.models.push_subscription import PushSubscription


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
