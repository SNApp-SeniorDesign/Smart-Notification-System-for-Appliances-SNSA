from sqlalchemy.orm import Session

from app.repository.sound import SoundRepository
from app.schemas.sound import SoundDB

# Post


def test_create_sound(db: Session, user, device):
    sound_db = SoundDB(
        sound_name="testSound",
        device_id=device.id,
        sound_file_url="test-audio-files/testSound.wav",
    )

    sound = SoundRepository.create_sound(db, sound_db)
    assert sound.id is not None
    assert sound.device_id == device.id
    assert sound.sound_name == "testSound"
    assert sound.is_synced_to_device is False
    assert sound.profile_version == 1
    assert sound.sound_status == "offline"


# Get


def test_get_by_id(db: Session, user, device, sound):
    sound_result = SoundRepository.get_by_id(db, sound.id, sound.device_id)

    assert sound_result is not None
    assert sound_result.id == sound.id
    assert sound_result.sound_name == "testSound"
    assert sound_result.device_id == device.id
    assert sound_result.is_synced_to_device is False
    assert sound_result.profile_version == 1
    assert sound_result.sound_status == "offline"


def test_get_by_id_return_none(db: Session, device):
    sound_result = SoundRepository.get_by_id(db, 9999999, device.id)

    assert sound_result is None
