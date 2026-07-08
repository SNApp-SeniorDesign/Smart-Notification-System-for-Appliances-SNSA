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


def test_get_by_id(db: Session, sound):
    sound_result = SoundRepository.get_by_id(db, sound.id)

    assert sound_result is not None
    assert sound_result.id == sound.id
    assert sound_result.sound_name == "testSound"
    assert sound_result.device_id == sound.device_id
    assert sound_result.is_synced_to_device is False
    assert sound_result.profile_version == 1
    assert sound_result.sound_status == "monitoring"


def test_get_by_sound_name(db: Session, sound):
    sound_result = SoundRepository.get_by_sound_name(
        db, sound.sound_name, sound.device_id
    )

    assert sound_result is not None
    assert sound_result.id == sound.id
    assert sound_result.sound_name == "testSound"
    assert sound_result.device_id == sound.device_id
    assert sound_result.is_synced_to_device is False
    assert sound_result.profile_version == 1
    assert sound_result.sound_status == "monitoring"


def test_get_by_id_fail(db: Session, sound):
    sound_result = SoundRepository.get_by_id(db, 99999)

    assert sound_result is None


def test_get_all_sound(db: Session, device):
    expected_sound = [
        ("testsound", "test-audio-files/testSound.wav"),
        ("Soundtest", "test-audio-files/Soundtest.wav"),
        ("Testsound", "test-audio-files/Test123.wav"),
    ]

    for sound_name, sound_file_url in expected_sound:
        SoundRepository.create_sound(
            db,
            SoundDB(
                sound_name=sound_name,
                device_id=device.id,
                sound_file_url=sound_file_url,
            ),
        )

    actual_sound_list = SoundRepository.get_all_sound(db, device.id)

    assert actual_sound_list is not None
    assert len(actual_sound_list) == len(expected_sound)

    actual_sound = [
        (sound.sound_name, sound.sound_file_url) for sound in actual_sound_list
    ]

    assert actual_sound == expected_sound


def test_get_all_unsynced_sound(db: Session, device):
    expected_sound = [
        ("testsound", "test-audio-files/testSound.wav", False),
        ("Soundtest", "test-audio-files/Soundtest.wav", False),
        ("Testsound", "test-audio-files/Test123.wav", False),
    ]

    for sound_name, sound_file_url, is_synced in expected_sound:
        SoundRepository.create_sound(
            db,
            SoundDB(
                sound_name=sound_name,
                device_id=device.id,
                sound_file_url=sound_file_url,
                is_synced_to_device=is_synced,
                sound_status="monitoring",
                is_on=True,
                profile_version=1,
            ),
        )

    SoundRepository.create_sound
    (
        db,
        SoundDB(
            sound_name="SyncedSound",
            device_id=device.id,
            sound_file_url="test-audio-files/SyncedSound.wav",
            is_synced_to_device=True,
            sound_status="monitoring",
            is_on=True,
            profile_version=1,
        ),
    )

    actual_sound_list = SoundRepository.get_all_unsynced_sound(db, device.id)

    assert actual_sound_list is not None
    assert len(actual_sound_list) == len(expected_sound)

    actual_sound = [
        (
            sound.sound_name,
            sound.sound_file_url,
            sound.is_synced_to_device,
        )
        for sound in actual_sound_list
    ]

    assert set(actual_sound) == set(expected_sound)


# Update
def test_update_sound(db: Session, sound):
    sound.sound_name = "modifiedSound"
    sound.sound_status = "online"
    sound.is_synced_to_device = True
    sound.profile_version = 2
    sound.sound_file_url = "new_url/sound_file.wav"

    SoundRepository.sound_update(db, sound)

    sound_new = SoundRepository.get_by_id(db, sound.id)

    assert sound_new is not None

    assert sound_new.sound_name == "modifiedSound"
    assert sound_new.sound_status == "online"
    assert sound_new.is_synced_to_device is True
    assert sound_new.profile_version == 2
    assert sound_new.sound_file_url == "new_url/sound_file.wav"


# Delete


def test_delete_sound(db: Session, sound):
    sound_not = SoundRepository.delete_sound(db, sound)

    assert sound_not is None
