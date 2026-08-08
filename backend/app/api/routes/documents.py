from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.database.models import GovernmentScheme

router = APIRouter(prefix="/documents", tags=["Government Scheme Documents API"])


@router.get(
    "",
    summary="Get Scheme Required Documents",
    description="Retrieves required documents associated with a government scheme with ALL_OF / ANY_OF logic requirements.",
)
def get_scheme_documents(
    scheme_id: Optional[str] = Query(None, description="Scheme ID to retrieve document rules for"),
    db: Session = Depends(get_db),
):
    if not scheme_id:
        return {
            "documents": [
                {"name": "Aadhaar Card", "required": True, "source_url": "https://uidai.gov.in"},
                {"name": "Income Certificate", "required": True, "source_url": "https://maharashtra.gov.in"},
                {"name": "Educational Marksheet", "required": True, "source_url": "https://scholarships.gov.in"},
                {"name": "Bank Passbook", "required": True, "source_url": "https://pmjdy.gov.in"}
            ]
        }

    scheme = db.query(GovernmentScheme).filter(GovernmentScheme.scheme_id == scheme_id).first()
    if not scheme:
        # Fallback default rules
        return {
            "scheme_id": scheme_id,
            "document_requirement": {
                "logic": "ALL_OF",
                "documents": [
                    {"name": "Aadhaar Card", "required": True, "source_url": "https://uidai.gov.in"},
                    {"name": "Income Certificate", "required": True, "source_url": "https://official.gov.in"},
                    {"name": "Bank Passbook", "required": True, "source_url": "https://official.gov.in"}
                ]
            }
        }

    return {
        "scheme_id": scheme.scheme_id,
        "scheme_name": scheme.scheme_name,
        "document_requirement": {
            "logic": "ALL_OF",
            "documents": [
                {
                    "name": doc,
                    "required": True,
                    "source_url": scheme.official_url or "https://official.gov.in"
                }
                for doc in (scheme.required_documents if hasattr(scheme, "required_documents") and scheme.required_documents else ["Aadhaar Card", "Income Certificate", "Bank Passbook"])
            ]
        }
    }
