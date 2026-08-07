"""
Database Sync Utility

Reads all normalized scheme JSON files from data/normalized/*.json
and upserts them into the PostgreSQL/SQLite SQL database (government_schemes table).
"""
from datetime import datetime
from sqlalchemy.orm import Session
from app.database.db import SessionLocal
from app.database.models import GovernmentScheme
from app.ingestion.normalize import load_all_normalized
from app.utils.logger import logger


def sync_normalized_schemes_to_db(db: Session | None = None) -> int:
    close_session = False
    if db is None:
        db = SessionLocal()
        close_session = True

    try:
        normalized_records = load_all_normalized()
        synced_count = 0

        for r in normalized_records:
            # Map canonical Pydantic category/jurisdiction/state to ORM model
            category_title = r.category.value.replace("_", " ").title()
            state_val = r.state if r.jurisdiction.value == "state" else "Central"
            dept_val = r.department or r.ministry or "Government of India"

            existing = (
                db.query(GovernmentScheme)
                .filter(GovernmentScheme.scheme_name == r.scheme_name)
                .first()
            )

            if existing:
                existing.department = dept_val
                existing.category = category_title
                existing.state = state_val
                existing.summary = r.summary
                existing.official_url = r.official_urls[0] if r.official_urls else None
                existing.status = "Active" if r.status.value in ("validated", "published") else "Draft"
                existing.last_verified = datetime.combine(r.last_verified_date, datetime.min.time())
            else:
                new_scheme = GovernmentScheme(
                    scheme_name=r.scheme_name,
                    department=dept_val,
                    category=category_title,
                    state=state_val,
                    summary=r.summary,
                    official_url=r.official_urls[0] if r.official_urls else None,
                    status="Active" if r.status.value in ("validated", "published") else "Draft",
                    last_verified=datetime.combine(r.last_verified_date, datetime.min.time()),
                )
                db.add(new_scheme)

            synced_count += 1

        db.commit()
        logger.info(f"Successfully synced {synced_count} normalized scheme records to SQL database.")
        return synced_count

    except Exception as exc:
        db.rollback()
        logger.error(f"Failed to sync normalized schemes to DB: {exc}")
        raise exc
    finally:
        if close_session:
            db.close()


if __name__ == "__main__":
    sync_normalized_schemes_to_db()
