# backend/tests/test_eligibility.py
import pytest
from app.models.scheme import Scheme
from app.schemas.eligibility import UserProfile
from app.services.eligibility_engine import EligibilityEngine

def test_amma_vodi_eligibility():
    # Mock Jagananna Amma Vodi rule
    scheme = Scheme(
        id=1,
        name="Jagananna Amma Vodi",
        applicable_state="Andhra Pradesh",
        min_age=18,
        gender="Female",
        max_income=144000
    )

    # Test Case 1: Eligible Female User
    eligible_profile = UserProfile(
        age=30,
        gender="Female",
        state="Andhra Pradesh",
        annual_income=100000
    )
    result = EligibilityEngine.assess_scheme(eligible_profile, scheme)
    assert result.status == "Likely Eligible"

    # Test Case 2: Ineligible Income
    rich_profile = UserProfile(
        age=30,
        gender="Female",
        state="Andhra Pradesh",
        annual_income=500000
    )
    result = EligibilityEngine.assess_scheme(rich_profile, scheme)
    assert result.status == "Likely Ineligible"
    assert len(result.failed_criteria) > 0

    # Test Case 3: Missing Income (Potentially Eligible)
    incomplete_profile = UserProfile(
        age=30,
        gender="Female",
        state="Andhra Pradesh",
        annual_income=None
    )
    result = EligibilityEngine.assess_scheme(incomplete_profile, scheme)
    assert result.status == "Potentially Eligible"