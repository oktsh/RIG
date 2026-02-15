from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.schemas import RulesetCreate, RulesetResponse, PaginatedRulesets
from app.middleware.auth import get_current_user
from app.services.ruleset_service import ruleset_service
from app.utils.pagination import paginate

router = APIRouter(prefix="/api/rulesets", tags=["rulesets"])


@router.get("/", response_model=PaginatedRulesets)
def list_rulesets(
    search: str | None = None,
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    query = ruleset_service.search(db, search)
    return paginate(query, page, limit)


@router.get("/{ruleset_id}", response_model=RulesetResponse)
def get_ruleset(ruleset_id: int, db: Session = Depends(get_db)):
    ruleset = ruleset_service.get(db, ruleset_id)
    if not ruleset:
        raise HTTPException(status_code=404, detail="Ruleset not found")
    return ruleset


@router.post("/", response_model=RulesetResponse, status_code=status.HTTP_201_CREATED)
def create_ruleset(
    data: RulesetCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    return ruleset_service.create_ruleset(db, data.model_dump(), user)
