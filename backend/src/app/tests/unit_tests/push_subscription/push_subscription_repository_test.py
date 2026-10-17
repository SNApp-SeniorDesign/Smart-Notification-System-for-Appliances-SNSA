from sqlalchemy.orm import Session

from app.models.push_subscription import PushSubscription
from app.repository.push_subcription import PushSubscriptionRepository
from app.schemas.push_subscription import (
    PushSubscriptionCreate,
    PushSubscriptionKeys,
)


# Get
def test_get_by_endpoint(db: Session, user):
    endpoint = "https://example.com/push/test-endpoint"

    subscription = PushSubscription(
        user_id=user.id,
        endpoint=endpoint,
        p256dh="test-p256dh-key",
        auth="test-auth-key",
    )

    db.add(subscription)
    db.commit()
    db.refresh(subscription)

    result = PushSubscriptionRepository.get_by_endpoint(db, endpoint)

    assert result is not None
    assert result.id == subscription.id
    assert result.user_id == subscription.user_id
    assert result.endpoint == endpoint
    assert result.p256dh == "test-p256dh-key"
    assert result.auth == "test-auth-key"


# Post


def test_create_subscription(db: Session, user):
    data = PushSubscriptionCreate(
        endpoint="https://example.com/push/new-endpoint",
        keys=PushSubscriptionKeys(
            p256dh="new-p256dh-key",
            auth="new-auth-key",
        ),
    )

    subscription = PushSubscriptionRepository.create_subscription(db, data, user.id)

    assert subscription is not None
    assert subscription.user_id == user.id
    assert subscription.endpoint == "https://example.com/push/new-endpoint"
    assert subscription.p256dh == "new-p256dh-key"
    assert subscription.auth == "new-auth-key"
