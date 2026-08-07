"""
Eligibility Rule Engine
========================
Compares the citizen's context (age, occupation, gender, income, category,
state) against each retrieved scheme's normalized eligibility rules.

IMPORTANT policy rule (per product spec): this engine must NEVER declare a
citizen "Eligible". It only ever returns one of:
    - Likely Match
    - Possible Match
    - Official Verification Required

This keeps the system from making a legal/administrative determination that
only the government portal/office can make.
"""

from __future__ import annotations

from app.ai.schemas import EligibilityResult, MatchStatus, RetrievedDocument

# Fields we know how to compare directly. Anything else in a scheme's
# eligibility metadata that we can't check is surfaced as missing_information.
_CHECKABLE_FIELDS = {"occupation", "min_age", "max_age", "max_income", "min_income",
                     "category", "state", "gender"}


def _check_field(field: str, rule_value, context: dict) -> tuple[bool | None, str | None]:
    """
    Returns (matched, missing_field_name).
      matched = True  -> rule satisfied
      matched = False -> rule contradicted
      matched = None  -> can't tell, we don't have this info about the citizen
    """
    if field == "occupation":
        citizen_val = context.get("occupation")
        if citizen_val is None:
            return None, "occupation"
        return citizen_val.lower() == str(rule_value).lower(), None

    if field == "min_age":
        citizen_val = context.get("age")
        if citizen_val is None:
            return None, "age"
        return citizen_val >= rule_value, None

    if field == "max_age":
        citizen_val = context.get("age")
        if citizen_val is None:
            return None, "age"
        return citizen_val <= rule_value, None

    if field == "min_income":
        citizen_val = context.get("income")
        if citizen_val is None:
            return None, "income"
        return citizen_val >= rule_value, None

    if field == "max_income":
        citizen_val = context.get("income")
        if citizen_val is None:
            return None, "income"
        return citizen_val <= rule_value, None

    if field == "category":
        citizen_val = context.get("category")
        if citizen_val is None:
            return None, "category"
        return citizen_val.upper() == str(rule_value).upper(), None

    if field == "state":
        citizen_val = context.get("state")
        if citizen_val is None:
            return None, "state"
        return citizen_val.lower() == str(rule_value).lower(), None

    if field == "gender":
        citizen_val = context.get("gender")
        if citizen_val is None:
            return None, "gender"
        return citizen_val.lower() == str(rule_value).lower(), None

    return None, None


def evaluate(document: RetrievedDocument, citizen_context: dict) -> EligibilityResult:
    """Evaluate a single scheme's eligibility rules against citizen context."""
    rules = {k: v for k, v in document.metadata.items() if k in _CHECKABLE_FIELDS}

    reasons: list[str] = []
    missing: list[str] = []
    contradicted = False
    matched_count = 0
    checkable_count = 0

    for field, rule_value in rules.items():
        matched, missing_field = _check_field(field, rule_value, citizen_context)
        if matched is None:
            if missing_field and missing_field not in missing:
                missing.append(missing_field)
            continue
        checkable_count += 1
        if matched:
            matched_count += 1
            reasons.append(_human_reason(field, rule_value))
        else:
            contradicted = True

    # Non-checkable eligibility flags (e.g. "landholding_required": True) --
    # we can't verify these ourselves, so they always go to missing_information.
    for field, value in document.metadata.items():
        if field not in _CHECKABLE_FIELDS and field not in ("housing_status",):
            label = field.replace("_", " ")
            if label not in missing:
                missing.append(label)

    match_score = (matched_count / checkable_count) if checkable_count else 0.0

    if contradicted:
        status = MatchStatus.NOT_A_MATCH
    elif missing:
        # We matched what we could check, but can't confirm everything.
        status = (
            MatchStatus.LIKELY_MATCH
            if match_score >= 0.6
            else MatchStatus.POSSIBLE_MATCH
        )
    elif checkable_count > 0 and match_score == 1.0:
        status = MatchStatus.LIKELY_MATCH
    else:
        status = MatchStatus.OFFICIAL_VERIFICATION_REQUIRED

    return EligibilityResult(
        scheme_id=document.scheme_id,
        scheme_name=document.scheme_name,
        status=status,
        reason=reasons,
        missing_information=missing,
        match_score=match_score,
    )


def _human_reason(field: str, value) -> str:
    mapping = {
        "occupation": lambda v: str(v).capitalize(),
        "state": lambda v: str(v),
        "category": lambda v: f"{v} category",
        "min_age": lambda v: f"Age {v}+",
        "max_age": lambda v: f"Age up to {v}",
        "min_income": lambda v: f"Income above ₹{int(v):,}",
        "max_income": lambda v: f"Income below ₹{int(v):,}",
        "gender": lambda v: str(v).capitalize(),
    }
    fn = mapping.get(field, lambda v: f"{field}={v}")
    return fn(value)
