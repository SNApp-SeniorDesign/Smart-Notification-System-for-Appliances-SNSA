from app.repository.user import UserRepository
from app.schemas.user import UserResponse, UserDB, UserCreate, UserUpdate
from app.core.database import get_db
from app.exceptions.user import user_not_exist, unauthorized
from app.core.auth import (
    oauth2_scheme,
    verify_token,
    get_password_hash,
    verify_password,
)

from fastapi import HTTPException, status, Depends
from typing import Annotated

from sqlalchemy.orm import Session


class UserService:
    def __init__(self) -> None:
        self.repository = UserRepository()

    "Get"

    def get_by_mail(self, db: Session, email: str) -> UserResponse | None:
        user_email = self.repository.get_by_mail(db, email)
        if user_email is None:
            user_not_exist()
        return user_email

    def get_by_id(self, db: Session, id: int) -> UserResponse | None:
        user_id = self.repository.get_by_id(db, id)
        if user_id is None:
            user_not_exist
        return user_id

    def is_email_taken(self, db: Session, email: str) -> bool:
        return self.repository.get_by_mail(db, email) is not None

    def is_username_taken(self, db: Session, username: str) -> bool:
        return self.repository.get_by_username(db, username) is not None

    def get_current_user(
        self,
        db: Annotated(Session, Depends(get_db)),
        token: Annotated(str, Depends(oauth2_scheme)),
    ) -> UserResponse | None:
        payload = verify_token(token)
        user_id = payload.get("sub")

        if user_id is None:
            unauthorized()
        token_version = payload.get("token_version")
        if token_version is None:
            unauthorized()
        user = self.repository.get_by_id(db, int(user_id))
        if user is None:
            user_not_exist()

        if user.token_version is not token_version:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has been revokded",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user

    "Post"

    def register_user(self, db: Session, user_db: UserCreate) -> UserResponse:
        if self.is_email_taken(db, user_db.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
        if self.is_username_taken(db, user_db.username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken",
            )

        hashed_password = get_password_hash(user_db.password)
        user_db = UserDB(
            username=user_db.username,
            email=user_db.email,
            hashed_password=hashed_password,
        )
        return self.repository.create_user(db, user_db)

    def authenticate(
        self, db: Session, email: str, password: str
    ) -> UserResponse | None:
        user = self.repository.get_by_mail(db, email)
        if not user or not verify_password(db, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect Email or Passwords",
            )
        return user

    "Update"

    def update_user(
        self, db: Session, db_user: UserResponse, user_db: UserUpdate
    ) -> UserResponse:
        if user_db.username:
            db_user.username = user_db.username
        if user_db.email:
            db_user.email = user_db.email
        if user_db.password:
            db_user.hashed_password = get_password_hash(user_db.password)
        return self.repository.update_user(db, db_user)

    def revoke_tokens(self, db: Session, db_user: UserResponse) -> UserResponse:
        return self.repository.token_revoke(db, db_user)


user_service = UserService()
