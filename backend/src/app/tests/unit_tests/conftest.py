import pytest
import shutil
from unittest.mock import Mock
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.core.database import Base, get_db
from app.core.auth import create_access_token

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


# fixture to create for user number 2
@pytest.fixture
def another_user(db):
    another_user = UserDB(
        username="Another user",
        email="Anothertest@example.com",
        hashed_password="Anotherhashedpassword",
    )

    return UserRepository.create_user(db, another_user)


# fixture to create device for repository
@pytest.fixture
def device(db, user):
    device = DeviceDB(
        device_name="testDevice",
        serial_number="testSerialNumber123",
        user_id=user.id,
        is_paired=True,
        device_status="online",
    )
    return DeviceRepository.create_device(db, device)


# fixture for another device number 2 of user number 2
@pytest.fixture
def another_device(db, another_user):
    another_device = DeviceDB(
        device_name="Other SNSA",
        serial_number="SNSA-OTHER-001",
        user_id=another_user.id,
        is_paired=True,
        device_status="online",
    )
    return DeviceRepository.create_device(db, another_device)


# fixture to create sound for repository
@pytest.fixture
def sound(db, device):
    sound_data = SoundDB(
        sound_name="testSound",
        device_id=device.id,
        sound_file_key="test-audio-files/testSound.wav",
        sound_status="monitoring",
        is_on=True,
        is_synced_to_device=False,
        profile_version=1,
    )

    return SoundRepository.create_sound(db, sound_data)


# fixture to create temporary directory for sound files
@pytest.fixture
def service(tmp_path):
    service = SoundService(upload_dir=tmp_path / "sounds")
    service.repository = Mock()
    service.repository.get_by_sound_name.return_value = None
    return service


@pytest.fixture(autouse=True)
def temp_sound_upload_dir(tmp_path):
    from app.services.sound import sound_service
    from app.routes import sound as sound_route

    old_service_dir = sound_service.upload_dir
    old_route_dir = sound_route.sound_service.upload_dir

    test_upload_dir = tmp_path / "sounds"

    sound_service.upload_dir = test_upload_dir
    sound_route.sound_service.upload_dir = test_upload_dir
    test_upload_dir.mkdir(parents=True, exist_ok=True)

    yield

    if test_upload_dir.exists():
        shutil.rmtree(test_upload_dir)

    sound_service.upload_dir = old_service_dir
    sound_route.sound_service.upload_dir = old_route_dir


# fixture to create headers for authorization
@pytest.fixture
def headers(client: TestClient, user):
    token = create_access_token(
        data={"sub": str(user.id), "token_version": user.token_version}
    )
    return {"Authorization": f"Bearer {token}"}
