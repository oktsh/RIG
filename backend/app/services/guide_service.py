"""Guide service with business logic."""

from __future__ import annotations

from typing import Any

from sqlalchemy.orm import Session, Query

from app.models.db import Guide, User
from app.models.enums import ContentStatus
from app.services.base import CRUDBase


class GuideService(CRUDBase[Guide]):
    """Service for Guide-related operations."""

    def get_published(self, db: Session) -> Query:
        """Get query for published guides."""
        return db.query(Guide).filter(Guide.status == ContentStatus.PUBLISHED)

    def get_by_status(self, db: Session, status: ContentStatus | str) -> Query:
        """Get query for guides by status."""
        return db.query(Guide).filter(Guide.status == status)

    def search(
        self,
        db: Session,
        search_term: str | None = None,
        status: ContentStatus | str | None = None,
    ) -> Query:
        """Get query for guides with optional search and status filter."""
        query = db.query(Guide).filter(Guide.deleted_at == None)

        if status:
            query = query.filter(Guide.status == status)

        if search_term:
            term = f"%{search_term}%"
            query = query.filter(Guide.title.ilike(term) | Guide.desc.ilike(term))

        return query

    def create_guide(self, db: Session, data: dict[str, Any], user: User) -> Guide:
        """Create a new guide with status based on user approval requirement."""
        status = (
            ContentStatus.PENDING if user.requires_approval else ContentStatus.PUBLISHED
        )
        guide = Guide(
            title=data["title"],
            desc=data.get("desc"),
            category=data.get("category"),
            time=data.get("time"),
            content=data.get("content"),
            author_id=user.id,
            author_name=user.name,
            status=status,
        )
        db.add(guide)
        db.commit()
        db.refresh(guide)
        return guide

    def update_guide(
        self,
        db: Session,
        guide_id: int,
        data: dict[str, Any],
        user: User,
    ) -> Guide | None:
        """Update a guide with authorization check."""
        guide = self.get(db, guide_id)
        if not guide:
            return None

        # Authorization: owner or admin
        if guide.author_id != user.id and user.role.value != "ADMIN":
            return None

        # Update fields, but skip status unless user is admin
        for field, value in data.items():
            if field == "status" and user.role.value != "ADMIN":
                continue
            setattr(guide, field, value)

        db.commit()
        db.refresh(guide)
        return guide

    def update_status(
        self, db: Session, guide_id: int, status: ContentStatus | str
    ) -> Guide | None:
        """Update guide status (admin/moderator only)."""
        guide = self.get(db, guide_id)
        if not guide:
            return None

        guide.status = status
        db.commit()
        db.refresh(guide)
        return guide


# Singleton instance
guide_service = GuideService(Guide)
