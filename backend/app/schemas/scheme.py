from pydantic import BaseModel
from typing import Optional

class SchemeBase(BaseModel):
    name: str
    short_name: Optional[str] = None
    description: str
    category: str
    gov_type: Optional[str] = None
    applicable_state: str
    ministry: Optional[str] = None
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    gender: Optional[str] = None
    education_requirement: Optional[str] = None
    max_income: Optional[int] = None
    occupation: Optional[str] = None
    residence_type: Optional[str] = None
    benefits: Optional[str] = None
    required_documents: Optional[str] = None
    application_process: Optional[str] = None
    official_url: Optional[str] = None
    source_url: Optional[str] = None
    is_active: Optional[bool] = True
    verification_status: Optional[str] = "Needs Verification"
class SchemeSchema(SchemeBase):
    id: int

    class Config:
        from_attributes = True
        orm_mode = True