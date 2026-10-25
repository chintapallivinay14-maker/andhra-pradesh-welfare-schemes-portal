import os
import re
import pandas as pd
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.scheme import Scheme

# Ensure database tables exist
Base.metadata.create_all(bind=engine)

def import_updated_dataset():
    # Look for updated_data.csv in backend/ directory
    possible_paths = [
        os.path.join(os.path.dirname(__file__), "updated_data.csv"),
        os.path.join(os.path.dirname(__file__), "data", "updated_data.csv"),
        "updated_data.csv",
        "data/updated_data.csv"
    ]
    
    file_path = None
    for p in possible_paths:
        if os.path.exists(p):
            file_path = p
            break

    if not file_path:
        print("Error: updated_data.csv not found in backend directory!")
        return

    print(f"Loading dataset from: {file_path}...")
    df = pd.read_csv(file_path, low_memory=False)
    print(f"Total records found in CSV: {len(df)}")

    db: Session = SessionLocal()
    imported_count = 0
    updated_count = 0

    for idx, row in df.iterrows():
        name = str(row.get("scheme_name", "")).strip()
        if not name or name.lower() == "nan":
            continue

        slug = str(row.get("slug", "")).strip()
        details = str(row.get("details", "Government Welfare Scheme.")).strip()
        benefits = str(row.get("benefits", "Financial assistance and welfare benefits.")).strip()
        eligibility = str(row.get("eligibility", "")).strip()
        application = str(row.get("application", "Apply via official government portal.")).strip()
        documents = str(row.get("documents", "Aadhaar Card; Income Certificate; Bank Passbook.")).strip()
        level = str(row.get("level", "All India")).strip()
        category_raw = str(row.get("schemeCategory", "Social Welfare")).strip()

        # Sanitize category string/list
        category = category_raw.replace("[", "").replace("]", "").replace("'", "").replace('"', '').split(",")[0].strip()
        if not category or category.lower() == "nan":
            category = "Social Welfare"

        # State/Central distinction
        if level.lower() in ["central", "all india", "national", "nan"]:
            applicable_state = "All India"
            gov_type = "Central"
        else:
            applicable_state = level
            gov_type = "State"

        # Official portal link generator using myScheme slug
        official_url = f"https://www.myscheme.gov.in/schemes/{slug}" if slug and slug != "nan" else "https://www.myscheme.gov.in/"

        # Extract income limits if mentioned in eligibility text
        max_income = None
        income_matches = re.findall(r'₹?\s?(\d[\d,]+)', eligibility)
        if income_matches:
            try:
                inc_val = int(income_matches[0].replace(',', ''))
                if 10000 <= inc_val <= 1000000:
                    max_income = inc_val
            except ValueError:
                pass

        # Gender detection
        elig_lower = (eligibility + " " + name).lower()
        if "female" in elig_lower or "women" in elig_lower or "girl" in elig_lower:
            gender = "Female"
        else:
            gender = "All"

        existing = db.query(Scheme).filter(Scheme.name == name).first()
        if existing:
            existing.description = details if details != "nan" else existing.description
            existing.benefits = benefits if benefits != "nan" else existing.benefits
            existing.required_documents = documents if documents != "nan" else existing.required_documents
            existing.application_process = application if application != "nan" else existing.application_process
            existing.category = category
            existing.applicable_state = applicable_state
            updated_count += 1
        else:
            new_scheme = Scheme(
                name=name,
                short_name=slug[:20] if slug != "nan" else name[:20],
                description=details if details != "nan" else "Government welfare initiative.",
                category=category,
                gov_type=gov_type,
                applicable_state=applicable_state if applicable_state != "nan" else "All India",
                ministry="Ministry of Social Justice and Empowerment",
                min_age=0,
                max_age=None,
                gender=gender,
                max_income=max_income,
                occupation=None,
                residence_type="All",
                benefits=benefits if benefits != "nan" else "Financial assistance and welfare benefits.",
                required_documents=documents if documents != "nan" else "Aadhaar Card; Income Certificate; Bank Passbook.",
                application_process=application if application != "nan" else "Apply through official portal.",
                official_url=official_url,
                source_url=official_url,
                is_active=True
            )
            db.add(new_scheme)
            imported_count += 1

        # Batch commit every 200 items for execution speed
        if (imported_count + updated_count) % 200 == 0:
            db.commit()

    db.commit()
    db.close()

    print(f"\nImport Completed Successfully!")
    print(f"Total New Schemes Imported: {imported_count}")
    print(f"Total Existing Schemes Updated: {updated_count}")

if __name__ == "__main__":
    import_updated_dataset()