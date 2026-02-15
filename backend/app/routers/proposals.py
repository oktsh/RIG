from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.db import User
from app.models.schemas import ProposalCreate, ProposalResponse, PaginatedProposals
from app.middleware.auth import require_role
from app.services.proposal_service import proposal_service
from app.utils.pagination import paginate

router = APIRouter(prefix="/api/proposals", tags=["proposals"])


@router.post("/", response_model=ProposalResponse, status_code=status.HTTP_201_CREATED)
def create_proposal(data: ProposalCreate, db: Session = Depends(get_db)):
    return proposal_service.create_proposal(db, data.model_dump())


@router.get("/", response_model=PaginatedProposals)
def list_proposals(
    search: str | None = None,
    status: str | None = None,
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("ADMIN", "MODERATOR")),
):
    query = proposal_service.search(db, search, status)
    query = query.order_by(query.column_descriptions[0]["entity"].created_at.desc())
    return paginate(query, page, limit)


@router.patch("/{proposal_id}/status")
def update_proposal_status(
    proposal_id: int,
    new_status: str,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("ADMIN", "MODERATOR")),
):
    proposal = proposal_service.update_status(db, proposal_id, new_status, user.id)
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return {"success": True}
