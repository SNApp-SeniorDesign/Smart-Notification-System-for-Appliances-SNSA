from app.repository.device import DeviceRepository
from app.models.device import Device
from app.schemas.device import DeviceDB, DeviceCreate, DeviceUpdate
from app.exceptions.device import device_not_exist


from fastapi import HTTPException, status
from sqlalchemy.orm import Session


class DeviceService:
    def __init__(self) -> None:
        self.repository = DeviceRepository

    # Get
    def is_device_name_taken(self, db: Session, device_name: str, user_id: int) -> bool:
        return self.repository.get_by_device_name(db, device_name, user_id) is not None

    def is_serial_number_taken(self, db: Session, serial_number: str) -> bool:
        return self.repository.get_by_serial_number(db, serial_number) is not None

    def get_by_device_name(self, db: Session, device_name: str) -> Device | None:
        user_device = self.repository.get_by_device_name(db, device_name)
        if user_device is None:
            device_not_exist()
        return user_device

    def get_by_serial_number(self, db: Session, serial_number: str) -> Device | None:
        user_device = self.repository.get_by_serial_number(db, serial_number)
        if user_device is None:
            device_not_exist()
        return user_device

    def get_by_device_id(
        self, db: Session, device_id: int, user_id: int
    ) -> Device | None:
        user_device = self.repository.get_by_id(db, device_id, user_id)
        if user_device is None:
            device_not_exist()
        return user_device

    def get_all_device(self, db: Session, user_id: int) -> list[Device] | None:
        user_devices = self.repository.get_all_by_user(db, user_id)
        return user_devices

    def get_device_with_sounds(
        self, db: Session, user_id: int, device_id: int
    ) -> Device | None:
        device = self.get_by_device_id(db, user_id, device_id)
        return self.repository.get_device_with_sounds(db, device.user_id, device.id)

    # Post
    def register_device(
        self, db: Session, user_id: int, device_db: DeviceCreate
    ) -> Device:
        if self.is_device_name_taken(db, device_db.device_name, user_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Device name already registered",
            )
        if self.is_serial_number_taken(db, device_db.serial_number):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Device serial number already registered",
            )

        device_db = DeviceDB(
            device_name=device_db.device_name,
            serial_number=device_db.serial_number,
            user_id=user_id,
            is_paired=True,
            device_status="online",
        )
        return self.repository.create_device(db, device_db)

    # Update
    def update_device(
        self, db: Session, db_device: Device, device_db: DeviceUpdate
    ) -> Device:
        if device_db.device_name:
            db_device.device_name = device_db.device_name
        if device_db.device_status:
            db_device.device_status = device_db.device_status
        if device_db.is_paired is not None:
            db_device.is_paired = device_db.is_paired

        return self.repository.update_device(db, db_device)

    def delete_device(self, db: Session, db_device: Device) -> None:
        self.repository.delete_device(db, db_device)


device_service = DeviceService()
