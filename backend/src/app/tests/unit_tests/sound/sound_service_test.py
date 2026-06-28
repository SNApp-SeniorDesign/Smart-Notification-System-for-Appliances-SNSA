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
    result = service.is_sound_name_taken(db, "testSound", 1)
    assert result is True
    service.repository.get_by_sound_name.assert_called_once_with(db, "testSound", 1)
