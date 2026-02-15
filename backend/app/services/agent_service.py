"""Agent service with business logic."""

from __future__ import annotations

from typing import Any

from sqlalchemy.orm import Session, Query

from app.models.db import Agent, User
from app.models.enums import AgentStatus, ContentStatus
from app.services.base import CRUDBase


class AgentService(CRUDBase[Agent]):
    """Service for Agent-related operations."""

    def search(self, db: Session, search_term: str | None = None) -> Query:
        """Get query for agents with optional search."""
        query = db.query(Agent)

        if search_term:
            term = f"%{search_term}%"
            query = query.filter(Agent.title.ilike(term) | Agent.desc.ilike(term))

        return query

    def get_by_status(self, db: Session, status: AgentStatus | str) -> Query:
        """Get query for agents by AgentStatus."""
        return db.query(Agent).filter(Agent.status == status)

    def get_by_content_status(
        self, db: Session, status: ContentStatus | str
    ) -> Query:
        """Get query for agents by ContentStatus."""
        return db.query(Agent).filter(Agent.content_status == status)

    def create_agent(self, db: Session, data: dict[str, Any], user: User) -> Agent:
        """Create a new agent."""
        agent = Agent(
            title=data["title"],
            desc=data.get("desc"),
            number=data.get("number"),
            status=data.get("status", AgentStatus.ACTIVE),
            author_id=user.id,
        )
        db.add(agent)
        db.commit()
        db.refresh(agent)
        return agent


# Singleton instance
agent_service = AgentService(Agent)
