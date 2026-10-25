
from pydantic import BaseModel, Field
from typing import Optional, List, Any


class UserProfile(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = "All"
    state: Optional[str] = "All India"
    annual_income: Optional[int] = None
    occupation: Optional[str] = None
    residence_type: Optional[str] = "All"
    education: Optional[str] = None

    # Category selected on the frontend
    category: Optional[str] = None

    class Config:
        extra = "allow"


class SchemeEligibilityResult(BaseModel):
    scheme_id: int
    scheme_name: str
    status: str
    matched_rules: List[str] = Field(default_factory=list)
    unmatched_rules: List[str] = Field(default_factory=list)
    confidence_score: Optional[float] = 1.0


# Alias for backwards compatibility
SchemeEligibility = SchemeEligibilityResult


class EligibilityResponse(BaseModel):
    profile_summary: UserProfile
    total_evaluated: int
    eligible_count: int
    eligible_schemes: List[SchemeEligibilityResult] = Field(
        default_factory=list
    )
