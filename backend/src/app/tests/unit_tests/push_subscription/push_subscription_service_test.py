from sqlalchemy.orm import Session

from app.schemas.push_subscription import (
    PushSubscriptionCreate,
    PushSubscriptionKeys,
)

from app.services.push_subscription import push_subscription_service


def test_save_subscription_creates_new_subscription(
    db: Session,
    user,
):
    subscription_data = PushSubscriptionCreate(
        endpoint="https://example.com/push/service-new-endpoint",
        keys=PushSubscriptionKeys(
            p256dh="service-p256dh-key",
            auth="service=auth-key",
        ),
    )

    result = push_subscription_service.save_subscription(
        db,
        subscription_data,
        user.id,
    )

    assert result.id is not None
    assert result.user_id == user.id
    assert result.endpoint == subscription_data.endpoint
    assert result.p256dh == subscription_data.keys.p256dh
    assert result.auth == subscription_data.keys.auth
