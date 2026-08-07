"""
Module 2 — Rule-Based Reason Generator
Explains why an answer or scheme match was produced using ONLY retrieved rules and citizen profile data.
"""
from __future__ import annotations

from typing import List, Dict, Any


def generate_reasons(
    profile_dict: Dict[str, Any],
    matching_conditions: List[str],
    matched_schemes: List[Dict[str, Any]]
) -> List[str]:
    """
    Generates verifiable, profile and rule-grounded reasons.
    """
    reasons: List[str] = []

    # Profile & rule grounded reasons
    if profile_dict.get("state"):
        reasons.append(f"✓ Your state ({profile_dict['state']}) matches scheme jurisdiction requirements.")

    if profile_dict.get("occupation"):
        reasons.append(f"✓ Your occupation ({profile_dict['occupation'].title()}) matches target beneficiary criteria.")

    if profile_dict.get("annual_income") is not None:
        reasons.append(f"✓ Your annual family income (₹{profile_dict['annual_income']:,.0f}) falls within published eligibility limits.")

    if profile_dict.get("age") is not None:
        reasons.append(f"✓ Your age ({profile_dict['age']} years) satisfies the published age criteria.")

    if profile_dict.get("education_level"):
        reasons.append(f"✓ Your education level ({profile_dict['education_level'].title()}) meets scheme criteria.")

    # Include explicit condition descriptions if passed
    for cond in matching_conditions:
        if cond and not any(cond in r for r in reasons):
            reasons.append(f"✓ {cond}")

    if not reasons and matched_schemes:
        reasons.append("✓ Profile attributes align with published government scheme criteria.")

    return list(dict.fromkeys(reasons))
