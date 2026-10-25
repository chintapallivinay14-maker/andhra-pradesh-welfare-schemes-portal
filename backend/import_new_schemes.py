
from pathlib import Path
import pandas as pd

from app.database import SessionLocal
from app.models.scheme import Scheme

BASE_DIR = Path(__file__).resolve().parent
CSV_FILE = BASE_DIR / "updated_data.csv"
PORTAL_URL = "https://www.myscheme.gov.in/"


def clean(value, default=""):
    if pd.isna(value):
        return default

    value = str(value).strip()
    if not value or value.casefold() in {"nan", "none", "null"}:
        return default

    return value


def normalize(name):
    return " ".join(name.casefold().split())


def get_government_level(level):
    value = level.strip().casefold()

    if value == "central":
        return "Central", "All India"

    return "State", "Unknown"
def main():
    if not CSV_FILE.exists():
        print(f"CSV not found: {CSV_FILE}")
        return

    df = pd.read_csv(CSV_FILE, low_memory=False)

    required = {
        "scheme_name", "details", "benefits",
        "eligibility", "application", "documents",
        "level", "schemeCategory"
    }

    missing = required - set(df.columns)
    if missing:
        print("Missing columns:", sorted(missing))
        return

    # Ignore rows without a usable scheme name.
    df["scheme_name"] = df["scheme_name"].apply(clean)
    df = df[df["scheme_name"] != ""]

    # Collapse repeated names within the CSV.
    df["_normalized_name"] = df["scheme_name"].apply(normalize)
    df = df.drop_duplicates("_normalized_name", keep="first")

    db = SessionLocal()
    added = 0
    skipped = 0
    errors = 0

    try:
        existing_names = {
            normalize(name)
            for (name,) in db.query(Scheme.name).all()
            if name
        }

        print(f"Unique candidate names in CSV: {len(df)}")

        for _, row in df.iterrows():
            name = clean(row.get("scheme_name"))
            key = normalize(name)

            if key in existing_names:
                skipped += 1
                continue

            details = clean(row.get("details"))
            benefits = clean(row.get("benefits"))
            eligibility = clean(row.get("eligibility"))
            application = clean(row.get("application"))
            documents = clean(row.get("documents"))
            level = clean(row.get("level"))
            category = clean(row.get("schemeCategory"), "Government Welfare")

            if not details:
                details = "Details require verification against an official source."

            if not benefits:
                benefits = "Benefits require verification against an official source."

            if not eligibility:
                eligibility = "Eligibility criteria have not been provided in the dataset."

            gov_type, state = get_government_level(level)

            slug = clean(row.get("slug"))
            official_url = (
                f"{PORTAL_URL}schemes/{slug}"
                if slug and slug != "nan"
                else PORTAL_URL
            )

            record = Scheme(
                name=name,
                short_name=name[:50],
                description=details,
                category=category,
                gov_type=gov_type,
                applicable_state=state,
                ministry=None,
                min_age=None,
                max_age=None,
                gender="All",
                education_requirement=eligibility,
                max_income=None,
                occupation=None,
                residence_type="All",
                benefits=benefits,
                required_documents=documents or "Not specified in the dataset.",
                application_process=application or "Check the official portal for current instructions.",
                official_url=official_url,
                source_url=PORTAL_URL,
                verification_status="Needs Verification",
                is_active=False,
            )

            db.add(record)
            existing_names.add(key)
            added += 1

            if added % 100 == 0:
                db.commit()
                print(f"Inserted {added} new records...")

        db.commit()

        print("\nImport finished.")
        print(f"New records inserted: {added}")
        print(f"Existing records skipped: {skipped}")
        print(f"Total records in database: {db.query(Scheme).count()}")
        print(
            "New records are inactive pending official verification."
        )

    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
