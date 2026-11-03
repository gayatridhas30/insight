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
    title="InsightLoop AI Feedback Intelligence & RAG Service",
    description="Multilingual Sentiment, Theme Extraction, Recurring Issues & Vector-assisted RAG Assistant",
    version="1.0.0"
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
        "service": "InsightLoop AI Engine",
        "status": "online",
        "version": "1.0.0",
        "capabilities": ["sentiment_analysis", "theme_clustering", "rag_assistant", "form_generator"]
    }

@app.get("/health")
def health():
    return {"status": "healthy", "service": "insightloop-ai"}

@app.post("/api/ai/analyze-responses", response_model=AnalysisResponse)
def analyze_responses(payload: AnalysisRequest):
    try:
        result = analyze_feedback_batch(
            event_id=payload.eventId,
            organization_id=payload.organizationId,
            event_title=payload.eventTitle or "Event",
            responses=payload.responses
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
                    "category": r.category or "General"
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
                "en": "How likely are you to recommend our future events to a peer or colleague?",
                "hi": "आप किसी सहकर्मी को हमारे भविष्य के कार्यक्रमों की सिफारिश करने की कितनी संभावना रखते हैं?",
                "mr": "आपण आपल्या मित्रांना किंवा सहकाऱ्यांना आमच्या भविष्यातील कार्यक्रमांची शिफारस करण्याची किती शक्यता आहे?"
            },
            "description": {
                "en": "0 (Not likely) to 10 (Extremely likely)",
                "hi": "0 (बिल्कुल नहीं) से 10 (अत्यधिक संभावना)",
                "mr": "0 (अजिबात नाही) ते 10 (नक्कीच)"
            },
            "options": []
        }
    ]

    # Category-specific questions
    if "hackathon" in cat or "coding" in cat or "tech" in cat:
        questions.extend([
            {
                "order": 3,
                "type": "single_choice",
                "category": "venue_logistics",
                "isRequired": True,
                "prompt": {
                    "en": "How was the network stability and power backup throughout the hackathon?",
                    "hi": "हैकथॉन के दौरान नेटवर्क स्थिरता और पावर बैकअप कैसा था?",
                    "mr": "हॅकाथॉन दरम्यान नेटवर्क स्थिरता आणि वीज बॅकअप कसा होता?"
                },
                "description": { "en": "Select one option", "hi": "एक विकल्प चुनें", "mr": "एक पर्याय निवडा" },
                "options": [
                    { "id": "opt_fast", "label": { "en": "Flawless & High Speed", "hi": "उत्कृष्ट और उच्च गति", "mr": "अतिशय वेगवान व सुरळीत" } },
                    { "id": "opt_ok", "label": { "en": "Decent with minor drops", "hi": "ठीक-ठाक, कभी-कभी रुकावट", "mr": "मध्यम, क्वचित अडचणी" } },
                    { "id": "opt_slow", "label": { "en": "Frequent disconnects", "hi": "लगातार डिस्कनेक्शन", "mr": "वारंवार डिस्कनेक्ट झाले" } }
                ]
            },
            {
                "order": 4,
                "type": "star_rating",
                "category": "speaker",
                "isRequired": False,
                "prompt": {
                    "en": "Rate the mentorship and technical judging quality.",
                    "hi": "मेंटरशिप और तकनीकी मूल्यांकन की गुणवत्ता को रेट करें।",
                    "mr": "मार्गदर्शन आणि तांत्रिक मूल्यमापनाचा दर्जा ठरवा."
                },
                "description": { "en": "1 to 5 stars", "hi": "1 से 5 स्टार", "mr": "1 ते 5 स्टार" },
                "options": []
            }
        ])
    elif "workshop" in cat or "webinar" in cat:
        questions.extend([
            {
                "order": 3,
                "type": "single_choice",
                "category": "content",
                "isRequired": True,
                "prompt": {
                    "en": "Was the pace of the hands-on session appropriate?",
                    "hi": "क्या अभ्यास सत्र की गति उपयुक्त थी?",
                    "mr": "प्रात्यक्षिक सत्राचा वेग योग्य होता का?"
                },
                "description": { "en": "Select pace", "hi": "गति चुनें", "mr": "वेग निवडा" },
                "options": [
                    { "id": "pace_fast", "label": { "en": "Too fast", "hi": "बहुत तेज", "mr": "खूप वेगवान" } },
                    { "id": "pace_just_right", "label": { "en": "Just right", "hi": "बिल्कुल सही", "mr": "अगदी योग्य" } },
                    { "id": "pace_slow", "label": { "en": "Too slow", "hi": "धीमा", "mr": "खूप संथ" } }
                ]
            },
            {
                "order": 4,
                "type": "yes_no",
                "category": "content",
                "isRequired": False,
                "prompt": {
                    "en": "Did the workshop materials & slides meet your learning expectations?",
                    "hi": "क्या कार्यशाला सामग्री और स्लाइड्स आपकी अपेक्षाओं पर खरी उतरीं?",
                    "mr": "कार्यशाळेचे साहित्य आणि सादरीकरण आपल्या अपेक्षा पूर्ण करणारे होते का?"
                },
                "description": { "en": "Yes or No", "hi": "हाँ या ना", "mr": "होय किंवा नाही" },
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
                    "en": "How would you rate the venue, seating, and audio/visual setup?",
                    "hi": "स्थान, बैठने की व्यवस्था और ऑडियो/वीडियो सेटअप को आप क्या रेटिंग देंगे?",
                    "mr": "ठिकाण, बैठक व्यवस्था आणि ध्वनी/प्रक्षेपण सेटअपला आपण काय रेटिंग द्याल?"
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
                "description": { "en": "Select all that apply", "hi": "लागू होने वाले सभी विकल्प चुनें", "mr": "लागू असलेले सर्व पर्याय निवडा" },
                "options": [
                    { "id": "opt_reg", "label": { "en": "Registration & Check-in", "hi": "पंजीकरण और चेक-इन", "mr": "नोंदणी आणि चेक-इन" } },
                    { "id": "opt_food", "label": { "en": "Refreshments & Water", "hi": "नाश्ता और पानी", "mr": "अल्पोपहार आणि पाणी" } },
                    { "id": "opt_av", "label": { "en": "Sound & Presentation Screen", "hi": "ध्वनि और स्क्रीन", "mr": "ध्वनी आणि पडदा" } },
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
            "en": "What did you enjoy most, or what could we improve for our next event?",
            "hi": "आपको सबसे ज्यादा क्या पसंद आया, या हम अगले कार्यक्रम में क्या सुधार कर सकते हैं?",
            "mr": "आपल्याला काय सर्वाधिक आवडले, किंवा पुढील कार्यक्रमासाठी आम्ही काय सुधारणा करू शकतो?"
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
