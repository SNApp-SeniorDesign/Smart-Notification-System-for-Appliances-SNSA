from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import Annotated
from fastapi.security import OAuth2PasswordRequestForm

from app.services.user import user_service
from app.schemas.user import UserResponse as UserSchema
from app.schemas.user import UserCreate, Token
from app.models.user import User as UserModel
from app.repository.user import UserRepository as user_repository

from app.core.database import get_db
from app.core.auth import create_access_token

api_router = APIRouter(prefix="/users", tags=["users"])

"Post"


@api_router.post(
    "/register", response_model=UserSchema, status_code=status.HTTP_201_CREATED
)
async def register_user(
    user: UserCreate, db: Annotated[Session, Depends(get_db)]
) -> UserSchema:
    return user_service.register_user(db, user)


@api_router.post("/login", response_model=Token)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[Session, Depends(get_db)],
) -> Token:
    user = user_service.authenticate(
        db, email=form_data.username, password=form_data.password
    )
    access_token = create_access_token(
        data={"sub": str(user.id), "token_version": user.token_version}
    )
    return Token(access_token=access_token, token_type="bearer")


"Delete"


@api_router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[UserModel, Depends(user_service.get_current_user)],
) -> None:
    user_repository.delete_user(db, current_user)
