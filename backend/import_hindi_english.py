import os
import pandas as pd
from datetime import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.scheme import Scheme

# Ensure DB tables exist
Base.metadata.create_all(bind=engine)

def import_hindi_english_dataset():
    db: Session = SessionLocal()
    filename = "indian government schemes dataset english and hindi.csv"
    
    if not os.path.exists(filename):
        print(f"❌ File '{filename}' not found in the backend directory! Please place it here.")
        return

    print(f"📖 Reading '{filename}'...")
    df = pd.read_csv(filename).fillna("")
    
    inserted = 0
    updated = 0

    for _, row in df.iterrows():
        name = str(row.get("scheme_name", "")).strip()
        if not name or name.lower() == "nan":
            continue

        state_central = str(row.get("state_or_central", "Central")).strip()
        gov_type = "State" if "State" in state_central else "Central"
        
        # Combine English description/answers or fallback to Hindi if needed
        desc_en = str(row.get("answer_english", "")).strip()
        desc_hi = str(row.get("answer", "")).strip()
        description = desc_en if desc_en else desc_hi
        if len(description) > 1000:
            description = description[:997] + "..."

        url = str(row.get("official_website", "https://www.india.gov.in/")).strip()
        category = str(row.get("category", "General Welfare")).strip()
        beneficiary = str(row.get("target_beneficiary", "All Citizens")).strip()

        existing = db.query(Scheme).filter(Scheme.name == name).first()
        if existing:
            existing.category = category or existing.category
            existing.occupation = beneficiary or existing.occupation
            if not existing.description and description:
                existing.description = description
            updated += 1
        else:
            new_scheme = Scheme(
                name=name,
                short_name=name[:50],
                applicable_state="All India",
                category=category or "General Welfare",
                gov_type=gov_type,
                occupation=beneficiary or "All Occupations",
                description=description or f"Government welfare scheme: {name}",
                benefits="Subsidies, financial assistance, and welfare support benefits.",
                required_documents="Aadhaar Card, Income Certificate, Bank Details.",
                application_process="Apply online via official government portal.",
                official_url=url,
                source_url=url,
                gender="All",
                residence_type="All",
                verification_status="Verified",
                last_verified=datetime.now(),
                is_active=True
            )
            db.add(new_scheme)
            inserted += 1

    db.commit()
    db.close()
    print(f"🎉 Success! Hindi/English dataset imported: {inserted} new schemes added, {updated} schemes updated.")

if __name__ == "__main__":
    import_hindi_english_dataset()