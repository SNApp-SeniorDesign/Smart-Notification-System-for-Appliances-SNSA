from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime

from app.core.settings import settings

app = FastAPI(
    title=settings.app_name,
    description="Backend API for Smart Notification System Appliance(SNSA)",
    version=settings.app_version,
)


class EventMessage(BaseModel):
    """Event message model"""

    deviceID: str
    event: str
    soundName: str
    timestamp: str


# temporary storage for event messages
latest_event = {}


@app.post("/event")
async def eventTrigger(event_message: EventMessage):
    global latest_event

    # log the event (for debugging purposes)
    print("Received event: ", event_message.dict())

    # store event (so fonrtend can fetch it)
    latest_event = event_message.dict()

    # return response
    return {
        "success": True,
        "message": "Event received",
        "receiveAt": datetime.utcnow().isoformat(),
    }


@app.get("/latest-event")
async def get_latest_event():
    return latest_event
