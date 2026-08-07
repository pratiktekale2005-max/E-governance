"""
Module 4 — Rule Tree Engine & Three-Valued Tree Evaluator
Evaluates nested RuleNode structures using strict Three-Valued Logic (TRUE / FALSE / UNKNOWN).
"""
from __future__ import annotations

from typing import Any, Dict, List
from app.models.scheme_rule import RuleNode, RuleCondition, LogicEnum
from app.models.pre_screening_result import ThreeValuedLogic, ConditionEvaluationResult
from app.pre_screening.rules.evaluator import evaluate_condition


class LogicTreeEvaluationResult:
    def __init__(self, result: ThreeValuedLogic, leaf_evaluations: List[ConditionEvaluationResult]):
        self.result = result
        self.leaf_evaluations = leaf_evaluations


def evaluate_rule_node(node: RuleNode, profile_dict: Dict[str, Any]) -> LogicTreeEvaluationResult:
    if not node.conditions:
        return LogicTreeEvaluationResult(result=ThreeValuedLogic.TRUE, leaf_evaluations=[])

    leaf_evals: List[ConditionEvaluationResult] = []
    child_results: List[ThreeValuedLogic] = []

    for child in node.conditions:
        if isinstance(child, RuleCondition):
            eval_res = evaluate_condition(child, profile_dict)
            leaf_evals.append(eval_res)
            child_results.append(eval_res.result)
        elif isinstance(child, RuleNode):
            sub_tree_res = evaluate_rule_node(child, profile_dict)
            leaf_evals.extend(sub_tree_res.leaf_evaluations)
            child_results.append(sub_tree_res.result)

    logic = node.logic or LogicEnum.AND

    if logic in [LogicEnum.AND, LogicEnum.ALL_OF]:
        if ThreeValuedLogic.FALSE in child_results:
            final_res = ThreeValuedLogic.FALSE
        elif ThreeValuedLogic.UNKNOWN in child_results:
            final_res = ThreeValuedLogic.UNKNOWN
        else:
            final_res = ThreeValuedLogic.TRUE

    elif logic in [LogicEnum.OR, LogicEnum.ANY_OF]:
        if ThreeValuedLogic.TRUE in child_results:
            final_res = ThreeValuedLogic.TRUE
        elif ThreeValuedLogic.UNKNOWN in child_results:
            final_res = ThreeValuedLogic.UNKNOWN
        else:
            final_res = ThreeValuedLogic.FALSE

    elif logic == LogicEnum.NOT:
        child_res = child_results[0] if child_results else ThreeValuedLogic.TRUE
        if child_res == ThreeValuedLogic.TRUE:
            final_res = ThreeValuedLogic.FALSE
        elif child_res == ThreeValuedLogic.FALSE:
            final_res = ThreeValuedLogic.TRUE
        else:
            final_res = ThreeValuedLogic.UNKNOWN
    else:
        final_res = ThreeValuedLogic.UNKNOWN

    return LogicTreeEvaluationResult(result=final_res, leaf_evaluations=leaf_evals)
