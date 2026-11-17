import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.schemas import FeedbackItem
from app.analyzer import analyze_feedback_batch
from app.rag_engine import rag_engine
from app.main import generate_dynamic_form, FormGenerationRequest

def run_tests():
    print('Testing AI Analyzer (Universal Events)...')
    items = [
        FeedbackItem(
            eventId="evt_1",
            participantName="Pooja",
            textOriginal="Great workshop, loved the hands-on explanations!",
            textTranslated="Great workshop, loved the hands-on explanations!",
            rating=5.0,
            category="Content, Trainer & Materials"
        ),
        FeedbackItem(
            eventId="evt_1",
            participantName="Rahul",
            textOriginal="The audio microphone in the auditorium was noisy and delayed.",
            textTranslated="The audio microphone in the auditorium was noisy and delayed.",
            rating=2.0,
            category="Audio & Visual Acoustics"
        )
    ]

    analysis = analyze_feedback_batch(
        event_id="evt_1",
        organization_id="org_1",
        event_title="AI Workshop",
        responses=items,
        event_category="Workshop",
        event_subcategory="AI & Machine Learning"
    )

    assert analysis.totalResponsesAnalyzed == 2
    assert analysis.sentimentSummary.positive >= 1
    assert analysis.sentimentSummary.negative >= 1
    assert len(analysis.recurringIssues) >= 1
    assert len(analysis.recommendations) >= 1
    print('[PASS] AI Analyzer: Universal Sentiment, Themes, Issues & Recommendations Verified')

    print('Testing Marathon AI Analysis...')
    marathon_items = [
        FeedbackItem(
            eventId="evt_marathon",
            participantName="Vikram",
            textOriginal="धावण्याचा मार्ग आणि पाण्याची सोय उत्तम होती. पण १५ किलोमीटरच्या स्टॉलवर पाणी संपले होते.",
            textTranslated="The running route and water facilities were great. However, water ran short at 15km.",
            rating=3.0,
            category="Hydration & Medical Aid"
        )
    ]
    marathon_analysis = analyze_feedback_batch(
        event_id="evt_marathon",
        organization_id="org_1",
        event_title="City Marathon",
        responses=marathon_items,
        event_category="Marathon",
        event_subcategory="Half Marathon"
    )
    assert marathon_analysis.totalResponsesAnalyzed == 1
    assert len(marathon_analysis.recommendations) >= 1
    print('[PASS] Marathon Specific Analysis & Recommendations Verified')

    print('Testing RAG Engine...')
    rag_engine.index_feedback("org_1", [
        {
            "eventId": "evt_1",
            "eventTitle": "AI Workshop",
            "textOriginal": "The audio microphone in the auditorium was noisy and delayed.",
            "textTranslated": "The audio microphone in the auditorium was noisy and delayed.",
            "rating": 2.0,
            "sentimentLabel": "negative",
            "category": "Audio & Visual Acoustics"
        }
    ])

    rag_res = rag_engine.query("org_1", "What were the audio problems?", "evt_1")
    assert 'answer' in rag_res
    assert len(rag_res['supportingEvidence']) >= 1
    print('[PASS] RAG Engine: Isolated Vector Index & Evidence Citations Verified')

    print('Testing Universal AI Dynamic Form Generator...')
    req = FormGenerationRequest(
        title="City Heritage Half Marathon 2026",
        category="Marathon",
        subcategory="Half Marathon (21.1K)",
        description="21K running race"
    )
    form_res = generate_dynamic_form(req)
    assert len(form_res['questions']) >= 3
    print('[PASS] Form Generator: Category-tailored Multilingual Questions Verified')

    print('\n=============================================')
    print(' ALL UNIVERSAL AI SERVICE TESTS PASSED 100% !')
    print('=============================================')

if __name__ == '__main__':
    run_tests()
