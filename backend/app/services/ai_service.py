import os
import re
import google.generativeai as genai
from sqlalchemy.orm import Session
from sqlalchemy import or_, not_
from app.models.scheme import Scheme
from app.schemas.ai import AIChatResponse, SchemeData

class AIService:
    @staticmethod
    def generate_scheme_explanation(prompt: str, db: Session, scheme_id: int = None, language: str = "English") -> AIChatResponse:
        try:
            raw_prompt = (prompt or "").strip()
            
            # Sanitize punctuation
            clean_prompt = re.sub(r'[^\w\s]', ' ', raw_prompt.lower())
            clean_prompt = " ".join(clean_prompt.split())

            api_key = os.getenv("GEMINI_API_KEY")

            # Strip leading greetings
            for g in ["hi ", "hello ", "hey ", "namaste ", "namaskaram "]:
                if clean_prompt.startswith(g):
                    clean_prompt = clean_prompt[len(g):].strip()
                    break

            # Conversational Intent Classification
            identity_queries = ["who are you", "who r u", "what is your name", "whats your name", "what's your name", "tell me about yourself"]
            greeting_queries = ["hi", "hello", "hey", "namaste", "namaskaram", "good morning", "good afternoon", "good evening"]
            thanks_queries = ["thanks", "thank you", "thank u", "dhanyavadalu", "super", "awesome", "great"]
            capability_queries = ["what can you do", "help", "how can you help", "options", "features"]

            is_pure_greeting = clean_prompt in greeting_queries or len(clean_prompt) == 0
            is_identity = any(q in clean_prompt for q in identity_queries)
            is_thanks = any(q in clean_prompt for q in thanks_queries)
            is_capability = any(q in clean_prompt for q in capability_queries)

            if is_pure_greeting:
                reply = (
                    "Hello! 👋 I am **Buddy**, your intelligent guide for Indian Central & State government schemes. How can I help you today?"
                    if language == "English"
                    else "నమస్కారం! 👋 నేను **బడ్డీ (Buddy)**, మీ ప్రభుత్వ పథకాల సహాయకుడిని. మీకు ఎలా సహాయపడగలను?"
                )
                return AIChatResponse(response=reply, sources_used=[], is_grounded=True, schemes=[])

            if is_identity:
                reply = (
                    "I am **Buddy**! 🤖\n\nI am designed to guide you through verified Central and State government welfare schemes, check eligibility criteria, provide required document checklists, and share official application portal links."
                    if language == "English"
                    else "నేను **బడ్డీ (Buddy)**! 🤖\n\nకేంద్ర మరియు రాష్ట్ర ప్రభుత్వ పథకాల వివరాలు, అర్హతలు, కావలసిన పత్రాలు మరియు అధికారిక లింక్‌లను మీకు అందించడానికి నేను తయారు చేయబడ్డాను."
                )
                return AIChatResponse(response=reply, sources_used=[], is_grounded=True, schemes=[])

            if is_thanks:
                reply = "You're very welcome! 😊 Feel free to ask Buddy if you need details on any other schemes."
                return AIChatResponse(response=reply, sources_used=[], is_grounded=True, schemes=[])

            if is_capability:
                reply = (
                    "Here is how **Buddy** can assist you:\n\n"
                    "• **Find Schemes:** Search Central and State schemes for students, farmers, artisans, women, drivers, mechanics, or business owners.\n"
                    "• **Check Eligibility:** Evaluate age, income, gender, and state residence rules.\n"
                    "• **Document Checklists:** View required certificates and ID proofs.\n"
                    "• **Official Portals:** Get direct official government links to apply."
                )
                return AIChatResponse(response=reply, sources_used=[], is_grounded=True, schemes=[])

            # State Keyword Mapping
            all_state_names = [
                "Andhra Pradesh", "Telangana", "Karnataka", "Tamil Nadu", "Maharashtra", 
                "Kerala", "Uttar Pradesh", "West Bengal", "Assam", "Bihar", 
                "Madhya Pradesh", "Rajasthan", "Delhi", "Punjab", "Gujarat", "Odisha"
            ]

            state_keywords = {
                "andhra": "Andhra Pradesh", "ap": "Andhra Pradesh",
                "telangana": "Telangana", "ts": "Telangana",
                "karnataka": "Karnataka", "ka": "Karnataka",
                "tamil nadu": "Tamil Nadu", "tn": "Tamil Nadu",
                "maharashtra": "Maharashtra", "mh": "Maharashtra",
                "kerala": "Kerala", "kl": "Kerala",
                "uttar pradesh": "Uttar Pradesh", "up": "Uttar Pradesh",
                "west bengal": "West Bengal", "wb": "West Bengal",
                "assam": "Assam", "bihar": "Bihar", "madhya pradesh": "Madhya Pradesh",
                "mp": "Madhya Pradesh", "rajasthan": "Rajasthan", "rj": "Rajasthan",
                "delhi": "Delhi", "dl": "Delhi", "punjab": "Punjab", "pb": "Punjab",
                "gujarat": "Gujarat", "gj": "Gujarat", "odisha": "Odisha"
            }

            detected_state = None
            prompt_words = clean_prompt.split()
            for key, state_fullname in state_keywords.items():
                if key in prompt_words or clean_prompt.startswith(f"{key} ") or clean_prompt.endswith(f" {key}"):
                    detected_state = state_fullname
                    break

            # Specific Trade/Profession Dictionary
            trade_dictionary = {
                "mechanic": ["mechanic", "garage", "auto repair", "motor vehicle worker"],
                "mechanics": ["mechanic", "garage", "auto repair", "motor vehicle worker"],
                "driver": ["driver", "taxi", "cab", "auto driver", "vahana"],
                "drivers": ["driver", "taxi", "cab", "auto driver", "vahana"],
                "tailor": ["tailor", "stitching", "weaver"],
                "tailors": ["tailor", "stitching", "weaver"],
                "carpenter": ["carpenter", "woodworking", "vishwakarma"],
                "carpenters": ["carpenter", "woodworking", "vishwakarma"],
                "plumber": ["plumber", "sanitary worker"]
            }

            detected_trade = None
            for w in prompt_words:
                if w in trade_dictionary:
                    detected_trade = w
                    break

            # Database Query
            schemes = []
            if scheme_id:
                schemes = db.query(Scheme).filter(Scheme.id == scheme_id, Scheme.is_active == True).all()
            else:
                query = db.query(Scheme).filter(Scheme.is_active == True)

                if detected_state:
                    state_conditions = [
                        Scheme.applicable_state.ilike(f"%{detected_state}%"),
                        Scheme.applicable_state.ilike("All India"),
                        Scheme.applicable_state.ilike("Central")
                    ]
                    query = query.filter(or_(*state_conditions))

                    other_states = [s for s in all_state_names if s.lower() != detected_state.lower()]
                    for other_st in other_states:
                        query = query.filter(not_(Scheme.applicable_state.ilike(f"%{other_st}%")))

                if detected_trade:
                    target_keywords = trade_dictionary[detected_trade]
                    trade_conditions = []
                    for tk in target_keywords:
                        trade_conditions.append(Scheme.name.ilike(f"%{tk}%"))
                        trade_conditions.append(Scheme.occupation.ilike(f"%{tk}%"))
                        trade_conditions.append(Scheme.description.ilike(f"%{tk}%"))
                    
                    query = query.filter(or_(*trade_conditions))

                    if "mechanic" in detected_trade:
                        query = query.filter(not_(Scheme.category.ilike("%agriculture%")))
                        query = query.filter(not_(Scheme.name.ilike("%Agriculture%")))
                        query = query.filter(not_(Scheme.name.ilike("%In-Plant Training%")))
                        query = query.filter(not_(Scheme.name.ilike("%AICTE%")))
                        query = query.filter(not_(Scheme.name.ilike("%AMRUT%")))
                else:
                    stop_words = ["are", "there", "any", "schemes", "scheme", "for", "in", "the", "available", "show", "tell", "list", "give", "what", "which", "how", "can", "get", "with", "and", "about", "is"]
                    search_terms = [w for w in prompt_words if len(w) >= 3 and w not in stop_words and w not in state_keywords]

                    if search_terms:
                        term_conditions = []
                        for term in search_terms:
                            term_conditions.append(
                                or_(
                                    Scheme.name.ilike(f"%{term}%"),
                                    Scheme.category.ilike(f"%{term}%"),
                                    Scheme.description.ilike(f"%{term}%"),
                                    Scheme.benefits.ilike(f"%{term}%"),
                                    Scheme.occupation.ilike(f"%{term}%")
                                )
                            )
                        query = query.filter(or_(*term_conditions))

                schemes = query.limit(6).all()

            # Python Post-Filter for State Alignment
            if detected_state:
                valid_schemes = []
                for s in schemes:
                    st_val = (s.applicable_state or "").lower()
                    if detected_state.lower() in st_val or "all india" in st_val or "central" in st_val:
                        is_other_state = any(other.lower() in st_val for other in all_state_names if other.lower() != detected_state.lower())
                        if not is_other_state:
                            valid_schemes.append(s)
                schemes = valid_schemes

            # Clean Not Found Logic
            if not schemes:
                requested_topic = detected_trade or "your search"
                state_label = f" in **{detected_state}**" if detected_state else ""
                
                reply = (
                    f"No specific government schemes available for **{requested_topic}**{state_label}.\n\n"
                    f"Please try searching for other professions (e.g., *farmers*, *students*, *weavers*, *drivers*) or broader categories like *Education*, *Agriculture*, or *Healthcare*."
                )

                return AIChatResponse(
                    response=reply,
                    sources_used=[],
                    is_grounded=True,
                    schemes=[]
                )

            # Build SchemeData List
            sources = [s.name for s in schemes if s.name]
            schemes_list = [
                SchemeData(
                    id=s.id,
                    name=s.name,
                    applicable_state=s.applicable_state,
                    category=s.category,
                    description=s.description,
                    benefits=s.benefits,
                    required_documents=s.required_documents,
                    application_process=s.application_process,
                    official_url=s.official_url
                ) for s in schemes
            ]

            intro_text = f"Found **{len(schemes_list)}** matching government scheme(s). Click on any scheme name below to expand full details:"

            # Try Gemini API Generation
            if api_key and len(api_key.strip()) > 20 and "your_api_key" not in api_key.lower():
                try:
                    genai.configure(api_key=api_key)
                    model = genai.GenerativeModel('gemini-1.5-flash')

                    context_str = "\n".join([
                        f"Scheme: {s.name} | State: {s.applicable_state} | Category: {s.category} | Benefits: {s.benefits} | Docs: {s.required_documents} | Process: {s.application_process} | URL: {s.official_url}"
                        for s in schemes
                    ])

                    sys_prompt = f"""You are Buddy, the AI Government Schemes Assistant for India.
Respond in clear, natural {language} with a warm tone.
Intro sentence: Mention that you found {len(schemes_list)} matching scheme(s) and invite the user to inspect the interactive cards below.

Database Context:
{context_str}"""

                    response = model.generate_content(sys_prompt)
                    if response and response.text:
                        intro_text = response.text.strip()
                except Exception as api_err:
                    print(f"[AIService] Gemini API warning: {api_err}")

            return AIChatResponse(
                response=intro_text,
                sources_used=sources,
                is_grounded=True,
                schemes=schemes_list
            )

        except Exception as top_err:
            print(f"[AIService] Exception caught: {top_err}")
            return AIChatResponse(
                response="I am Buddy! Please search for a specific scheme name or topic like 'PM Kisan', 'Student scholarships', or 'Andhra Pradesh schemes'.",
                sources_used=[],
                is_grounded=True,
                schemes=[]
            )