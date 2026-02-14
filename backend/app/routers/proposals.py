from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.db import Proposal, User
from app.models.schemas import ProposalCreate, ProposalResponse
from app.middleware.auth import require_role

router = APIRouter(prefix="/api/proposals", tags=["proposals"])


@router.post("/", response_model=ProposalResponse, status_code=status.HTTP_201_CREATED)
def create_proposal(data: ProposalCreate, db: Session = Depends(get_db)):
    proposal = Proposal(
        type=data.type,
        title=data.title,
        description=data.description,
        content=data.content,
        email=data.email,
        tags=data.tags,
    )
    db.add(proposal)
    db.commit()
    db.refresh(proposal)
    return proposal


@router.get("/", response_model=list[ProposalResponse])
def list_proposals(
    db: Session = Depends(get_db),
    _: User = Depends(require_role("ADMIN", "MODERATOR")),
):
    return db.query(Proposal).order_by(Proposal.created_at.desc()).all()


@router.patch("/{proposal_id}/status")
def update_proposal_status(
    proposal_id: int,
    new_status: str,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("ADMIN", "MODERATOR")),
):
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    proposal.status = new_status
    proposal.reviewer_id = user.id
    db.commit()
    return {"success": True}
