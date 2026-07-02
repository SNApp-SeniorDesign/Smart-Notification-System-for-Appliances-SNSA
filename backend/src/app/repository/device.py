from sqlalchemy.orm import Session, joinedload

from app.schemas.device import DeviceDB
from app.models.device import Device


class DeviceRepository:
    # read

    @staticmethod
    def get_by_id(db: Session, device_id: int, user_id: int) -> Device | None:
        return (
            db.query(Device)
            .filter(Device.id == device_id, Device.user_id == user_id)
            .first()
        )

    @staticmethod
    def get_by_device_id(db: Session, device_id: int) -> Device | None:
        return db.query(Device).filter(Device.id == device_id).first()

    @staticmethod
    def get_by_device_name(
        db: Session, device_name: str, user_id: int
    ) -> Device | None:
        return (
            db.query(Device)
            .filter(Device.device_name == device_name, Device.user_id == user_id)
            .first()
        )

    @staticmethod
    def get_by_serial_number(db: Session, serial_number: str) -> Device | None:
        return db.query(Device).filter(Device.serial_number == serial_number).first()

    @staticmethod
    def get_device_with_sounds(
        db: Session, device_id: int, user_id: int
    ) -> Device | None:
        return (
            db.query(Device)
            .options(joinedload(Device.sounds))
            .filter(Device.id == device_id, Device.user_id == user_id)
            .first()
        )

    @staticmethod
    def get_all_by_user(db: Session, user_id: int) -> list[Device]:
        return db.query(Device).filter(Device.user_id == user_id).all()

    # post

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

    # Update

    @staticmethod
    def update_device(db: Session, device_db: Device) -> Device | None:
        db.commit()
        db.refresh(device_db)
        return device_db

    # Delete
    @staticmethod
    def delete_device(db: Session, device_db: Device) -> None:
        db.delete(device_db)
        db.commit()
