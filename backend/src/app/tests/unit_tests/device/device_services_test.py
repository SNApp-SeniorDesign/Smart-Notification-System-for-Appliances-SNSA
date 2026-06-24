import pytest
from unittest.mock import Mock
from app.services.device import DeviceService


@pytest.fixture
def service():
    services = DeviceService()
    services.repository = Mock()
    return services


@pytest.fixture
def db():
    return Mock()


# Get


def test_is_device_name_taken_success(service, db):
    service.repository.is_device_name_taken.return_value = object()
    result = service.is_device_name_taken(db, "TestDevice")
    assert result is True
    service.repository.get_by_device_name.assert_called_once_with(db, "TestDevice")


def test_is_device_name_taken_fail(service, db):
    service.repository.get_by_device_name.return_value = None
    result = service.is_device_name_taken(db, "TestDevice")
    assert result is False
