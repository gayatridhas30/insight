import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    res = client.get('/health')
    assert res.status_code == 200
    assert res.json()['status'] == 'healthy'
    print('✔ AI Health Endpoint Verified')

def test_analyze_responses():
    payload = {
        "eventId": "test_evt_1",
        "organizationId": "test_org_1",
        "eventTitle": "Hackathon 2026",
        "eventCategory": "Hackathon",
        "responses": [
            {
                "eventId": "test_evt_1",
                "participantName": "Attendee 1",
                "textOriginal": "Great workshop, loved the speaker explanations!",
                "textTranslated": "Great workshop, loved the speaker explanations!",
                "rating": 5.0,
                "category": "Speaker & Delivery"
            },
            {
                "eventId": "test_evt_1",
                "participantName": "Attendee 2",
                "textOriginal": "The audio microphone in the auditorium was terrible and delayed the start.",
                "textTranslated": "The audio microphone in the auditorium was terrible and delayed the start.",
                "rating": 2.0,
                "category": "Audio & Visual"
            }
        ]
    }
    res = client.post('/api/ai/analyze-responses', json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data['totalResponsesAnalyzed'] == 2
    assert data['sentimentSummary']['positive'] >= 1
    assert data['sentimentSummary']['negative'] >= 1
    assert len(data['recurringIssues']) > 0
    assert len(data['recommendations']) > 0
    print('✔ AI Sentiment & Theme Analysis Verified')

def test_rag_query():
    payload = {
        "organizationId": "test_org_1",
        "query": "What were the biggest problems in my previous events?"
    }
    res = client.post('/api/ai/rag/query', json=payload)
    assert res.status_code == 200
    data = res.json()
    assert 'answer' in data
    assert len(data['supportingEvidence']) > 0
    print('✔ RAG Vector Retrieval & Evidence Synthesis Verified')

def test_generate_form():
    payload = {
        "title": "Machine Learning Bootcamp",
        "category": "Workshop",
        "description": "Intensive hands-on coding"
    }
    res = client.post('/api/ai/generate-form', json=payload)
    assert res.status_code == 200
    data = res.json()
    assert len(data['questions']) >= 3
    print('✔ AI Dynamic Form Generation Verified')

if __name__ == '__main__':
    test_health()
    test_analyze_responses()
    test_rag_query()
    test_generate_form()
    print('\n======================================')
    print('ALL AI SERVICE TESTS PASSED WITH 100%!')
    print('======================================')
