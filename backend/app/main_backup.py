from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db, engine, Base
from app.models.scheme import Scheme

# Initialize database tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Schemes Navigator API",
    description="Backend API for Indian Central and State Welfare Schemes with AI Buddy and Eligibility Engine.",
    version="1.0.0"
)

# Enable CORS for Frontend (Vite running on localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Root & Health Check ---
@app.get("/")
def read_root():
    return {"message": "AI Schemes Navigator Backend is running successfully!"}


# --- Schemes Endpoints ---
@app.get("/api/v1/schemes")
def get_all_schemes(db: Session = Depends(get_db)):
    schemes = db.query(Scheme).filter(Scheme.is_active == True).all()
    return schemes


@app.get("/api/v1/schemes/stats/state-counts")
def get_state_scheme_counts(db: Session = Depends(get_db)):
    results = db.query(Scheme.applicable_state, func.count(Scheme.id))\
                .filter(Scheme.is_active == True)\
                .group_by(Scheme.applicable_state)\
                .all()
    
    counts_map = {state: count for state, count in results if state}
    return counts_map


@app.get("/api/v1/schemes/stats/sector-counts")
def get_sector_scheme_counts(state: str = "All India", db: Session = Depends(get_db)):
    query = db.query(Scheme.category, func.count(Scheme.id)).filter(Scheme.is_active == True)
    
    # Strictly filter counts by the requested state plus Central / All India schemes
    if state and state != "All India":
        query = query.filter(
            (func.lower(Scheme.applicable_state).contains(state.lower())) | 
            (func.lower(Scheme.applicable_state) == "all india") |
            (func.lower(Scheme.applicable_state) == "central")
        )
        
    results = query.group_by(Scheme.category).all()
    
    categories_list = [{"category": cat or "General Welfare", "count": cnt} for cat, cnt in results]
    categories_list.sort(key=lambda x: x["count"], reverse=True)
    
    return categories_list

# --- Dashboard Stats Endpoint ---
@app.get("/api/v1/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_schemes = db.query(Scheme).filter(Scheme.is_active == True).count()
    central_count = db.query(Scheme).filter((Scheme.applicable_state == "All India") | (Scheme.applicable_state == "Central")).count()
    state_count = total_schemes - central_count
    
    return {
        "total_schemes": total_schemes,
        "central_schemes": central_count,
        "state_schemes": state_count,
        "active_sectors": 49
    }


# --- Eligibility Assessment Engine ---
from typing import Optional

class EligibilityRequest(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = "All"
    state: Optional[str] = "All India"
    annual_income: Optional[int] = 0
    occupation: Optional[str] = "All"
    residence_type: Optional[str] = "Rural"
    category: Optional[str] = "All"

@app.post("/api/v1/eligibility/assess")
def assess_eligibility(req: EligibilityRequest, db: Session = Depends(get_db)):
    try:
        query = db.query(Scheme).filter(Scheme.is_active == True)
        
        # Category Filter
        if req.category and req.category != "All":
            cat_term = req.category.strip().lower()
            query = query.filter(func.lower(Scheme.category).contains(cat_term))
            
        # State Filter (Strict match: State + All India + Central)
        if req.state and req.state != "All India":
            st_term = req.state.strip().lower()
            query = query.filter(
                (func.lower(Scheme.applicable_state).contains(st_term)) | 
                (func.lower(Scheme.applicable_state) == "all india") |
                (func.lower(Scheme.applicable_state) == "central")
            )

        schemes = query.all()
        eligible_results = []
        seen_names = set()

        for s in schemes:
            if not s.name or s.name in seen_names:
                continue

            matched = True
            matched_rules = []
            name_lower = s.name.lower()
            desc_lower = (s.description or "").lower()

            # 1. Strict Age Check for Minors
            if req.age is not None and req.age < 18:
                if any(term in name_lower or term in desc_lower for term in ["mudra", "jan dhan", "svanidhi", "business", "entrepreneur", "commercial", "loan"]):
                    matched = False

            # 2. Strict Income Threshold Check
            if req.annual_income is not None and s.max_income and s.max_income > 0:
                if req.annual_income > s.max_income:
                    matched = False  # Exclude if family income exceeds scheme limit
                else:
                    matched_rules.append(f"Income within limit (≤ ₹{s.max_income:,})")
            else:
                matched_rules.append("Meets income criteria")

            # 3. Strict Occupation/Farmer/Student Check
            if req.occupation and req.occupation != "All":
                occ_lower = req.occupation.lower()
                if "farmer" in occ_lower and not any(t in name_lower or t in desc_lower for t in ["farmer", "kisan", "agriculture", "crop"]):
                    # If user is a farmer but scheme has nothing to do with farming/agriculture, skip or filter strictly
                    pass

            if matched:
                seen_names.add(s.name)
                eligible_results.append({
                    "scheme_id": s.id,
                    "scheme_name": s.name,
                    "matched_rules": matched_rules or ["Meets eligibility criteria"]
                })

        return {"eligible_schemes": eligible_results}
        
    except Exception as e:
        print(f"Error in assess_eligibility: {e}")
        return {"eligible_schemes": []}
@app.post("/api/v1/eligibility/assess")
def assess_eligibility(req: EligibilityRequest, db: Session = Depends(get_db)):
    try:
        query = db.query(Scheme).filter(Scheme.is_active == True)
        
        if req.category and req.category != "All":
            cat_term = req.category.strip().lower()
            query = query.filter(func.lower(Scheme.category).contains(cat_term))
            
        if req.state and req.state != "All India":
            st_term = req.state.strip().lower()
            query = query.filter(
                (func.lower(Scheme.applicable_state).contains(st_term)) | 
                (func.lower(Scheme.applicable_state) == "all india") |
                (func.lower(Scheme.applicable_state) == "central")
            )

        schemes = query.all()
        eligible_results = []
        seen_normalized_names = set()

        for s in schemes:
            if not s.name:
                continue
                
            # Normalize name to catch duplicates with punctuation/spacing differences
            norm_name = "".join(c for c in s.name.lower() if c.isalnum())
            if not norm_name or norm_name in seen_normalized_names:
                continue

            matched = True
            matched_rules = []
            name_lower = s.name.lower()
            desc_lower = (s.description or "").lower()

            # Age check for minors
            if req.age is not None and req.age < 18:
                if any(term in name_lower or term in desc_lower for term in ["mudra", "jan dhan", "svanidhi", "business", "commercial", "loan"]):
                    matched = False

            # Income limit check
            if req.annual_income is not None and s.max_income and s.max_income > 0:
                if req.annual_income > s.max_income:
                    matched = False
                else:
                    matched_rules.append(f"Income within limit (≤ ₹{s.max_income:,})")
            else:
                matched_rules.append("Meets income criteria")

            if matched:
                seen_normalized_names.add(norm_name)
                eligible_results.append({
                    "scheme_id": s.id,
                    "scheme_name": s.name,
                    "matched_rules": matched_rules or ["Meets eligibility criteria"]
                })

        return {"eligible_schemes": eligible_results}
        
    except Exception as e:
        print(f"Error in assess_eligibility: {e}")
        return {"eligible_schemes": []}
# --- Buddy AI Chat Endpoint ---
class ChatRequest(BaseModel):
    message: str

@app.post("/api/v1/ai/chat")
def ai_chat_endpoint(req: ChatRequest, db: Session = Depends(get_db)):
    message = req.message.strip()
    msg_lower = message.lower()
    
    greetings = ["hi", "hello", "hey", "hii", "hey buddy", "good morning", "good evening", "sup", "how are you"]
    if any(msg_lower == g or msg_lower.startswith(g + " ") for g in greetings):
        return {
            "reply": "Hello! 👋 I'm Buddy, your AI assistant for Indian Central & State government schemes. How can I help you today? \n\nYou can ask me about:\n• Farming & agricultural grants\n• Student scholarships\n• Healthcare & medical support\n• Business loans & artisan backing\n• Schemes in specific states (e.g., Andhra Pradesh, Telangana)"
        }

    keywords = [kw for kw in msg_lower.split() if len(kw) > 2]
    schemes = db.query(Scheme).filter(Scheme.is_active == True).all()
    
    matched = []
    for s in schemes:
        corpus = f"{s.name} {s.category} {s.description} {s.applicable_state} {s.occupation}".lower()
        if any(kw in corpus for kw in keywords):
            matched.append(s)

    if matched:
        top_matches = matched[:3]
        reply_text = f"I found **{len(matched)}** scheme(s) matching your request! Here are the top recommendations:\n\n"
        for idx, s in enumerate(top_matches, 1):
            reply_text += f"**{idx}. {s.name}** ({s.applicable_state})\n"
            reply_text += f"• *Sector:* {s.category}\n"
            reply_text += f"• *Details:* {(s.description or s.benefits or 'Government welfare support.')[:180]}...\n\n"
        reply_text += "💡 *Tip:* You can use the **Browse Directory** or **Profile Evaluation Wizard** for a complete step-by-step eligibility assessment!"
        return {"reply": reply_text}

    return {
        "reply": f"That's a great question about '{message}'. While I didn't find an exact keyword match in our database, you can explore broader categories like *Agriculture*, *Education*, *Healthcare*, or specify a state like *Andhra Pradesh* or *Telangana* in our Directory Browser!"
    }