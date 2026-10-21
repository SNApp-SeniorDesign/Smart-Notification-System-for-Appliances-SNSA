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
