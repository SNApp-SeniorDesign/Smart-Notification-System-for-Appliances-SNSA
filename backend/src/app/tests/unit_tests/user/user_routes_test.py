from fastapi.testclient import TestClient


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


# def test_delete_user_success(client: TestClient, db):
#     response = client.delete("/users/me", headers={"Authorization": f"Bearer {token}"})
#     assert response.status_code == 204

#     deleted_user = UserRepository.get_by_mail(db, "test@example.com")
#     assert deleted_user is None
