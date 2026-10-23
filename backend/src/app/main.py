from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, UTC

from app.core.settings import settings
from app.core.database import create_db_tb

from app.routes.user import api_router as user_router
from app.routes.device import api_router as device_router
from app.routes.sound import api_router as sound_router
from app.routes.recording import api_router as recording_router
from app.routes.push_subscription import api_router as push_subscription_router

from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.event import EventMessage
from app.services.event import event_service

FRONTEND_URL = settings.frontend_url


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_tb()
    yield


app = FastAPI(
    title=settings.app_name,
    description="Backend API for Smart Notification System Appliance(SNSA)",
    version=settings.app_version,
    lifespan=lifespan,
)

app.include_router(user_router)
app.include_router(device_router)
app.include_router(sound_router)
app.include_router(recording_router)
app.include_router(push_subscription_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
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
async def eventTrigger(
    event_message: EventMessage,
    db: Annotated[Session, Depends(get_db)]
):
    global latest_event

    print("Received event:", event_message.model_dump())

    latest_event = event_message.model_dump()

    sent_count = event_service.process_sound_detection(
        db,
        event_message,
    )
    return {
        "success": True,
        "message": "Event received",
        "notificationsSent": sent_count,
        "receiveAt": datetime.now(UTC).isoformat(),
    }
    


@app.get("/latest-event")
async def get_latest_event():
    return latest_event
