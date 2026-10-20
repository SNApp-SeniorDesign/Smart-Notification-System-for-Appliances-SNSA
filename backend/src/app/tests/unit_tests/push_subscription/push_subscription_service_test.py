from sqlalchemy.orm import Session

from app.schemas.push_subscription import (
    PushSubscriptionCreate,
    PushSubscriptionKeys,
)
from app.services.push_subscription import push_subscription_service


#Get

def test_get_by_endpoint(
    db: Session,
    push_subscription,
):
    result = push_subscription_service.get_by_endpoint(
        db,
        push_subscription.endpoint,
    )

    assert result is not None
    assert result.id == push_subscription.id
    assert result.user_id == push_subscription.user_id
    assert result.endpoint == push_subscription.endpoint
    assert result.p256dh == push_subscription.p256dh
    assert result.auth == push_subscription.auth

def test_get_all_subscription(
    db: Session,
    user,
    push_subscription,
    another_push_subscription,
):
    result = push_subscription_service.get_all_subscriptions(
        db,
        user.id,
    )
    assert len(result) == 2

    actual_endpoints = {
        subscription.endpoint for subscription in result
    }

    expected_endpoints = {
        push_subscription.endpoint,
        another_push_subscription.endpoint,
    }
    
    assert actual_endpoints == expected_endpoints
    assert all(subscription.user_id == user.id for subscription in result)
# Post
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


# Update
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


# delete


def test_delete_subscription(
    db: Session,
    user,
    push_subscription,
):
    endpoint = push_subscription.endpoint

    result = push_subscription_service.delete_subscription(
        db,
        endpoint,
        user.id,
    )

    assert result is None
    deleted_subscription = push_subscription_service.get_by_endpoint(
        db,
        endpoint,
    )

    assert deleted_subscription is None
