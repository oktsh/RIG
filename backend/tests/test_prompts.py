"""
Tests for /api/prompts endpoints (list, get, create).
"""

import pytest

from app.models.db import Prompt
from tests.conftest import get_auth_header


# ---------------------------------------------------------------------------
# GET /api/prompts  (public, published only)
# ---------------------------------------------------------------------------

class TestListPrompts:
    """Tests for listing published prompts."""

    def test_list_prompts_empty(self, client):
        """When there are no prompts the endpoint returns an empty list."""
        resp = client.get("/api/prompts/")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_list_prompts_returns_only_published(self, client, db_session, admin_user):
        """Only prompts with status='published' are returned."""
        # Create one published and one draft prompt directly in the DB
        published = Prompt(
            title="Published Prompt",
            desc="A published prompt",
            author_id=admin_user.id,
            author_name=admin_user.name,
            status="published",
            tags=["python"],
            tech="Python",
            content="Do something",
        )
        draft = Prompt(
            title="Draft Prompt",
            desc="A draft prompt",
            author_id=admin_user.id,
            author_name=admin_user.name,
            status="draft",
            tags=[],
            content="WIP",
        )
        pending = Prompt(
            title="Pending Prompt",
            desc="A pending prompt",
            author_id=admin_user.id,
            author_name=admin_user.name,
            status="pending",
            tags=[],
            content="Awaiting review",
        )
        db_session.add_all([published, draft, pending])
        db_session.commit()

        resp = client.get("/api/prompts/")
        assert resp.status_code == 200
        prompts = resp.json()
        assert len(prompts) == 1
        assert prompts[0]["title"] == "Published Prompt"
        assert prompts[0]["status"] == "published"

    def test_list_prompts_no_auth_required(self, client):
        """The public prompts endpoint does not require authentication."""
        resp = client.get("/api/prompts/")
        assert resp.status_code == 200


# ---------------------------------------------------------------------------
# GET /api/prompts/:id  (get single prompt)
# ---------------------------------------------------------------------------

class TestGetPrompt:
    """Tests for getting a single prompt by ID."""

    def test_get_prompt_by_id(self, client, db_session, admin_user):
        """Get an existing prompt by its ID."""
        prompt = Prompt(
            title="My Prompt",
            desc="Desc",
            author_id=admin_user.id,
            author_name=admin_user.name,
            status="published",
            tags=["test"],
            content="content here",
        )
        db_session.add(prompt)
        db_session.commit()
        db_session.refresh(prompt)

        resp = client.get(f"/api/prompts/{prompt.id}")
        assert resp.status_code == 200
        body = resp.json()
        assert body["title"] == "My Prompt"
        assert body["id"] == prompt.id

    def test_get_prompt_not_found(self, client):
        """Get a prompt that does not exist returns 404."""
        resp = client.get("/api/prompts/99999")
        assert resp.status_code == 404


# ---------------------------------------------------------------------------
# POST /api/prompts  (create prompt, auth required)
# ---------------------------------------------------------------------------

class TestCreatePrompt:
    """Tests for creating prompts."""

    def test_create_prompt_authenticated(self, client, regular_user, user_headers):
        """An authenticated user can create a prompt."""
        resp = client.post(
            "/api/prompts/",
            json={
                "title": "New Prompt",
                "desc": "A test prompt",
                "tags": ["python", "ai"],
                "tech": "Python",
                "content": "Write clean code.",
            },
            headers=user_headers,
        )
        assert resp.status_code == 201
        body = resp.json()
        assert body["title"] == "New Prompt"
        assert body["author_name"] == "Regular User"
        assert body["tags"] == ["python", "ai"]
        # Regular user requires approval, so status should be "pending"
        assert body["status"] == "pending"

    def test_create_prompt_admin_auto_publishes(self, client, admin_user, admin_headers):
        """Admin user (requires_approval=False) gets auto-published prompts."""
        resp = client.post(
            "/api/prompts/",
            json={
                "title": "Admin Prompt",
                "desc": "Admin-created prompt",
                "tags": [],
                "content": "Content",
            },
            headers=admin_headers,
        )
        assert resp.status_code == 201
        assert resp.json()["status"] == "published"

    def test_create_prompt_without_auth(self, client):
        """Creating a prompt without authentication returns 401/403."""
        resp = client.post(
            "/api/prompts/",
            json={
                "title": "No Auth Prompt",
                "desc": "Should fail",
                "content": "content",
            },
        )
        assert resp.status_code in (401, 403)

    def test_create_prompt_minimal_fields(self, client, regular_user, user_headers):
        """Creating a prompt with only the required 'title' field succeeds."""
        resp = client.post(
            "/api/prompts/",
            json={"title": "Minimal Prompt"},
            headers=user_headers,
        )
        assert resp.status_code == 201
        body = resp.json()
        assert body["title"] == "Minimal Prompt"
        assert body["tags"] == []

    def test_create_prompt_missing_title(self, client, regular_user, user_headers):
        """Creating a prompt without a title returns 422."""
        resp = client.post(
            "/api/prompts/",
            json={"desc": "No title provided"},
            headers=user_headers,
        )
        assert resp.status_code == 422
