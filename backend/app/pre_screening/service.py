"""
PreScreeningService Facade Engine
Orchestrates Modules 1 through 10 of the Government Scheme Pre-screening Pipeline.
"""
from __future__ import annotations

from datetime import datetime
from typing import List, Dict, Optional
from app.models.citizen_profile import CitizenProfileInput, normalize_profile
from app.models.scheme_rule import SchemeRuleSet
from app.models.pre_screening_result import (
    PreScreeningSchemeResult,
    PreScreeningCheckResponse,
    ThreeValuedLogic,
    PreScreeningStatus,
)
from app.pre_screening.rules.parser import load_all_scheme_rules
from app.pre_screening.rules.provenance import is_provenance_valid
from app.pre_screening.rules.logic_tree import evaluate_rule_node
from app.pre_screening.classification import classify_pre_screening
from app.pre_screening.missing_info import detect_missing_information
from app.pre_screening.documents import map_required_documents
from app.pre_screening.ranking import calculate_ranking_score
from app.pre_screening.explanation import generate_llm_explanation
from app.utils.logger import logger


class PreScreeningService:
    def __init__(self, rules_map: Optional[Dict[str, SchemeRuleSet]] = None):
        self.rules_map = rules_map if rules_map is not None else load_all_scheme_rules()

    def run_pre_screening(
        self,
        raw_profile: CitizenProfileInput,
        include_llm_explanation: bool = True,
        target_scheme_id: Optional[str] = None,
    ) -> PreScreeningCheckResponse:
        norm_profile = normalize_profile(raw_profile)
        profile_dict = norm_profile.as_dict()

        evaluated_count = 0
        scheme_results: List[PreScreeningSchemeResult] = []
        all_missing_fields: set[str] = set()
        all_follow_ups: set[str] = set()

        rules_to_evaluate = (
            {target_scheme_id: self.rules_map[target_scheme_id]}
            if target_scheme_id and target_scheme_id in self.rules_map
            else self.rules_map
        )

        for scheme_id, scheme_rule in rules_to_evaluate.items():
            evaluated_count += 1

            # Validate Provenance
            prov_valid, prov_reason = is_provenance_valid(scheme_rule.provenance)

            # Evaluate Rule Tree using Three-Valued Logic
            tree_eval = evaluate_rule_node(scheme_rule.root_rule, profile_dict)

            # Classify Pre-screening Status
            status = classify_pre_screening(
                tree_result=tree_eval.result,
                evaluations=tree_eval.leaf_evaluations,
                provenance_valid=prov_valid,
            )

            # Detect Missing Info
            missing_fields, follow_ups = detect_missing_information(tree_eval.leaf_evaluations)
            all_missing_fields.update(missing_fields)
            all_follow_ups.update(follow_ups)

            # Document Mapping
            req_docs = map_required_documents(scheme_rule.required_documents)

            # Transparent Ranking
            score, ranking_reasons = calculate_ranking_score(
                scheme_rule=scheme_rule,
                evaluations=tree_eval.leaf_evaluations,
                status=status,
                profile_dict=profile_dict,
            )

            matched_conds = [e.description for e in tree_eval.leaf_evaluations if e.result == ThreeValuedLogic.TRUE]
            conflicting_conds = [e.reason for e in tree_eval.leaf_evaluations if e.result == ThreeValuedLogic.FALSE]

            sources = [
                {
                    "source_url": scheme_rule.provenance.source_url,
                    "source_title": scheme_rule.provenance.source_title,
                    "last_verified_at": scheme_rule.provenance.last_verified_at,
                    "review_status": scheme_rule.provenance.review_status.value,
                }
            ]

            result_item = PreScreeningSchemeResult(
                scheme_id=scheme_id,
                scheme_name=scheme_rule.scheme_name,
                decision_type="pre_screening",
                status=status,
                ranking_score=score,
                matched_conditions=matched_conds,
                missing_information=missing_fields,
                conflicting_conditions=conflicting_conds,
                required_documents=req_docs,
                ranking_reasons=ranking_reasons,
                official_verification_required=True,
                sources=sources,
            )
            scheme_results.append(result_item)

        # Sort schemes by ranking score descending
        scheme_results.sort(key=lambda r: r.ranking_score, reverse=True)

        # LLM Explanation (Optional)
        explanation = None
        if include_llm_explanation and scheme_results:
            explanation = generate_llm_explanation(profile_dict, scheme_results)

        return PreScreeningCheckResponse(
            user_id=norm_profile.user_id,
            timestamp=datetime.utcnow().isoformat(),
            schemes_evaluated=evaluated_count,
            matched_schemes=scheme_results,
            missing_profile_fields=sorted(list(all_missing_fields)),
            follow_up_questions=sorted(list(all_follow_ups)),
            llm_explanation=explanation,
        )


pre_screening_service_instance = PreScreeningService()
