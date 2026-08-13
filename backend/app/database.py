"""Database session and engine setup."""

from __future__ import annotations

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""


if settings.database_url:
    engine = create_engine(settings.database_url, pool_pre_ping=True)
else:
    engine = create_engine(
        "sqlite:///./support_crm.db", connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """Yield a database session for dependency injection."""

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
