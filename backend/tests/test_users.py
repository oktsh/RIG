"""
Tests for /api/users endpoints (CRUD, admin-only).
"""

import pytest

from tests.conftest import get_auth_header


# ---------------------------------------------------------------------------
# GET /api/users  (list users, admin only)
# ---------------------------------------------------------------------------

class TestListUsers:
    """Tests for listing users."""

    def test_admin_can_list_users(self, client, admin_user, admin_headers):
        """An admin should be able to list all users."""
        resp = client.get("/api/users/", headers=admin_headers)
        assert resp.status_code == 200
        users = resp.json()
        assert isinstance(users, list)
        # At least the admin user exists
        assert len(users) >= 1
        emails = [u["email"] for u in users]
        assert "admin@test.com" in emails

    def test_regular_user_cannot_list_users(self, client, regular_user, user_headers):
        """A regular USER should receive 403 when listing users."""
        resp = client.get("/api/users/", headers=user_headers)
        assert resp.status_code == 403

    def test_moderator_cannot_list_users(self, client, moderator_user, moderator_headers):
        """A MODERATOR should receive 403 when listing users."""
        resp = client.get("/api/users/", headers=moderator_headers)
        assert resp.status_code == 403

    def test_unauthenticated_cannot_list_users(self, client):
        """Request without auth should receive 401/403."""
        resp = client.get("/api/users/")
        assert resp.status_code in (401, 403)


# ---------------------------------------------------------------------------
# POST /api/users  (create user, admin only)
# ---------------------------------------------------------------------------

class TestCreateUser:
    """Tests for creating users via the admin endpoint."""

    def test_admin_can_create_user(self, client, admin_user, admin_headers):
        """Admin can create a new user."""
        resp = client.post(
            "/api/users/",
            json={
                "name": "New User",
                "email": "newuser@test.com",
                "password": "newpass123",
                "role": "USER",
            },
            headers=admin_headers,
        )
        assert resp.status_code == 201
        body = resp.json()
        assert body["email"] == "newuser@test.com"
        assert body["name"] == "New User"
        assert body["role"] == "USER"
        assert body["is_active"] is True

    def test_admin_can_create_moderator(self, client, admin_user, admin_headers):
        """Admin can create a user with MODERATOR role."""
        resp = client.post(
            "/api/users/",
            json={
                "name": "New Mod",
                "email": "newmod@test.com",
                "password": "modpass123",
                "role": "MODERATOR",
            },
            headers=admin_headers,
        )
        assert resp.status_code == 201
        assert resp.json()["role"] == "MODERATOR"

    def test_create_user_duplicate_email(self, client, admin_user, admin_headers):
        """Creating a user with an already-registered email returns 400."""
        resp = client.post(
            "/api/users/",
            json={
                "name": "Duplicate",
                "email": "admin@test.com",  # already exists
                "password": "pass123",
            },
            headers=admin_headers,
        )
        assert resp.status_code == 400
        assert "already registered" in resp.json()["detail"].lower()

    def test_regular_user_cannot_create_user(self, client, regular_user, user_headers):
        """Regular USER cannot create users (403)."""
        resp = client.post(
            "/api/users/",
            json={
                "name": "Hack User",
                "email": "hack@test.com",
                "password": "hackpass",
            },
            headers=user_headers,
        )
        assert resp.status_code == 403


# ---------------------------------------------------------------------------
# PATCH /api/users/:id  (update user, admin only)
# ---------------------------------------------------------------------------

class TestUpdateUser:
    """Tests for updating users."""

    def test_admin_can_update_user_role(
        self, client, admin_user, regular_user, admin_headers
    ):
        """Admin can change a user's role."""
        resp = client.patch(
            f"/api/users/{regular_user.id}",
            json={"role": "MODERATOR"},
            headers=admin_headers,
        )
        assert resp.status_code == 200
        assert resp.json()["role"] == "MODERATOR"

    def test_admin_can_deactivate_user(
        self, client, admin_user, regular_user, admin_headers
    ):
        """Admin can deactivate a user."""
        resp = client.patch(
            f"/api/users/{regular_user.id}",
            json={"is_active": False},
            headers=admin_headers,
        )
        assert resp.status_code == 200
        assert resp.json()["is_active"] is False

    def test_admin_can_toggle_requires_approval(
        self, client, admin_user, regular_user, admin_headers
    ):
        """Admin can toggle the requires_approval flag."""
        resp = client.patch(
            f"/api/users/{regular_user.id}",
            json={"requires_approval": False},
            headers=admin_headers,
        )
        assert resp.status_code == 200
        assert resp.json()["requires_approval"] is False

    def test_update_nonexistent_user(self, client, admin_user, admin_headers):
        """Updating a user that does not exist returns 404."""
        resp = client.patch(
            "/api/users/99999",
            json={"role": "ADMIN"},
            headers=admin_headers,
        )
        assert resp.status_code == 404

    def test_regular_user_cannot_update_user(
        self, client, admin_user, regular_user, user_headers
    ):
        """Regular USER cannot update other users (403)."""
        resp = client.patch(
            f"/api/users/{admin_user.id}",
            json={"role": "USER"},
            headers=user_headers,
        )
        assert resp.status_code == 403


# ---------------------------------------------------------------------------
# DELETE /api/users/:id  (delete user, admin only)
# ---------------------------------------------------------------------------

class TestDeleteUser:
    """Tests for deleting users."""

    def test_admin_can_delete_user(
        self, client, admin_user, regular_user, admin_headers
    ):
        """Admin can delete a user. Returns 204 No Content."""
        resp = client.delete(
            f"/api/users/{regular_user.id}",
            headers=admin_headers,
        )
        assert resp.status_code == 204

        # Verify the user is gone
        list_resp = client.get("/api/users/", headers=admin_headers)
        emails = [u["email"] for u in list_resp.json()]
        assert "user@test.com" not in emails

    def test_delete_nonexistent_user(self, client, admin_user, admin_headers):
        """Deleting a user that does not exist returns 404."""
        resp = client.delete(
            "/api/users/99999",
            headers=admin_headers,
        )
        assert resp.status_code == 404

    def test_regular_user_cannot_delete_user(
        self, client, admin_user, regular_user, user_headers
    ):
        """Regular USER cannot delete users (403)."""
        resp = client.delete(
            f"/api/users/{admin_user.id}",
            headers=user_headers,
        )
        assert resp.status_code == 403
