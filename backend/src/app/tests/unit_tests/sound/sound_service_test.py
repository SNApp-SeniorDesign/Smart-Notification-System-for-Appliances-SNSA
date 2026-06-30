import pytest
from unittest.mock import Mock
from fastapi import HTTPException

from app.services.sound import SoundService


@pytest.fixture
def service():
    services = SoundService()
    services.repository = Mock()
    return services


@pytest.fixture
def db():
    return Mock()


# Get


def test_is_sound_name_taken_success(service, db):
    service.repository.is_sound_name_taken.return_value = object()
    result = service.is_sound_name_taken(db, "testSound")
    assert result is True
    service.repository.get_by_sound_name.assert_called_once_with(db, "testSound")


def test_is_sound_name_taken_fail(service, db):
    service.repository.get_by_sound_name.return_value = None
    result = service.is_sound_name_taken(db, "nonexistsound")
    service.repository.get_by_sound_name.assert_called_once_with(db, "nonexistsound")
    assert result is False


def test_get_by_sound_name_success(service, db):
    fake_sound = Mock(sound_name="testsound")
    service.repository.get_by_sound_name.return_value = fake_sound
    result = service.get_by_sound_name(db, "testsound")
    assert fake_sound == result


def test_get_sound_name_fail(service, db):
    service.repository.get_by_sound_name.return_value = None

    with pytest.raises(HTTPException) as exc_info:
        service.get_by_sound_name(db, "notexistSound")

    service.repository.get_by_sound_name.assert_called_once_with(db, "notexistSound")

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
