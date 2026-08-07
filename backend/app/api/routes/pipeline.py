from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.ingestion.validate import validate_all_schemes
from app.ingestion.db_sync import sync_normalized_schemes_to_db
from app.embeddings.vector_store import VectorStore
from app.api.dependencies import require_roles
from app.database.models import User

router = APIRouter(prefix="/pipeline", tags=["Data Pipeline Administration"])


@router.get(
    "/status",
    summary="Pipeline Quality & Freshness Status",
    description="Returns data pipeline quality validation metrics and normalized scheme stats.",
)
def get_pipeline_status():
    report = validate_all_schemes()
    return report


@router.post(
    "/sync-db",
    summary="Sync Normalized Schemes to Database",
    description="Upserts all normalized JSON scheme files into the SQL database government_schemes table.",
)
def sync_schemes_db(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Admin", "Moderator"])),
):
    synced_count = sync_normalized_schemes_to_db(db)
    return {
        "message": f"Successfully synchronized {synced_count} schemes into SQL database.",
        "synced_count": synced_count,
    }


@router.post(
    "/reindex",
    summary="Rebuild FAISS Vector Store Index",
    description="Re-chunks and re-embeds all validated schemes into the FAISS vector database.",
)
def reindex_vector_store(
    current_user: User = Depends(require_roles(["Admin", "Moderator"])),
):
    store = VectorStore()
    chunk_count = store.build_from_scratch()
    store.save()
    return {
        "message": f"Vector store reindexed successfully with {chunk_count} chunk embeddings.",
        "chunks_indexed": chunk_count,
    }
