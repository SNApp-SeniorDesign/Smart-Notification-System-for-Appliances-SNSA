from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime

from app.core.settings import settings
from app.core.database import create_db_tb
from app.routes.user import api_router as user_router

NEXT_URL = settings.frontend_url


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


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        NEXT_URL,
    ],
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
