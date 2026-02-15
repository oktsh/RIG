"""Integration tests for prompts router."""
import pytest


class TestListPrompts:
    """Test GET /api/prompts."""

    def test_list_prompts_public(self, client, sample_prompt):
        """Should list published prompts without auth."""
        response = client.get("/api/prompts")

        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert "page" in data
        assert data["page"] == 1

    def test_list_prompts_with_search(self, client, sample_prompt):
        """Should filter prompts by search term."""
        response = client.get("/api/prompts?search=Test")

        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) >= 1

    def test_list_prompts_pagination(self, client, sample_prompt):
        """Should support pagination."""
        response = client.get("/api/prompts?page=1&limit=5")

        assert response.status_code == 200
        data = response.json()
        assert data["limit"] == 5
        assert data["page"] == 1


class TestGetPrompt:
    """Test GET /api/prompts/{id}."""

    def test_get_prompt_success(self, client, sample_prompt):
        """Should return a specific prompt."""
        response = client.get(f"/api/prompts/{sample_prompt.id}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_prompt.id
        assert data["title"] == sample_prompt.title

    def test_get_prompt_not_found(self, client):
        """Should return 404 for non-existent prompt."""
        response = client.get("/api/prompts/99999")

        assert response.status_code == 404
        data = response.json()
        assert data["type"] == "NotFoundError"


class TestCreatePrompt:
    """Test POST /api/prompts."""

    def test_create_prompt_as_admin(self, client, admin_headers):
        """Admin should create published prompt."""
        response = client.post(
            "/api/prompts",
            json={
                "title": "New Test Prompt",
                "desc": "Test description",
                "content": "Test content for the prompt",
                "tags": ["test"],
            },
            headers=admin_headers
        )

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "New Test Prompt"
        assert data["status"] == "published"

    def test_create_prompt_as_user(self, client, user_headers):
        """Regular user prompt should be pending."""
        response = client.post(
            "/api/prompts",
            json={
                "title": "User Prompt",
                "desc": "Test",
                "content": "Test content",
            },
            headers=user_headers
        )

        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "pending"

    def test_create_prompt_unauthorized(self, client):
        """Should reject creation without auth."""
        response = client.post(
            "/api/prompts",
            json={"title": "Test", "content": "Test"}
        )

        assert response.status_code == 401

    def test_create_prompt_validation_error(self, client, admin_headers):
        """Should validate prompt data."""
        response = client.post(
            "/api/prompts",
            json={"title": "ab"},  # Too short (min 3 chars)
            headers=admin_headers
        )

        assert response.status_code == 422  # Validation error


class TestUpdatePrompt:
    """Test PUT /api/prompts/{id}."""

    def test_update_own_prompt(self, client, sample_prompt, admin_headers):
        """Should update own prompt."""
        response = client.put(
            f"/api/prompts/{sample_prompt.id}",
            json={"title": "Updated Title"},
            headers=admin_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Title"

    def test_update_prompt_unauthorized(self, client, sample_prompt, user_headers):
        """Regular user cannot update others' prompts."""
        response = client.put(
            f"/api/prompts/{sample_prompt.id}",
            json={"title": "Hacked"},
            headers=user_headers
        )

        assert response.status_code == 404  # Not found or not authorized


class TestUpdatePromptStatus:
    """Test PATCH /api/prompts/{id}/status."""

    def test_update_status_as_admin(self, client, draft_prompt, admin_headers):
        """Admin should update prompt status."""
        response = client.patch(
            f"/api/prompts/{draft_prompt.id}/status?status=published",
            headers=admin_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "published"

    def test_update_status_as_moderator(self, client, draft_prompt, moderator_headers):
        """Moderator should update prompt status."""
        response = client.patch(
            f"/api/prompts/{draft_prompt.id}/status?status=published",
            headers=moderator_headers
        )

        assert response.status_code == 200

    def test_update_status_as_user(self, client, draft_prompt, user_headers):
        """Regular user cannot update status."""
        response = client.patch(
            f"/api/prompts/{draft_prompt.id}/status?status=published",
            headers=user_headers
        )

        assert response.status_code == 403  # Forbidden
