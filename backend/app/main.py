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
    schemes = db.query(Scheme).filter(
        Scheme.is_active.is_(True)
    ).all()

    return [
        {
            "id": s.id,
            "name": s.name,
            "short_name": s.short_name,
            "description": s.description,
            "category": s.category,
            "gov_type": s.gov_type,
            "applicable_state": s.applicable_state,
            "benefits": s.benefits,
            "official_url": s.official_url,
            "is_active": s.is_active,
            "verification_status": s.verification_status,
        }
        for s in schemes
    ]

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

    # Category-specific details
    land_ownership: Optional[str] = None
    farming_type: Optional[str] = None
@app.post("/api/v1/eligibility/assess")
def assess_eligibility(req: EligibilityRequest, db: Session = Depends(get_db)):
    try:
        query = db.query(Scheme).filter(Scheme.is_active == True)

        # 1. Category filter
        if req.category and req.category.strip().lower() != "all":
            category_term = req.category.strip().lower()
            query = query.filter(
                func.lower(Scheme.category).contains(category_term)
            )

        # 2. State filter: requested state + national schemes
        if req.state and req.state.strip().lower() not in {
            "all", "all india"
        }:
            state_term = req.state.strip().lower()
            query = query.filter(
                (func.lower(Scheme.applicable_state).contains(state_term))
                | (func.lower(Scheme.applicable_state) == "all india")
                | (func.lower(Scheme.applicable_state) == "central")
            )

        schemes = query.order_by(Scheme.id).all()
        results = []
        seen_names = set()

        def normalize(value):
            return " ".join((value or "").lower().strip().split())

        def is_unspecified(value):
            return normalize(value) in {
                "", "all", "all genders", "any", "any gender",
                "all india", "not specified", "na", "n/a", "none"
            }

        occupation = normalize(req.occupation)
        gender = normalize(req.gender)
        residence = normalize(req.residence_type)

        for s in schemes:
            name = (s.name or "").strip()
            if not name:
                continue

            # 3. Deduplicate names despite case/spacing differences
            name_key = normalize(name)
            if name_key in seen_names:
                continue

            description = normalize(s.description)
            category = normalize(s.category)
            scheme_occupation = normalize(s.occupation)
            scheme_gender = normalize(s.gender)
            scheme_residence = normalize(s.residence_type)

            searchable = " ".join([
                name, description, category,
                normalize(s.education_requirement),
                normalize(s.benefits)
            ]).lower()

            matched_rules = []
            # Filter schemes for retired users
            if occupation == "retired":
                relevant_terms = [
                    "old age pension",
                    "senior citizen",
                    "senior citizens",
                    "retirement pension",
                    "employees' pension",
                    "ntr bharosa",
                    "ayushman bharat",
                    "jan arogya",
                    "aarogyasri",
                    "medical assistance",
                    "health insurance",
                    "hospitalization",
                    "rural housing",
                    "awas yojana",
                    "monthly income scheme",
                    "saving scheme",
                ]

                if not any(term in searchable for term in relevant_terms):
                    continue

                unrelated_terms = [
                    "industrial fellowship",
                    "single girl child",
                    "manual scavenger",
                    "pravasi bharatiya",
                    "rural employment guarantee",
                    "ad arsh gram yojana",
                    "swachh bharat mission",
                    "niramaya",
                    "jiyo parsi",
                    "kera suraksha",
                    "research training fellowship",
                    "research fellowship",
                    "doctoral fellowship",
                    "post-doctoral fellowship",
                    "postdoctoral fellowship",
                    "faculty training",
                    "student scholarship",
                    "girl child scholarship",
                    "pregnant women",
                    "lactating mothers",
                    "health workers fighting covid",
                    "best district panchayat",
                    "best private sector organisation",
                    "best public sector organisation",
                    "best institution for research",
                    "best urban local body",
                ]

                if any(term in searchable for term in unrelated_terms):
                    continue
                if not any(
                    term in searchable
                    for term in relevant_terms
                ):
                    continue
            rejected = False

            # 4. Age: reject only when a recorded limit conflicts
            if req.age is not None:
                if s.min_age is not None and req.age < s.min_age:
                    rejected = True
                if s.max_age is not None and req.age > s.max_age:
                    rejected = True

                if not rejected and (
                    s.min_age is not None or s.max_age is not None
                ):
                    matched_rules.append("Recorded age limits satisfied")

            if rejected:
                continue

            # 5. Income: reject above a known limit.
            # Missing income limits are UNKNOWN, not a match.
            if req.annual_income is not None and s.max_income is not None:
                if s.max_income > 0:
                    if req.annual_income > s.max_income:
                        continue
                    matched_rules.append("Recorded income limit satisfied")

            # 6. Gender: apply only when the scheme specifies a restriction
            if (
                not is_unspecified(gender)
                and not is_unspecified(scheme_gender)
            ):
                if gender != scheme_gender:
                    # Allow common equivalent wording
                    gender_aliases = {
                        "male": {"male", "men", "man", "boys"},
                        "female": {"female", "women", "woman", "girls"}
                    }
                    user_group = gender_aliases.get(gender, {gender})
                    scheme_group = gender_aliases.get(
                        scheme_gender, {scheme_gender}
                    )
                    if not user_group.intersection(scheme_group):
                        continue
                matched_rules.append("Recorded gender requirement satisfied")

            # 7. Occupation: use explicit scheme occupation information
            if (
                not is_unspecified(occupation)
                and not is_unspecified(scheme_occupation)
            ):
                # Do not accept unrelated occupations when the scheme
                # explicitly names its target occupation.
                user_terms = set(occupation.replace("-", " ").split())
                scheme_terms = set(
                    scheme_occupation.replace("-", " ").split()
                )

                aliases = {
                    "retired": {"retired", "senior citizen", "pensioner"},
                    "farmer": {"farmer", "agriculture", "agricultural", "kisan"},
                    "student": {"student", "students"},
                    "self employed": {"self employed", "entrepreneur", "business"},
                    "unorganized worker": {
                        "unorganized worker", "unorganised worker",
                        "labour", "labor", "worker"
                    }
                }

                user_aliases = aliases.get(occupation, {occupation})
                scheme_text = " " + scheme_occupation + " "
                if not any(
                    term in scheme_text
                    for term in user_aliases
                ) and not (
                    user_terms.intersection(scheme_terms)
                ):
                    continue

                matched_rules.append("Recorded occupation requirement matched")

            # 8. Residence: enforce only when a specific value is recorded
            if not is_unspecified(residence) and not is_unspecified(scheme_residence):
                user_residence = residence.lower()
                target_residence = scheme_residence.lower()

                if user_residence == "rural" and target_residence == "urban":
                    continue

                if user_residence == "urban" and target_residence == "rural":
                    continue

            # Exclude Urban PMAY for users who selected Rural
            if (
                residence == "rural"
                and "pradhan mantri awas yojana - urban" in searchable
            ):
                continue
            if (
                not is_unspecified(residence)
                and not is_unspecified(scheme_residence)
            ):
                matched_rules.append("Recorded residence requirement matched")
            # 9. Agriculture-specific matching
            land_ownership = normalize(req.land_ownership)
            farming_type = normalize(req.farming_type)

            is_agriculture_scheme = (
                "agriculture" in category
                or "farmer" in searchable
                or "kisan" in searchable
                or "crop" in searchable
            )

            if is_agriculture_scheme:
                if land_ownership in {"yes", "no", "tenant farmer"}:
                    matched_rules.append(
                        f"Land/cultivation response recorded: {req.land_ownership}"
                    )

                if farming_type in {
                    "crop farming", "horticulture", "dairy farming", "other"
                }:
                    matched_rules.append(
                        f"Farming type response recorded: {req.farming_type}"
                    )
            # 9. Filter clearly unrelated schemes using their descriptions
            if is_unspecified(scheme_occupation):
                text_to_check = searchable

                unrelated_by_occupation = {
                    "retired": [
                        "scholarship",
                        "students",
                        "student fellowship",
                        "internship",
                        "faculty training",
                        "teacher training",
                        "doctoral fellowship",
                        "post-doctoral fellowship",
                        "postdoctoral fellowship",
                        "research fellowship",
                    ],
                    "student": [
                        "old age pension",
                        "senior citizen pension",
                        "retirement pension",
                    ],
                    "farmer": [
                        "student scholarship",
                        "faculty training",
                        "doctoral fellowship",
                        "post-doctoral fellowship",
                        "postdoctoral fellowship",
                    ],
                }

                blocked_terms = unrelated_by_occupation.get(
                    occupation, []
                )

                if any(term in text_to_check for term in blocked_terms):
                    continue

            # Also exclude clearly specialized schemes when their target
            # group conflicts with the supplied profile.
            if occupation == "retired":
                if any(term in searchable for term in [
                    "pregnant women",
                    "lactating mothers",
                    "maternity benefit",
                    "girl child scholarship",
                ]):
                    continue

            # 10. Do not invent a successful eligibility match.
            # If no recorded criterion was checked, flag it for verification.
            if not matched_rules:
                matched_rules.append(
                    "Eligibility conditions require official verification"
                )

            seen_names.add(name_key)
            results.append({
                "description": s.description,
                "benefits": s.benefits,
                "required_documents": s.required_documents,
                "application_process": s.application_process,
                "official_url": s.official_url,
                "source_url": s.source_url,
                "verification_status": s.verification_status,
                "scheme_id": s.id,
                "scheme_name": name,
                "matched_rules": matched_rules,
                "status": "needs_verification",
                "message": (
                    "Potential match only. Verify all scheme-specific "
                    "conditions with the official source."
                )
            })

        return {
            "eligible_schemes": results,
            "count": len(results)
        }

    except Exception as e:
        print(f"Error in assess_eligibility: {e}")
        raise HTTPException(
            status_code=500,
            detail="Eligibility assessment failed"
        )

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
@app.get("/api/v1/chat")
def chat_with_buddy(query: str, db: Session = Depends(get_db)):
    try:
        q_lower = query.strip().lower()
        
        # 1. Handle greetings
        greetings = ["hi", "hello", "hey", "hey bud", "hey buddy", "good morning", "good evening", "sup", "how are you"]
        if any(greet == q_lower or q_lower.startswith(greet + " ") for greet in greetings):
            return {
                "reply": "Hello! 👋 I'm Buddy, your Andhra Pradesh & Central welfare scheme assistant. Ask me about student scholarships, farmer grants, application links, or type any scheme name!"
            }

        # 2. Handle requests for "more" or pagination
        if q_lower in ["more", "show more", "next", "other schemes", "all schemes"]:
            schemes = db.query(Scheme).order_by(
                func.lower(Scheme.applicable_state).contains('andhra pradesh').desc()
            ).offset(3).limit(4).all()
            
            if not schemes:
                return {"reply": "You've viewed all available schemes in our Andhra Pradesh & Central database!"}
            
            reply_text = "Here are additional welfare schemes available for Andhra Pradesh residents:\n\n"
            for s in schemes:
                reply_text += f"• **{s.name}** ({s.applicable_state} - {s.gov_type})\n  {s.description}\n  *Benefits:* {s.benefits}\n  🔗 [Official Portal]({s.official_url})\n\n"
            return {"reply": reply_text.strip()}

        # 3. Map conversational terms to search keywords/categories
        search_term = q_lower
        if "student" in q_lower or "education" in q_lower or "scholarship" in q_lower:
            search_term = "education"
        elif "farmer" in q_lower or "agriculture" in q_lower or "crop" in q_lower:
            search_term = "agriculture"
        elif "health" in q_lower or "medical" in q_lower:
            search_term = "health"
        elif "pension" in q_lower or "senior" in q_lower:
            search_term = "pension"
        elif "driver" in q_lower or "vehicle" in q_lower or "transport" in q_lower or "auto" in q_lower or "taxi" in q_lower:
            search_term = "vahana"
        elif "apply" in q_lower or "link" in q_lower or "portal" in q_lower:
            search_term = "andhra"  # Default to showing top AP schemes with direct apply links
        elif "andhra" in q_lower or "ap" in q_lower:
            search_term = "andhra pradesh"

        # 4. Fetch matching schemes, prioritizing Andhra Pradesh state schemes first
        schemes = db.query(Scheme).filter(
            (func.lower(Scheme.name).contains(search_term)) |
            (func.lower(Scheme.category).contains(search_term)) |
            (func.lower(Scheme.description).contains(search_term)) |
            (func.lower(Scheme.applicable_state).contains(search_term)) |
            (func.lower(Scheme.name).contains(q_lower))
        ).order_by(
            func.lower(Scheme.applicable_state).contains('andhra pradesh').desc()
        ).limit(3).all()

        if not schemes:
            return {
                "reply": f"I couldn't find a direct match for '{query}'. Try asking about agriculture, education, application links, or check your eligibility instantly using our wizard on the home page!"
            }

        reply_text = f"Here are the top schemes matching your request with official application links:\n\n"
        for s in schemes:
            link_html = f'<a href="{s.official_url}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline; font-weight: 600;">🔗 Visit Official Portal</a>'
            reply_text += f"• **{s.name}** ({s.applicable_state} - {s.gov_type})\n  {s.description}\n  *Benefits:* {s.benefits}\n  📋 *How to Apply:* {s.application_process}\n  {link_html}\n\n"
        return {"reply": reply_text.strip()}
    except Exception as e:
        return {"reply": "Sorry, I encountered an error searching the schemes database."}

@app.get("/api/v1/analytics")
def get_analytics(db: Session = Depends(get_db)):
    try:
        total_schemes = db.query(Scheme).count()

        active_schemes = db.query(Scheme).filter(
            Scheme.is_active.is_(True)
        ).count()

        inactive_schemes = db.query(Scheme).filter(
            Scheme.is_active.is_(False)
        ).count()

        needs_verification = db.query(Scheme).filter(
            Scheme.verification_status == "Needs Verification"
        ).count()

        verified_schemes = db.query(Scheme).filter(
            Scheme.verification_status == "Verified"
        ).count()

        active_ap_schemes = db.query(Scheme).filter(
            Scheme.is_active.is_(True),
            Scheme.gov_type == "State",
            Scheme.applicable_state == "Andhra Pradesh"
        ).count()

        active_central_schemes = db.query(Scheme).filter(
            Scheme.is_active.is_(True),
            Scheme.gov_type == "Central",
            Scheme.applicable_state == "All India"
        ).count()

        categories_count = db.query(Scheme.category).filter(
            Scheme.is_active.is_(True)
        ).distinct().count()

        verification_percentage = round(
            verified_schemes / total_schemes * 100, 2
        ) if total_schemes else 0

        return {
            "total_schemes": total_schemes,
            "active_schemes": active_schemes,
            "inactive_schemes": inactive_schemes,
            "ap_schemes": active_ap_schemes,
            "central_schemes": active_central_schemes,
            "covered_sectors": categories_count,
            "verified_schemes": verified_schemes,
            "needs_verification": needs_verification,
            "verification_percentage": verification_percentage,
            "regional_coverage": "Andhra Pradesh & Central"
        }

    except Exception as e:
        return {"error": str(e)}
