from app.schemas.device import DeviceDB
from app.repository.device import DeviceRepository
from sqlalchemy.orm import Session
from app.schemas.sound import SoundDB
from app.repository.sound import SoundRepository

# Read


def test_get_by_id(db: Session, user, device):
    device_response = DeviceRepository.get_by_id(db, user.id, device.id)

    assert device_response is not None
    assert device_response.id == device.id
    assert device_response.user_id == user.id
    assert device_response.device_name == "testDevice"
    assert device_response.serial_number == "testSerialNumber123"
    assert device_response.is_paired is True
    assert device_response.device_status == "online"


def test_get_by_device_id(db: Session, device):
    device_response = DeviceRepository.get_by_device_id(db, device.id)

    assert device_response is not None
    assert device_response.id == device.id
    assert device_response.user_id == device.user_id
    assert device_response.device_name == "testDevice"
    assert device_response.serial_number == "testSerialNumber123"
    assert device_response.is_paired is True
    assert device_response.device_status == "online"


def test_get_by_device_name(db: Session, device):
    device_response = DeviceRepository.get_by_device_name(
        db, device.device_name, device.user_id
    )

    assert device_response is not None
    assert device_response.id == device.id
    assert device_response.user_id == device.user_id
    assert device_response.device_name == "testDevice"
    assert device_response.serial_number == "testSerialNumber123"
    assert device_response.is_paired is True
    assert device_response.device_status == "online"


def test_get_by_serial_number(db: Session, device):
    device_response = DeviceRepository.get_by_serial_number(db, device.serial_number)

    assert device_response is not None
    assert device_response.id == device.id
    assert device_response.user_id == device.user_id
    assert device_response.device_name == "testDevice"
    assert device_response.serial_number == "testSerialNumber123"
    assert device_response.is_paired is True
    assert device_response.device_status == "online"


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


def test_get_device_with_sounds(db: Session, user, device):
    expected_sounds = [
        ("Microwave Beep", "test-audio-files/microwave.wav"),
        ("Washer Done", "test-audio-files/washer.wav"),
        ("Dryer Done", "test-audio-files/dryer.wav"),
    ]

    for sound_name, sound_file_url in expected_sounds:
        SoundRepository.create_sound(
            db,
            SoundDB(
                sound_name=sound_name,
                device_id=device.id,
                sound_file_url=sound_file_url,
            ),
        )
    device_with_sounds = DeviceRepository.get_device_with_sounds(
        db,
        device.id,
        user.id,
    )

    assert device_with_sounds is not None
    assert len(device_with_sounds.sounds) == len(expected_sounds)

    actual_sounds = {
        (sound.sound_name, sound.sound_file_url) for sound in device_with_sounds.sounds
    }

    assert actual_sounds == set(expected_sounds)


def test_get_device_with_sound_fail(db: Session, user, device):
    result = DeviceRepository.get_device_with_sounds(
        db,
        device.id,
        user_id=9999,
    )
    assert result is None


def test_get_all_device(db: Session, user):
    expected_devices = [
        ("testdevice", "testSeriaNumber123"),
        ("DeviceTest", "SerialNumberTest321"),
        ("Testingde", "3456SerialNumb"),
    ]

    for device_name, serial_number in expected_devices:
        DeviceRepository.create_device(
            db,
            DeviceDB(
                device_name=device_name, user_id=user.id, serial_number=serial_number
            ),
        )

    actual_device_list = DeviceRepository.get_all_by_user(db, user.id)

    assert actual_device_list is not None
    assert len(actual_device_list) == len(expected_devices)

    actual_devices = {
        (device.device_name, device.serial_number) for device in actual_device_list
    }

    assert actual_devices == set(expected_devices)


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


# Update


def test_update_device(db: Session, user, device):
    device.device_name = "modifiedDevice"
    device.device_status = "online"
    device.is_paired = True

    DeviceRepository.update_device(db, device)

    device_new = DeviceRepository.get_by_id(db, device.id, device.user_id)

    assert device_new is not None

    assert device_new.device_name == "modifiedDevice"
    assert device_new.device_status == "online"
    assert device_new.is_paired is True


# Delete


def test_delete_device(db: Session, user, device):
    not_device = DeviceRepository.delete_device(db, device)

    assert not_device is None
