from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from datetime import datetime, timezone
from app.database import Base

class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    short_name = Column(String, index=True, nullable=True)
    description = Column(Text, nullable=False)
    category = Column(String, index=True, nullable=False) 
    gov_type = Column(String, nullable=False) 
    applicable_state = Column(String, default="All", index=True) 
    ministry = Column(String, nullable=True)
    
    min_age = Column(Integer, nullable=True)
    max_age = Column(Integer, nullable=True)
    gender = Column(String, default="All") 
    education_requirement = Column(String, nullable=True)
    max_income = Column(Integer, nullable=True) 
    occupation = Column(String, nullable=True) 
    residence_type = Column(String, default="All") 

    benefits = Column(Text, nullable=False)
    required_documents = Column(Text, nullable=False)
    application_process = Column(Text, nullable=False)
    official_url = Column(String, nullable=False)
    
    source_url = Column(String, nullable=False)
    verification_status = Column(String, default="Verified") 
    last_verified = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    is_active = Column(Boolean, default=True)