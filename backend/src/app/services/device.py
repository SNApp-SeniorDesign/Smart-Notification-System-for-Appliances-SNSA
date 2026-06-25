from app.repository.device import DeviceRepository
from app.schemas.device import DeviceResponse
from app.exceptions.device import device_not_exist

from sqlalchemy.orm import Session


class DeviceService:
    def __init__(self) -> None:
        self.repository = DeviceRepository

    # Get
    def is_device_name_taken(self, db: Session, device_name: str) -> bool:
        return self.repository.get_by_device_name(db, device_name) is not None

    def is_serial_number_taken(self, db: Session, serial_number: str) -> bool:
        return self.repository.get_by_serial_number(db, serial_number) is not None

    def get_by_device_name(
        self, db: Session, device_name: str
    ) -> DeviceResponse | None:
        user_device = self.repository.get_by_device_name(db, device_name)
        if user_device is None:
            device_not_exist()
        return user_device

    def get_by_serial_number(
        self, db: Session, serial_number: str
    ) -> DeviceResponse | None:
        user_device = self.repository.get_by_serial_number(db, serial_number)
        if user_device is None:
            device_not_exist()
        return user_device
