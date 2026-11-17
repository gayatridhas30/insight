import os
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .schemas import (
    AnalysisRequest,
    AnalysisResponse,
    RAGQueryRequest,
    RAGQueryResponse,
    FormGenerationRequest,
    FeedbackItem
)
from .analyzer import analyze_feedback_batch
from .rag_engine import rag_engine

load_dotenv()

app = FastAPI(
    title="InsightLoop Universal AI Feedback Intelligence & RAG Service",
    description="Multilingual Sentiment, Theme Extraction, Recurring Issues & Vector-assisted RAG Assistant for Universal Events",
    version="2.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "service": "InsightLoop Universal AI Engine",
        "status": "online",
        "version": "2.0.0",
        "supportedCategories": [
            "Marathon", "Sports", "Concert", "Conference",
            "Workshop", "Cultural", "Corporate", "Charity", "Community", "College"
        ],
        "capabilities": ["multilingual_sentiment", "universal_themes", "category_recommendations", "rag_assistant", "form_generator"]
    }

@app.get("/health")
def health():
    return {"status": "healthy", "service": "insightloop-ai", "version": "2.0.0"}

@app.post("/api/ai/analyze-responses", response_model=AnalysisResponse)
def analyze_responses(payload: AnalysisRequest):
    try:
        result = analyze_feedback_batch(
            event_id=payload.eventId,
            organization_id=payload.organizationId,
            event_title=payload.eventTitle or "Event",
            responses=payload.responses,
            event_category=payload.eventCategory or "Workshop",
            event_subcategory=payload.eventSubcategory or ""
        )
        # Also index into RAG engine for immediate natural-language retrieval
        if payload.responses:
            indexed_docs = [
                {
                    "eventId": r.eventId,
                    "eventTitle": payload.eventTitle or "Event",
                    "textOriginal": r.textOriginal,
                    "textTranslated": r.textTranslated,
                    "rating": r.rating,
                    "sentimentLabel": "positive" if (r.rating and r.rating >= 4) else "negative" if (r.rating and r.rating <= 2) else "neutral",
                    "category": r.category or payload.eventCategory or "General"
                }
                for r in payload.responses
            ]
            rag_engine.index_feedback(payload.organizationId, indexed_docs)

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Analysis Failed: {str(e)}")

@app.post("/api/ai/rag/index")
def index_rag_docs(organization_id: str, docs: List[Dict[str, Any]]):
    try:
        rag_engine.index_feedback(organization_id, docs)
        return {"status": "success", "indexedCount": len(docs)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Indexing Failed: {str(e)}")

@app.post("/api/ai/rag/query", response_model=RAGQueryResponse)
def rag_query(payload: RAGQueryRequest):
    try:
        res = rag_engine.query(
            organization_id=payload.organizationId,
            query_text=payload.query,
            event_id=payload.eventId,
            top_k=5
        )
        return RAGQueryResponse(**res)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG Retrieval Failed: {str(e)}")

@app.post("/api/ai/generate-form")
def generate_dynamic_form(payload: FormGenerationRequest):
    """Generate contextual feedback questions based on event category and title."""
    title = payload.title
    cat = (payload.category or "").lower()
    subcat = (payload.subcategory or "").lower()

    questions = [
        {
            "order": 1,
            "type": "star_rating",
            "category": "overall",
            "isRequired": True,
            "prompt": {
                "en": f"How would you rate your overall experience at {title}?",
                "hi": f"{title} में आपका समग्र अनुभव कैसा रहा?",
                "mr": f"{title} मधील आपला एकंदर अनुभव कसा होता?"
            },
            "description": {
                "en": "Select from 1 to 5 stars",
                "hi": "1 से 5 स्टार का चयन करें",
                "mr": "1 ते 5 स्टार निवडा"
            },
            "options": []
        },
        {
            "order": 2,
            "type": "nps",
            "category": "overall",
            "isRequired": True,
            "prompt": {
                "en": "How likely are you to recommend our future events to peers or friends?",
                "hi": "आप किसी मित्र को हमारे भविष्य के कार्यक्रमों की सिफारिश करने की कितनी संभावना रखते हैं?",
                "mr": "आपण मित्रांना आमच्या पुढील कार्यक्रमांची शिफारस करण्याची किती शक्यता आहे?"
            },
            "description": {
                "en": "0 (Not likely) to 10 (Extremely likely)",
                "hi": "0 से 10",
                "mr": "0 ते 10"
            },
            "options": []
        }
    ]

    # Category and subcategory tailored questions
    if "marathon" in cat or "run" in cat:
        questions.extend([
            {
                "order": 3,
                "type": "single_choice",
                "category": "venue_logistics",
                "isRequired": True,
                "prompt": {
                    "en": "How was the hydration and medical aid along the course?",
                    "hi": "मार्ग पर हाइड्रेशन (पानी/इलेक्ट्रोलाइट) और चिकित्सा सहायता कैसी थी?",
                    "mr": "मार्गावरील पाणी/इलेक्ट्रोलाइट्स आणि वैद्यकीय मदत कशी होती?"
                },
                "description": { "en": "Select one option", "hi": "एक विकल्प चुनें", "mr": "एक पर्याय निवडा" },
                "options": [
                    { "id": "opt_abundant", "label": { "en": "Abundant and well supplied", "hi": "पर्याप्त और भरपूर", "mr": "मुबलक आणि वेळेवर" } },
                    { "id": "opt_moderate", "label": { "en": "Sufficient but crowded", "hi": "ठीक-ठाक, लेकिन भीड़भाड़", "mr: ": "पुरेशी पण गर्दी होती" } },
                    { "id": "opt_short", "label": { "en": "Ran out at later aid stations", "hi": "बाद के स्टॉलों पर कमी थी", "mr": "पुढील स्टॉल्सवर कमतरता होती" } }
                ]
            },
            {
                "order": 4,
                "type": "star_rating",
                "category": "organization",
                "isRequired": True,
                "prompt": {
                    "en": "Rate the route marking, traffic control, and finish line management.",
                    "hi": "दौड़ मार्ग के चिह्नांकन, ट्रैफिक नियंत्रण और फिनिश लाइन व्यवस्था को रेट करें।",
                    "mr": "मार्गाचे दिशा-दर्शन, वाहतूक नियंत्रण आणि फिनिश लाईन व्यवस्थेचे मूल्यांकन करा."
                },
                "description": { "en": "1 to 5 stars", "hi": "1 से 5 स्टार", "mr": "1 ते 5 स्टार" },
                "options": []
            }
        ])
    elif "concert" in cat or "music" in cat:
        questions.extend([
            {
                "order": 3,
                "type": "star_rating",
                "category": "venue_logistics",
                "isRequired": True,
                "prompt": {
                    "en": "How was the acoustic clarity, bass balance, and lighting visuals?",
                    "hi": "ध्वनि की गुणवत्ता (साउंड), बास और स्टेज लाइटिंग शो कैसा था?",
                    "mr": "ध्वनीचा दर्जा (साउंड), बास आणि स्टेज लाईट शो कसा होता?"
                },
                "description": { "en": "1 to 5 stars", "hi": "1 से 5 स्टार", "mr": "1 ते 5 स्टार" },
                "options": []
            },
            {
                "order": 4,
                "type": "single_choice",
                "category": "venue_logistics",
                "isRequired": True,
                "prompt": {
                    "en": "How was the entry gate queue speed and crowd management?",
                    "hi": "प्रवेश द्वार कतार की गति और भीड़ नियंत्रण कैसा था?",
                    "mr": "प्रवेशद्वारावरील रांगेचा वेग आणि गर्दी नियंत्रण कसे होते?"
                },
                "description": { "en": "Select experience", "hi": "अनुभव चुनें", "mr": "अनुभव निवडा" },
                "options": [
                    { "id": "opt_smooth", "label": { "en": "Smooth & fast entry (< 10 mins)", "hi": "सहज और त्वरित प्रवेश", "mr": "सुरळीत आणि जलद प्रवेश" } },
                    { "id": "opt_moderate", "label": { "en": "Moderate wait (15-25 mins)", "hi": "मध्यम प्रतीक्षा", "mr": "मध्यम प्रतीक्षा" } },
                    { "id": "opt_bottleneck", "label": { "en": "Severe bottleneck (> 30 mins)", "hi": "अत्यधिक भीड़ और देरी", "mr": "खूप जास्त गर्दी व विलंब" } }
                ]
            }
        ])
    elif "sports" in cat:
        questions.extend([
            {
                "order": 3,
                "type": "star_rating",
                "category": "venue_logistics",
                "isRequired": True,
                "prompt": {
                    "en": "How would you rate the playing turf, court condition, and lighting?",
                    "hi": "मैदान/पिच/कोर्ट की स्थिति और लाइटिंग को आप क्या रेटिंग देंगे?",
                    "mr": "मैदान/पिच/कोर्टची गुणवत्ता आणि प्रकाशव्यवस्थेला आपण काय रेटिंग द्याल?"
                },
                "description": { "en": "1 to 5 stars", "hi": "1 से 5 स्टार", "mr": "1 ते 5 स्टार" },
                "options": []
            },
            {
                "order": 4,
                "type": "single_choice",
                "category": "organization",
                "isRequired": True,
                "prompt": {
                    "en": "How fair and professional was the refereeing / officiating?",
                    "hi": "अंपायरिंग और रेफरी का निर्णय कितना निष्पक्ष और पेशेवर था?",
                    "mr": "पंच आणि पंचांचे निर्णय किती निष्पक्ष व व्यावसायिक होते?"
                },
                "description": { "en": "Select fairness", "hi": "सटीकता चुनें", "mr": "अचूकता निवडा" },
                "options": [
                    { "id": "opt_fair", "label": { "en": "Impartial & Professional", "hi": "निष्पक्ष और पेशेवर", "mr": "निष्पक्ष आणि व्यावसायिक" } },
                    { "id": "opt_disputed", "label": { "en": "Acceptable with minor disputed calls", "hi": "स्वीकार्य, कुछ विवादास्पद निर्णय", "mr": "समाधानकारक, किरकोळ त्रुटी" } },
                    { "id": "opt_biased", "label": { "en": "Inconsistent calls made", "hi": "असंगत निर्णय", "mr": "विसंगत निर्णय" } }
                ]
            }
        ])
    elif "workshop" in cat:
        questions.extend([
            {
                "order": 3,
                "type": "single_choice",
                "category": "content",
                "isRequired": True,
                "prompt": {
                    "en": "Was the balance between theoretical concepts and hands-on exercises appropriate?",
                    "hi": "क्या सैद्धांतिक ज्ञान और व्यावहारिक (हैंड्स-ऑन) अभ्यास का संतुलन उपयुक्त था?",
                    "mr": "सैद्धांतिक संकल्पना आणि प्रत्यक्ष प्रात्यक्षिके (हँड्स-ऑन) यांचा ताळमेळ योग्य होता का?"
                },
                "description": { "en": "Select pace & balance", "hi": "संतुलन चुनें", "mr": "तोल निवडा" },
                "options": [
                    { "id": "opt_balanced", "label": { "en": "Just right balance", "hi": "बिल्कुल सही संतुलन", "mr": "अतिशय योग्य ताळमेळ" } },
                    { "id": "opt_more_hands_on", "label": { "en": "Wanted more hands-on coding", "hi": "अधिक व्यावहारिक अभ्यास चाहिए था", "mr": "आणखी प्रात्यक्षिक सराव हवा होता" } },
                    { "id": "opt_too_fast", "label": { "en": "Pace was too fast", "hi": "गति बहुत तेज थी", "mr": "वेग खूप वेगवान होता" } }
                ]
            },
            {
                "order": 4,
                "type": "star_rating",
                "category": "speaker",
                "isRequired": True,
                "prompt": {
                    "en": "Rate the instructor clarity and responsiveness to audience queries.",
                    "hi": "प्रशिक्षक की स्पष्टता और सवालों के उत्तर देने की शैली को रेट करें।",
                    "mr": "प्रशिक्षकांची शिकवण्याची पद्धत आणि शंका निरसनाचे मूल्यांकन करा."
                },
                "description": { "en": "1 to 5 stars", "hi": "1 से 5 स्टार", "mr": "1 ते 5 स्टार" },
                "options": []
            }
        ])
    else:
        questions.extend([
            {
                "order": 3,
                "type": "star_rating",
                "category": "venue_logistics",
                "isRequired": False,
                "prompt": {
                    "en": "How would you rate the venue facilities, seating, and presentation screen?",
                    "hi": "स्थान, बैठने की व्यवस्था और स्क्रीन को आप क्या रेटिंग देंगे?",
                    "mr": "ठिकाण, बैठक व्यवस्था आणि पडद्याला आपण काय रेटिंग द्याल?"
                },
                "description": { "en": "1 to 5 stars", "hi": "1 से 5 स्टार", "mr": "1 ते 5 स्टार" },
                "options": []
            },
            {
                "order": 4,
                "type": "multi_choice",
                "category": "food",
                "isRequired": False,
                "prompt": {
                    "en": "Which arrangements were most satisfactory?",
                    "hi": "कौन सी व्यवस्थाएं सबसे संतोषजनक थीं?",
                    "mr": "कोणत्या व्यवस्था सर्वाधिक समाधानकारक होत्या?"
                },
                "description": { "en": "Select all that apply", "hi": "सभी लागू विकल्प चुनें", "mr": "लागू सर्व पर्याय निवडा" },
                "options": [
                    { "id": "opt_reg", "label": { "en": "Registration & Check-in", "hi": "पंजीकरण और चेक-इन", "mr": "नोंदणी आणि चेक-इन" } },
                    { "id": "opt_food", "label": { "en": "Refreshments & Water", "hi": "नाश्ता और पानी", "mr": "अल्पोपहार आणि पाणी" } },
                    { "id": "opt_staff", "label": { "en": "Volunteers & Support", "hi": "स्वयंसेवक सहायता", "mr": "स्वयंसेवक मदत" } }
                ]
            }
        ])

    # Text feedback questions for all
    questions.append({
        "order": len(questions) + 1,
        "type": "long_text",
        "category": "overall",
        "isRequired": False,
        "prompt": {
            "en": "What did you enjoy most, or what suggestions do you have for our next edition?",
            "hi": "आपको सबसे ज्यादा क्या पसंद आया, या अगले संस्करण के लिए आपके क्या सुझाव हैं?",
            "mr": "आपल्याला काय सर्वाधिक आवडले, किंवा पुढील आवृत्तीसाठी काय सुधारणा सुचवाल?"
        },
        "description": {
            "en": "Feel free to share in English, Hindi, or Marathi (Type or record voice)",
            "hi": "अंग्रेजी, हिंदी या मराठी में साझा करें (लिखें या आवाज रिकॉर्ड करें)",
            "mr": "इंग्रजी, हिंदी किंवा मराठीत लिहा किंवा आवाज रेकॉर्ड करा"
        },
        "options": []
    })

    return {
        "title": f"{title} Feedback Form",
        "description": f"Thank you for attending {title}. Please take 2 minutes to help us understand your experience.",
        "questions": questions
    }
