from pydantic import BaseModel
from typing import Optional, List

class SchemeData(BaseModel):
    id: Optional[int] = None
    name: str
    applicable_state: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    benefits: Optional[str] = None
    required_documents: Optional[str] = None
    application_process: Optional[str] = None
    official_url: Optional[str] = None

class AIChatRequest(BaseModel):
    prompt: str
    scheme_id: Optional[int] = None
    language: Optional[str] = "English"

class AIChatResponse(BaseModel):
    response: str
    sources_used: List[str] = []
    is_grounded: bool = True
    schemes: Optional[List[SchemeData]] = []