"""Tests for ruleset service."""
import pytest
from app.services.ruleset_service import ruleset_service


class TestRulesetService:
    """Test ruleset service operations."""

    def test_get_ruleset(self, db_session, sample_ruleset):
        """Should retrieve a ruleset by ID."""
        ruleset = ruleset_service.get(db_session, sample_ruleset.id)

        assert ruleset is not None
        assert ruleset.id == sample_ruleset.id
        assert ruleset.title == sample_ruleset.title

    def test_soft_delete_ruleset(self, db_session, sample_ruleset):
        """Should soft delete a ruleset."""
        deleted = ruleset_service.delete(db_session, sample_ruleset.id, soft=True)

        assert deleted is not None
        assert deleted.deleted_at is not None

    def test_restore_ruleset(self, db_session, sample_ruleset):
        """Should restore a soft-deleted ruleset."""
        ruleset_service.delete(db_session, sample_ruleset.id, soft=True)
        restored = ruleset_service.restore(db_session, sample_ruleset.id)

        assert restored is not None
        assert restored.deleted_at is None

    def test_get_multi_excludes_deleted(self, db_session, sample_ruleset):
        """get_multi should exclude soft-deleted rulesets."""
        # Soft delete
        ruleset_service.delete(db_session, sample_ruleset.id, soft=True)

        # Query without deleted
        rulesets = ruleset_service.get_multi(db_session, include_deleted=False)
        assert not any(r.id == sample_ruleset.id for r in rulesets)

        # Query with deleted
        rulesets = ruleset_service.get_multi(db_session, include_deleted=True)
        assert any(r.id == sample_ruleset.id for r in rulesets)
