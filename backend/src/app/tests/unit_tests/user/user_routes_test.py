from fastapi.testclient import TestClient
from app.repository.user import UserRepository
import pytest

"Post"

payload = {
    "username": "testuser",
    "email": "test@example.com",
    "password": "securepassword123",
}


def test_register_user_success(client: TestClient):
    response = client.post(
        "/users/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "securepassword123",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["username"] == "testuser"
    assert "id" in data

    assert "password" not in data
    assert "hashed_password" not in data


def test_register_duplicate_email(client: TestClient):
    client.post("/users/register", json=payload)

    response = client.post(
        "/users/register",
        json={
            "username": "anotheruser",
            "email": "test@example.com",
            "password": "differentpassword",
        },
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"


def test_register_duplicate_username(client: TestClient):

    client.post("/users/register", json=payload)

    response = client.post(
        "/users/register",
        json={
            "username": "testuser",
            "email": "another@example.com",
            "password": "differentpassword",
        },
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Username already taken"


def test_register_invalid_email(client: TestClient):
    response = client.post(
        "/users/register",
        json={
            "username": "testuser",
            "email": "not-an-email",
            "password": "securepassword123",
        },
    )

    assert response.status_code == 422


def test_empty_username(client: TestClient):
    response = client.post(
        "/users/register",
        json={
            "username": "",
            "email": "test@example.com",
            "password": "securepassword123",
        },
    )
    assert response.status_code == 422


def test_empty_password(client: TestClient):
    response = client.post(
        "/users/register",
        json={"username": "testuser", "email": "test@example.com", "password": ""},
    )
    assert response.status_code == 422


def test_login_success(client):
    client.post(
        "/users/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "securepassword123",
        },
    )

    response = client.post(
        "/users/login",
        data={
            "username": "test@example.com",
            "password": "securepassword123",
        },
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"


def test_login_wrong_password(client):
    client.post(
        "/users/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "securedpassword123",
        },
    )

    response = client.post(
        "/users/login",
        data={
            "username": "test@example.com",
            "password": "wrongpassword",
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect Email or Passwords"


def test_login_wrong_email(client):
    client.post(
        "/users/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "securedpassword123",
        },
    )

    response = client.post(
        "/users/login",
        data={
            "username": "wrong@example.com",
            "password": "securepassowrd123",
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect Email or Passwords"


"Get"


@pytest.fixture
def auth_headers(client):
    client.post(
        "/users/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "securepassword123",
        },
    )

    response = client.post(
        "/users/login",
        data={
            "username": "test@example.com",
            "password": "securepassword123",
        },
    )

    token = response.json()["access_token"]

    return {"Authorization": f"Bearer {token}"}


def test_get_me_success(client, auth_headers):

    response = client.get("/users/me", headers=auth_headers)

    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"


"Put"


def test_update_user_username(client, auth_headers):
    response = client.put(
        "/users/update", headers=auth_headers, json={"username": "newusername"}
    )
    assert response.status_code == 200
    assert response.json()["username"] == "newusername"


"Delete"


def test_delete_user_success(client, db, authenticated_user):
    response = client.delete(
        "/users/me", headers={"Authorization": f"Bearer {authenticated_user}"}
    )
    assert response.status_code == 204

    deleted_user = UserRepository.get_by_mail(db, "test@example.com")
    assert deleted_user is None
