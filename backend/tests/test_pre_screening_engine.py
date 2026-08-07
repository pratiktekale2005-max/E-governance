"""
Unit Tests for Government Scheme Pre-screening Engine (Modules 1 through 11)
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.citizen_profile import (
    CitizenProfileInput,
    normalize_profile,
    Gender,
    Category,
    EducationLevel,
    EmploymentStatus,
)
from app.models.scheme_rule import (
    SchemeRuleSet,
    RuleNode,
    RuleCondition,
    RuleProvenance,
    OperatorEnum,
    LogicEnum,
    ReviewStatusEnum,
)
from app.models.pre_screening_result import ThreeValuedLogic, PreScreeningStatus
from app.pre_screening.rules.evaluator import evaluate_condition
from app.pre_screening.rules.logic_tree import evaluate_rule_node
from app.pre_screening.rules.provenance import is_provenance_valid
from app.pre_screening.classification import classify_pre_screening
from app.pre_screening.missing_info import detect_missing_information
from app.pre_screening.documents import map_required_documents
from app.pre_screening.ranking import calculate_ranking_score
from app.pre_screening.service import PreScreeningService

client = TestClient(app)


def test_profile_normalization():
    raw = CitizenProfileInput(
        age=22,
        gender="F",
        state="Mh",
        occupation="College Student",
        annual_income=180000,
        category="OBC",
        education_level="Undergraduate",
    )
    norm = normalize_profile(raw)
    assert norm.age == 22
    assert norm.gender == Gender.FEMALE
    assert norm.state == "Maharashtra"
    assert norm.category == Category.OBC
    assert norm.education_level == EducationLevel.UNDERGRADUATE
    assert norm.student_status is True


def test_three_valued_condition_evaluation():
    cond_age = RuleCondition(field="age", operator=OperatorEnum.GREATER_THAN_EQUAL, value=18)

    # 1. Profile with age = 22 -> TRUE
    res1 = evaluate_condition(cond_age, {"age": 22})
    assert res1.result == ThreeValuedLogic.TRUE

    # 2. Profile with age = 16 -> FALSE
    res2 = evaluate_condition(cond_age, {"age": 16})
    assert res2.result == ThreeValuedLogic.FALSE

    # 3. Profile with age missing (None) -> UNKNOWN
    res3 = evaluate_condition(cond_age, {})
    assert res3.result == ThreeValuedLogic.UNKNOWN


def test_rule_tree_nested_logic():
    # Logic: state == "Maharashtra" AND (occupation == "farmer" OR occupation == "agricultural_worker")
    cond_state = RuleCondition(field="state", operator=OperatorEnum.EQUALS, value="Maharashtra")
    cond_farmer = RuleCondition(field="occupation", operator=OperatorEnum.EQUALS, value="farmer")
    cond_agri = RuleCondition(field="occupation", operator=OperatorEnum.EQUALS, value="agricultural_worker")

    or_node = RuleNode(logic=LogicEnum.OR, conditions=[cond_farmer, cond_agri])
    root = RuleNode(logic=LogicEnum.AND, conditions=[cond_state, or_node])

    # Farmer in Maharashtra -> TRUE
    eval_true = evaluate_rule_node(root, {"state": "Maharashtra", "occupation": "farmer"})
    assert eval_true.result == ThreeValuedLogic.TRUE

    # Student in Maharashtra -> FALSE
    eval_false = evaluate_rule_node(root, {"state": "Maharashtra", "occupation": "student"})
    assert eval_false.result == ThreeValuedLogic.FALSE

    # Missing occupation in Maharashtra -> UNKNOWN
    eval_unknown = evaluate_rule_node(root, {"state": "Maharashtra"})
    assert eval_unknown.result == ThreeValuedLogic.UNKNOWN


def test_provenance_validation():
    valid_prov = RuleProvenance(
        source_url="https://pmkisan.gov.in",
        source_title="PM-KISAN Guidelines",
        review_status=ReviewStatusEnum.HUMAN_VERIFIED,
        last_verified_at="2026-08-01",
    )
    is_valid, reason = is_provenance_valid(valid_prov)
    assert is_valid is True

    unverified_prov = RuleProvenance(
        source_url="https://pmkisan.gov.in",
        review_status=ReviewStatusEnum.UNVERIFIED,
    )
    is_valid_unv, _ = is_provenance_valid(unverified_prov)
    assert is_valid_unv is False


def test_pre_screening_classification():
    # TRUE -> LIKELY_MATCH
    status1 = classify_pre_screening(ThreeValuedLogic.TRUE, [], provenance_valid=True)
    assert status1 == PreScreeningStatus.LIKELY_MATCH

    # UNKNOWN -> MORE_INFORMATION_REQUIRED
    status2 = classify_pre_screening(ThreeValuedLogic.UNKNOWN, [], provenance_valid=True)
    assert status2 == PreScreeningStatus.MORE_INFORMATION_REQUIRED

    # FALSE -> APPEARS_NOT_TO_MATCH
    status3 = classify_pre_screening(ThreeValuedLogic.FALSE, [], provenance_valid=True)
    assert status3 == PreScreeningStatus.APPEARS_NOT_TO_MATCH

    # Stale provenance -> STALE_RULE
    status4 = classify_pre_screening(ThreeValuedLogic.TRUE, [], provenance_valid=False)
    assert status4 == PreScreeningStatus.STALE_RULE


def test_missing_info_detection():
    cond_inc = RuleCondition(field="annual_income", operator=OperatorEnum.LESS_THAN_EQUAL, value=250000)
    eval_res = evaluate_condition(cond_inc, {})
    assert eval_res.result == ThreeValuedLogic.UNKNOWN

    missing_fields, questions = detect_missing_information([eval_res])
    assert "annual_income" in missing_fields
    assert len(questions) == 1
    assert "annual family income" in questions[0]


def test_required_document_mapping_alternative():
    raw_docs = ["Aadhaar Card", "Income Certificate OR BPL Ration Card"]
    doc_details = map_required_documents(raw_docs)
    assert len(doc_details) == 3
    alt_docs = [d for d in doc_details if d.is_alternative]
    assert len(alt_docs) == 2
    assert alt_docs[0].alternative_group_id == alt_docs[1].alternative_group_id


def test_transparent_ranking_score():
    rule_set = SchemeRuleSet(
        scheme_id="test-scheme",
        scheme_name="Test Scheme",
        target_state="Maharashtra",
        root_rule=RuleNode(conditions=[]),
        provenance=RuleProvenance(source_url="https://test.gov.in"),
    )
    score, reasons = calculate_ranking_score(
        scheme_rule=rule_set,
        evaluations=[],
        status=PreScreeningStatus.LIKELY_MATCH,
        profile_dict={"state": "Maharashtra"},
    )
    assert score > 0
    assert any("State matched" in r for r in reasons)


def test_pre_screening_rest_apis():
    # 1. Profile API
    profile_payload = {
        "user_id": "test_citizen_001",
        "age": 25,
        "gender": "Female",
        "state": "Maharashtra",
        "occupation": "College Student",
        "annual_income": 150000,
        "category": "OBC",
    }
    res_prof = client.post("/api/v1/profile", json=profile_payload)
    assert res_prof.status_code == 200
    assert res_prof.json()["status"] == "success"

    # 2. Pre-screening Preview API (fast)
    res_preview = client.post("/api/v1/pre-screening/preview", json=profile_payload)
    assert res_preview.status_code == 200
    data_preview = res_preview.json()
    assert "schemes_evaluated" in data_preview
    assert len(data_preview["matched_schemes"]) > 0

    # 3. Get Recommended Schemes API
    res_rec = client.get("/api/v1/schemes/recommended?state=Maharashtra&occupation=student")
    assert res_rec.status_code == 200
    assert "recommended_count" in res_rec.json()
