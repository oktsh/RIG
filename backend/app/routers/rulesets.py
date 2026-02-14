from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.db import Ruleset
from app.models.schemas import RulesetCreate, RulesetResponse
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/rulesets", tags=["rulesets"])


@router.get("/", response_model=list[RulesetResponse])
def list_rulesets(db: Session = Depends(get_db)):
    return db.query(Ruleset).all()


@router.get("/{ruleset_id}", response_model=RulesetResponse)
def get_ruleset(ruleset_id: int, db: Session = Depends(get_db)):
    ruleset = db.query(Ruleset).filter(Ruleset.id == ruleset_id).first()
    if not ruleset:
        raise HTTPException(status_code=404, detail="Ruleset not found")
    return ruleset


@router.post("/", response_model=RulesetResponse, status_code=status.HTTP_201_CREATED)
def create_ruleset(
    data: RulesetCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    ruleset = Ruleset(
        title=data.title,
        desc=data.desc,
        language=data.language,
        content=data.content,
        author_id=user.id,
    )
    db.add(ruleset)
    db.commit()
    db.refresh(ruleset)
    return ruleset
