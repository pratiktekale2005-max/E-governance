import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.rag.language_detector import detect_language
from app.rag.intent_detector import detect_intent
from app.rag.entity_extractor import extract_entities
from app.rag.query_rewriter import rewrite_query
from app.vector_db.reranker import HybridReranker
from app.rag.context_builder import build_context
from app.rag.confidence_engine import evaluate_confidence
from app.rag.citation_service import generate_citations
from app.evaluation.benchmark import run_benchmark

client = TestClient(app)


def test_language_detection():
    en_res = detect_language("What financial support is available for farmers?")
    assert en_res["code"] == "en"

    mr_res = detect_language("माझी लाडकी बहीण योजना पात्रता काय आहे?")
    assert mr_res["code"] in ["mr", "hi"]


def test_intent_and_entity():
    q = "I am a 25 year old woman in Maharashtra. What documents are required for Majhi Ladki Bahin Scheme?"
    intent_data = detect_intent(q)
    assert intent_data["intent"] in ["Document Request", "Eligibility Check", "Scheme Search"]

    entities = extract_entities(q)
    assert entities["state"] == "Maharashtra"
    assert entities["gender"] == "Female"
    assert entities["age"] == 25


def test_query_rewriter():
    entities = {"state": "Maharashtra"}
    rewritten = rewrite_query("Help me with farmer accident", entities)
    assert "farmer accident insurance" in rewritten
    assert "Maharashtra" in rewritten


def test_hybrid_reranker():
    candidates = [
        {"chunk_id": "1", "scheme_name": "Scheme A", "text": "farmer accident compensation", "vector_score": 0.8, "state": "Maharashtra", "last_verified_date": "2026-08-01"},
        {"chunk_id": "2", "scheme_name": "Scheme B", "text": "unrelated text", "vector_score": 0.3, "state": "Delhi", "last_verified_date": "2020-01-01"},
    ]
    reranker = HybridReranker()
    reranked = reranker.rerank("farmer accident", candidates, top_k=2, state="Maharashtra")
    assert len(reranked) == 2
    assert reranked[0]["chunk_id"] == "1"
    assert reranked[0]["hybrid_score"] > reranked[1]["hybrid_score"]


def test_context_and_confidence_engine():
    chunks = [
        {
            "chunk_id": "pm-kisan#overview",
            "scheme_id": "pm-kisan",
            "scheme_name": "PM-KISAN",
            "category": "farmer",
            "jurisdiction": "central",
            "state": None,
            "section": "overview",
            "text": "PM-KISAN provides Rs 6,000 annually to farmer families.",
            "official_url": "https://pmkisan.gov.in",
            "last_verified_date": "2026-08-01",
            "vector_score": 0.85,
            "keyword_score": 0.90,
            "hybrid_score": 0.88,
            "status": "validated",
        }
    ]

    context_res = build_context(chunks)
    assert "PM-KISAN" in context_res["context_text"]
    assert context_res["scheme_count"] == 1

    conf_res = evaluate_confidence(chunks, user_state="Maharashtra")
    assert conf_res["level"] in ["HIGH", "MEDIUM"]
    assert "score_percentage" in conf_res
    assert "reason" in conf_res

    citations = generate_citations(chunks)
    assert len(citations) == 1
    assert citations[0]["official_url"] == "https://pmkisan.gov.in"


def test_chat_api_endpoint():
    payload = {
        "message": "What financial aid is available for pregnant women in Maharashtra?",
        "session_id": "test_session_999",
        "state": "Maharashtra",
        "category": "women",
    }
    res = client.post("/api/v1/chat", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["session_id"] == "test_session_999"
    assert "response" in data
    assert "confidence" in data
    assert "citations" in data
    assert "intent" in data
    assert "entities" in data
    assert data["entities"]["state"] == "Maharashtra"

    # Test GET history
    hist_res = client.get("/api/v1/chat/history?session_id=test_session_999")
    assert hist_res.status_code == 200
    hist_data = hist_res.json()
    assert len(hist_data["messages"]) >= 2


def test_sources_api_endpoint():
    res = client.post("/api/v1/sources", json={"source_id": "pm_kisan"})
    assert res.status_code == 200
    src_data = res.json()
    assert src_data["source_id"] == "pm_kisan"
    assert "pmkisan.gov.in" in src_data["base_url"]


def test_benchmark_runner():
    summary = run_benchmark()
    assert summary["total_queries"] == 6
    assert "precision_at_5" in summary
    assert "average_latency_ms" in summary
