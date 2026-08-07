import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoints():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert "database_connected" in data


def test_public_schemes_list():
    response = client.get("/api/v1/schemes")
    assert response.status_code == 200
    schemes = response.json()
    assert len(schemes) >= 20
    assert any("Kisan" in s["scheme_name"] for s in schemes)


def test_auth_workflow():
    # 1. Register a test user with unique email
    unique_id = str(uuid.uuid4())[:8]
    email = f"test_citizen_{unique_id}@example.com"
    reg_payload = {
        "full_name": "Test Citizen One",
        "email": email,
        "password": "TestPassword123!",
        "state": "Maharashtra",
        "district": "Pune",
        "preferred_language": "hi",
    }
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    user_data = reg_res.json()
    assert user_data["email"] == email
    assert user_data["role"] == "Citizen"

    # 2. Login as the registered user
    login_payload = {
        "email": email,
        "password": "TestPassword123!",
    }
    login_res = client.post("/api/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    assert "refresh_token" in token_data
    access_token = token_data["access_token"]
    refresh_token = token_data["refresh_token"]

    # 3. Access protected /auth/me route
    headers = {"Authorization": f"Bearer {access_token}"}
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["email"] == email

    # 4. Refresh token
    refresh_res = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert refresh_res.status_code == 200
    refreshed_data = refresh_res.json()
    assert "access_token" in refreshed_data

    # 5. Citizen attempting Admin route -> 403 Forbidden
    users_res = client.get("/api/v1/users", headers=headers)
    assert users_res.status_code == 403

    # 6. Logout
    logout_res = client.post("/api/v1/auth/logout", json={"refresh_token": refresh_token})
    assert logout_res.status_code == 200
    assert logout_res.json()["message"].startswith("Successfully logged out")


def test_admin_rbac():
    # Login as seeded Admin
    admin_login = {
        "email": "admin@citizenos.gov.in",
        "password": "AdminPassword123!",
    }
    res = client.post("/api/v1/auth/login", json=admin_login)
    assert res.status_code == 200
    admin_access_token = res.json()["access_token"]

    # Admin accessing /users list -> 200 OK
    headers = {"Authorization": f"Bearer {admin_access_token}"}
    users_res = client.get("/api/v1/users", headers=headers)
    assert users_res.status_code == 200
    users_list = users_res.json()
    assert len(users_list) >= 3
