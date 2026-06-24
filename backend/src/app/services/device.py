from app.repository.device import DeviceRepository
from sqlalchemy.orm import Session


class DeviceService:
    def __init__(self) -> None:
        self.repository = DeviceRepository

    # Get
    def is_device_name_taken(self, db: Session, device_name: str) -> bool:
        return self.repository.get_by_device_name(db, device_name) is not None

    def is_serial_number_taken(self, db: Session, serial_number: str) -> bool:
        return self.repository.get_by_serial_number(db, serial_number) is not None
