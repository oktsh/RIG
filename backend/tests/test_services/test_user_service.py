"""Tests for user service."""
import pytest
from app.models.enums import UserRole
from app.services.user_service import user_service
from app.services.auth import verify_password


class TestUserServiceCRUD:
    """Test basic CRUD operations for users."""

    def test_create_user(self, db_session):
        """Should create a new user."""
        data = {
            "name": "Test User",
            "email": "newuser@test.com",
            "password": "testpass123",
            "role": UserRole.USER,
        }
        user = user_service.create_user(db_session, data)

        assert user.id is not None
        assert user.email == "newuser@test.com"
        assert user.name == "Test User"
        assert user.role == UserRole.USER
        assert verify_password("testpass123", user.password_hash)

    def test_get_user(self, db_session, admin_user):
        """Should retrieve a user by ID."""
        user = user_service.get(db_session, admin_user.id)

        assert user is not None
        assert user.id == admin_user.id
        assert user.email == admin_user.email

    def test_get_by_email(self, db_session, admin_user):
        """Should retrieve a user by email."""
        user = user_service.get_by_email(db_session, admin_user.email)

        assert user is not None
        assert user.id == admin_user.id
        assert user.email == admin_user.email

    def test_get_by_email_not_found(self, db_session):
        """Should return None for non-existent email."""
        user = user_service.get_by_email(db_session, "nonexistent@test.com")
        assert user is None

    def test_update_user(self, db_session, regular_user):
        """Should update a user."""
        updated = user_service.update_user(
            db_session,
            regular_user.id,
            {"role": UserRole.MODERATOR}
        )

        assert updated is not None
        assert updated.role == UserRole.MODERATOR

    def test_update_user_not_found(self, db_session):
        """Should return None when updating non-existent user."""
        updated = user_service.update_user(db_session, 99999, {"name": "Test"})
        assert updated is None


class TestUserServiceSoftDeletes:
    """Test soft delete functionality."""

    def test_soft_delete_user(self, db_session, regular_user):
        """Should soft delete a user."""
        deleted = user_service.delete(db_session, regular_user.id, soft=True)

        assert deleted is not None
        assert deleted.deleted_at is not None

        # Verify hidden from normal queries
        user = user_service.get(db_session, regular_user.id, include_deleted=False)
        assert user is None

    def test_restore_user(self, db_session, regular_user):
        """Should restore a soft-deleted user."""
        user_service.delete(db_session, regular_user.id, soft=True)
        restored = user_service.restore(db_session, regular_user.id)

        assert restored is not None
        assert restored.deleted_at is None

    def test_hard_delete_user(self, db_session, regular_user):
        """Should permanently delete a user."""
        user_id = regular_user.id
        deleted = user_service.delete(db_session, user_id, soft=False)

        assert deleted is not None

        # Verify completely gone
        user = user_service.get(db_session, user_id, include_deleted=True)
        assert user is None
