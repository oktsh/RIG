"""
Tests for /api/auth endpoints (login, /me).
"""

import pytest

from tests.conftest import get_auth_header


# ---------------------------------------------------------------------------
# POST /api/auth/login
# ---------------------------------------------------------------------------

class TestLogin:
    """Tests for the login endpoint."""

    def test_login_valid_credentials(self, client, admin_user):
        """Login with correct email/password returns a JWT token."""
        resp = client.post(
            "/api/auth/login",
            json={"email": "admin@test.com", "password": "testpass123"},
        )
        assert resp.status_code == 200
        body = resp.json()
        assert "access_token" in body
        assert body["token_type"] == "bearer"
        # Token should be a non-empty string with 3 dot-separated parts (JWT)
        token = body["access_token"]
        assert len(token.split(".")) == 3

    def test_login_wrong_password(self, client, admin_user):
        """Login with a wrong password returns 401."""
        resp = client.post(
            "/api/auth/login",
            json={"email": "admin@test.com", "password": "wrongpassword"},
        )
        assert resp.status_code == 401
        assert "Invalid email or password" in resp.json()["detail"]

    def test_login_nonexistent_email(self, client):
        """Login with an email that does not exist returns 401."""
        resp = client.post(
            "/api/auth/login",
            json={"email": "nobody@test.com", "password": "whatever"},
        )
        assert resp.status_code == 401
        assert "Invalid email or password" in resp.json()["detail"]

    def test_login_inactive_user(self, client, inactive_user):
        """Login with an inactive account returns 403."""
        resp = client.post(
            "/api/auth/login",
            json={"email": "inactive@test.com", "password": "testpass123"},
        )
        assert resp.status_code == 403
        assert "inactive" in resp.json()["detail"].lower()

    def test_login_missing_fields(self, client):
        """Login request without required fields returns 422."""
        resp = client.post("/api/auth/login", json={})
        assert resp.status_code == 422


# ---------------------------------------------------------------------------
# GET /api/auth/me
# ---------------------------------------------------------------------------

class TestMe:
    """Tests for the /me endpoint."""

    def test_me_with_valid_token(self, client, admin_user):
        """GET /me with a valid token returns user information."""
        headers = get_auth_header(admin_user)
        resp = client.get("/api/auth/me", headers=headers)
        assert resp.status_code == 200
        body = resp.json()
        assert body["email"] == "admin@test.com"
        assert body["name"] == "Admin User"
        assert body["role"] == "ADMIN"
        assert body["is_active"] is True

    def test_me_without_token(self, client):
        """GET /me without an Authorization header returns 401/403."""
        resp = client.get("/api/auth/me")
        assert resp.status_code in (401, 403)

    def test_me_with_invalid_token(self, client):
        """GET /me with a garbage token returns 401."""
        resp = client.get(
            "/api/auth/me",
            headers={"Authorization": "Bearer invalid.token.here"},
        )
        assert resp.status_code == 401

    def test_me_returns_correct_role_for_regular_user(self, client, regular_user):
        """GET /me for a regular user returns role=USER."""
        headers = get_auth_header(regular_user)
        resp = client.get("/api/auth/me", headers=headers)
        assert resp.status_code == 200
        assert resp.json()["role"] == "USER"

    def test_me_returns_correct_role_for_moderator(self, client, moderator_user):
        """GET /me for a moderator returns role=MODERATOR."""
        headers = get_auth_header(moderator_user)
        resp = client.get("/api/auth/me", headers=headers)
        assert resp.status_code == 200
        assert resp.json()["role"] == "MODERATOR"
