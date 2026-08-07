import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.utils.config import settings
from app.utils.logger import logger

# Base for ORM Models
Base = declarative_base()

def get_engine():
    """
    Returns an Engine instance for the configured DATABASE_URL.
    Falls back to a local SQLite database if Postgres is unreachable during initial local setup.
    """
    db_url = settings.DATABASE_URL
    try:
        engine = create_engine(
            db_url,
            pool_pre_ping=True,
            pool_size=10 if "postgresql" in db_url else 5,
            max_overflow=20 if "postgresql" in db_url else 10,
        )
        # Test quick ping connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return engine
    except Exception as exc:
        logger.warning(
            f"Unable to connect to primary database at '{db_url}'. "
            f"Error: {exc}. Falling back to local SQLite database 'citizen_db.sqlite3' for local environment."
        )
        fallback_url = "sqlite:///./citizen_db.sqlite3"
        return create_engine(
            fallback_url,
            connect_args={"check_same_thread": False},
        )

engine = get_engine()

# Create SessionLocal class for DB sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """
    Dependency generator for database session injection into FastAPI routes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_connection() -> bool:
    """
    Utility helper to check database connectivity.
    """
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.warning(f"Database connection check warning: {e}")
        return False
