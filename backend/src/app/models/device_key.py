from datetime import datetime, UTC

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class DeviceKey(Base):
    __tablename__ = "device_keys"

    id = Column(Integer, primary_key=True, index=True)

    # One key per device
    device_id = Column(
        Integer,
        ForeignKey("devices.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    # SHA-256 hex digest, the plaintext key is never stored
    key_hash = Column(String(64), nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(UTC), nullable=False)

    # Relationship with Device
    device = relationship("Device", back_populates="device_key")
