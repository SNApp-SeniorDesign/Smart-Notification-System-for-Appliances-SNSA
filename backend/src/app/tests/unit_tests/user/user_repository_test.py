from sqlalchemy.orm import Session

from app.repository.user import UserRepository
from app.schemas.user import UserDB


def test_create_user(db: Session):
    user_db = UserDB(
        username="testuser",
        email="test@example.com",
        hashed_password="hashedpassword123",
    )
    user = UserRepository.create_user(db, user_db)
    assert user.id is not None
    assert user.email == "test@example.com"
    assert user.username == "testuser"


def test_delete_user(db: Session):
    user_db = UserDB(
        username="testuser",
        email="test@example.com",
        hashed_password="hashedpassword123",
    )
    created = UserRepository.create_user(db, user_db)
    UserRepository.delete_user(db, created)

    user = UserRepository.get_by_mail(db, "test@example.com")
    assert user is None
