from sqlalchemy.orm import Session

from app.schemas.device import DeviceDB
from app.models.device import Device


class DeviceRepository:
    "read"

    @staticmethod
    def get_by_id(db: Session, device_id: int) -> Device | None:
        return db.query(Device).filter(Device.id == device_id, Device.user_id).first()

    "post"

    @staticmethod
    def create_device(db: Session, device_db: DeviceDB) -> Device:
        db_device = Device(
            device_name=device_db.device_name,
            serial_number=device_db.serial_number,
        )
        db.add(db_device)
        db.commit()
        db.refresh(db_device)
        return db_device
