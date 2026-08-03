import pytest
from unittest.mock import Mock, patch, call
from fastapi import HTTPException
from types import SimpleNamespace
from pathlib import Path

from app.services.user import UserService
from app.schemas.user import UserCreate, UserUpdate
from app.models.user import User


@pytest.fixture
def service():
    services = UserService()
    services.repository = Mock()
    return services


@pytest.fixture
def db():
    return Mock()


fake_user_email = Mock(email="test@example.com")
fake_user_id = Mock(id=1)
"Get"


def test_get_by_mail_success(service, db):
    service.repository.get_by_mail.return_value = fake_user_email
    result = service.get_by_mail(db, "test@example.com")
    assert result == fake_user_email


def test_get_by_mail_not_found(service, db):
    service.repository.get_by_mail.return_value = None

    with pytest.raises(HTTPException) as exc_info:
        service.get_by_mail(db, "notexist@example.com")

    service.repository.get_by_mail.assert_called_once_with(db, "notexist@example.com")

    assert exc_info.value.status_code == 404


def test_get_by_id_success(service, db):
    service.repository.get_by_id.return_value = fake_user_id
    result = service.get_by_id(db, 1)
    assert result == fake_user_id


def test_get_by_id_not_found(service, db):
    service.repository.get_by_id.return_value = None

    with pytest.raises(HTTPException) as exc_info:
        service.get_by_id(db, 99999)

    service.repository.get_by_id.assert_called_once_with(db, 99999)

    assert exc_info.value.status_code == 404


def test_is_email_taken_success(service, db):
    service.repository.is_email_taken.return_value = object()
    result = service.is_email_taken(db, "test@example.com")
    assert result is True
    service.repository.get_by_mail.assert_called_once_with(db, "test@example.com")


def test_is_email_taken_fail(service, db):
    service.repository.get_by_mail.return_value = None
    result = service.is_email_taken(db, "test@example.com")
    assert result is False


def test_is_username_taken_success(service, db):
    service.repository.is_username_taken.return_value = object()
    result = service.is_username_taken(db, "tester")
    assert result is True
    service.repository.get_by_username.assert_called_once_with(db, "tester")


def test_is_username_taken_fail(service, db):
    service.repository.get_by_username.return_value = None
    result = service.is_username_taken(db, "tester")
    assert result is False


def test_get_current_user_success(service, db):
    user = SimpleNamespace(id=1, token_version=3)
    service.repository.get_by_id.return_value = user

    with patch("app.services.user.verify_token") as mock_verify:
        mock_verify.return_value = {
            "sub": "1",
            "token_version": 3,
        }
        result = service.get_current_user(db, "fake-token")
    assert result == user
    service.repository.get_by_id.assert_called_once_with(db, 1)


def test_get_current_user_missing_sub(service, db):
    with patch("app.services.user.verify_token") as mock_verify:
        mock_verify.return_value = {
            "token_version": 3,
        }
        with pytest.raises(HTTPException) as exc_info:
            service.get_current_user(db, "fake-token")

    assert exc_info.value.status_code == 401


def test_get_current_user_missing_token_version(service, db):
    with patch("app.services.user.verify_token") as mock_verify:
        mock_verify.return_value = {
            "sub": 1,
        }
        with pytest.raises(HTTPException) as exc_info:
            service.get_current_user(db, "fake-token")

    assert exc_info.value.status_code == 401


def test_get_current_user_user_not_found(service, db):
    service.repository.get_by_id.return_value = None

    with patch("app.services.user.verify_token") as mock_verify:
        mock_verify.return_value = {
            "sub": "1",
            "token_version": 3,
        }
        with pytest.raises(HTTPException) as exc_info:
            service.get_current_user(db, "fake-token")
    assert exc_info.value.status_code == 404


def test_get_current_user_revoked_token(service, db):
    user = SimpleNamespace(id=1, token_version=4)
    service.repository.get_by_id.return_value = user

    with patch("app.services.user.verify_token") as mock_verify:
        mock_verify.return_value = {
            "sub": "1",
            "token_version": 3,
        }
        with pytest.raises(HTTPException) as exc_info:
            service.get_current_user(db, "fake-token")
    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Token has been revoked"


"Post"

user_create = UserCreate(
    username="testuser", email="test@example.com", password="plainpassword123"
)


def test_register_user_success(service, db):

    created_user = User(id=1, username="testuser", email="test@example.com")

    service.is_email_taken = Mock(return_value=False)
    service.is_username_taken = Mock(return_value=False)
    service.repository.create_user.return_value = created_user

    with patch("app.services.user.get_password_hash") as mock_hash:
        mock_hash.return_value = "hashedpassword123"
        result = service.register_user(db, user_create)

    assert result == created_user

    service.is_email_taken.assert_called_once_with(db, "test@example.com")
    service.is_username_taken.assert_called_once_with(db, "testuser")
    mock_hash.assert_called_once_with("plainpassword123")

    service.repository.create_user.assert_called_once()


def test_register_user_email_already_exist(service, db):
    service.is_email_taken = Mock(return_value=True)

    with pytest.raises(HTTPException) as exc_info:
        service.register_user(db, user_create)

    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Email already registered"

    service.is_email_taken.assert_called_once_with(db, "test@example.com")


def test_register_user_username_already_exist(service, db):
    service.is_email_taken = Mock(return_value=False)
    service.is_username_taken = Mock(return_value=True)

    with pytest.raises(HTTPException) as exc_info:
        service.register_user(db, user_create)

    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Username already taken"

    service.is_email_taken.assert_called_once_with(db, "test@example.com")
    service.is_username_taken.assert_called_once_with(db, "testuser")


def test_authenticate_success(service, db):
    user = SimpleNamespace(
        username="testuser",
        email="test@example.com",
        hashed_password="hashedpassword123",
    )
    service.repository.get_by_mail.return_value = user

    with patch("app.services.user.verify_password") as mock_verify:
        mock_verify.return_value = True
        result = service.authenticate(db, "test@example.com", "plainpassword123")

    assert user == result

    service.repository.get_by_mail.assert_called_once_with(db, "test@example.com")
    mock_verify.assert_called_once_with("plainpassword123", "hashedpassword123")


def test_authenticate_wrong_user(service, db):
    service.repository.get_by_mail.return_value = None

    with pytest.raises(HTTPException) as exc_info:
        service.authenticate(db, "test@example.com", "plainpassword123")

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Incorrect Email or Passwords"

    service.repository.get_by_mail.assert_called_once_with(db, "test@example.com")


def test_authenticate_wrong_password(service, db):
    user = SimpleNamespace(
        email="test@example.com", hashed_password="hashedpassword123"
    )

    service.repository.get_by_mail.return_value = user

    with patch("app.services.user.verify_password") as mock_verify:
        mock_verify.return_value = False

        with pytest.raises(HTTPException) as exc_info:
            service.authenticate(db, "test@example.com", "plainpassword123")

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Incorrect Email or Passwords"

    mock_verify.assert_called_once_with("plainpassword123", "hashedpassword123")


"Update"


def test_update_user_all_fields(service, db):
    db_user = SimpleNamespace(
        id=1,
        username="olduser",
        email="old@example.com",
        hashed_password="oldhashedpassword",
    )

    user_update = UserUpdate(
        username="newuser", email="new@example.com", password="newpassword123"
    )

    service.repository.update_user.return_value = db_user

    with patch("app.services.user.get_password_hash") as mock_hash:
        mock_hash.return_value = "newhashedpassword"

        result = service.update_user(db, db_user, user_update)

    assert result == db_user

    assert db_user.username == "newuser"
    assert db_user.email == "new@example.com"
    assert db_user.hashed_password == "newhashedpassword"

    mock_hash.assert_called_once_with("newpassword123")
    service.repository.update_user.assert_called_once_with(db, db_user)


def test_update_user_email_only(service, db):

    db_user = SimpleNamespace(
        id=1,
        username="olduser",
        email="old@example.com",
        hashed_password="oldhashedpassword",
    )

    user_update = UserUpdate(email="new@example.com")

    service.repository.update_user.return_value = db_user
    result = service.update_user(db, db_user, user_update)

    assert result is db_user

    assert db_user.username == "olduser"
    assert db_user.email == "new@example.com"
    assert db_user.hashed_password == "oldhashedpassword"

    service.repository.update_user.assert_called_once_with(db, db_user)


def test_update_user_username_only(service, db):

    db_user = SimpleNamespace(
        id=1,
        username="olduser",
        email="old@example.com",
        hashed_password="oldhashedpassword",
    )

    user_update = UserUpdate(username="newuser")

    service.repository.update_user.return_value = db_user
    result = service.update_user(db, db_user, user_update)

    assert result is db_user

    assert db_user.username == "newuser"
    assert db_user.email == "old@example.com"
    assert db_user.hashed_password == "oldhashedpassword"

    service.repository.update_user.assert_called_once_with(db, db_user)


def test_update_user_password_only(service, db):
    db_user = SimpleNamespace(
        id=1,
        username="olduser",
        email="old@example.com",
        hashed_password="oldhashedpassword",
    )

    user_update = UserUpdate(password="newpassword123")

    service.repository.update_user.return_value = db_user

    with patch("app.services.user.get_password_hash") as mock_hash:
        mock_hash.return_value = "newhashedpassword"

        result = service.update_user(db, db_user, user_update)

    assert result is db_user

    assert db_user.hashed_password == "newhashedpassword"
    assert db_user.username == "olduser"
    assert db_user.email == "old@example.com"

    mock_hash.assert_called_once_with("newpassword123")
    service.repository.update_user.assert_called_once_with(db, db_user)


# Delete


def test_delete_user(service, db):
    device_one_sounds = [
        SimpleNamespace(
            id=1,
            sound_file_url="/uploads/sounds/doorbell.wav",
        ),
        SimpleNamespace(
            id=2,
            sound_file_url="/uploads/sounds/microwave.wav",
        ),
    ]

    device_two_sounds = [
        SimpleNamespace(
            id=3,
            sound_file_url="/uploads/sounds/washing-machine.wav",
        ),
    ]

    fake_devices = [
        SimpleNamespace(
            id=1,
            sounds=device_one_sounds,
        ),
        SimpleNamespace(
            id=2,
            sounds=device_two_sounds,
        ),
    ]

    db_user = SimpleNamespace(
        id=1,
        devices=fake_devices,
    )
    service.repository.delete_user = Mock()

    with patch(
        "app.services.user.sound_service.delete_all_sound_files"
    ) as mock_delete_all_sound_files:
        result = service.delete_user(db=db, db_user=db_user)

    mock_delete_all_sound_files.assert_has_calls(
        [
            call(device_one_sounds),
            call(device_two_sounds),
        ]
    )

    assert mock_delete_all_sound_files.call_count == 2

    service.repository.delete_user.assert_called_once_with(
        db,
        db_user,
    )
    assert result is None


def test_delete_user_sound_files(service, db, tmp_path: Path):
    sound_one = tmp_path / "doorbell.wav"
    sound_two = tmp_path / "microwave.wav"
    sound_three = tmp_path / "washing-machine.wav"

    sound_one.write_bytes(b"fake wav data")
    sound_two.write_bytes(b"fake wav data")
    sound_three.write_bytes(b"fake wav data")

    assert sound_one.exists()
    assert sound_two.exists()
    assert sound_three.exists()

    device_one_sounds = [
        SimpleNamespace(
            id=1,
            sound_file_url="/uploads/sounds/doorbell.wav",
        ),
        SimpleNamespace(
            id=2,
            sound_file_url="/uploads/sounds/microwave.wav",
        ),
    ]

    device_two_sounds = [
        SimpleNamespace(
            id=3,
            sound_file_url="/uploads.sounds/washing-machine.wav",
        ),
    ]

    db_user = SimpleNamespace(
        id=1,
        devices=[
            SimpleNamespace(
                id=1,
                sounds=device_one_sounds,
            ),
            SimpleNamespace(
                id=2,
                sounds=device_two_sounds,
            ),
        ],
    )

    with patch(
        "app.services.user.sound_service.upload_dir",
        tmp_path,
    ):
        service.delete_user(db, db_user)

    assert not sound_one.exists()
    assert not sound_two.exists()
    assert not sound_three.exists()

    service.repository.delete_user.assert_called_once_with(
        db,
        db_user,
    )
