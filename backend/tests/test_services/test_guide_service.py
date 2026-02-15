"""Tests for guide service."""
import pytest
from app.models.db import Guide
from app.models.enums import ContentStatus
from app.services.guide_service import guide_service


class TestGuideServiceCRUD:
    """Test basic CRUD operations for guides."""

    def test_create_guide(self, db_session, admin_user):
        """Should create a new guide."""
        data = {
            "title": "New Guide",
            "desc": "Test description",
            "content": "Test content for the guide",
            "category": "Tutorial",
            "time": "15 min",
        }
        guide = guide_service.create_guide(db_session, data, admin_user)

        assert guide.id is not None
        assert guide.title == "New Guide"
        assert guide.author_id == admin_user.id
        assert guide.status == ContentStatus.PUBLISHED  # Admin doesn't require approval

    def test_create_guide_requires_approval_for_regular_user(self, db_session, regular_user):
        """Regular user guides should start as PENDING."""
        data = {
            "title": "User Guide",
            "desc": "Test",
            "content": "Test content",
        }
        guide = guide_service.create_guide(db_session, data, regular_user)

        assert guide.status == ContentStatus.PENDING

    def test_get_guide(self, db_session, sample_guide):
        """Should retrieve a guide by ID."""
        guide = guide_service.get(db_session, sample_guide.id)

        assert guide is not None
        assert guide.id == sample_guide.id
        assert guide.title == sample_guide.title

    def test_update_guide(self, db_session, sample_guide, admin_user):
        """Should update an existing guide."""
        updated = guide_service.update_guide(
            db_session,
            sample_guide.id,
            {"title": "Updated Guide Title"},
            admin_user
        )

        assert updated is not None
        assert updated.title == "Updated Guide Title"

    def test_update_guide_unauthorized(self, db_session, sample_guide, regular_user):
        """Regular user should not update another user's guide."""
        updated = guide_service.update_guide(
            db_session,
            sample_guide.id,
            {"title": "Hacked"},
            regular_user
        )

        assert updated is None

    def test_update_status(self, db_session, sample_guide):
        """Should update guide status."""
        updated = guide_service.update_status(db_session, sample_guide.id, ContentStatus.DRAFT)

        assert updated is not None
        assert updated.status == ContentStatus.DRAFT


class TestGuideServiceQueries:
    """Test query methods."""

    def test_search_guides(self, db_session, sample_guide):
        """Should find guides by search term."""
        query = guide_service.search(db_session, search_term="Test", status=ContentStatus.PUBLISHED)
        guides = query.all()

        assert len(guides) >= 1
        assert any(g.id == sample_guide.id for g in guides)

    def test_get_published(self, db_session, sample_guide):
        """Should only return published guides."""
        # Create a draft guide
        draft = Guide(
            title="Draft Guide",
            content="Draft content",
            status=ContentStatus.DRAFT,
            author_id=sample_guide.author_id,
            author_name=sample_guide.author_name,
        )
        db_session.add(draft)
        db_session.commit()

        query = guide_service.get_published(db_session)
        guides = query.all()

        assert any(g.id == sample_guide.id for g in guides)
        assert not any(g.id == draft.id for g in guides)


class TestGuideServiceSoftDeletes:
    """Test soft delete functionality."""

    def test_soft_delete_guide(self, db_session, sample_guide):
        """Should soft delete a guide."""
        deleted = guide_service.delete(db_session, sample_guide.id, soft=True)

        assert deleted is not None
        assert deleted.deleted_at is not None

    def test_restore_guide(self, db_session, sample_guide):
        """Should restore a soft-deleted guide."""
        guide_service.delete(db_session, sample_guide.id, soft=True)
        restored = guide_service.restore(db_session, sample_guide.id)

        assert restored is not None
        assert restored.deleted_at is None
