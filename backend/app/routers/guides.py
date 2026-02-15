from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.exceptions import NotFoundError, ForbiddenError
from app.models.db import Guide, User
from app.models.enums import ContentStatus
from app.models.schemas import GuideCreate, GuideUpdate, GuideResponse, PaginatedGuides
from app.middleware.auth import get_current_user, require_role
from app.services.guide_service import guide_service
from app.utils.pagination import paginate

router = APIRouter(prefix="/api/guides", tags=["guides"])


@router.get("/", response_model=PaginatedGuides)
def list_guides(
    search: str | None = None,
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    query = guide_service.search(db, search, status=ContentStatus.PUBLISHED)
    query = query.order_by(Guide.created_at.desc())
    return paginate(query, page, limit)


@router.get("/moderation/pending", response_model=PaginatedGuides)
def list_moderation_guides(
    status: str = "pending",
    search: str | None = None,
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("ADMIN", "MODERATOR")),
):
    query = guide_service.search(db, search, status=status if status != "all" else None)
    query = query.order_by(Guide.created_at.desc())
    return paginate(query, page, limit)


@router.get("/{guide_id}", response_model=GuideResponse)
def get_guide(guide_id: int, db: Session = Depends(get_db)):
    guide = guide_service.get(db, guide_id)
    if not guide:
        raise NotFoundError("Guide")
    return guide


@router.post("/", response_model=GuideResponse, status_code=status.HTTP_201_CREATED)
def create_guide(
    data: GuideCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return guide_service.create_guide(db, data.model_dump(), user)


@router.put("/{guide_id}", response_model=GuideResponse)
def update_guide(
    guide_id: int,
    data: GuideUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    guide = guide_service.update_guide(db, guide_id, data.model_dump(exclude_unset=True), user)
    if not guide:
        raise ForbiddenError("Guide not found or not authorized")
    return guide


@router.patch("/{guide_id}/status", response_model=GuideResponse)
def update_guide_status(
    guide_id: int,
    status: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("ADMIN", "MODERATOR")),
):
    guide = guide_service.update_status(db, guide_id, status)
    if not guide:
        raise NotFoundError("Guide")
    return guide
