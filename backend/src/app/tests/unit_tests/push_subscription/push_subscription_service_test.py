from sqlalchemy.orm import Session

from app.schemas.push_subscription import (
    PushSubscriptionCreate,
    PushSubscriptionKeys,
)
from app.services.push_subscription import push_subscription_service


def test_create_subscription(
    db: Session,
    user,
):
    subscription_data = PushSubscriptionCreate(
        endpoint="https://example.com/push/service-new-endpoint",
        keys=PushSubscriptionKeys(
            p256dh="service-p256dh-key",
            auth="service-auth-key",
        ),
    )

    result = push_subscription_service.create_subscription(
        db,
        subscription_data,
        user.id,
    )

    assert result.id is not None
    assert result.user_id == user.id
    assert result.endpoint == subscription_data.endpoint
    assert result.p256dh == subscription_data.keys.p256dh
    assert result.auth == subscription_data.keys.auth


def test_update_subscription(
    db: Session,
    user,
    push_subscription,
):
    subscription_data = PushSubscriptionCreate(
        endpoint=push_subscription.endpoint,
        keys=PushSubscriptionKeys(
            p256dh="service-updated-p256dh-key",
            auth="service-updated-auth-key",
        ),
    )

    result = push_subscription_service.update_subscription(
        db,
        push_subscription,
        subscription_data,
        user.id,
    )

    assert result.id == push_subscription.id
    assert result.user_id == user.id
    assert result.endpoint == push_subscription.endpoint
    assert result.p256dh == "service-updated-p256dh-key"
    assert result.auth == "service-updated-auth-key"
