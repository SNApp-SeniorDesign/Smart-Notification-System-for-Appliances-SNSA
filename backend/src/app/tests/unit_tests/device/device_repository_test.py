from app.schemas.device import DeviceDB
from app.repository.device import DeviceRepository
from sqlalchemy.orm import Session


# Read


def test_get_by_id(db: Session, user, device):
    device_response = DeviceRepository.get_by_id(db, device.id, user.id)

    assert device_response is not None
    assert device_response.id == device.id
    assert device_response.user_id == user.id
    assert device_response.device_name == "testDevice"
    assert device_response.serial_number == "testSerialNumber123"
    assert device_response.is_paired is False
    assert device_response.device_status == "offline"


def test_get_device_with_sound(db: Session, user, device, sound):
    device_sound = DeviceRepository.get_device_with_sounds(db, device.id, user.id)

    assert device_sound is not None
    assert device_sound.id == device.id
    assert device_sound.user_id == user.id

    assert len(device_sound.sounds) == 1

    loaded_sound = device_sound.sounds[0]

    assert loaded_sound.id == sound.id
    assert loaded_sound.device_id == device.id
    assert loaded_sound.sound_name == "testSound"
    assert loaded_sound.sound_file_url == "test-audio-files/testSound.wav"


# Post


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
