from app.schemas.eligibility import UserProfile, SchemeEligibilityResult
from app.models.scheme import Scheme

class EligibilityEngine:
    @staticmethod
    def assess_scheme(profile: UserProfile, scheme: Scheme) -> SchemeEligibilityResult:
        matched = []
        unmatched = []
        status = "Likely Eligible"

        # 1. State Rule (Central / All India schemes apply to all states)
        if scheme.applicable_state and scheme.applicable_state.lower() not in ["all india", "central", "all"]:
            if profile.state and profile.state.lower() not in ["all india", "central", "all"]:
                if scheme.applicable_state.lower() != profile.state.lower():
                    status = "Not Eligible"
                    unmatched.append(f"State Mismatch (Scheme is for {scheme.applicable_state}, profile is {profile.state})")
                else:
                    matched.append(f"State Match ({profile.state})")
            else:
                matched.append("State Rules Match")
        else:
            matched.append("Applicable Nationwide (Central Scheme)")

        # 2. Income Rule
        if scheme.max_income and profile.annual_income is not None:
            if profile.annual_income <= scheme.max_income:
                matched.append(f"Income Criteria Met (₹{profile.annual_income:,} <= ₹{scheme.max_income:,})")
            else:
                status = "Not Eligible"
                unmatched.append(f"Income Limit Exceeded (Limit: ₹{scheme.max_income:,}, Profile: ₹{profile.annual_income:,})")

        # 3. Age Rules
        if profile.age is not None:
            if scheme.min_age and profile.age < scheme.min_age:
                status = "Not Eligible"
                unmatched.append(f"Below Minimum Age (Min: {scheme.min_age}, Age: {profile.age})")
            elif scheme.max_age and profile.age > scheme.max_age:
                status = "Not Eligible"
                unmatched.append(f"Exceeds Maximum Age (Max: {scheme.max_age}, Age: {profile.age})")
            else:
                matched.append("Age Requirements Satisfied")

        # 4. Gender Rule
        if scheme.gender and scheme.gender.lower() not in ["all", "either"]:
            if profile.gender and profile.gender.lower() not in ["all", "either"]:
                if scheme.gender.lower() == profile.gender.lower():
                    matched.append(f"Gender Criteria Satisfied ({profile.gender})")
                else:
                    status = "Not Eligible"
                    unmatched.append(f"Gender Mismatch (Scheme requires {scheme.gender})")

        # Calculate confidence score based on rules evaluated
        total_rules = len(matched) + len(unmatched)
        confidence = round(len(matched) / total_rules, 2) if total_rules > 0 else 1.0

        return SchemeEligibilityResult(
            scheme_id=scheme.id,
            scheme_name=scheme.name,
            status=status,
            matched_rules=matched,
            unmatched_rules=unmatched,
            confidence_score=confidence
        )