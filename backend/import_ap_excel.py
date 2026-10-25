
from pathlib import Path
import re
import pandas as pd

from app.database import SessionLocal
from app.models.scheme import Scheme

BASE_DIR = Path(__file__).resolve().parent
EXCEL_FILE = BASE_DIR / "data" / "andhra-pradesh.xlsx"

# Generic official portals; verify the exact scheme page before publishing.
AP_PORTAL = "https://ap.gov.in/"
AP_FINANCE_PORTAL = "https://apfinance.gov.in/"


def clean(value):
    if pd.isna(value):
        return ""
    return str(value).strip()


def normalize_name(name):
    return re.sub(r"\s+", " ", name).casefold().strip()


def guess_category(name, description):
    text = f"{name} {description}".lower()

    categories = [
        (["farmer", "agriculture", "crop", "seed", "irrigation",
          "rythu", "loan"], "Agriculture"),
        (["student", "education", "school", "scholarship",
          "college", "vidya"], "Education"),
        (["health", "medical", "hospital", "aarogya"], "Healthcare"),
        (["pension", "widow", "elderly", "old age"], "Social Welfare"),
        (["women", "girl", "mahila", "maternity"], "Women and Child Welfare"),
        (["housing", "house", "awas"], "Housing"),
        (["employment", "skill", "livelihood", "self-employment"],
         "Employment"),
        (["fisher", "fisheries", "fishery"], "Fisheries"),
        (["tribal", "scheduled caste", "scheduled tribe"], "Social Welfare"),
    ]

    for keywords, category in categories:
        if any(word in text for word in keywords):
            return category

    return "Government Welfare"


def main():
    if not EXCEL_FILE.exists():
        print(f"Excel file not found: {EXCEL_FILE}")
        return

    df = pd.read_excel(EXCEL_FILE, sheet_name="Andhra Pradesh")
    required = {"Scheme", "Scheme Description"}

    if not required.issubset(df.columns):
        print("Missing required columns:", required - set(df.columns))
        return

    db = SessionLocal()

    added = 0
    skipped = 0
    invalid = 0

    try:
        existing_names = {
            normalize_name(name)
            for (name,) in db.query(Scheme.name).all()
            if name
        }

        # Collapse repeated fiscal years and estimate types into one scheme.
        unique_rows = df.dropna(subset=["Scheme"]).drop_duplicates(
            subset=["Scheme"], keep="first"
        )

        print(f"Excel rows: {len(df)}")
        print(f"Distinct scheme names in Excel: {len(unique_rows)}")

        for _, row in unique_rows.iterrows():
            name = clean(row.get("Scheme"))
            description = clean(row.get("Scheme Description"))

            if not name or not description:
                invalid += 1
                continue

            key = normalize_name(name)

            if key in existing_names:
                print(f"SKIPPED existing: {name}")
                skipped += 1
                continue

            scheme = Scheme(
                name=name,
                short_name=name[:50],
                description=description,
                category=guess_category(name, description),
                gov_type="State",
                applicable_state="Andhra Pradesh",
                ministry=None,
                min_age=None,
                max_age=None,
                gender="All",
                education_requirement=None,
                max_income=None,
                occupation=None,
                residence_type="All",
                benefits=(
                    "The source dataset includes budget information for "
                    "selected fiscal years. Current beneficiary benefits "
                    "must be confirmed from an official scheme notification."
                ),
                required_documents=(
                    "Not specified in the source dataset. Verify the "
                    "current requirements with the implementing department."
                ),
                application_process=(
                    "Application instructions are not provided in this "
                    "dataset. Check the relevant official department."
                ),
                official_url=AP_PORTAL,
                source_url=AP_FINANCE_PORTAL,
                verification_status="Needs Verification",
                is_active=True,
            )

            db.add(scheme)
            existing_names.add(key)
            added += 1
            print(f"ADDED: {name}")

        db.commit()

        print("\nImport completed.")
        print(f"New schemes added: {added}")
        print(f"Existing schemes skipped: {skipped}")
        print(f"Rows missing a name or description: {invalid}")
        print(f"Total records in database: {db.query(Scheme).count()}")

    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
