# Stack Rules — Python / FastAPI

## Toolchain Detection

### Linter (ruff)
Detection order:
1. `.venv/bin/ruff` — local venv
2. `uv.lock` + `uv` available — `uv run ruff`
3. `ruff` on PATH — global

### Typechecker (mypy)
Detection order:
1. `.venv/bin/mypy` — local venv
2. `uv.lock` + `uv` available — `uv run mypy`
3. `mypy` on PATH — global

### Package Manager
Detection order:
1. `uv.lock` — use `uv`
2. `.venv/` exists — use `pip` (within venv)
3. Fallback: `pip`

## Python Standards

- Python 3.11+ features allowed (match/case, ExceptionGroup, TaskGroup).
- Type hints on all function signatures.
- Use `from __future__ import annotations` for forward references.
- f-strings for string formatting.
- Pydantic v2 for data validation.

## FastAPI

- Async endpoints by default (`async def`).
- Pydantic models for request/response schemas.
- Dependency injection for database sessions, auth, config.
- One router file per domain concept.
- Proper HTTP status codes: 201 (create), 204 (delete), 422 (validation error).

## Quality Commands

```bash
# Lint
ruff check .
ruff check --fix .     # auto-fix safe issues

# Format
ruff format .

# Typecheck
mypy .

# Test
pytest
pytest -x              # stop on first failure
pytest -k "test_name"  # run specific test

# Run server
uvicorn app.main:app --reload
```

## Project Structure

```
project/
├── app/
│   ├── main.py           # FastAPI app, startup, router registration
│   ├── config.py          # Settings from environment
│   ├── database.py        # Engine, session factory
│   ├── models/            # SQLAlchemy ORM + Pydantic schemas
│   ├── routers/           # API endpoint handlers
│   ├── services/          # Business logic
│   └── middleware/        # Auth, logging, error handling
├── tests/
│   ├── conftest.py        # Shared fixtures
│   └── test_*.py          # Test files
├── pyproject.toml
└── .python-version
```

## Dependency Management

- Pin versions in `pyproject.toml` or `requirements.txt`. No floating ranges in production.
- `pip audit` or `uv pip audit` after every install.
- Separate dev dependencies from production dependencies.
