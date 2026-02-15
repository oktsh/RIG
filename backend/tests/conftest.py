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
