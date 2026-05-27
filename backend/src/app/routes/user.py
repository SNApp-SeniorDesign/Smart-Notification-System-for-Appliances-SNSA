from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import Annotated

from app.services.user import user_service
from app.schemas.user import UserResponse as UserSchema
from app.schemas.user import UserCreate
from app.models.user import User as UserModel
from app.repository.user import UserRepository as user_repository

from app.core.database import get_db

api_router = APIRouter(prefix="/users", tags=["users"])

"Post"


@api_router.post(
    "/register", response_model=UserSchema, status_code=status.HTTP_201_CREATED
)
async def register_user(
    user: UserCreate, db: Annotated[Session, Depends(get_db)]
) -> UserSchema:
    return user_service.register_user(db, user)


"Delete"


@api_router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    db: Annotated(Session, Depends(get_db)),
    current_user: Annotated(UserModel, Depends(user_service.get_current_user)),
) -> None:
    user_repository.delete_user(db, current_user)
