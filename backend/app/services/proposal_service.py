"""Proposal service with business logic."""

from __future__ import annotations

from typing import Any

from sqlalchemy.orm import Session, Query

from app.models.db import Proposal
from app.models.enums import ProposalStatus
from app.services.base import CRUDBase


class ProposalService(CRUDBase[Proposal]):
    """Service for Proposal-related operations."""

    def get_by_status(self, db: Session, status: ProposalStatus | str) -> Query:
        """Get query for proposals by status."""
        return db.query(Proposal).filter(Proposal.status == status)

    def search(
        self,
        db: Session,
        search_term: str | None = None,
        status: ProposalStatus | str | None = None,
    ) -> Query:
        """Get query for proposals with optional search and status filter."""
        query = db.query(Proposal)

        if status:
            query = query.filter(Proposal.status == status)

        if search_term:
            term = f"%{search_term}%"
            query = query.filter(
                Proposal.title.ilike(term)
                | Proposal.description.ilike(term)
                | Proposal.email.ilike(term)
            )

        return query

    def create_proposal(self, db: Session, data: dict[str, Any]) -> Proposal:
        """Create a new proposal."""
        proposal = Proposal(
            type=data["type"],
            title=data["title"],
            description=data.get("description"),
            content=data.get("content"),
            email=data["email"],
            tags=data.get("tags", []),
        )
        db.add(proposal)
        db.commit()
        db.refresh(proposal)
        return proposal

    def update_status(
        self,
        db: Session,
        proposal_id: int,
        status: ProposalStatus | str,
        reviewer_id: int,
    ) -> Proposal | None:
        """Update proposal status with reviewer tracking."""
        proposal = self.get(db, proposal_id)
        if not proposal:
            return None

        proposal.status = status
        proposal.reviewer_id = reviewer_id
        db.commit()
        db.refresh(proposal)
        return proposal


# Singleton instance
proposal_service = ProposalService(Proposal)
