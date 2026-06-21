from sqlalchemy.orm import Session, joinedload

from app.schemas.device import DeviceDB
from app.models.device import Device


class DeviceRepository:
    "read"

    @staticmethod
    def get_by_id(db: Session, device_id: int, user_id: int) -> Device | None:
        return (
            db.query(Device)
            .filter(Device.id == device_id, Device.user_id == user_id)
            .first()
        )

    @staticmethod
    def get_device_with_sound(
        db: Session, device_id: int, user_id: int
    ) -> Device | None:
        return (
            db.query(Device)
            .options(joinedload(Device.sounds))
            .filter(Device.id == device_id, Device.user_id == user_id)
            .first()
        )

    "post"

    @staticmethod
    def create_device(db: Session, device_db: DeviceDB) -> Device:
        db_device = Device(
            device_name=device_db.device_name,
            serial_number=device_db.serial_number,
            user_id=device_db.user_id,
            is_paired=device_db.is_paired,
            device_status=device_db.device_status,
        )
        db.add(db_device)
        db.commit()
        db.refresh(db_device)
        return db_device
