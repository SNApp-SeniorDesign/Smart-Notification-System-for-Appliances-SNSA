import pytest
from unittest.mock import Mock, call, patch
from fastapi import HTTPException, UploadFile
from io import BytesIO
from types import SimpleNamespace
from pathlib import Path
from app.services.sound import SoundService

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


def test_get_all_unsynced_sound_success(service, db):
    device_id = 1

    fake_sounds = [
        SimpleNamespace(
            id=1,
            sound_name="Doorbell",
            is_synced_to_device=False,
        ),
        SimpleNamespace(
            id=2,
            sound_name="Microwave",
            is_synced_to_device=False,
        ),
        SimpleNamespace(
            id=3,
            sound_name="Washing Machine",
            is_synced_to_device=False,
        ),
    ]

    service.repository.get_all_unsynced_sound.return_value = fake_sounds

    result = service.get_all_unsynced_sound(db, device_id)

    service.repository.get_all_unsynced_sound.assert_called_once_with(db, device_id)

    assert result == fake_sounds
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


def test_create_sound_success(service, db, monkeypatch):
    monkeypatch.setenv("STORAGE_BACKEND", "local")
    
    fake_file = UploadFile(
        filename="test.wav",
        file=BytesIO(b"fake audio data"),
    )

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
            db=db,
            device_id=1,
            sound_name="Microwave Beep",
            file=fake_file,
        )

    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Sound file is required"

    service.repository.create_sound.assert_not_called()

def test_save_sound_file_to_r2(service, monkeypatch):
    monkeypatch.setenv("R2_ACCOUNT_ID", "test-account-id")
    monkeypatch.setenv("R2_ACCESS_KEY_ID", "test-access-key")
    monkeypatch.setenv("R2_SECRET_ACCESS_KEY", "test-secret-key")
    monkeypatch.setenv("R2_BUCKET_NAME", "snsa-sound-files")

    fake_file = UploadFile(
        filename="test/wav",
        file=BytesIO(b"fake audio data"),
    )

    fake_r2_client = Mock()

    with patch(
        "app.services.sound.boto3.client",
        return_value=fake_r2_client,
    ):
        result = service.save_sound_file_to_r2(
            fake_file,
            "test-uuid.wav"
        )
    
    assert result == "sounds/test-uuid.wav"
    fake_r2_client.upload_fileobj.assert_called_once()

    args = fake_r2_client.upload_fileobj.call_args.args

    assert args[1] == "snsa-sound-files"
    assert args[2] == "sounds/test-uuid.wav"

# Update
def test_sound_update_metadata_only(service, db):
    sound = SimpleNamespace(
        id=1,
        device_id=1,
        sound_name="Old Sound Name",
        sound_status="monitoring",
        is_on=True,
        is_synced_to_device=True,
        profile_version=1,
        sound_file_url="/uploads/sounds/old_sound.wav",
    )

    sound_update = SoundUpdate(
        sound_name="New Sound Name",
        sound_status="detecting",
    )

    service.repository.sound_update.return_value = sound

    result = service.update_sound(
        db=db,
        sound=sound,
        sound_db=sound_update,
        file=None,
    )

    assert result == sound


def test_sound_update_with_file(service, db):
    sound = SimpleNamespace(
        id=1,
        device_id=1,
        sound_name="Old Sound Name",
        sound_status="monitoring",
        is_on=True,
        is_synced_to_device=True,
        profile_version=1,
        sound_file_url="/uploads/sounds/old_sound.wav",
    )

    sound_update = SoundUpdate(
        sound_name="New Sound Name",
    )

    file = UploadFile(
        filename="new.wav",
        file=BytesIO(b"fake audio data"),
    )

    service.save_sound_file = Mock(return_value="/uploads/sounds/new_sound.wav")
    service.delete_sound_file = Mock()
    service.repository.sound_update.return_value = sound

    result = service.update_sound(
        db=db,
        sound=sound,
        sound_db=sound_update,
        file=file,
    )

    assert result == sound
    assert sound.sound_name == "New Sound Name"
    assert sound.sound_file_url == "/uploads/sounds/new_sound.wav"
    assert sound.profile_version == 2
    assert sound.is_synced_to_device is False

    service.save_sound_file.assert_called_once_with(file)
    service.delete_sound_file.assert_called_once_with("/uploads/sounds/old_sound.wav")
    service.repository.sound_update.assert_called_once_with(
        db,
        sound,
    )


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


def test_delete_sound_all(service):
    device_id_fake = 1

    fake_sounds = [
        SimpleNamespace(
            id=1,
            sound_name="Doorbell",
            is_synced_to_device=False,
            sound_file_url="/uploads/sounds/sound_to_deleteOne.wav",
            device_id=device_id_fake,
        ),
        SimpleNamespace(
            id=2,
            sound_name="Microwave",
            is_synced_to_device=False,
            sound_file_url="/uploads/sounds/sound_to_deleteTwo.wav",
            device_id=device_id_fake,
        ),
        SimpleNamespace(
            id=3,
            sound_name="Washing Machine",
            is_synced_to_device=False,
            sound_file_url="/uploads/sounds/sound_to_deleteThree.wav",
            device_id=device_id_fake,
        ),
    ]

    service.delete_sound_file = Mock()
    service.repository.delete_all_sound_files.return_value = None
    result = service.delete_all_sound_files(fake_sounds)

    service.delete_sound_file.assert_has_calls(
        [
            call("/uploads/sounds/sound_to_deleteOne.wav"),
            call("/uploads/sounds/sound_to_deleteTwo.wav"),
            call("/uploads/sounds/sound_to_deleteThree.wav"),
        ]
    )
    assert service.delete_sound_file.call_count == 3
    assert result is None


def test_delete_sound_file(tmp_path: Path):
    service = SoundService(upload_dir=tmp_path)

    sound_file = tmp_path / "doorbell.wav"
    sound_file.write_bytes(b"fake wav data")

    assert sound_file.exists()

    service.delete_sound_file("/uploads.sounds/doorbell.wav")

    assert not sound_file.exists()


def test_delete_sound_file_missing_file_does_not_raise(
    tmp_path: Path,
):
    service = SoundService(upload_dir=tmp_path)

    service.delete_sound_file("/uploads/sounds/not-founs.wav")
