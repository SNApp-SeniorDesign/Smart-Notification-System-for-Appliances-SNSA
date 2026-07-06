import pytest
from unittest.mock import Mock
from fastapi import HTTPException, UploadFile
from io import BytesIO
from types import SimpleNamespace

from app.schemas.sound import SoundUpdate


@pytest.fixture
def db():
    return Mock()


# Get


def test_is_sound_name_taken_success(service, db):
    service.repository.get_by_sound_name.return_value = object()
    result = service.is_sound_name_taken(db, "testSound", 1)
    assert result is True
    service.repository.get_by_sound_name.assert_called_once_with(db, "testSound", 1)


def test_is_sound_name_taken_fail(service, db):
    service.repository.get_by_sound_name.return_value = None
    result = service.is_sound_name_taken(db, "nonexistsound", 99999)
    service.repository.get_by_sound_name.assert_called_once_with(
        db, "nonexistsound", 99999
    )
    assert result is False


def test_get_by_sound_name_success(service, db):
    fake_sound = Mock(sound_name="testsound", device_id=1)
    service.repository.get_by_sound_name.return_value = fake_sound
    result = service.get_by_sound_name(db, "testsound", 1)
    assert fake_sound == result


def test_get_sound_name_fail(service, db):
    service.repository.get_by_sound_name.return_value = None

    with pytest.raises(HTTPException) as exc_info:
        service.get_by_sound_name(db, "notexistSound", 99999)

    service.repository.get_by_sound_name.assert_called_once_with(
        db, "notexistSound", 99999
    )

    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Sound not found"


def test_get_all_sound_success(service, db):
    device_id = 1

    fake_set_sounds = [
        Mock("testsound", "test-audio-files/testSound.wav"),
        Mock("Soundtest", "test-audio-files/Soundtest.wav"),
        Mock("Testsound", "test-audio-files/Test123.wav"),
    ]

    service.repository.get_all_sound.return_value = fake_set_sounds

    result = service.get_all_sound(db, device_id)

    service.repository.get_all_sound.assert_called_once_with(db, device_id)

    assert result == fake_set_sounds
    assert len(result) == 3


def test_get_all_sound_empty(service, db):
    device_id = 1

    service.repository.get_all_sound.return_value = []
    result = service.get_all_sound(db, device_id)
    service.repository.get_all_sound.assert_called_once_with(db, device_id)
    assert result == []


def test_get_sound_by_id_success(service, db):
    fake_sound = Mock(id=1)

    service.repository.get_by_id.return_value = fake_sound

    result = service.get_sound_by_id(db, 1)
    service.repository.get_by_id.assert_called_once_with(db, 1)
    assert result == fake_sound


def test_get_sound_by_id_fail(service, db):
    service.repository.get_by_id.return_value = None

    with pytest.raises(HTTPException) as exc_info:
        service.get_sound_by_id(db, 99999)

    service.repository.get_by_id.assert_called_once_with(db, 99999)

    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Sound not found"


# Post


def test_create_sound_success(service, db):

    fake_file = UploadFile(filename="test.wav", file=BytesIO(b"fake audio data"))

    fake_created_sound = Mock()
    service.repository.get_by_sound_name.return_value = None
    service.repository.create_sound.return_value = fake_created_sound

    result = service.create_sound(
        db=db,
        device_id=1,
        sound_name="Microwave Beep",
        file=fake_file,
    )

    assert result == fake_created_sound
    service.repository.create_sound.assert_called_once()

    sound_arg = service.repository.create_sound.call_args.args[1]

    assert sound_arg.device_id == 1
    assert sound_arg.sound_name == "Microwave Beep"
    assert sound_arg.sound_file_url.startswith("/uploads/sounds/")
    assert sound_arg.sound_file_url.endswith(".wav")
    assert sound_arg.sound_status == "monitoring"
    assert sound_arg.is_on is True
    assert sound_arg.is_synced_to_device is False
    assert sound_arg.profile_version == 1


def test_create_sound_no_file_name(service, db):
    fake_file = UploadFile(
        filename="",
        file=BytesIO(b"fake audio data"),
    )
    service.repository.get_by_sound_name.return_value = None
    with pytest.raises(HTTPException) as exc_info:
        service.create_sound(
            db=db, device_id=1, sound_name="Microwave Beep", file=fake_file
        )

    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Sound file is required"

    service.repository.create_sound.assert_not_called()


# Update
def test_update_sound_metada_only(service, db):
    sound = SimpleNamespace(
        id=1,
        device_id=1,
        sound_name="Old Sound Name",
        sound_status="monitoring",
        is_synced_to_device=True,
        profile_version=1,
        sound_file_url="/uploads/sounds/old_sound.wav",
    )

    sound_update = SoundUpdate(
        sound_name="New Sound Name",
        sound_status="detecting",
        is_synced_to_device=False,
    )

    service.repository.sound_update.return_value = sound

    result = service.update_sound(db, sound, sound_update, file=None)

    assert result == sound
    assert sound.sound_name == "New Sound Name"
    assert sound.sound_status == "detecting"
    assert sound.is_synced_to_device is False
    assert sound.profile_version == 1
    assert sound.sound_file_url == "/uploads/sounds/old_sound.wav"
    service.repository.sound_update.assert_called_once_with(db, sound)


def test_update_sound_with_new_file(service, db):
    sound = SimpleNamespace(
        id=1,
        device_id=1,
        sound_name="Old Sound Name",
        sound_status="monitoring",
        is_synced_to_device=True,
        profile_version=1,
        sound_file_url="/uploads/sounds/old_sound.wav",
    )

    sound_update = SoundUpdate(sound_name="New Sound Name")

    file = UploadFile(
        filename="new.wav",
        file=BytesIO(b"fake audio data"),
    )

    service.save_sound_file = Mock(return_value="/uploads/sounds/new_sound.wav")
    service.delete_sound_file = Mock()
    service.repository.sound_update.return_value = sound

    result = service.update_sound(db, sound, sound_update, file)

    assert result == sound
    assert sound.sound_name == "New Sound Name"
    assert sound.sound_status == "monitoring"
    assert sound.is_synced_to_device is False
    assert sound.profile_version == 2
    assert sound.sound_file_url == "/uploads/sounds/new_sound.wav"

    service.save_sound_file.assert_called_once_with(file)
    service.delete_sound_file.assert_called_once_with("/uploads/sounds/old_sound.wav")
    service.repository.sound_update.assert_called_once_with(db, sound)


def test_update_sound_file_missing_filename(service, db):
    sound = SimpleNamespace(
        id=1,
        device_id=1,
        sound_name="Old Sound Name",
        sound_status="monitoring",
        is_synced_to_device=True,
        profile_version=1,
        sound_file_url="/uploads/sounds/old_sound.wav",
    )

    sound_update = SoundUpdate(sound_name="New Sound Name")

    file = UploadFile(
        filename="",
        file=BytesIO(b"fake audio data"),
    )

    service.repository.sound_update.return_value = sound

    with pytest.raises(HTTPException) as exc_info:
        service.update_sound(db, sound, sound_update, file)

    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Sound file is required"

    service.repository.sound_update.assert_not_called()


def test_update_sound_no_changes(service, db):
    sound = SimpleNamespace(
        id=1,
        device_id=1,
        sound_name="Old Sound Name",
        sound_status="monitoring",
        is_synced_to_device=True,
        profile_version=1,
        sound_file_url="/uploads/sounds/old_sound.wav",
    )

    sound_update = SoundUpdate()

    service.repository.sound_update.return_value = sound

    result = service.update_sound(db, sound, sound_update, file=None)

    assert result == sound
    assert sound.sound_name == "Old Sound Name"
    assert sound.sound_status == "monitoring"
    assert sound.is_synced_to_device is True
    assert sound.profile_version == 1
    assert sound.sound_file_url == "/uploads/sounds/old_sound.wav"

    service.repository.sound_update.assert_called_once_with(db, sound)


# Delete


def test_delete_sound(service, db):
    sound = SimpleNamespace(
        id=1,
        device_id=1,
        sound_name="Sound to Delete",
        sound_status="monitoring",
        is_synced_to_device=True,
        profile_version=1,
        sound_file_url="/uploads/sounds/sound_to_delete.wav",
    )

    service.delete_sound_file = Mock()
    service.repository.delete_sound.return_value = None
    result = service.delete_sound(db, sound)

    service.delete_sound_file.assert_called_once_with(
        "/uploads/sounds/sound_to_delete.wav"
    )
    service.repository.delete_sound.assert_called_once_with(db, sound)

    assert result is None
