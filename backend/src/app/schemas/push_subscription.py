from pydantic import BaseModel, Field
from datetime import UTC, datetime

class PushSubscriptionKeys(BaseModel):
    p256dh: str
    auth: str


class PushSubscriptionCreate(BaseModel):
    endpoint: str
    keys: PushSubscriptionKeys

class PushSubscriptionDelete(BaseModel):
    endpoint: str

class PushNotification(BaseModel):
    title: str = Field(
        default="SNSA Appliance Alert",
        min_lnegth=1,
        max_length=100,
    )

    body: str = Field(
        min_length=1,
        max_length=300,
    )

    device_id: int | None = None
    device_name: str | None = None
    sound_name: str | None = None

    detected_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC)
    )

    url: str = "/dashboard"
    icon: str = "/icon-192.png"