"""
Module 5 — Three-Valued Evaluation Engine (Condition Level)
Evaluates atomic RuleConditions against a citizen profile returning TRUE, FALSE, or UNKNOWN.
"""
from __future__ import annotations

from typing import Any, Dict
from app.models.scheme_rule import RuleCondition, OperatorEnum
from app.models.pre_screening_result import ThreeValuedLogic, ConditionEvaluationResult


def evaluate_condition(condition: RuleCondition, profile_dict: Dict[str, Any]) -> ConditionEvaluationResult:
    field = condition.field
    op = condition.operator
    expected = condition.value
    desc = condition.description or f"{field} {op.value} {expected}"

    citizen_val = profile_dict.get(field)

    # Handle EXISTS operator specially
    if op == OperatorEnum.EXISTS:
        res = ThreeValuedLogic.TRUE if citizen_val is not None else ThreeValuedLogic.FALSE
        return ConditionEvaluationResult(
            field=field,
            result=res,
            description=desc,
            reason=f"Field '{field}' exists" if res == ThreeValuedLogic.TRUE else f"Field '{field}' is missing"
        )

    # Missing profile data yields UNKNOWN (never FALSE!)
    if citizen_val is None:
        return ConditionEvaluationResult(
            field=field,
            result=ThreeValuedLogic.UNKNOWN,
            description=desc,
            reason=f"Citizen profile field '{field}' is missing or not provided"
        )

    # String case normalization for comparison
    def _norm(val: Any) -> Any:
        if isinstance(val, str):
            return val.strip().lower()
        return val

    c_val = _norm(citizen_val)
    e_val = _norm(expected) if not isinstance(expected, list) else [_norm(x) for x in expected]

    # Perform evaluation based on operator
    if op == OperatorEnum.EQUALS:
        matched = c_val == e_val
        res = ThreeValuedLogic.TRUE if matched else ThreeValuedLogic.FALSE
        reason = f"Profile {field} ({citizen_val}) matches requirement ({expected})" if matched else f"Profile {field} ({citizen_val}) does not match required ({expected})"

    elif op == OperatorEnum.NOT_EQUALS:
        matched = c_val != e_val
        res = ThreeValuedLogic.TRUE if matched else ThreeValuedLogic.FALSE
        reason = f"Profile {field} ({citizen_val}) satisfies not-equal requirement ({expected})" if matched else f"Profile {field} ({citizen_val}) equals excluded value ({expected})"

    elif op == OperatorEnum.GREATER_THAN:
        try:
            matched = float(citizen_val) > float(expected)
            res = ThreeValuedLogic.TRUE if matched else ThreeValuedLogic.FALSE
            reason = f"{field} ({citizen_val}) > {expected}" if matched else f"{field} ({citizen_val}) is not > {expected}"
        except (ValueError, TypeError):
            res = ThreeValuedLogic.FALSE
            reason = f"Type error comparing {citizen_val} > {expected}"

    elif op == OperatorEnum.GREATER_THAN_EQUAL:
        try:
            matched = float(citizen_val) >= float(expected)
            res = ThreeValuedLogic.TRUE if matched else ThreeValuedLogic.FALSE
            reason = f"{field} ({citizen_val}) >= {expected}" if matched else f"{field} ({citizen_val}) is less than required minimum ({expected})"
        except (ValueError, TypeError):
            res = ThreeValuedLogic.FALSE
            reason = f"Type error comparing {citizen_val} >= {expected}"

    elif op == OperatorEnum.LESS_THAN:
        try:
            matched = float(citizen_val) < float(expected)
            res = ThreeValuedLogic.TRUE if matched else ThreeValuedLogic.FALSE
            reason = f"{field} ({citizen_val}) < {expected}" if matched else f"{field} ({citizen_val}) is not < {expected}"
        except (ValueError, TypeError):
            res = ThreeValuedLogic.FALSE
            reason = f"Type error comparing {citizen_val} < {expected}"

    elif op == OperatorEnum.LESS_THAN_EQUAL:
        try:
            matched = float(citizen_val) <= float(expected)
            res = ThreeValuedLogic.TRUE if matched else ThreeValuedLogic.FALSE
            reason = f"{field} ({citizen_val}) <= {expected}" if matched else f"{field} ({citizen_val}) exceeds required maximum limit ({expected})"
        except (ValueError, TypeError):
            res = ThreeValuedLogic.FALSE
            reason = f"Type error comparing {citizen_val} <= {expected}"

    elif op == OperatorEnum.BETWEEN:
        try:
            low, high = expected
            matched = float(low) <= float(citizen_val) <= float(high)
            res = ThreeValuedLogic.TRUE if matched else ThreeValuedLogic.FALSE
            reason = f"{field} ({citizen_val}) is within range [{low}, {high}]" if matched else f"{field} ({citizen_val}) is outside required range [{low}, {high}]"
        except Exception:
            res = ThreeValuedLogic.FALSE
            reason = f"Invalid between range format: {expected}"

    elif op == OperatorEnum.IN:
        if isinstance(e_val, list):
            matched = c_val in e_val
            res = ThreeValuedLogic.TRUE if matched else ThreeValuedLogic.FALSE
            reason = f"{field} ({citizen_val}) is among allowed values {expected}" if matched else f"{field} ({citizen_val}) is not in allowed list {expected}"
        else:
            res = ThreeValuedLogic.FALSE
            reason = f"Expected list value for 'in' operator"

    elif op == OperatorEnum.NOT_IN:
        if isinstance(e_val, list):
            matched = c_val not in e_val
            res = ThreeValuedLogic.TRUE if matched else ThreeValuedLogic.FALSE
            reason = f"{field} ({citizen_val}) is excluded by {expected}" if not matched else f"{field} ({citizen_val}) is not in restricted list {expected}"
        else:
            res = ThreeValuedLogic.FALSE
            reason = f"Expected list value for 'not_in' operator"

    elif op == OperatorEnum.CONTAINS:
        matched = str(e_val) in str(c_val)
        res = ThreeValuedLogic.TRUE if matched else ThreeValuedLogic.FALSE
        reason = f"{field} contains '{expected}'" if matched else f"{field} does not contain '{expected}'"

    else:
        res = ThreeValuedLogic.UNKNOWN
        reason = f"Unsupported operator: {op}"

    return ConditionEvaluationResult(
        field=field,
        result=res,
        description=desc,
        reason=reason
    )
