from app.repository.user import UserRepository
from app.schemas.user import UserResponse
from fastapi import HTTPEXception, status
from sqlaalchemy.orm import Session


class userService:
    def __init__(self) -> None:
        self.repository = UserRepository()

    "Get"

    def get_by_mail(self, db: Session, email: str) -> UserResponse | None:
        user_email = self.repository.get_by_mail(db, email)
        if user_email is None:
            raise HTTPEXception(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        return user_email

    def get_by_id(self, db: Session, id: int) -> UserResponse | None:
        user_id = self.repository.get_by_id(db, id)
        if user_id is None:
            raise HTTPEXception(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )
