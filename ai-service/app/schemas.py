from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class FeedbackItem(BaseModel):
    id: Optional[str] = None
    eventId: str
    organizationId: Optional[str] = None
    participantName: Optional[str] = "Anonymous"
    submissionLanguage: Optional[str] = "en"
    textOriginal: Optional[str] = ""
    textTranslated: Optional[str] = ""
    rating: Optional[float] = None
    category: Optional[str] = "General"
    timestamp: Optional[str] = None

class AnalysisRequest(BaseModel):
    eventId: str
    organizationId: str
    eventTitle: Optional[str] = ""
    eventCategory: Optional[str] = ""
    responses: List[FeedbackItem]

class SentimentSummary(BaseModel):
    positive: int = 0
    neutral: int = 0
    negative: int = 0
    averageScore: float = 0.0

class ThemeItem(BaseModel):
    name: str
    sentiment: str
    responseCount: int
    representativeQuotes: List[str] = []
    keywords: List[str] = []

class RecurringIssue(BaseModel):
    issue: str
    severity: str
    frequency: int
    category: str
    evidence: List[str] = []

class PositiveHighlight(BaseModel):
    highlight: str
    frequency: int
    category: str
    evidence: List[str] = []

class RecommendationItem(BaseModel):
    title: str
    description: str
    category: str
    priority: str
    impact: str
    suggestedAction: str
    supportingEvidence: List[str] = []

class AnalysisResponse(BaseModel):
    eventId: str
    organizationId: str
    totalResponsesAnalyzed: int
    sentimentSummary: SentimentSummary
    themes: List[ThemeItem]
    recurringIssues: List[RecurringIssue]
    positiveHighlights: List[PositiveHighlight]
    recommendations: List[RecommendationItem]

class RAGQueryRequest(BaseModel):
    organizationId: str
    eventId: Optional[str] = None
    query: str
    historyLimit: Optional[int] = 50

class RAGQueryResponse(BaseModel):
    query: str
    answer: str
    supportingEvidence: List[str] = []
    confidence: float = 0.95
    sourcesCount: int = 0

class FormGenerationRequest(BaseModel):
    title: str
    category: str
    description: Optional[str] = ""
    targetAudience: Optional[str] = "Students and professionals"
    languages: Optional[List[str]] = ["en", "hi", "mr"]
