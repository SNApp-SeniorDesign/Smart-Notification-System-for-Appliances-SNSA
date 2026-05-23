from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserDB


class UserRepository:
    "Read"

    @staticmethod
    def get_by_mail(db: Session, email: str) -> User | None:
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_by_username(db: Session, username: str) -> User | None:
        return db.query(User).filter(User.username == username).first()

    @staticmethod
    def get_by_id(db: Session, user_id: int) -> User | None:
        return db.query(User).filter(User.id == user_id).first()

    "Create"

    @staticmethod
    def create_user(db: Session, user_db: UserDB) -> User:
        db_user = User(
            username=user_db.username,
            email=user_db.email,
            hashed_password=user_db.hashed_password,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    "Update"

    @staticmethod
    def update_user(db: Session, db_user: User) -> User:
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def token_revoke(db: Session, db_user: User) -> User:
        db.user.token_version += 1
        db.commit()
        db.refresh(db_user)
        return db_user

    "Delete"

    @staticmethod
    def delete_user(db: Session, db_user: User) -> None:
        db.delete(db_user)
        db.commit()
        db.refresh(db_user)
