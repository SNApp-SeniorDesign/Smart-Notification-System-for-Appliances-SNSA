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
    service.repository.get_by_device_name.assert_called_once_with(db, "TestDevice")
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
    service.repository.get_by_serial_number.assert_called_once_with(
        db, "testSerialNumber123"
    )
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


def test_get_by_serial_number_succcess(service, db):
    fake_device = Mock(serial_number="TestSerialNumber123")
    service.repository.get_by_serial_number.return_value = fake_device
    result = service.get_by_serial_number(db, "TestSerialNumber123")
    assert fake_device == result


def test_get_by_serial_number_fail(service, db):
    service.repository.get_by_serial_number.return_value = None

    with pytest.raises(HTTPException) as exc_info:
        service.get_by_serial_number(db, "TestSerialNumber123")

    service.repository.get_by_serial_number.assert_called_once_with(
        db, "TestSerialNumber123"
    )

    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Device not found"


def test_get_all_device_success(service, db):
    user_id = 1

    fake_set_devices = [
        Mock("testdevice", "testSerialNumber123"),
        Mock("DeviceTest", "SerialNumberTest321"),
        Mock("Testingde", "3456Serialnumb"),
    ]

    service.repository.get_all_by_user.return_value = fake_set_devices

    result = service.get_all_device(db, user_id)

    service.repository.get_all_by_user.assert_called_once_with(db, user_id)

    assert result == fake_set_devices
    assert len(result) == 3


def test_get_all_device_empty(service, db):
    user_id = 1
    service.repository.get_all_by_user.return_value = []
    result = service.get_all_device(db, user_id)
    service.repository.get_all_by_user.assert_called_once_with(db, user_id)
    assert result == []


def test_get_device_by_id_success(service, db):
    fake_device = Mock(id=1)
    service.repository.get_by_id.return_value = fake_device
    result = service.get_by_device_id(db, 1)
    assert result == fake_device


def test_get_device_by_id_fail(service, db):
    service.repository.get_by_id.return_value = None

    with pytest.raises(HTTPException) as exc_info:
        service.get_by_device_id(db, 99999)

    service.repository.get_by_id.assert_called_once_with(db, 99999)

    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Device not found"
