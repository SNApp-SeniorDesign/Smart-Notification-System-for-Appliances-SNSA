import pytest
from unittest.mock import Mock
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.core.database import Base, get_db

from app.schemas.user import UserDB
from app.schemas.device import DeviceDB
from app.schemas.sound import SoundDB

from app.repository.user import UserRepository
from app.repository.device import DeviceRepository
from app.repository.sound import SoundRepository

from app.services.sound import SoundService

TEST_DATABASE_URL = "postgresql+psycopg://rune:12345678@localhost:5432/snsa_test"

engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def overrides_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = overrides_get_db


@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client():
    return TestClient(app)


# Test fixture for to return token
@pytest.fixture
def authenticated_user(client):
    register_response = client.post(
        "/users/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "securepassword123",
        },
    )

    assert register_response.status_code == 201, register_response.json()

    response = client.post(
        "/users/login",
        data={"username": "test@example.com", "password": "securepassword123"},
    )

    assert response.status_code == 200, response.json()

    return response.json()["access_token"]


# fixture to create user for repository
@pytest.fixture
def user(db):
    user = UserDB(
        username="testuser",
        email="test@example.com",
        hashed_password="hashedpassword",
    )

    return UserRepository.create_user(db, user)


# fixture to create device for repository
@pytest.fixture
def device(db, user):
    device = DeviceDB(
        device_name="testDevice", serial_number="testSerialNumber123", user_id=user.id
    )
    return DeviceRepository.create_device(db, device)


# fixture to create sound for repository
@pytest.fixture
def sound(db, device):
    sound = SoundDB(
        sound_name="testSound",
        device_id=device.id,
        sound_file_url="test-audio-files/testSound.wav",
    )
    return SoundRepository.create_sound(db, sound)


# fixture to create temporary directory for sound files
@pytest.fixture
def service(tmp_path):
    services = SoundService(upload_dir=tmp_path / "sounds")
    service.repository = Mock()
    return services
