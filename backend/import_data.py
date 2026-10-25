import csv
import os
from sqlalchemy import create_engine, Column, Integer, String, Text, Float, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Connect directly to your schemes.db SQLite database
DB_PATH = os.path.join(os.path.dirname(__file__), "schemes.db")
engine = create_engine(f"sqlite:///{DB_PATH}")
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class SchemeModel(Base):
    __tablename__ = "schemes"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String, index=True)
    applicable_state = Column(String, index=True)
    gov_type = Column(String, default="Central")
    description = Column(Text, nullable=True)
    benefits = Column(Text, nullable=True)
    application_process = Column(Text, default="Apply online through official portal.")
    max_income = Column(Float, nullable=True)
    required_documents = Column(Text, nullable=True)
    official_url = Column(Text, nullable=True)
    source_url = Column(Text, default="https://www.india.gov.in")
    is_active = Column(Boolean, default=True)

def import_all_eligible_schemes(csv_path="data/schemes_seed.csv"):
    db = SessionLocal()
    
    # Clear existing schemes to start fresh
    db.query(SchemeModel).delete()
    db.commit()

    added_count = 0
    full_csv_path = os.path.join(os.path.dirname(__file__), csv_path)
    
    with open(full_csv_path, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            state_field = (row.get('applicable_state') or row.get('state') or '').strip()
            state_lower = state_field.lower()

            # Include Andhra Pradesh + Central / All India / National / Blank (Nationwide) schemes
            is_valid = (
                'andhra pradesh' in state_lower or 
                'all india' in state_lower or 
                'central' in state_lower or 
                'national' in state_lower or
                'pan-india' in state_lower or
                state_field == '' # Blank state fields apply nationwide centrally
            )

            if is_valid:
                max_inc = None
                try:
                    val = row.get('max_income')
                    if val and val.strip():
                        max_inc = float(val)
                except ValueError:
                    pass

                # Set appropriate jurisdiction tag
                gov_type_val = "State" if 'andhra pradesh' in state_lower else "Central"
                display_state = "Andhra Pradesh" if 'andhra pradesh' in state_lower else "All India"

                app_process = row.get('application_process') or "Apply online through official portal or local authorized centers."
                off_url = row.get('official_url') or "https://www.india.gov.in"

                scheme = SchemeModel(
                    name=row.get('name'),
                    category=row.get('category', 'General'),
                    applicable_state=display_state,
                    gov_type=gov_type_val,
                    description=row.get('description'),
                    benefits=row.get('benefits'),
                    application_process=app_process,
                    max_income=max_inc,
                    required_documents=row.get('required_documents'),
                    official_url=off_url,
                    source_url=off_url,
                    is_active=True
                )
                db.add(scheme)
                added_count += 1

    db.commit()
    db.close()
    print(f"Successfully imported {added_count} Andhra Pradesh & Central Government schemes!")

if __name__ == "__main__":
    import_all_eligible_schemes()