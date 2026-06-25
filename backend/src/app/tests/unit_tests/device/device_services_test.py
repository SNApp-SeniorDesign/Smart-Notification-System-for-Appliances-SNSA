import pytest
from unittest.mock import Mock
from fastapi import HTTPException

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


def test_is_serial_number_taken_success(service, db):
    service.repository.get_by_serial_number.return_value = object()
    result = service.is_serial_number_taken(db, "testSerialNumber123")
    assert result is True
    service.repository.get_by_serial_number.assert_called_once_with(
        db, "testSerialNumber123"
    )


def test_is_serial_number_taken_fail(service, db):
    service.repository.get_by_serial_number.return_value = None
    result = service.is_serial_number_taken(db, "testSerialNumber123")
    assert result is False


def test_get_by_device_name(service, db):
    fake_device = Mock(device_name="testDevice")
    service.repository.get_by_device_name.return_value = fake_device
    result = service.get_by_device_name(db, "testDevice")
    assert fake_device == result


def test_get_by_device_name_fail(service, db):
    service.repository.get_by_device_name.return_value = None

    with pytest.raises(HTTPException) as exc_info:
        service.get_by_device_name(db, "DeviceNotExist")

    service.repository.get_by_device_name.assert_called_once_with(db, "DeviceNotExist")

    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Device not found"
