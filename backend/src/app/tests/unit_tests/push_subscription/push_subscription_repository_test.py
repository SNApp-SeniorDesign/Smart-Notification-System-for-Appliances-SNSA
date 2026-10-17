from sqlalchemy.orm import Session

from app.repository.push_subcription import PushSubscriptionRepository
from app.schemas.push_subscription import (
    PushSubscriptionCreate,
    PushSubscriptionKeys,
)


# Get
def test_get_by_endpoint(db: Session, push_subscription):
    result = PushSubscriptionRepository.get_by_endpoint(
        db,
        push_subscription.endpoint,
    )

    assert result is not None
    assert result.id == push_subscription.id
    assert result.user_id == push_subscription.user_id
    assert result.endpoint == push_subscription.endpoint
    assert result.p256dh == push_subscription.p256dh
    assert result.auth == push_subscription.auth


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


# Update


def test_update_subscription(db: Session, user, push_subscription):
    update_data = PushSubscriptionCreate(
        endpoint=push_subscription.endpoint,
        keys=PushSubscriptionKeys(
            p256dh="updated-p256dh-key",
            auth="updated-auth-key",
        ),
    )

    result = PushSubscriptionRepository.update_subscription(
        db,
        push_subscription,
        update_data,
        user.id,
    )

    assert result.id == push_subscription.id
    assert result.user_id == user.id
    assert result.endpoint == push_subscription.endpoint
    assert result.p256dh == "updated-p256dh-key"
    assert result.auth == "updated-auth-key"


# Delete


def test_delete_subscription(db: Session, user, push_subscription):
    endpoint = push_subscription.endpoint

    result = PushSubscriptionRepository.delete_subscription(
        db,
        endpoint,
        user.id,
    )

    assert result is None

    deleted_subscription = PushSubscriptionRepository.get_by_endpoint(
        db,
        endpoint,
    )

    assert deleted_subscription is None
