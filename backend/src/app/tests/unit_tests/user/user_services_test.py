import pytest
from unittest.mock import Mock
from app.services.user import UserService
from fastapi import HTTPException


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
