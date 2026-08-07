"""
Unit Tests for Explainability & Trust Engine (Modules 1 through 10)
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.explainability.evidence import evidence_collector_instance
from app.explainability.reasoning import generate_reasons
from app.explainability.citations import generate_citations
from app.explainability.confidence import calculate_confidence
from app.explainability.conflict_detector import detect_source_conflicts
from app.explainability.freshness import validate_freshness
from app.explainability.transparency import generate_transparency_trace
from app.explainability.official_links import extract_official_links
from app.explainability.formatter import format_explainable_response
from app.explainability.service import ExplainabilityService, explainability_service_instance

client = TestClient(app)


def test_evidence_collector():
    chunks = [
        {
            "scheme_id": "pm-kisan",
            "chunk_id": "chunk_001",
            "scheme_name": "PM-KISAN Guidelines",
            "official_url": "https://pmkisan.gov.in",
            "section": "Eligibility",
            "page": 4,
            "text": "Direct income support of Rs 6,000 per year.",
        }
    ]
    col = evidence_collector_instance.create_collection("farmer schemes", chunks)
    assert col.query == "farmer schemes"
    assert len(col.items) == 1
    assert col.items[0].source_url == "https://pmkisan.gov.in"
    assert col.items[0].page == 4


def test_reason_generator():
    profile = {"state": "Maharashtra", "occupation": "farmer", "annual_income": 180000}
    reasons = generate_reasons(profile, ["State matched"], [{"scheme_id": "pm-kisan"}])
    assert len(reasons) >= 3
    assert any("Maharashtra" in r for r in reasons)
    assert any("farmer" in r.lower() for r in reasons)


def test_citation_generator():
    chunks = [
        {
            "scheme_id": "pm-kisan",
            "scheme_name": "PM-KISAN Guidelines",
            "official_url": "https://pmkisan.gov.in",
            "section": "Eligibility",
            "page": 4,
        }
    ]
    col = evidence_collector_instance.create_collection("query", chunks)
    citations = generate_citations(col.items)
    assert len(citations) == 1
    assert citations[0].official_url == "https://pmkisan.gov.in"
    assert citations[0].page_number == 4


def test_confidence_engine():
    chunks = [
        {
            "scheme_id": "pm-kisan",
            "official_url": "https://pmkisan.gov.in",
            "status": "human_verified",
            "last_verified_date": "2026-08-07",
        },
        {
            "scheme_id": "pm-kisan",
            "official_url": "https://myscheme.gov.in",
            "status": "human_verified",
            "last_verified_date": "2026-08-07",
        },
    ]
    col = evidence_collector_instance.create_collection("query", chunks)
    conf = calculate_confidence(col.items, conflicts=[], missing_fields=[])
    assert conf.level.value == "High"
    assert conf.score_percentage >= 80.0
    assert len(conf.explanation_points) > 0


def test_source_conflict_detector():
    chunks = [
        {"scheme_id": "pm-kisan", "official_url": "https://source1.gov.in", "text": "Income limit 2,00,000 per year"},
        {"scheme_id": "pm-kisan", "official_url": "https://source2.gov.in", "text": "Income limit 2,50,000 per year"},
    ]
    col = evidence_collector_instance.create_collection("query", chunks)
    conflicts = detect_source_conflicts(col.items)
    assert len(conflicts) == 1
    assert conflicts[0].scheme_id == "pm-kisan"
    assert "annual_income" in conflicts[0].field


def test_freshness_checker():
    chunks = [
        {"scheme_id": "pm-kisan", "official_url": "https://pmkisan.gov.in", "status": "human_verified", "last_verified_date": "2026-08-07"}
    ]
    col = evidence_collector_instance.create_collection("query", chunks)
    is_fresh, date_str, warning = validate_freshness(col.items)
    assert is_fresh is True
    assert warning is None

    stale_chunks = [
        {"scheme_id": "pm-kisan", "official_url": "https://pmkisan.gov.in", "status": "unverified", "last_verified_date": "2020-01-01"}
    ]
    stale_col = evidence_collector_instance.create_collection("query", stale_chunks)
    is_fresh_stale, _, warning_stale = validate_freshness(stale_col.items)
    assert is_fresh_stale is False
    assert warning_stale is not None


def test_transparency_trace():
    trace = generate_transparency_trace(num_documents_retrieved=3, num_rules_evaluated=6, num_matches_found=2)
    assert len(trace) == 5
    assert trace[0].component == "RAG Vector Store & Ingestion"
    assert trace[4].component == "LLM Explanation Layer"


def test_official_link_manager():
    chunks = [{"scheme_id": "pm-kisan", "official_url": "https://pmkisan.gov.in"}]
    col = evidence_collector_instance.create_collection("query", chunks)
    links = extract_official_links(col.items)
    assert "https://pmkisan.gov.in" in links


def test_explainability_rest_apis():
    payload = {
        "query": "What schemes match a farmer in Maharashtra?",
        "answer": "PM-KISAN provides income support.",
        "profile": {"state": "Maharashtra", "occupation": "farmer", "annual_income": 180000},
        "retrieved_chunks": [
            {
                "scheme_id": "pm-kisan",
                "scheme_name": "PM-KISAN",
                "official_url": "https://pmkisan.gov.in",
                "section": "Eligibility",
                "page": 4,
                "text": "Rs 6000 per year support",
                "status": "human_verified",
            }
        ],
        "matching_conditions": ["State matched", "Occupation matched"],
    }
    
    # 1. POST /api/v1/explain
    res_explain = client.post("/api/v1/explain", json=payload)
    assert res_explain.status_code == 200
    data = res_explain.json()
    assert "response_id" in data
    assert data["confidence"]["level"] in ["High", "Medium"]
    assert len(data["reasons"]) > 0
    assert len(data["sources"]) > 0
    resp_id = data["response_id"]

    # 2. GET /api/v1/sources/{scheme_id}
    res_source = client.get("/api/v1/sources/pm-kisan")
    assert res_source.status_code == 200
    assert res_source.json()["scheme_id"] == "pm-kisan"

    # 3. GET /api/v1/confidence/{response_id}
    res_conf = client.get(f"/api/v1/confidence/{resp_id}")
    assert res_conf.status_code == 200
    assert "confidence" in res_conf.json()

    # 4. GET /api/v1/citations/{response_id}
    res_cite = client.get(f"/api/v1/citations/{resp_id}")
    assert res_cite.status_code == 200
    assert len(res_cite.json()["citations"]) > 0
