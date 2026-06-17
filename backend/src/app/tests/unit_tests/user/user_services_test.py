import pytest
from unittest.mock import Mock, patch
from app.services.user import UserService
from fastapi import HTTPException
from types import SimpleNamespace
from app.schemas.user import UserCreate, UserResponse


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

    created_user = UserResponse(id=1, username="testuser", email="test@example.com")

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
