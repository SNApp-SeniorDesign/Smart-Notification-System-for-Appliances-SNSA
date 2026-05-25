from app.repository.user import UserRepository
from app.schemas.user import UserResponse
from app.core.database import get_db
from app.exceptions.user import user_not_exist, unauthorized
from app.core.auth import verify_token, oauth2_schema


from fastapi import HTTPException, status, Depends
from typing import Annotated

from sqlaalchemy.orm import Session


class userService:
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
        token: Annotated(str, Depends(oauth2_schema)),
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
