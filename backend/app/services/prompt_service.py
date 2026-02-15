"""Prompt service with business logic."""

from __future__ import annotations

from typing import Any

from sqlalchemy.orm import Session, Query

from app.models.db import Prompt, User
from app.models.enums import ContentStatus
from app.services.base import CRUDBase


class PromptService(CRUDBase[Prompt]):
    """Service for Prompt-related operations."""

    def get_published(self, db: Session) -> Query:
        """Get query for published prompts."""
        return db.query(Prompt).filter(Prompt.status == ContentStatus.PUBLISHED)

    def get_by_status(self, db: Session, status: ContentStatus | str) -> Query:
        """Get query for prompts by status."""
        return db.query(Prompt).filter(Prompt.status == status)

    def search(
        self,
        db: Session,
        search_term: str | None = None,
        status: ContentStatus | str | None = None,
    ) -> Query:
        """Get query for prompts with optional search and status filter."""
        query = db.query(Prompt).filter(Prompt.deleted_at == None)

        if status:
            query = query.filter(Prompt.status == status)

        if search_term:
            term = f"%{search_term}%"
            query = query.filter(Prompt.title.ilike(term) | Prompt.desc.ilike(term))

        return query

    def create_prompt(
        self, db: Session, data: dict[str, Any], user: User
    ) -> Prompt:
        """Create a new prompt with status based on user approval requirement."""
        status = (
            ContentStatus.PENDING if user.requires_approval else ContentStatus.PUBLISHED
        )
        prompt = Prompt(
            title=data["title"],
            desc=data.get("desc"),
            tags=data.get("tags", []),
            tech=data.get("tech"),
            content=data.get("content"),
            author_id=user.id,
            author_name=user.name,
            status=status,
        )
        db.add(prompt)
        db.commit()
        db.refresh(prompt)
        return prompt

    def update_prompt(
        self,
        db: Session,
        prompt_id: int,
        data: dict[str, Any],
        user: User,
    ) -> Prompt | None:
        """Update a prompt with authorization check."""
        prompt = self.get(db, prompt_id)
        if not prompt:
            return None

        # Authorization: owner or admin
        if prompt.author_id != user.id and user.role.value != "ADMIN":
            return None

        # Update fields, but skip status unless user is admin
        for field, value in data.items():
            if field == "status" and user.role.value != "ADMIN":
                continue
            setattr(prompt, field, value)

        db.commit()
        db.refresh(prompt)
        return prompt

    def update_status(
        self, db: Session, prompt_id: int, status: ContentStatus | str
    ) -> Prompt | None:
        """Update prompt status (admin/moderator only)."""
        prompt = self.get(db, prompt_id)
        if not prompt:
            return None

        prompt.status = status
        db.commit()
        db.refresh(prompt)
        return prompt


# Singleton instance
prompt_service = PromptService(Prompt)
