from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.db import Prompt, User
from app.models.enums import ContentStatus, UserRole
from app.models.schemas import PromptCreate, PromptUpdate, PromptResponse, PaginatedPrompts
from app.middleware.auth import get_current_user, require_role
from app.services.prompt_service import prompt_service
from app.utils.pagination import paginate

router = APIRouter(prefix="/api/prompts", tags=["prompts"])


@router.get("/", response_model=PaginatedPrompts)
def list_prompts(
    search: str | None = None,
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    query = prompt_service.search(db, search, status=ContentStatus.PUBLISHED)
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
    query = prompt_service.search(db, search, status=status if status != "all" else None)
    query = query.order_by(Prompt.created_at.desc())
    return paginate(query, page, limit)


@router.get("/{prompt_id}", response_model=PromptResponse)
def get_prompt(prompt_id: int, db: Session = Depends(get_db)):
    prompt = prompt_service.get(db, prompt_id)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    return prompt


@router.post("/", response_model=PromptResponse, status_code=status.HTTP_201_CREATED)
def create_prompt(
    data: PromptCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return prompt_service.create_prompt(db, data.model_dump(), user)


@router.put("/{prompt_id}", response_model=PromptResponse)
def update_prompt(
    prompt_id: int,
    data: PromptUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    prompt = prompt_service.update_prompt(db, prompt_id, data.model_dump(exclude_unset=True), user)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found or not authorized")
    return prompt


@router.patch("/{prompt_id}/status", response_model=PromptResponse)
def update_prompt_status(
    prompt_id: int,
    status: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("ADMIN", "MODERATOR")),
):
    prompt = prompt_service.update_status(db, prompt_id, status)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    return prompt
