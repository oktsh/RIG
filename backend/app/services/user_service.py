"""User service with business logic."""

from __future__ import annotations

from typing import Any

from sqlalchemy.orm import Session, Query

from app.models.db import User
from app.models.enums import UserRole
from app.services.auth import hash_password
from app.services.base import CRUDBase


class UserService(CRUDBase[User]):
    """Service for User-related operations."""

    def get_by_email(self, db: Session, email: str) -> User | None:
        """Get user by email address."""
        return db.query(User).filter(User.email == email).first()

    def search(self, db: Session, search_term: str | None = None) -> Query:
        """Get query for users with optional search."""
        query = db.query(User)

        if search_term:
            term = f"%{search_term}%"
            query = query.filter(User.name.ilike(term) | User.email.ilike(term))

        return query

    def create_user(self, db: Session, data: dict[str, Any]) -> User:
        """Create a new user with hashed password."""
        user = User(
            name=data["name"],
            email=data["email"],
            password_hash=hash_password(data["password"]),
            role=data.get("role", UserRole.USER),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def update_user(
        self, db: Session, user_id: int, data: dict[str, Any]
    ) -> User | None:
        """Update user properties (admin only)."""
        user = self.get(db, user_id)
        if not user:
            return None

        # Update allowed fields
        if "role" in data and data["role"] is not None:
            user.role = data["role"]
        if "requires_approval" in data and data["requires_approval"] is not None:
            user.requires_approval = data["requires_approval"]
        if "is_active" in data and data["is_active"] is not None:
            user.is_active = data["is_active"]

        db.commit()
        db.refresh(user)
        return user


# Singleton instance
user_service = UserService(User)
