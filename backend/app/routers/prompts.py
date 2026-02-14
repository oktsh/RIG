from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.db import Prompt, User
from app.models.schemas import PromptCreate, PromptUpdate, PromptResponse
from app.middleware.auth import get_current_user, require_role

router = APIRouter(prefix="/api/prompts", tags=["prompts"])


@router.get("/", response_model=list[PromptResponse])
def list_prompts(db: Session = Depends(get_db)):
    return db.query(Prompt).filter(Prompt.status == "published").all()


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
