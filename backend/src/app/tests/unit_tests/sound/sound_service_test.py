import pytest
from unittest.mock import Mock

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


def test_get_by_sound_name(service, db):
    fake_sound = Mock(sound_name="testsound")
    service.repository.get_by_sound_name.return_value = fake_sound
    result = service.get_by_sound_name(db, "testsound")
    assert fake_sound == result
