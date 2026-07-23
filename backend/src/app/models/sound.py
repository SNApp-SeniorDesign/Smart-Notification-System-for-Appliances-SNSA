from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    ForeignKey,
    DateTime,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class Sound(Base):
    __tablename__ = "sounds"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(
        Integer, ForeignKey("devices.id", ondelete="CASCADE"), nullable=False
    )

    sound_name = Column(String, nullable=False)
    sound_file_url = Column(String, nullable=True)

    last_detected = Column(DateTime(timezone=True))
    sound_status = Column(String, default="monitoring", nullable=False)
    processing_status = Column(String, default="Ready", nullable=False)

    is_on = Column(Boolean, default=True, nullable=False)

    device = relationship("Device", back_populates="sounds")

    is_synced_to_device = Column(Boolean, default=False, nullable=False)
    profile_version = Column(Integer, default=1, nullable=False)
