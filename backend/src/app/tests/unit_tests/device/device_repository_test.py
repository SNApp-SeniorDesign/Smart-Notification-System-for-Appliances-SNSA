from app.schemas.device import DeviceDB
from app.repository.device import DeviceRepository
from sqlalchemy.orm import Session


"Post"


def test_create_device(db: Session, user):
    device_db = DeviceDB(
        device_name="testDevice", serial_number="testSerialNumber123", user_id=user.id
    )

    device = DeviceRepository.create_device(db, device_db)

    assert device.id is not None
    assert device.user_id == user.id
    assert device.device_name == "testDevice"
    assert device.serial_number == "testSerialNumber123"

    assert device.is_paired is False
    assert device.device_status == "offline"
