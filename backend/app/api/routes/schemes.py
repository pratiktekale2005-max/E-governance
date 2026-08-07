from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.database.crud import get_all_schemes
from app.database.models import GovernmentScheme
from app.models.response import SchemeResponse
from app.utils.limiter import limiter

router = APIRouter(prefix="/schemes", tags=["Government Schemes"])


@router.get(
    "",
    response_model=List[SchemeResponse],
    summary="List Government Schemes",
    description="Retrieves active government schemes with optional category and state filtering.",
)
@limiter.limit("30/minute")
def list_schemes(
    request: Request,
    category: Optional[str] = Query(None, description="Filter by scheme category"),
    state: Optional[str] = Query(None, description="Filter by state name or 'Central'"),
    db: Session = Depends(get_db),
):
    return get_all_schemes(db, category=category, state=state)


@router.get(
    "/{scheme_id}",
    response_model=SchemeResponse,
    summary="Get Scheme Details",
    description="Retrieves detailed information for a specific scheme by UUID.",
)
def get_scheme_by_id(
    scheme_id: str,
    db: Session = Depends(get_db),
):
    scheme = db.query(GovernmentScheme).filter(GovernmentScheme.scheme_id == scheme_id).first()
    if not scheme:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Government scheme not found.",
        )
    return scheme
