"""
Module 7 — Missing Information Engine
Detects missing citizen profile attributes and generates citizen-friendly follow-up questions.
"""
from __future__ import annotations

from typing import List, Dict, Set
from app.models.pre_screening_result import ConditionEvaluationResult, ThreeValuedLogic


FIELD_QUESTION_MAP: Dict[str, str] = {
    "annual_income": "Please provide your annual family income (in INR).",
    "income": "Please specify your annual family income.",
    "age": "Please provide your age in years.",
    "gender": "Please select your gender (Male / Female / Transgender).",
    "state": "Please select your state of residence.",
    "district": "Please select your district.",
    "occupation": "Please describe your current occupation.",
    "category": "Please select your category (General / OBC / SC / ST / EWS).",
    "disability_status": "Please indicate if you have a disability (Yes / No).",
    "education_level": "Please specify your highest level of education.",
    "farmer_status": "Are you a farmer or member of a landholding agricultural family? (Yes / No)",
    "student_status": "Are you currently enrolled as a student? (Yes / No)",
    "employment_status": "What is your current employment status?",
    "marital_status": "Please select your marital status.",
}


def detect_missing_information(evaluations: List[ConditionEvaluationResult]) -> tuple[List[str], List[str]]:
    """
    Returns (missing_fields, follow_up_questions).
    """
    missing_fields_set: Set[str] = set()
    questions: List[str] = []

    for eval_item in evaluations:
        if eval_item.result == ThreeValuedLogic.UNKNOWN:
            field = eval_item.field
            if field not in missing_fields_set:
                missing_fields_set.add(field)
                q = FIELD_QUESTION_MAP.get(field, f"Please provide your {field.replace('_', ' ')}.")
                questions.append(q)

    return sorted(list(missing_fields_set)), questions
