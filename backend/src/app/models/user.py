from sqlalchemy import Column, Integer, String
from app.core.database import Base
from sqlalchemy.orm import relationship


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    # Accessing list of device associated with the user
    devices = relationship("Device", back_populates="user", cascade="all,delete-orphan")

    # token version for invalidating tokens when user log-in
    token_version = Column(Integer, nullable=False, default=0)
