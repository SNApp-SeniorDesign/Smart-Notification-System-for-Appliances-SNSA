import pytest
from unittest.mock import Mock, patch
from fastapi import HTTPException
from types import SimpleNamespace

from app.services.device import DeviceService
from app.schemas.device import DeviceCreate, DeviceDB, DeviceUpdate


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
    result = service.is_device_name_taken(db, "TestDevice", 1)
    assert result is True
    service.repository.get_by_device_name.assert_called_once_with(db, "TestDevice", 1)


def test_is_device_name_taken_fail(service, db):
    service.repository.get_by_device_name.return_value = None
    result = service.is_device_name_taken(db, "TestDevice", 9999)
    service.repository.get_by_device_name.assert_called_once_with(
        db, "TestDevice", 9999
    )
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
    fake_device = Mock(id=1, user_id=1)
    service.repository.get_by_id.return_value = fake_device
    result = service.get_by_device_id(db, 1, 1)
    assert result == fake_device


def test_get_device_by_id_fail_user(service, db):
    service.repository.get_by_id.return_value = None

    with pytest.raises(HTTPException) as exc_info:
        service.get_by_device_id(db=db, device_id=99999, user_id=1)

    service.repository.get_by_id.assert_called_once_with(
        db=db, device_id=99999, user_id=1
    )

    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Device not found"


def test_get_device_by_id_fail_device(service, db):
    service.repository.get_by_id.return_value = None

    with pytest.raises(HTTPException) as exc_info:
        service.get_by_device_id(db=db, device_id=1, user_id=99999)

    service.repository.get_by_id.assert_called_once_with(
        db=db, device_id=1, user_id=99999
    )

    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Device not found"


def test_get_device_with_sounds_success(service, db):
    fake_device = Mock(id=1, user_id=100)
    fake_result = Mock()

    service.get_by_device_id = Mock(return_value=fake_device)
    service.repository.get_device_with_sounds.return_value = fake_result

    result = service.get_device_with_sounds(db, 100, 1)

    service.get_by_device_id.assert_called_once_with(db, 100, 1)
    service.repository.get_device_with_sounds.assert_called_once_with(db, 100, 1)
    assert result == fake_result


def test_get_device_with_sound_fail(service, db):
    service.get_by_device_id = Mock(
        side_effect=HTTPException(status_code=404, detail="Device not found")
    )
    with pytest.raises(HTTPException) as exc_info:
        service.get_device_with_sounds(db, 100, 999)

    service.get_by_device_id.assert_called_once_with(db, 100, 999)
    service.repository.get_device_with_sounds.assert_not_called()

    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Device not found"


# Post

device_create = DeviceCreate(device_name="testDevice", serial_number="TestSerialNum123")


def test_register_device_success(service, db):
    created_device = DeviceDB(
        device_name="testDevice",
        serial_number="TestSerialNum123",
        user_id=1,
        is_paired=True,
        device_status="online",
    )

    service.is_device_name_taken = Mock(return_value=False)
    service.is_serial_number_taken = Mock(return_value=False)
    service.repository.create_device.return_value = created_device

    result = service.register_device(db, 1, device_create)

    assert result == created_device

    service.is_device_name_taken.assert_called_once_with(db, "testDevice", 1)
    service.is_serial_number_taken.assert_called_once_with(db, "TestSerialNum123")

    service.repository.create_device.assert_called_once()

    device_arg = service.repository.create_device.call_args.args[1]

    assert device_arg.device_name == "testDevice"
    assert device_arg.serial_number == "TestSerialNum123"
    assert device_arg.user_id == 1
    assert device_arg.is_paired is True
    assert device_arg.device_status == "online"


def test_register_device_name_taken(service, db):
    service.is_device_name_taken = Mock(return_value=True)

    with pytest.raises(HTTPException) as exc_info:
        service.register_device(db, 1, device_create)

    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Device name already registered"

    service.is_device_name_taken.assert_called_once_with(
        db, device_create.device_name, 1
    )


def test_register_device_serial_number_taken(service, db):
    service.is_device_name_taken = Mock(return_value=False)
    service.is_serial_number_taken = Mock(return_value=True)

    with pytest.raises(HTTPException) as exc_info:
        service.register_device(db, 1, device_create)

    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Device serial number already registered"

    service.is_device_name_taken.assert_called_once_with(
        db, device_create.device_name, 1
    )
    service.is_serial_number_taken.assert_called_once_with(
        db, device_create.serial_number
    )


# Update


def test_update_device_all_fields(service, db):

    db_device = SimpleNamespace(
        device_name="testDevice",
        serial_number="TestSerialNum123",
        user_id=1,
        is_paired=True,
        device_status="online",
    )

    device_update = DeviceUpdate(
        device_name="newDeviceName", is_paired=False, device_status="offline"
    )

    service.repository.update_device.return_value = db_device

    result = service.update_device(db, db_device, device_update)

    assert result == db_device

    assert db_device.device_name == "newDeviceName"
    assert db_device.is_paired is False
    assert db_device.device_status == "offline"
    assert db_device.serial_number == "TestSerialNum123"
    assert db_device.user_id == 1

    service.repository.update_device.assert_called_once_with(db, db_device)


def test_update_device_device_name_only(service, db):

    db_device = SimpleNamespace(
        device_name="testDevice",
        serial_number="TestSerialNum123",
        user_id=1,
        is_paired=True,
        device_status="online",
    )

    device_update = DeviceUpdate(device_name="newDeviceName")

    service.repository.update_device.return_value = db_device

    result = service.update_device(db, db_device, device_update)

    assert result == db_device

    assert db_device.device_name == "newDeviceName"
    assert db_device.is_paired is True
    assert db_device.device_status == "online"
    assert db_device.serial_number == "TestSerialNum123"
    assert db_device.user_id == 1

    service.repository.update_device.assert_called_once_with(db, db_device)


def test_update_device_is_paired_only(service, db):

    db_device = SimpleNamespace(
        device_name="testDevice",
        serial_number="TestSerialNum123",
        user_id=1,
        is_paired=True,
        device_status="online",
    )

    device_update = DeviceUpdate(is_paired=False)

    service.repository.update_device.return_value = db_device

    result = service.update_device(db, db_device, device_update)

    assert result == db_device

    assert db_device.device_name == "testDevice"
    assert db_device.is_paired is False
    assert db_device.device_status == "online"
    assert db_device.serial_number == "TestSerialNum123"
    assert db_device.user_id == 1

    service.repository.update_device.assert_called_once_with(db, db_device)


def test_update_device_device_status_only(service, db):

    db_device = SimpleNamespace(
        device_name="testDevice",
        serial_number="TestSerialNum123",
        user_id=1,
        is_paired=True,
        device_status="online",
    )

    device_update = DeviceUpdate(device_status="offline")

    service.repository.update_device.return_value = db_device

    result = service.update_device(db, db_device, device_update)

    assert result == db_device

    assert db_device.device_name == "testDevice"
    assert db_device.is_paired is True
    assert db_device.device_status == "offline"
    assert db_device.serial_number == "TestSerialNum123"
    assert db_device.user_id == 1

    service.repository.update_device.assert_called_once_with(db, db_device)


# Delete


def test_delete_device(service, db):
    fake_sounds = [
        SimpleNamespace(
            id=1,
            sound_name="Doorbell",
            sound_file_url="/uploads/sounds/sound_to_deleteOne.wav",
        ),
        SimpleNamespace(
            id=2,
            sound_name="Microwave",
            sound_file_url="/uploads/sounds/sound_to_deleteTwo.wav",
        ),
        SimpleNamespace(
            id=3,
            sound_name="Washing Machine",
            sound_file_url="/uploads/sounds/sound_to_deleteThree.wav",
        ),
    ]

    db_device = SimpleNamespace(id=1, sounds=fake_sounds)

    service.repository.delete_device = Mock()

    with patch(
        "app.services.device.sound_service.delete_all_sound_files"
    ) as mock_delete_all_sound_files:
        result = service.delete_device(
            db=db,
            db_device=db_device,
        )

    mock_delete_all_sound_files.assert_called_once_with(fake_sounds)

    service.repository.delete_device.assert_called_once_with(db, db_device)
    assert result is None
