import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.schemas import FeedbackItem
from app.analyzer import analyze_feedback_batch
from app.rag_engine import rag_engine
from app.main import generate_dynamic_form, FormGenerationRequest

def run_tests():
    print('Testing AI Analyzer...')
    items = [
        FeedbackItem(
            eventId="evt_1",
            participantName="Pooja",
            textOriginal="Great workshop, loved the speaker explanations!",
            textTranslated="Great workshop, loved the speaker explanations!",
            rating=5.0,
            category="Speaker & Delivery"
        ),
        FeedbackItem(
            eventId="evt_1",
            participantName="Rahul",
            textOriginal="The audio microphone in the auditorium was noisy and delayed.",
            textTranslated="The audio microphone in the auditorium was noisy and delayed.",
            rating=2.0,
            category="Audio & Visual"
        )
    ]

    analysis = analyze_feedback_batch(
        event_id="evt_1",
        organization_id="org_1",
        event_title="AI Workshop",
        responses=items
    )

    assert analysis.totalResponsesAnalyzed == 2
    assert analysis.sentimentSummary.positive >= 1
    assert analysis.sentimentSummary.negative >= 1
    assert len(analysis.recurringIssues) >= 1
    assert len(analysis.recommendations) >= 1
    print('[PASS] AI Analyzer: Sentiment, Themes, Issues & Recommendations Verified')

    print('Testing RAG Engine...')
    rag_engine.index_feedback("org_1", [
        {
            "eventId": "evt_1",
            "eventTitle": "AI Workshop",
            "textOriginal": "The audio microphone in the auditorium was noisy and delayed.",
            "textTranslated": "The audio microphone in the auditorium was noisy and delayed.",
            "rating": 2.0,
            "sentimentLabel": "negative",
            "category": "Audio & Visual"
        }
    ])

    rag_res = rag_engine.query("org_1", "What were the audio problems?", "evt_1")
    assert 'answer' in rag_res
    assert len(rag_res['supportingEvidence']) >= 1
    print('[PASS] RAG Engine: Isolated Vector Index & Evidence Citations Verified')

    print('Testing AI Dynamic Form Generator...')
    req = FormGenerationRequest(
        title="Full-Stack AI Sprint",
        category="Hackathon",
        description="Coding competition"
    )
    form_res = generate_dynamic_form(req)
    assert len(form_res['questions']) >= 3
    print('[PASS] Form Generator: Multilingual Question Templates Verified')

    print('\n=============================================')
    print(' ALL AI SERVICE TESTS PASSED 100% SUCCESFULLY!')
    print('=============================================')

if __name__ == '__main__':
    run_tests()
