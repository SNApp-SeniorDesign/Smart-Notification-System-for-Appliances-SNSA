from unittest.mock import patch

from sqlalchemy.orm import Session

from app.schemas.event import EventMessage
from app.services.event import event_service


@patch(
    "app.services.event.push_notification_service.send_notification",
    return_value=1,
)
def test_process_sound_detection(
    mock_send_notification,
    db: Session,
    user,
    device,
    sound,
):
    event_message = EventMessage(
        deviceID=device.serial_number,
        event="sound_detected",
        soundName=sound.sound_name,
        timestamp="2026-10-21T12:00:00Z",
    )

    sent_count = event_service.process_sound_detection(
        db,
        event_message,
    )

    assert sent_count == 1

    mock_send_notification.assert_called_once()

    call_kwargs = mock_send_notification.call_args.kwargs

    assert call_kwargs["user_id"] == user.id

    notification = call_kwargs["notification"]

    assert notification.title == f"{sound.sound_name} Detected"
    assert sound.sound_name in notification.body
    assert notification.device_id == device.id
    assert notification.device_name == device.device_name
    assert notification.sound_name == sound.sound_name