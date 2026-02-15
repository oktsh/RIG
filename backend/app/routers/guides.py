from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.db import Guide, User
from app.models.schemas import GuideCreate, GuideUpdate, GuideResponse, PaginatedGuides
from app.middleware.auth import get_current_user, require_role
from app.utils.pagination import paginate

router = APIRouter(prefix="/api/guides", tags=["guides"])


@router.get("/", response_model=PaginatedGuides)
def list_guides(
    search: str | None = None,
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    query = db.query(Guide).filter(Guide.status == "published")
    if search:
        term = f"%{search}%"
        query = query.filter(Guide.title.ilike(term) | Guide.desc.ilike(term))
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
    query = db.query(Guide)
    if status != "all":
        query = query.filter(Guide.status == status)
    if search:
        term = f"%{search}%"
        query = query.filter(Guide.title.ilike(term) | Guide.desc.ilike(term))
    query = query.order_by(Guide.created_at.desc())
    return paginate(query, page, limit)


@router.get("/{guide_id}", response_model=GuideResponse)
def get_guide(guide_id: int, db: Session = Depends(get_db)):
    guide = db.query(Guide).filter(Guide.id == guide_id).first()
    if not guide:
        raise HTTPException(status_code=404, detail="Guide not found")
    return guide


@router.post("/", response_model=GuideResponse, status_code=status.HTTP_201_CREATED)
def create_guide(
    data: GuideCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    guide = Guide(
        title=data.title,
        desc=data.desc,
        category=data.category,
        time=data.time,
        content=data.content,
        author_id=user.id,
        author_name=user.name,
        status="pending" if user.requires_approval else "published",
    )
    db.add(guide)
    db.commit()
    db.refresh(guide)
    return guide


@router.put("/{guide_id}", response_model=GuideResponse)
def update_guide(
    guide_id: int,
    data: GuideUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    guide = db.query(Guide).filter(Guide.id == guide_id).first()
    if not guide:
        raise HTTPException(status_code=404, detail="Guide not found")
    if guide.author_id != user.id and user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized")

    for field, value in data.model_dump(exclude_unset=True).items():
        if field == "status" and user.role != "ADMIN":
            continue
        setattr(guide, field, value)

    db.commit()
    db.refresh(guide)
    return guide


@router.patch("/{guide_id}/status", response_model=GuideResponse)
def update_guide_status(
    guide_id: int,
    status: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("ADMIN", "MODERATOR")),
):
    guide = db.query(Guide).filter(Guide.id == guide_id).first()
    if not guide:
        raise HTTPException(status_code=404, detail="Guide not found")
    guide.status = status
    db.commit()
    db.refresh(guide)
    return guide
