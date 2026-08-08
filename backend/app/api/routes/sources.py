from typing import Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from app.ingestion.source_registry import SourceRegistry

router = APIRouter(prefix="/sources", tags=["Sources API"])
registry = SourceRegistry()


class SourceRequest(BaseModel):
    source_id: Optional[str] = Field(None, json_schema_extra={"example": "pm_kisan"})
    scheme_id: Optional[str] = Field(None, json_schema_extra={"example": "pm-kisan"})


@router.get(
    "",
    summary="List Official Sources Metadata",
    description="Retrieves official government source metadata, portal URLs, and trust tiers.",
)
@router.post(
    "",
    summary="Get Official Sources Metadata",
    description="Retrieves official government source metadata, portal URLs, and trust tiers.",
)
def get_sources_metadata(payload: Optional[SourceRequest] = None):
    if payload and payload.source_id:
        src = registry.get(payload.source_id)
        if not src:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Source ID '{payload.source_id}' not found in official registry.",
            )
        return {
            "source_id": src.id,
            "name": src.name,
            "base_url": src.base_url,
            "allowed_domains": src.allowed_domains,
            "jurisdiction": src.jurisdiction,
            "state": src.state,
            "trust_tier": src.trust_tier,
            "notes": src.notes,
        }

    sources_list = registry.list_sources()
    return {
        "total_sources": len(sources_list),
        "sources": [
            {
                "id": s.id,
                "name": s.name,
                "base_url": s.base_url,
                "allowed_domains": s.allowed_domains,
                "jurisdiction": s.jurisdiction,
                "state": s.state,
                "trust_tier": s.trust_tier,
            }
            for s in sources_list
        ],
    }
