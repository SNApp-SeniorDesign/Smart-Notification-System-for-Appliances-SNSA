from sqlalchemy.orm import Session

from app.repository.user import UserRepository
from app.schemas.user import UserDB

user_db = UserDB(
    username="testuser",
    email="test@example.com",
    hashed_password="hashedpassword123",
)


def test_create_user(db: Session):

    user = UserRepository.create_user(db, user_db)
    assert user.id is not None
    assert user.email == "test@example.com"
    assert user.username == "testuser"


def test_get_by_mail_exists(db: Session):
    UserRepository.create_user(db, user_db)
    user = UserRepository.get_by_mail(db, "test@example.com")
    assert user is not None
    assert user.email == "test@example.com"


def test_get_by_mail_not_exists(db: Session):
    user = UserRepository.get_by_mail(db, "nonexistent@example.com")
    assert user is None


def test_get_by_username_exists(db: Session):
    UserRepository.create_user(db, user_db)
    user = UserRepository.get_by_username(db, "testuser")
    assert user is not None
    assert user.username == "testuser"


def test_get_by_username_not_exists(db: Session):
    user = UserRepository.get_by_username(db, "nonexistent")
    assert user is None


def test_get_by_id_exists(db: Session):
    created = UserRepository.create_user(db, user_db)
    user = UserRepository.get_by_id(db, created.id)
    assert user is not None
    assert user.id == created.id


def test_get_by_id_not_exists(db: Session):
    user = UserRepository.get_by_id(db, 9999)
    assert user is None


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
