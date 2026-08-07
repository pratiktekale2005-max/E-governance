"""
Citizen Profile Model & Normalization Layer (Module 1 & 2)
"""
from __future__ import annotations

from enum import Enum
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, validator


class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    TRANSGENDER = "transgender"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"


class Category(str, Enum):
    GENERAL = "general"
    OBC = "obc"
    SC = "sc"
    ST = "st"
    EWS = "ews"


class EducationLevel(str, Enum):
    ILLITERATE = "illiterate"
    PRIMARY = "primary"
    SECONDARY = "secondary"
    HIGHER_SECONDARY = "higher_secondary"
    DIPLOMA = "diploma"
    UNDERGRADUATE = "undergraduate"
    POSTGRADUATE = "postgraduate"
    DOCTORATE = "doctorate"
    OTHER = "other"


class EmploymentStatus(str, Enum):
    EMPLOYED = "employed"
    UNEMPLOYED = "unemployed"
    SELF_EMPLOYED = "self_employed"
    STUDENT = "student"
    FARMER = "farmer"
    HOMEMAKER = "homemaker"
    RETIRED = "retired"
    OTHER = "other"


class MaritalStatus(str, Enum):
    SINGLE = "single"
    MARRIED = "married"
    WIDOWED = "widowed"
    DIVORCED = "divorced"
    SEPARATED = "separated"


class CitizenProfileInput(BaseModel):
    user_id: Optional[str] = Field(None, description="Optional unique identifier for registered citizens")
    age: Optional[int] = Field(None, ge=0, le=120)
    gender: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    occupation: Optional[str] = None
    annual_income: Optional[float] = Field(None, ge=0)
    category: Optional[str] = None
    disability_status: Optional[bool] = None
    education_level: Optional[str] = None
    family_size: Optional[int] = Field(None, ge=1)
    employment_status: Optional[str] = None
    farmer_status: Optional[bool] = None
    land_ownership: Optional[bool] = None
    student_status: Optional[bool] = None
    marital_status: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "usr_101",
                "age": 22,
                "gender": "female",
                "state": "Maharashtra",
                "district": "Pune",
                "occupation": "College Student",
                "annual_income": 180000,
                "category": "OBC",
                "disability_status": False,
                "education_level": "Undergraduate",
                "family_size": 4,
                "employment_status": "Student",
                "student_status": True,
                "marital_status": "Single",
            }
        }


class NormalizedCitizenProfile(BaseModel):
    user_id: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[Gender] = None
    state: Optional[str] = None
    district: Optional[str] = None
    occupation: Optional[str] = None
    annual_income: Optional[float] = None
    category: Optional[Category] = None
    disability_status: Optional[bool] = None
    education_level: Optional[EducationLevel] = None
    family_size: Optional[int] = None
    employment_status: Optional[EmploymentStatus] = None
    farmer_status: Optional[bool] = None
    land_ownership: Optional[bool] = None
    student_status: Optional[bool] = None
    marital_status: Optional[MaritalStatus] = None

    def as_dict(self) -> Dict[str, Any]:
        """Return dict representation omitting None values."""
        res = {}
        for k, v in self.dict().items():
            if v is not None:
                if isinstance(v, Enum):
                    res[k] = v.value
                else:
                    res[k] = v
        return res

    def get_missing_fields(self, core_fields: list[str]) -> list[str]:
        """Detect which core fields are None."""
        profile_dict = self.as_dict()
        return [f for f in core_fields if f not in profile_dict or profile_dict[f] is None]


def normalize_profile(raw: CitizenProfileInput) -> NormalizedCitizenProfile:
    """
    Module 2 — Profile Normalization
    Converts raw citizen inputs into standardized values.
    """
    # Normalize State
    norm_state = raw.state.strip().title() if raw.state else None
    if norm_state:
        state_map = {
            "Mh": "Maharashtra",
            "Maha": "Maharashtra",
            "Dl": "Delhi",
            "Up": "Uttar Pradesh",
            "Mp": "Madhya Pradesh",
            "Ktn": "Karnataka",
            "Tn": "Tamil Nadu",
            "Wb": "West Bengal",
            "Gj": "Gujarat",
        }
        norm_state = state_map.get(norm_state, norm_state)

    # Normalize Gender
    norm_gender = None
    if raw.gender:
        g = raw.gender.strip().lower()
        if g in ["m", "male", "man", "boy"]:
            norm_gender = Gender.MALE
        elif g in ["f", "female", "woman", "girl"]:
            norm_gender = Gender.FEMALE
        elif g in ["trans", "transgender"]:
            norm_gender = Gender.TRANSGENDER
        else:
            norm_gender = Gender.OTHER

    # Normalize Category
    norm_category = None
    if raw.category:
        c = raw.category.strip().lower()
        if "obc" in c:
            norm_category = Category.OBC
        elif "sc" in c:
            norm_category = Category.SC
        elif "st" in c:
            norm_category = Category.ST
        elif "ews" in c:
            norm_category = Category.EWS
        else:
            norm_category = Category.GENERAL

    # Normalize Education Level
    norm_education = None
    if raw.education_level:
        ed = raw.education_level.strip().lower()
        if "post" in ed or "master" in ed or "mtech" in ed or "msc" in ed or "mba" in ed:
            norm_education = EducationLevel.POSTGRADUATE
        elif "undergrad" in ed or "bachelor" in ed or "degree" in ed or "btech" in ed or "bsc" in ed or "ba" in ed:
            norm_education = EducationLevel.UNDERGRADUATE
        elif "diploma" in ed:
            norm_education = EducationLevel.DIPLOMA
        elif "12" in ed or "higher" in ed or "hs" in ed or "hsc" in ed:
            norm_education = EducationLevel.HIGHER_SECONDARY
        elif "10" in ed or "sec" in ed or "ssc" in ed:
            norm_education = EducationLevel.SECONDARY
        elif "primary" in ed or "school" in ed:
            norm_education = EducationLevel.PRIMARY
        elif "phd" in ed or "doctor" in ed:
            norm_education = EducationLevel.DOCTORATE
        else:
            norm_education = EducationLevel.OTHER

    # Normalize Employment & Occupation
    norm_employment = None
    norm_occupation = raw.occupation.strip().lower() if raw.occupation else None
    if raw.employment_status:
        emp = raw.employment_status.strip().lower()
        if "student" in emp:
            norm_employment = EmploymentStatus.STUDENT
        elif "farmer" in emp or "agri" in emp:
            norm_employment = EmploymentStatus.FARMER
        elif "self" in emp or "business" in emp:
            norm_employment = EmploymentStatus.SELF_EMPLOYED
        elif "unemploy" in emp:
            norm_employment = EmploymentStatus.UNEMPLOYED
        elif "employ" in emp or "job" in emp:
            norm_employment = EmploymentStatus.EMPLOYED
        elif "home" in emp:
            norm_employment = EmploymentStatus.HOMEMAKER
        elif "retire" in emp:
            norm_employment = EmploymentStatus.RETIRED
        else:
            norm_employment = EmploymentStatus.OTHER

    # Derive boolean flags if student or farmer is indicated in occupation
    student_flag = raw.student_status
    if student_flag is None and norm_occupation:
        if "student" in norm_occupation or "college" in norm_occupation or "school" in norm_occupation:
            student_flag = True

    farmer_flag = raw.farmer_status
    if farmer_flag is None and norm_occupation:
        if "farm" in norm_occupation or "agri" in norm_occupation or "kisan" in norm_occupation:
            farmer_flag = True

    # Normalize Marital Status
    norm_marital = None
    if raw.marital_status:
        m = raw.marital_status.strip().lower()
        if "married" in m:
            norm_marital = MaritalStatus.MARRIED
        elif "single" in m or "unmarried" in m:
            norm_marital = MaritalStatus.SINGLE
        elif "widow" in m:
            norm_marital = MaritalStatus.WIDOWED
        elif "divorce" in m:
            norm_marital = MaritalStatus.DIVORCED
        else:
            norm_marital = MaritalStatus.SINGLE

    return NormalizedCitizenProfile(
        user_id=raw.user_id,
        age=raw.age,
        gender=norm_gender,
        state=norm_state,
        district=raw.district.strip().title() if raw.district else None,
        occupation=norm_occupation,
        annual_income=raw.annual_income,
        category=norm_category,
        disability_status=raw.disability_status,
        education_level=norm_education,
        family_size=raw.family_size,
        employment_status=norm_employment,
        farmer_status=farmer_flag,
        land_ownership=raw.land_ownership,
        student_status=student_flag,
        marital_status=norm_marital,
    )
