from sqlalchemy.orm import Session

from app.models.sound import Sound
from app.schemas.event import EventMessage
from app.schemas.push_notification import PushNotificationData
from app.services.device import device_service
from app.services.push_notification import push_notification_service
from app.services.sound import sound_service

class EventService:
    def process_sound_detection(
        self,
        db: Session,
        event_message: EventMessage,
    ) -> int:
        if event_message.event != "sound_detected":
            return 0
        
        device = device_service.get_by_serial_number(
            db,
            event_message.deviceID,
        )

        sound = sound_service.get_by_sound_name(
            db,
            event_message.soundName,
            device.id,
        )

        if not sound.is_on:
            return 0
        
        notification = PushNotitificationsData(
            title=f"{sound.sound_name} Detected",
            body=(
                f'{sound.sound_name} was detected by '
                f'"{device.device_name}".', 
            ),
            device_id=device.id,
            device_name=device.device_name,
            sound_name=sound.sound_name,
            url="/dashboard",
        )

        return push_notification_service.send_notification(
            db=db,
            user_id=device.user_id,
            notification=notification,
        )

event_service = EventService()