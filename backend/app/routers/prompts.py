from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.db import Prompt, User
from app.models.schemas import PromptCreate, PromptUpdate, PromptResponse, PaginatedPrompts
from app.middleware.auth import get_current_user, require_role
from app.utils.pagination import paginate

router = APIRouter(prefix="/api/prompts", tags=["prompts"])


@router.get("/", response_model=PaginatedPrompts)
def list_prompts(
    search: str | None = None,
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    query = db.query(Prompt).filter(Prompt.status == "published")
    if search:
        term = f"%{search}%"
        query = query.filter(Prompt.title.ilike(term) | Prompt.desc.ilike(term))
    query = query.order_by(Prompt.created_at.desc())
    return paginate(query, page, limit)


@router.get("/moderation/pending", response_model=PaginatedPrompts)
def list_moderation_prompts(
    status: str = "pending",
    search: str | None = None,
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("ADMIN", "MODERATOR")),
):
    query = db.query(Prompt)
    if status != "all":
        query = query.filter(Prompt.status == status)
    if search:
        term = f"%{search}%"
        query = query.filter(Prompt.title.ilike(term) | Prompt.desc.ilike(term))
    query = query.order_by(Prompt.created_at.desc())
    return paginate(query, page, limit)


@router.get("/{prompt_id}", response_model=PromptResponse)
def get_prompt(prompt_id: int, db: Session = Depends(get_db)):
    prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    return prompt


@router.post("/", response_model=PromptResponse, status_code=status.HTTP_201_CREATED)
def create_prompt(
    data: PromptCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    prompt = Prompt(
        title=data.title,
        desc=data.desc,
        tags=data.tags,
        tech=data.tech,
        content=data.content,
        author_id=user.id,
        author_name=user.name,
        status="pending" if user.requires_approval else "published",
    )
    db.add(prompt)
    db.commit()
    db.refresh(prompt)
    return prompt


@router.put("/{prompt_id}", response_model=PromptResponse)
def update_prompt(
    prompt_id: int,
    data: PromptUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    if prompt.author_id != user.id and user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized")

    for field, value in data.model_dump(exclude_unset=True).items():
        if field == "status" and user.role != "ADMIN":
            continue
        setattr(prompt, field, value)

    db.commit()
    db.refresh(prompt)
    return prompt


@router.patch("/{prompt_id}/status", response_model=PromptResponse)
def update_prompt_status(
    prompt_id: int,
    status: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("ADMIN", "MODERATOR")),
):
    prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    prompt.status = status
    db.commit()
    db.refresh(prompt)
    return prompt
