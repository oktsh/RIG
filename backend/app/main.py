from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.exceptions import AppException
from app.database import Base, engine, SessionLocal
from app.services.seed import seed_database
from app.routers import auth, users, prompts, guides, agents, rulesets, proposals


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed
    # Note: Alembic is now configured for database migrations.
    # For production, run: python -m alembic upgrade head
    # The create_all below is kept as a fallback for development convenience.
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield
    # Shutdown


app = FastAPI(
    title="RIG API",
    description="Backend API for the RIG knowledge base platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handlers
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    """Handle custom application exceptions with standardized JSON response."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.message,
            "type": exc.__class__.__name__,
        },
    )


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(prompts.router)
app.include_router(guides.router)
app.include_router(agents.router)
app.include_router(rulesets.router)
app.include_router(proposals.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "platform": "RIG"}
