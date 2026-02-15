from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy.pool import QueuePool

from app.config import settings

# Configure database engine with connection pooling
engine = create_engine(
    settings.DATABASE_URL,
    poolclass=QueuePool,
    pool_size=5,  # Maximum connections in pool
    max_overflow=10,  # Maximum overflow beyond pool_size
    pool_pre_ping=True,  # Verify connection before use (detect stale connections)
    pool_recycle=3600,  # Recycle connections after 1 hour
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
)


# Enable SQLite foreign keys (if using SQLite)
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_conn, connection_record):
    """Enable foreign key constraints for SQLite databases."""
    if "sqlite" in settings.DATABASE_URL:
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
