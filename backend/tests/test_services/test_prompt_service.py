"""Tests for prompt service."""
import pytest
from app.models.db import Prompt
from app.models.enums import ContentStatus
from app.services.prompt_service import prompt_service


class TestPromptServiceCRUD:
    """Test basic CRUD operations."""

    def test_create_prompt(self, db_session, admin_user):
        """Should create a new prompt."""
        data = {
            "title": "New Prompt",
            "desc": "Test description",
            "content": "Test content",
            "tags": ["test"],
            "tech": "Python",
        }
        prompt = prompt_service.create_prompt(db_session, data, admin_user)

        assert prompt.id is not None
        assert prompt.title == "New Prompt"
        assert prompt.author_id == admin_user.id
        assert prompt.status == ContentStatus.PUBLISHED  # Admin doesn't require approval

    def test_create_prompt_requires_approval_for_regular_user(self, db_session, regular_user):
        """Regular user prompts should start as PENDING."""
        data = {
            "title": "User Prompt",
            "desc": "Test",
            "content": "Test content",
        }
        prompt = prompt_service.create_prompt(db_session, data, regular_user)

        assert prompt.status == ContentStatus.PENDING  # Regular user requires approval

    def test_get_prompt(self, db_session, sample_prompt):
        """Should retrieve a prompt by ID."""
        prompt = prompt_service.get(db_session, sample_prompt.id)

        assert prompt is not None
        assert prompt.id == sample_prompt.id
        assert prompt.title == sample_prompt.title

    def test_get_nonexistent_prompt(self, db_session):
        """Should return None for non-existent prompt."""
        prompt = prompt_service.get(db_session, 99999)
        assert prompt is None

    def test_update_prompt(self, db_session, sample_prompt, admin_user):
        """Should update an existing prompt."""
        updated = prompt_service.update_prompt(
            db_session,
            sample_prompt.id,
            {"title": "Updated Title"},
            admin_user
        )

        assert updated is not None
        assert updated.title == "Updated Title"

    def test_update_prompt_unauthorized(self, db_session, sample_prompt, regular_user):
        """Regular user should not update another user's prompt."""
        updated = prompt_service.update_prompt(
            db_session,
            sample_prompt.id,
            {"title": "Hacked"},
            regular_user
        )

        assert updated is None  # Not authorized

    def test_delete_prompt_soft(self, db_session, sample_prompt):
        """Should soft delete a prompt."""
        deleted = prompt_service.delete(db_session, sample_prompt.id, soft=True)

        assert deleted is not None
        assert deleted.deleted_at is not None

        # Verify it's hidden from normal queries
        prompt = prompt_service.get(db_session, sample_prompt.id, include_deleted=False)
        assert prompt is None

    def test_delete_prompt_hard(self, db_session, sample_prompt):
        """Should hard delete a prompt."""
        prompt_id = sample_prompt.id
        deleted = prompt_service.delete(db_session, prompt_id, soft=False)

        assert deleted is not None

        # Verify it's completely gone
        prompt = prompt_service.get(db_session, prompt_id, include_deleted=True)
        assert prompt is None

    def test_restore_prompt(self, db_session, sample_prompt):
        """Should restore a soft-deleted prompt."""
        # Soft delete
        prompt_service.delete(db_session, sample_prompt.id, soft=True)

        # Restore
        restored = prompt_service.restore(db_session, sample_prompt.id)

        assert restored is not None
        assert restored.deleted_at is None
        assert restored.id == sample_prompt.id


class TestPromptServiceQueries:
    """Test query methods."""

    def test_search_prompts_by_title(self, db_session, sample_prompt):
        """Should find prompts by title search."""
        query = prompt_service.search(db_session, search_term="Test", status=ContentStatus.PUBLISHED)
        prompts = query.all()

        assert len(prompts) >= 1
        assert any(p.id == sample_prompt.id for p in prompts)

    def test_search_prompts_by_description(self, db_session, sample_prompt):
        """Should find prompts by description search."""
        query = prompt_service.search(db_session, search_term="description", status=ContentStatus.PUBLISHED)
        prompts = query.all()

        assert len(prompts) >= 1
        assert any(p.id == sample_prompt.id for p in prompts)

    def test_search_prompts_case_insensitive(self, db_session, sample_prompt):
        """Search should be case-insensitive."""
        query = prompt_service.search(db_session, search_term="TEST", status=ContentStatus.PUBLISHED)
        prompts = query.all()

        assert len(prompts) >= 1
        assert any(p.id == sample_prompt.id for p in prompts)

    def test_get_by_status(self, db_session, sample_prompt, draft_prompt):
        """Should filter prompts by status."""
        # Get published prompts
        query = prompt_service.get_by_status(db_session, ContentStatus.PUBLISHED)
        published = query.all()

        assert any(p.id == sample_prompt.id for p in published)
        assert not any(p.id == draft_prompt.id for p in published)

        # Get draft prompts
        query = prompt_service.get_by_status(db_session, ContentStatus.DRAFT)
        drafts = query.all()

        assert any(p.id == draft_prompt.id for p in drafts)
        assert not any(p.id == sample_prompt.id for p in drafts)

    def test_get_published(self, db_session, sample_prompt, draft_prompt):
        """Should only return published prompts."""
        query = prompt_service.get_published(db_session)
        prompts = query.all()

        assert any(p.id == sample_prompt.id for p in prompts)
        assert not any(p.id == draft_prompt.id for p in prompts)

    def test_update_status(self, db_session, draft_prompt):
        """Should update prompt status."""
        updated = prompt_service.update_status(db_session, draft_prompt.id, ContentStatus.PUBLISHED)

        assert updated is not None
        assert updated.status == ContentStatus.PUBLISHED


class TestPromptServiceSoftDeletes:
    """Test soft delete functionality."""

    def test_get_multi_excludes_deleted(self, db_session):
        """get_multi should exclude soft-deleted prompts by default."""
        # Create two prompts
        p1 = Prompt(title="Prompt 1", content="Content 1", status=ContentStatus.PUBLISHED)
        p2 = Prompt(title="Prompt 2", content="Content 2", status=ContentStatus.PUBLISHED)
        db_session.add_all([p1, p2])
        db_session.commit()

        # Soft delete one
        prompt_service.delete(db_session, p1.id, soft=True)

        # Query all
        prompts = prompt_service.get_multi(db_session, include_deleted=False)

        # Should only get p2
        assert len(prompts) == 1
        assert prompts[0].id == p2.id

    def test_get_multi_includes_deleted_when_requested(self, db_session):
        """get_multi should include soft-deleted prompts when requested."""
        # Create and soft-delete a prompt
        p = Prompt(title="Deleted Prompt", content="Content", status=ContentStatus.PUBLISHED)
        db_session.add(p)
        db_session.commit()
        prompt_service.delete(db_session, p.id, soft=True)

        # Query with include_deleted=True
        prompts = prompt_service.get_multi(db_session, include_deleted=True)

        # Should include the deleted prompt
        assert any(pr.id == p.id for pr in prompts)
