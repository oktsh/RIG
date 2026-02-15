"""Ruleset service with business logic."""

from __future__ import annotations

from typing import Any

from sqlalchemy.orm import Session, Query

from app.models.db import Ruleset, User
from app.models.enums import ContentStatus
from app.services.base import CRUDBase


class RulesetService(CRUDBase[Ruleset]):
    """Service for Ruleset-related operations."""

    def search(self, db: Session, search_term: str | None = None) -> Query:
        """Get query for rulesets with optional search."""
        query = db.query(Ruleset)

        if search_term:
            term = f"%{search_term}%"
            query = query.filter(Ruleset.title.ilike(term) | Ruleset.desc.ilike(term))

        return query

    def get_by_content_status(
        self, db: Session, status: ContentStatus | str
    ) -> Query:
        """Get query for rulesets by ContentStatus."""
        return db.query(Ruleset).filter(Ruleset.content_status == status)

    def create_ruleset(
        self, db: Session, data: dict[str, Any], user: User
    ) -> Ruleset:
        """Create a new ruleset."""
        ruleset = Ruleset(
            title=data["title"],
            desc=data.get("desc"),
            language=data.get("language"),
            content=data.get("content"),
            author_id=user.id,
        )
        db.add(ruleset)
        db.commit()
        db.refresh(ruleset)
        return ruleset


# Singleton instance
ruleset_service = RulesetService(Ruleset)
