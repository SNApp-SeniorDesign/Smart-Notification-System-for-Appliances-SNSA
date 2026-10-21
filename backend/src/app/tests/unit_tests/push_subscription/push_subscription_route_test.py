from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from unittest.mock import patch

from app.models.push_subscription import PushSubscription

#Post
def test_create_subscription(
    client: TestClient,
    headers,
    db: Session,
    user,
):
    endpoint = "https://example.com/push/route-endpoint"

    response = client.post(
        "/notifications/subscribe",
        json={
            "endpoint": endpoint,
            "keys": {
                "p256dh": "route-p256dh-key",
                "auth": "route-auth-key",
            },
        },
        headers=headers,
    )

    assert response.status_code == 201
    data = response.json()

    assert data["message"] == "Push subscription created successfully"
    assert data["subscription_id"] is not None

    subscription = (
        db.query(PushSubscription)
        .filter(PushSubscription.endpoint == endpoint)
        .first()
    )

    assert subscription is not None
    assert subscription.user_id == user.id
    assert subscription.p256dh == "route-p256dh-key"
    assert subscription.auth == "route-auth-key"


@patch(
    "app.routes.push_subscription.push_notification_service.send_notification",
    return_value = 2,
)
def test_send_test_notification(
    mock_send_notification,
    client: TestClient,
    headers,
):
    response = client.post(
        "/notifications/test",
        json={
            "title": "Washing Machine Finished",
            "body": "Your washing machine has completed its cycle.",
            "device_id": 1,
            "device_name": "Kitchen SNSA",
            "sound_name": "Washer Done",
            "url": "/dashboard",
            "icon": "/icon-192.png",
        },
        headers=headers,
    )

    assert response.status_code == 200

    data=response.json()

    assert data["message"] == "Test notification sent successfully"
    assert data ["sent_count"] == 2

    mock_send_notification.assert_called_once()

#Delete
def test_delete_subscription(
    client: TestClient,
    headers,
    db:Session,
    push_subscription,
):
    endpoint = push_subscription.endpoint

    response = client.request(
        "DELETE",
        "/notifications/unsubscribe",
        json={"endpoint": endpoint},
        headers=headers,
    )

    assert response.status_code == 204

    deleted_subscription = (
        db.query(PushSubscription)
        .filter(PushSubscription.endpoint == endpoint)
        .first()
    )

    assert deleted_subscription is None