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
