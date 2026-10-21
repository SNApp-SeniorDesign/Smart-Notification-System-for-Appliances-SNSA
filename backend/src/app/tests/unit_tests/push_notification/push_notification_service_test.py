import json
from unittest.mock import patch

from sqlalchemy.orm import Session

from app.schemas.push_notification import PushNotificationData
from app.services.push_notification import push_notification_service

@patch("app.services.push_notification.webpush")
def test_send_notification_to_all_subscriptions(
    mock_webpush,
    db: Session,
    user,
    push_subscription,
    another_push_subscription,
):
    notification = PushNotificationData(
        title="Washing Machine Finished",
        body="Your washing machine has completed its cycle.",
        device_id=1,
        device_name="Kitchen SNSA",
        sound_name="Washer Done",
    )

    sent_count = push_notification_service.send_notification(
        db,
        user.id,
        notification,
    )

    assert sent_count == 2
    assert mock_webpush.call_count == 2

    sent_endpoints = {
        call.kwargs["subscription_info"]["endpoint"]
        for call in mock_webpush.call_args_list
    }

    expected_endpoints = {
        push_subscription.endpoint,
        another_push_subscription.endpoint,
    }

    assert sent_endpoints == expected_endpoints

    payload = json.loads(
        mock_webpush.call_args_list[0].kwargs["data"]
    )

    assert payload["title"] == "Washing Machine Finished"
    assert payload["body"] == "Your washing machine has completed its cycle."
    assert payload ["device_id"] == 1
    assert payload["device_name"] == "Kitchen SNSA"
    assert payload ["sound_name"] == "Washer Done"