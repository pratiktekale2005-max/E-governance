import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.ingestion.validate import validate_all_schemes
from app.ingestion.db_sync import sync_normalized_schemes_to_db
from app.services.retrieval_service import RetrievalService, CitizenProfile

client = TestClient(app)


def test_pipeline_validation():
    report = validate_all_schemes()
    assert report["total_schemes"] >= 28
    assert report["valid_schemes"] >= 28
    assert report["quality_score"] == 100.0


def test_db_sync_and_schemes_api():
    synced_count = sync_normalized_schemes_to_db()
    assert synced_count >= 28

    res = client.get("/api/v1/schemes?state=Maharashtra")
    assert res.status_code == 200
    schemes = res.json()
    assert len(schemes) >= 5
    assert any(s["state"] == "Maharashtra" for s in schemes)


def test_rag_retrieval_service():
    svc = RetrievalService()
    # Test farmer question in Maharashtra
    out = svc.retrieve(
        question="What financial help is available for a farmer who had an accident in Maharashtra?",
        profile=CitizenProfile(state="Maharashtra"),
    )
    assert out["confidence"] in ["high", "medium"]
    assert len(out["matched_schemes"]) > 0
    assert "disclaimer" in out
    assert any(s["state"] in ["Maharashtra", "Central"] for s in out["matched_schemes"])


def test_rag_retrieve_endpoint():
    payload = {
        "question": "What health insurance coverage is offered for senior citizens?",
        "state": "Central",
        "category": "health",
        "top_k": 3,
    }
    res = client.post("/api/v1/retrieve", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "matched_schemes" in data
    assert "confidence" in data
    assert data["confidence"] != "none"
    assert len(data["matched_schemes"]) > 0


def test_pipeline_status_endpoint():
    res = client.get("/api/v1/pipeline/status")
    assert res.status_code == 200
    report = res.json()
    assert report["total_schemes"] >= 28
    assert report["quality_score"] > 90.0
