"""
Tests for /api/proposals endpoints (create public, list admin/mod).
"""

import pytest

from tests.conftest import get_auth_header


SAMPLE_PROPOSAL = {
    "type": "prompt",
    "title": "Community Prompt Idea",
    "description": "A great idea for a prompt",
    "content": "Here is the full prompt content...",
    "email": "contributor@example.com",
    "tags": ["python", "ai"],
}


# ---------------------------------------------------------------------------
# POST /api/proposals  (public, no auth required)
# ---------------------------------------------------------------------------

class TestCreateProposal:
    """Tests for submitting community proposals."""

    def test_submit_proposal(self, client):
        """Anyone can submit a proposal without authentication."""
        resp = client.post("/api/proposals/", json=SAMPLE_PROPOSAL)
        assert resp.status_code == 201
        body = resp.json()
        assert body["title"] == "Community Prompt Idea"
        assert body["type"] == "prompt"
        assert body["email"] == "contributor@example.com"
        assert body["status"] == "pending"
        assert "id" in body

    def test_submit_proposal_with_different_type(self, client):
        """Proposals can have different types (guide, ruleset, etc.)."""
        payload = {**SAMPLE_PROPOSAL, "type": "guide", "title": "Guide Proposal"}
        resp = client.post("/api/proposals/", json=payload)
        assert resp.status_code == 201
        assert resp.json()["type"] == "guide"

    def test_submit_proposal_missing_required_fields(self, client):
        """Submitting a proposal without required fields returns 422."""
        resp = client.post("/api/proposals/", json={"title": "Incomplete"})
        assert resp.status_code == 422

    def test_submit_proposal_empty_tags(self, client):
        """Proposals can be submitted with an empty tags list."""
        payload = {**SAMPLE_PROPOSAL, "tags": []}
        resp = client.post("/api/proposals/", json=payload)
        assert resp.status_code == 201


# ---------------------------------------------------------------------------
# GET /api/proposals  (admin/moderator only)
# ---------------------------------------------------------------------------

class TestListProposals:
    """Tests for listing proposals (admin/moderator only)."""

    def test_admin_can_list_proposals(self, client, admin_user, admin_headers):
        """Admin can see all proposals."""
        # Create a proposal first
        client.post("/api/proposals/", json=SAMPLE_PROPOSAL)

        resp = client.get("/api/proposals/", headers=admin_headers)
        assert resp.status_code == 200
        body = resp.json()
        assert "items" in body
        assert len(body["items"]) >= 1

    def test_moderator_can_list_proposals(
        self, client, moderator_user, moderator_headers
    ):
        """Moderator can see all proposals."""
        # Create a proposal first
        client.post("/api/proposals/", json=SAMPLE_PROPOSAL)

        resp = client.get("/api/proposals/", headers=moderator_headers)
        assert resp.status_code == 200
        body = resp.json()
        assert "items" in body
        assert len(body["items"]) >= 1

    def test_regular_user_cannot_list_proposals(
        self, client, regular_user, user_headers
    ):
        """Regular USER cannot list proposals (403)."""
        resp = client.get("/api/proposals/", headers=user_headers)
        assert resp.status_code == 403

    def test_unauthenticated_cannot_list_proposals(self, client):
        """Unauthenticated request cannot list proposals (401/403)."""
        resp = client.get("/api/proposals/")
        assert resp.status_code in (401, 403)

    def test_proposals_ordered_by_created_at_desc(
        self, client, admin_user, admin_headers
    ):
        """Proposals are returned newest first."""
        # Submit two proposals
        p1 = {**SAMPLE_PROPOSAL, "title": "First Proposal"}
        p2 = {**SAMPLE_PROPOSAL, "title": "Second Proposal"}
        client.post("/api/proposals/", json=p1)
        client.post("/api/proposals/", json=p2)

        resp = client.get("/api/proposals/", headers=admin_headers)
        assert resp.status_code == 200
        body = resp.json()
        proposals = body["items"]
        assert len(proposals) >= 2
        # The second proposal should appear before the first (newest first)
        titles = [p["title"] for p in proposals]
        idx_first = titles.index("First Proposal")
        idx_second = titles.index("Second Proposal")
        assert idx_second < idx_first
