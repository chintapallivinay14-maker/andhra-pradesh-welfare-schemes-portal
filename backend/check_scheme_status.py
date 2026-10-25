from app.database import SessionLocal
from app.models.scheme import Scheme

db = SessionLocal()

try:
    print("Total:", db.query(Scheme).count())
    print("Active:", db.query(Scheme).filter(
        Scheme.is_active.is_(True)
    ).count())
    print("Inactive:", db.query(Scheme).filter(
        Scheme.is_active.is_(False)
    ).count())
    print("Needs verification:", db.query(Scheme).filter(
        Scheme.verification_status == "Needs Verification"
    ).count())
finally:
    db.close()