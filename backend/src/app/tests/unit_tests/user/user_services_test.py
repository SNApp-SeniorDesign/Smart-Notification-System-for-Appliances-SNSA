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


"Get"


def test_get_by_mail_success(service, db):
    fake_user = Mock(email="test@example.com")
    service.repository.get_by_mail.return_value = fake_user
    result = service.get_by_mail(db, "test@example.com")
    assert result == fake_user


def test_get_by_mail_not_found(service, db):
    service.repository.get_by_mail.return_value = None

    with pytest.raises(HTTPException) as exc_info:
        service.get_by_mail(db, "notexist@example.com")

    service.repository.get_by_mail.assert_called_once_with(db, "notexist@example.com")

    assert exc_info.value.status_code == 404
