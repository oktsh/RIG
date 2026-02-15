"""Tests for agent service."""
import pytest
from app.models.enums import AgentStatus
from app.services.agent_service import agent_service


class TestAgentService:
    """Test agent service operations."""

    def test_get_agent(self, db_session, sample_agent):
        """Should retrieve an agent by ID."""
        agent = agent_service.get(db_session, sample_agent.id)

        assert agent is not None
        assert agent.id == sample_agent.id
        assert agent.title == sample_agent.title

    def test_soft_delete_agent(self, db_session, sample_agent):
        """Should soft delete an agent."""
        deleted = agent_service.delete(db_session, sample_agent.id, soft=True)

        assert deleted is not None
        assert deleted.deleted_at is not None

    def test_restore_agent(self, db_session, sample_agent):
        """Should restore a soft-deleted agent."""
        agent_service.delete(db_session, sample_agent.id, soft=True)
        restored = agent_service.restore(db_session, sample_agent.id)

        assert restored is not None
        assert restored.deleted_at is None

    def test_get_multi_excludes_deleted(self, db_session, sample_agent):
        """get_multi should exclude soft-deleted agents."""
        # Soft delete the agent
        agent_service.delete(db_session, sample_agent.id, soft=True)

        # Query without deleted
        agents = agent_service.get_multi(db_session, include_deleted=False)
        assert not any(a.id == sample_agent.id for a in agents)

        # Query with deleted
        agents = agent_service.get_multi(db_session, include_deleted=True)
        assert any(a.id == sample_agent.id for a in agents)
