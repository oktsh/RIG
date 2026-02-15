"""
Shared test fixtures for the RIG backend test suite.

Provides:
- In-memory SQLite test database
- Overridden get_db dependency for test isolation
- TestClient instance
- Fixtures for creating users with different roles
- Fixtures for obtaining auth tokens
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models.db import User
from app.services.auth import hash_password, create_access_token


# ---------------------------------------------------------------------------
# Database fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(scope="function")
def db_engine():
    """Create a fresh in-memory SQLite engine for each test."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture(scope="function")
def db_session(db_engine):
    """Create a new database session for each test."""
    TestingSessionLocal = sessionmaker(
        autocommit=False, autoflush=False, bind=db_engine
    )
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="function")
def client(db_session):
    """
    FastAPI TestClient with the get_db dependency overridden
    to use the in-memory test database.
    """

    def _override_get_db():
        try:
            yield db_session
        finally:
            pass  # session cleanup handled by the db_session fixture

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c
    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# User creation helpers
# ---------------------------------------------------------------------------

def _make_user(
    db_session,
    *,
    name: str,
    email: str,
    password: str = "testpass123",
    role: str = "USER",
    requires_approval: bool = True,
    is_active: bool = True,
) -> User:
    """Insert a user directly into the test database and return it."""
    user = User(
        name=name,
        email=email,
        password_hash=hash_password(password),
        role=role,
        requires_approval=requires_approval,
        is_active=is_active,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture()
def admin_user(db_session) -> User:
    """An active admin user."""
    return _make_user(
        db_session,
        name="Admin User",
        email="admin@test.com",
        role="ADMIN",
        requires_approval=False,
    )


@pytest.fixture()
def moderator_user(db_session) -> User:
    """An active moderator user."""
    return _make_user(
        db_session,
        name="Moderator User",
        email="mod@test.com",
        role="MODERATOR",
        requires_approval=False,
    )


@pytest.fixture()
def regular_user(db_session) -> User:
    """An active regular user (requires approval by default)."""
    return _make_user(
        db_session,
        name="Regular User",
        email="user@test.com",
        role="USER",
        requires_approval=True,
    )


@pytest.fixture()
def inactive_user(db_session) -> User:
    """An inactive user (cannot login)."""
    return _make_user(
        db_session,
        name="Inactive User",
        email="inactive@test.com",
        role="USER",
        is_active=False,
    )


# ---------------------------------------------------------------------------
# Auth token helpers
# ---------------------------------------------------------------------------

def get_auth_header(user: User) -> dict[str, str]:
    """Return an Authorization header dict for the given user."""
    token = create_access_token(user.id, user.role)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def admin_headers(admin_user) -> dict[str, str]:
    """Authorization headers for the admin user."""
    return get_auth_header(admin_user)


@pytest.fixture()
def moderator_headers(moderator_user) -> dict[str, str]:
    """Authorization headers for the moderator user."""
    return get_auth_header(moderator_user)


@pytest.fixture()
def user_headers(regular_user) -> dict[str, str]:
    """Authorization headers for the regular user."""
    return get_auth_header(regular_user)


# ---------------------------------------------------------------------------
# Content model fixtures
# ---------------------------------------------------------------------------

@pytest.fixture()
def sample_prompt(db_session, admin_user):
    """Create a published prompt for testing."""
    from app.models.db import Prompt
    from app.models.enums import ContentStatus

    prompt = Prompt(
        title="Test Prompt",
        desc="A test prompt description",
        content="Test prompt content for testing purposes",
        tags=["test", "sample"],
        tech="Python",
        status=ContentStatus.PUBLISHED,
        author_id=admin_user.id,
        author_name=admin_user.name,
    )
    db_session.add(prompt)
    db_session.commit()
    db_session.refresh(prompt)
    return prompt


@pytest.fixture()
def draft_prompt(db_session, regular_user):
    """Create a draft prompt for testing."""
    from app.models.db import Prompt
    from app.models.enums import ContentStatus

    prompt = Prompt(
        title="Draft Prompt",
        desc="A draft prompt",
        content="Draft content",
        status=ContentStatus.DRAFT,
        author_id=regular_user.id,
        author_name=regular_user.name,
    )
    db_session.add(prompt)
    db_session.commit()
    db_session.refresh(prompt)
    return prompt


@pytest.fixture()
def sample_guide(db_session, admin_user):
    """Create a published guide for testing."""
    from app.models.db import Guide
    from app.models.enums import ContentStatus

    guide = Guide(
        title="Test Guide",
        desc="A test guide description",
        content="Test guide content for testing purposes",
        category="Tutorial",
        time="10 min",
        status=ContentStatus.PUBLISHED,
        author_id=admin_user.id,
        author_name=admin_user.name,
    )
    db_session.add(guide)
    db_session.commit()
    db_session.refresh(guide)
    return guide


@pytest.fixture()
def sample_agent(db_session, admin_user):
    """Create an active agent for testing."""
    from app.models.db import Agent
    from app.models.enums import AgentStatus, ContentStatus

    agent = Agent(
        title="Test Agent",
        desc="A test agent description",
        number="001",
        status=AgentStatus.ACTIVE,
        content_status=ContentStatus.PUBLISHED,
        author_id=admin_user.id,
    )
    db_session.add(agent)
    db_session.commit()
    db_session.refresh(agent)
    return agent


@pytest.fixture()
def sample_ruleset(db_session, admin_user):
    """Create a published ruleset for testing."""
    from app.models.db import Ruleset
    from app.models.enums import ContentStatus

    ruleset = Ruleset(
        title="Test Ruleset",
        desc="A test ruleset description",
        language="Python",
        content="Test ruleset content",
        content_status=ContentStatus.PUBLISHED,
        author_id=admin_user.id,
    )
    db_session.add(ruleset)
    db_session.commit()
    db_session.refresh(ruleset)
    return ruleset


@pytest.fixture()
def sample_proposal(db_session):
    """Create a pending proposal for testing."""
    from app.models.db import Proposal
    from app.models.enums import ProposalStatus

    proposal = Proposal(
        type="prompt",
        title="Test Proposal",
        description="A test proposal description",
        content="Test proposal content",
        email="proposer@test.com",
        tags=["test"],
        status=ProposalStatus.PENDING,
    )
    db_session.add(proposal)
    db_session.commit()
    db_session.refresh(proposal)
    return proposal
