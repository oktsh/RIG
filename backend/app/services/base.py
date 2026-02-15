"""Base CRUD service with generic operations."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Generic, TypeVar

from sqlalchemy.orm import Session

ModelType = TypeVar("ModelType")


class CRUDBase(Generic[ModelType]):
    """Generic CRUD service with common database operations."""

    def __init__(self, model: type[ModelType]) -> None:
        """Initialize with a SQLAlchemy model class."""
        self.model = model

    def get(self, db: Session, id: int, include_deleted: bool = False) -> ModelType | None:
        """Get a single record by ID.

        Args:
            db: Database session
            id: Record ID
            include_deleted: If True, include soft-deleted records

        Returns:
            Model instance or None if not found
        """
        query = db.query(self.model).filter(self.model.id == id)
        if not include_deleted and hasattr(self.model, "deleted_at"):
            query = query.filter(self.model.deleted_at == None)
        return query.first()

    def get_multi(
        self, db: Session, skip: int = 0, limit: int = 100, include_deleted: bool = False
    ) -> list[ModelType]:
        """Get multiple records with pagination.

        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum number of records to return
            include_deleted: If True, include soft-deleted records

        Returns:
            List of model instances
        """
        query = db.query(self.model)
        if not include_deleted and hasattr(self.model, "deleted_at"):
            query = query.filter(self.model.deleted_at == None)
        return query.offset(skip).limit(limit).all()

    def create(self, db: Session, obj_in: dict[str, Any]) -> ModelType:
        """Create a new record."""
        db_obj = self.model(**obj_in)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self, db: Session, db_obj: ModelType, obj_in: dict[str, Any]
    ) -> ModelType:
        """Update an existing record."""
        for field, value in obj_in.items():
            setattr(db_obj, field, value)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, id: int, soft: bool = True) -> ModelType | None:
        """Delete a record by ID.

        Args:
            db: Database session
            id: Record ID
            soft: If True, perform soft delete (set deleted_at); if False, hard delete from database

        Returns:
            Deleted model instance or None if not found
        """
        obj = self.get(db, id, include_deleted=False)
        if not obj:
            return None

        if soft and hasattr(obj, "deleted_at"):
            # Soft delete: set deleted_at timestamp
            obj.deleted_at = datetime.utcnow()
            db.commit()
            db.refresh(obj)
        else:
            # Hard delete: remove from database
            db.delete(obj)
            db.commit()
        return obj

    def restore(self, db: Session, id: int) -> ModelType | None:
        """Restore a soft-deleted record.

        Args:
            db: Database session
            id: Record ID

        Returns:
            Restored model instance or None if not found or not soft-deleted
        """
        if not hasattr(self.model, "deleted_at"):
            return None

        obj = (
            db.query(self.model)
            .filter(self.model.id == id, self.model.deleted_at != None)
            .first()
        )

        if obj:
            obj.deleted_at = None
            db.commit()
            db.refresh(obj)
        return obj
