from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import Annotated

from app.services.user import user_service
from app.schemas.user import UserResponse as UserSchema
from app.schemas.user import UserCreate

from app.core.database import get_db

api_router = APIRouter(prefix="/users", tags=["users"])


@api_router.post(
    "/register", response_model=UserSchema, status_code=status.HTTP_201_CREATED
)
async def register_user(
    user: UserCreate, db: Annotated[Session, Depends(get_db)]
) -> UserSchema:
    return user_service.register_user(db, user)
