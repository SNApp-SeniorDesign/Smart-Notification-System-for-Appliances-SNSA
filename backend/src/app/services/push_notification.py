from pywebpush import webpush
from sqlalchemy.orm import Session

from app.core.settings import settings
from app.schemas.push_notification import PushNotificationData
from app.services.push_subscription import push_subscription_service

class PushNotificationService:
    def __init__(self) -> None:
        self.subscription_service = push_subscription_service
    
    def send_notification(
        self,
        db: Session,
        user_id: int,
        notification: PushNotificationData,
    ) -> int: 
        subscriptions = self.subscription_service.get_all_subscriptions(
            db,
            user_id,
        )

        sent_count = 0

        for subscription in subscriptions:
            subscription_info = {
                "endpoint": subscription.endpoint,
                "keys": {
                    "p256dh": subscription.p256dh,
                    "auth": subscription.auth,
                },
            }

            webpush(
                subscription_info = subscription_info,
                data=notification.model_dump_json(),
                vapid_private_key=settings.vapid_private_key_path,
                vapid_claims={
                    "sub": settings.vapid_claim_email,
                },
            )

            sent_count += 1
        
        return sent_count

push_notification_service = PushNotificationService()