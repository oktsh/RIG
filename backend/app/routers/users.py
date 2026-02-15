from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.exceptions import NotFoundError, ConflictError
from app.models.db import User
from app.models.schemas import UserCreate, UserUpdate, UserResponse, PaginatedUsers
from app.middleware.auth import require_role
from app.services.user_service import user_service
from app.utils.pagination import paginate

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/", response_model=PaginatedUsers)
def list_users(
    search: str | None = None,
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("ADMIN")),
):
    query = user_service.search(db, search)
    query = query.order_by(User.created_at.desc())
    return paginate(query, page, limit)


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("ADMIN")),
):
    existing = user_service.get_by_email(db, data.email)
    if existing:
        raise ConflictError("Email already registered")

    return user_service.create_user(db, data.model_dump())


@router.patch("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("ADMIN")),
):
    user = user_service.update_user(db, user_id, data.model_dump())
    if not user:
        raise NotFoundError("User")
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("ADMIN")),
):
    user = user_service.delete(db, user_id)
    if not user:
        raise NotFoundError("User")
