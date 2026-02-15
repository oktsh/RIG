"""Integration tests for auth router."""
import pytest


class TestLogin:
    """Test login endpoint."""

    def test_login_success(self, client, admin_user):
        """Should login with valid credentials."""
        response = client.post(
            "/api/auth/login",
            json={"email": "admin@test.com", "password": "testpass123"}
        )

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_invalid_email(self, client):
        """Should reject login with invalid email."""
        response = client.post(
            "/api/auth/login",
            json={"email": "wrong@test.com", "password": "testpass123"}
        )

        assert response.status_code == 401
        data = response.json()
        assert data["type"] == "UnauthorizedError"
        assert "Invalid email or password" in data["detail"]

    def test_login_invalid_password(self, client, admin_user):
        """Should reject login with invalid password."""
        response = client.post(
            "/api/auth/login",
            json={"email": "admin@test.com", "password": "wrongpass"}
        )

        assert response.status_code == 401
        data = response.json()
        assert data["type"] == "UnauthorizedError"

    def test_login_inactive_user(self, client, inactive_user):
        """Should reject login for inactive user."""
        response = client.post(
            "/api/auth/login",
            json={"email": "inactive@test.com", "password": "testpass123"}
        )

        assert response.status_code == 403
        data = response.json()
        assert data["type"] == "ForbiddenError"
        assert "inactive" in data["detail"].lower()


class TestGetMe:
    """Test /me endpoint."""

    def test_get_me_success(self, client, admin_headers, admin_user):
        """Should return current user info."""
        response = client.get("/api/auth/me", headers=admin_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["email"] == admin_user.email
        assert data["name"] == admin_user.name
        assert data["role"] in [str(admin_user.role), admin_user.role.value]

    def test_get_me_unauthorized(self, client):
        """Should reject request without auth token."""
        response = client.get("/api/auth/me")

        assert response.status_code == 401

    def test_get_me_invalid_token(self, client):
        """Should reject request with invalid token."""
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": "Bearer invalid.token.here"}
        )

        assert response.status_code == 401
