from sqlalchemy.orm import Session

from app.models.device import Device


class DeviceRepository:
    "read"

    @staticmethod
    def get_by_id(db: Session, device_id: int) -> Device | None:
        return db.query(Device).filter(Device.id == device_id, Device.user_id).first()
