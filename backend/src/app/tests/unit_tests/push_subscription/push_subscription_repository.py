from sqlalchemy.orm import Session

from app.models.push_subscription import PushSubscription
from app.repository.push_subcription import PushSubscriptionRepository


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
    assert result.user_id == subscription.user.id
    assert result.endpoint == endpoint
    assert result.p256dh == "test-p256dh-key"
    assert result.auth == "test-auth-key"
