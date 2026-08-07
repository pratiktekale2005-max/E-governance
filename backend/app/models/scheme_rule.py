"""
Scheme Rule Definition & Provenance Models (Module 3 & 4)
"""
from __future__ import annotations

from enum import Enum
from typing import Any, List, Optional, Union
from pydantic import BaseModel, Field


class OperatorEnum(str, Enum):
    EQUALS = "equals"
    NOT_EQUALS = "not_equals"
    GREATER_THAN = "greater_than"
    GREATER_THAN_EQUAL = "greater_than_equal"
    LESS_THAN = "less_than"
    LESS_THAN_EQUAL = "less_than_equal"
    BETWEEN = "between"
    CONTAINS = "contains"
    IN = "in"
    NOT_IN = "not_in"
    EXISTS = "exists"


class LogicEnum(str, Enum):
    AND = "AND"
    OR = "OR"
    NOT = "NOT"
    ALL_OF = "ALL_OF"
    ANY_OF = "ANY_OF"


class ReviewStatusEnum(str, Enum):
    HUMAN_VERIFIED = "human_verified"
    UNVERIFIED = "unverified"
    STALE = "stale"
    DEPRECATED = "deprecated"


class RuleProvenance(BaseModel):
    source_url: str = Field(..., description="Official government portal URL")
    source_title: str = Field("Official Scheme Guidelines", description="Title of official document")
    page_number: Optional[int] = Field(None, description="Page reference in official PDF")
    effective_from: Optional[str] = Field("2026-04-01", description="Effective date (YYYY-MM-DD)")
    last_verified_at: Optional[str] = Field("2026-08-07", description="Last human verification date")
    review_status: ReviewStatusEnum = Field(ReviewStatusEnum.HUMAN_VERIFIED, description="Must be human_verified to evaluate")


class RuleCondition(BaseModel):
    field: str = Field(..., description="Target citizen profile attribute (e.g., 'annual_income')")
    operator: OperatorEnum = Field(..., description="Comparison operator")
    value: Optional[Any] = Field(None, description="Expected value or range [min, max]")
    unit: Optional[str] = Field(None, description="Unit if numeric (e.g., 'INR', 'years')")
    is_mandatory: bool = Field(True, description="True if condition is strictly mandatory for scheme")
    description: Optional[str] = Field(None, description="Human readable description of this condition")


class RuleNode(BaseModel):
    logic: Optional[LogicEnum] = Field(LogicEnum.AND, description="Boolean logic operator for child conditions")
    conditions: List[Union[RuleCondition, RuleNode]] = Field(default_factory=list)
    is_mandatory: bool = Field(True)


# Support recursive Pydantic schema resolution for RuleNode
RuleNode.update_forward_refs()


class SchemeRuleSet(BaseModel):
    scheme_id: str
    scheme_name: str
    category: Optional[str] = None
    jurisdiction: Optional[str] = Field("central", description="central | state")
    target_state: Optional[str] = None
    root_rule: RuleNode
    provenance: RuleProvenance
    required_documents: List[str] = Field(default_factory=list)
