"""
Benchmark Evaluation Runner

Executes citizen query benchmark suite and measures precision@5, latency, and confidence.
"""
import time
from typing import Dict, Any, List
from app.rag.rag_pipeline import RAGPipeline
from app.utils.logger import logger

BENCHMARK_QUERIES = [
    {"query": "How much financial support does PM KISAN provide to farmers?", "state": "Central", "expected_scheme": "pm-kisan"},
    {"query": "What is the health insurance limit under Ayushman Bharat PM-JAY?", "state": "Central", "expected_scheme": "ayushman-bharat-pmjay"},
    {"query": "How can women in Maharashtra get 1500 rupees per month?", "state": "Maharashtra", "expected_scheme": "mh-mukhyamantri-majhi-ladki-bahin"},
    {"query": "Is there free dialysis available for kidney patients in India?", "state": "Central", "expected_scheme": "pm-national-dialysis-programme"},
    {"query": "What scholarship is available for SC post-matric students in Maharashtra?", "state": "Maharashtra", "expected_scheme": "post-matric-scholarship-sc"},
    {"query": "What is the age limit for Sukanya Samriddhi Yojana?", "state": "Central", "expected_scheme": "sukanya-samriddhi-yojana"},
]


def run_benchmark() -> Dict[str, Any]:
    pipeline = RAGPipeline()
    total_queries = len(BENCHMARK_QUERIES)
    successful_matches = 0
    total_latency_ms = 0.0

    results = []

    for item in BENCHMARK_QUERIES:
        q = item["query"]
        st = item.get("state")
        
        start = time.time()
        res = pipeline.process_query(query=q, profile_dict={"state": st})
        latency = (time.time() - start) * 1000
        total_latency_ms += latency

        matched = res.get("evidence", {}).get("matched_schemes", [])
        matched_ids = [m.get("scheme_id") for m in matched]
        matched_names = [m.get("scheme_name") for m in matched]

        is_hit = item["expected_scheme"] in matched_ids or any(item["expected_scheme"] in name.lower() for name in matched_names)
        if is_hit:
            successful_matches += 1

        results.append({
            "query": q,
            "latency_ms": round(latency, 2),
            "confidence": res.get("confidence", {}).get("score_percentage"),
            "matched_ids": matched_ids,
            "is_hit": is_hit,
        })

    precision_at_5 = round((successful_matches / total_queries) * 100, 2)
    avg_latency = round(total_latency_ms / total_queries, 2)

    summary = {
        "total_queries": total_queries,
        "precision_at_5": f"{precision_at_5}%",
        "average_latency_ms": f"{avg_latency}ms",
        "detailed_results": results,
    }

    logger.info(f"Benchmark Runner completed: Precision@5 = {precision_at_5}%, Avg Latency = {avg_latency}ms")
    return summary


if __name__ == "__main__":
    import json
    res = run_benchmark()
    print(json.dumps(res, indent=2))
