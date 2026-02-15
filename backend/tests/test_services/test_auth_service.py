"""Tests for authentication service."""
import pytest
from app.services.auth import hash_password, verify_password, create_access_token, decode_access_token


class TestPasswordHashing:
    """Test password hashing functions."""

    def test_hash_password_uses_unique_salt(self):
        """Each password hash should use a unique random salt."""
        password = "test_password_123"
        hash1 = hash_password(password)
        hash2 = hash_password(password)
        assert hash1 != hash2, "Same password should produce different hashes (different salts)"

    def test_hash_password_uses_bcrypt_format(self):
        """Password hash should use bcrypt format."""
        password = "test_password_123"
        hashed = hash_password(password)
        assert hashed.startswith("$2b$"), "Hash should use bcrypt format ($2b$)"

    def test_verify_password_accepts_correct_password(self):
        """verify_password should return True for correct password."""
        password = "correct_password"
        hashed = hash_password(password)
        assert verify_password(password, hashed) is True

    def test_verify_password_rejects_wrong_password(self):
        """verify_password should return False for incorrect password."""
        password = "correct_password"
        hashed = hash_password(password)
        assert verify_password("wrong_password", hashed) is False

    def test_verify_password_rejects_empty_password(self):
        """verify_password should return False for empty password."""
        password = "correct_password"
        hashed = hash_password(password)
        assert verify_password("", hashed) is False

    def test_hash_password_handles_unicode(self):
        """Password hashing should handle unicode characters."""
        password = "пароль密码🔐"
        hashed = hash_password(password)
        assert verify_password(password, hashed) is True


class TestJWTTokens:
    """Test JWT token creation and decoding."""

    def test_create_access_token(self):
        """Should create a valid JWT token."""
        token = create_access_token(user_id=1, role="USER")
        assert isinstance(token, str)
        assert len(token) > 0

    def test_decode_access_token_valid(self):
        """Should decode a valid token and return payload."""
        user_id = 42
        role = "ADMIN"
        token = create_access_token(user_id=user_id, role=role)
        payload = decode_access_token(token)

        assert payload is not None
        assert payload["sub"] == str(user_id)  # JWT stores user_id as string
        assert payload["role"] == role

    def test_decode_access_token_invalid(self):
        """Should return None for invalid token."""
        invalid_token = "invalid.jwt.token"
        payload = decode_access_token(invalid_token)
        assert payload is None

    def test_decode_access_token_malformed(self):
        """Should return None for malformed token."""
        malformed_token = "not-a-jwt-at-all"
        payload = decode_access_token(malformed_token)
        assert payload is None

    def test_token_contains_user_id_and_role(self):
        """Token payload should contain user_id and role."""
        user_id = 123
        role = "MODERATOR"
        token = create_access_token(user_id=user_id, role=role)
        payload = decode_access_token(token)

        assert "sub" in payload
        assert "role" in payload
        assert payload["sub"] == str(user_id)  # JWT stores user_id as string
        assert payload["role"] == role

    def test_token_has_expiration(self):
        """Token payload should contain expiration time."""
        token = create_access_token(user_id=1, role="USER")
        payload = decode_access_token(token)

        assert "exp" in payload
        assert payload["exp"] > 0
