import pytest
from unittest.mock import Mock
from app.services.user import UserService


@pytest.fixture
def service():
    services = UserService()
    services.repository = Mock()
    return services


@pytest.fixture
def db():
    return Mock()


def test_get_by_mail_success(service, db):
    fake_user = Mock(email="test@example.com")
    service.repository.get_by_mail.return_value = fake_user
    result = service.get_by_mail(db, "test@example.com")
    assert result == fake_user
