from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.push_subscription import PushSubscription
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
        "notifications/unsubscribe",
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