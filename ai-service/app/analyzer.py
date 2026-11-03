import re
from typing import List, Dict, Any
from .schemas import (
    FeedbackItem,
    AnalysisResponse,
    SentimentSummary,
    ThemeItem,
    RecurringIssue,
    PositiveHighlight,
    RecommendationItem,
)

# Common sentiment lexicon and topic keywords
POSITIVE_WORDS = {
    "great", "excellent", "amazing", "wonderful", "insightful", "helpful", "good",
    "awesome", "love", "loved", "liked", "clear", "engaging", "valuable", "friendly",
    "organized", "smooth", "informative", "best", "brilliant", "inspiring", "useful",
    "उत्कृष्ट", "छान", "सुंदर", "मस्त", "सराहनीय", "ज्ञानवर्धक", "सुव्यवस्थित"
}

NEGATIVE_WORDS = {
    "bad", "poor", "terrible", "horrible", "delay", "delayed", "late", "rushed",
    "noisy", "inaudible", "cold", "hot", "crowded", "confusing", "slow", "broken",
    "wifi", "ac", "food", "audio", "mic", "screen", "disconnect", "boring", "useless",
    "गोंधळ", "अस्वच्छ", "उशीर", "आवाज", "खराब", "कमी", "त्रास", "समस्या"
}

TOPIC_PATTERNS = {
    "Audio & Visual": [r"\baudio\b", r"\bmic\b", r"\bmicrophone\b", r"\bsound\b", r"\bscreen\b", r"\bprojector\b", r"\bvolume\b", r"\binaudible\b", r"\bआवाज\b", r"\bध्वनी\b"],
    "Venue & Logistics": [r"\bvenue\b", r"\bac\b", r"\bhall\b", r"\broom\b", r"\bseating\b", r"\bchairs\b", r"\btemperature\b", r"\bcrowd\b", r"\bparking\b", r"\bहॉल\b", r"\bबैठक\b"],
    "Food & Refreshments": [r"\bfood\b", r"\bsnack\b", r"\blunch\b", r"\btea\b", r"\bcoffee\b", r"\bwater\b", r"\brefreshment\b", r"\bजेवण\b", r"\bनाश्ता\b", r"\bचहा\b"],
    "Content & Materials": [r"\bcontent\b", r"\bslides\b", r"\bmaterials\b", r"\bexamples\b", r"\bhands-on\b", r"\bpractical\b", r"\bcode\b", r"\bdeep\b", r"\bअभ्यासक्रम\b"],
    "Speaker & Delivery": [r"\bspeaker\b", r"\bpresenter\b", r"\bexplanation\b", r"\bpace\b", r"\bclarity\b", r"\bengaging\b", r"\bknowledge\b", r"\bवक्ता\b"],
    "Time & Schedule": [r"\btime\b", r"\bdelay\b", r"\blate\b", r"\brushed\b", r"\bschedule\b", r"\bbreak\b", r"\bduration\b", r"\bउशीर\b", r"\bवेळ\b"],
    "WiFi & Connectivity": [r"\bwifi\b", r"\binternet\b", r"\bnetwork\b", r"\bconnection\b", r"\bsignal\b", r"\bवायफाय\b"]
}

def calculate_text_sentiment(text: str, rating: float = None) -> float:
    """Calculate sentiment score from -1.0 to 1.0 combining text analysis and optional rating."""
    tokens = re.findall(r"\w+", text.lower())
    pos_count = sum(1 for w in tokens if w in POSITIVE_WORDS)
    neg_count = sum(1 for w in tokens if w in NEGATIVE_WORDS)
    
    word_diff = pos_count - neg_count
    if pos_count + neg_count > 0:
        text_score = word_diff / (pos_count + neg_count)
    else:
        text_score = 0.0

    if rating is not None:
        # Scale 1-5 rating to -1.0 to +1.0
        rating_score = (rating - 3.0) / 2.0
        # Weighted blend: 60% rating, 40% text
        return round(0.6 * rating_score + 0.4 * text_score, 2)
    
    return round(text_score, 2)

def analyze_feedback_batch(
    event_id: str,
    organization_id: str,
    event_title: str,
    responses: List[FeedbackItem]
) -> AnalysisResponse:
    total = len(responses)
    if total == 0:
        return AnalysisResponse(
            eventId=event_id,
            organizationId=organization_id,
            totalResponsesAnalyzed=0,
            sentimentSummary=SentimentSummary(),
            themes=[],
            recurringIssues=[],
            positiveHighlights=[],
            recommendations=[]
        )

    pos_count = 0
    neu_count = 0
    neg_count = 0
    scores = []

    topic_feedbacks: Dict[str, List[Dict[str, Any]]] = {topic: [] for topic in TOPIC_PATTERNS}

    for item in responses:
        combined_text = f"{item.textOriginal or ''} {item.textTranslated or ''}".strip()
        score = calculate_text_sentiment(combined_text, item.rating)
        scores.append(score)

        if score > 0.15:
            pos_count += 1
            sentiment_tag = "positive"
        elif score < -0.15:
            neg_count += 1
            sentiment_tag = "negative"
        else:
            neu_count += 1
            sentiment_tag = "neutral"

        # Categorize into topics
        matched_any = False
        for topic, patterns in TOPIC_PATTERNS.items():
            for pat in patterns:
                if re.search(pat, combined_text, re.IGNORECASE):
                    topic_feedbacks[topic].append({
                        "text": combined_text,
                        "score": score,
                        "sentiment": sentiment_tag,
                        "user": item.participantName
                    })
                    matched_any = True
                    break
        if not matched_any and combined_text:
            topic_feedbacks.setdefault("General", []).append({
                "text": combined_text,
                "score": score,
                "sentiment": sentiment_tag,
                "user": item.participantName
            })

    avg_score = round(sum(scores) / len(scores), 2) if scores else 0.0

    # Build themes
    themes: List[ThemeItem] = []
    recurring_issues: List[RecurringIssue] = []
    positive_highlights: List[PositiveHighlight] = []

    for topic, items in topic_feedbacks.items():
        if not items:
            continue
        topic_count = len(items)
        topic_scores = [x["score"] for x in items]
        t_avg = sum(topic_scores) / len(topic_scores)

        t_sentiment = "positive" if t_avg > 0.15 else "negative" if t_avg < -0.15 else "neutral"
        quotes = [x["text"] for x in items if len(x["text"]) > 10][:3]

        themes.append(ThemeItem(
            name=topic,
            sentiment=t_sentiment,
            responseCount=topic_count,
            representativeQuotes=quotes,
            keywords=[topic.lower()]
        ))

        # Recurring issues (negative themes or items)
        neg_items = [x for x in items if x["sentiment"] == "negative"]
        if neg_items:
            severity = "critical" if len(neg_items) >= 5 or t_avg < -0.5 else "high" if len(neg_items) >= 3 else "medium"
            recurring_issues.append(RecurringIssue(
                issue=f"Participants encountered repeated challenges with {topic.lower()}.",
                severity=severity,
                frequency=len(neg_items),
                category=topic,
                evidence=[x["text"] for x in neg_items[:3]]
            ))

        # Positive highlights
        pos_items = [x for x in items if x["sentiment"] == "positive"]
        if pos_items:
            positive_highlights.append(PositiveHighlight(
                highlight=f"High satisfaction reported regarding {topic.lower()}.",
                frequency=len(pos_items),
                category=topic,
                evidence=[x["text"] for x in pos_items[:3]]
            ))

    # Generate Actionable Recommendations
    recommendations: List[RecommendationItem] = []
    for issue in recurring_issues:
        rec_title = f"Resolve {issue.category} constraints"
        rec_action = f"Perform pre-event audit and dedicated checkpoint for {issue.category.lower()}."
        
        if issue.category == "Audio & Visual":
            rec_action = "Conduct sound-check 45 mins prior to kickoff; provide handheld backup mics and check projector resolution."
        elif issue.category == "Venue & Logistics":
            rec_action = "Optimize room temperature 30 mins before audience arrives and adjust seat arrangement for smoother aisle transit."
        elif issue.category == "Food & Refreshments":
            rec_action = "Add separate dietary and beverage counters to prevent queue bottlenecks during intermission."
        elif issue.category == "WiFi & Connectivity":
            rec_action = "Provision dedicated SSID with bandwidth QoS allocation reserved specifically for hands-on sessions."
        elif issue.category == "Time & Schedule":
            rec_action = "Introduce strict 10-minute warning cards for speakers and buffer 15-minute intervals between consecutive sessions."

        recommendations.append(RecommendationItem(
            title=rec_title,
            description=f"Identified across {issue.frequency} participant complaints. {issue.issue}",
            category=issue.category,
            priority="urgent" if issue.severity == "critical" else "high" if issue.severity == "high" else "medium",
            impact=f"Projected to boost overall participant NPS and satisfaction by 15-25%.",
            suggestedAction=rec_action,
            supportingEvidence=issue.evidence
        ))

    # If no negative issues, recommend scaling positives
    if not recommendations and positive_highlights:
        recommendations.append(RecommendationItem(
            title="Consolidate and standardize event excellence playbooks",
            description="Participant feedback was overwhelmingly positive across key aspects.",
            category="Best Practices",
            priority="medium",
            impact="Ensure consistent 5-star experience across future organizational sessions.",
            suggestedAction="Document speaker preparation steps and venue layout checklist as organizational templates.",
            supportingEvidence=[h.highlight for h in positive_highlights[:2]]
        ))

    return AnalysisResponse(
        eventId=event_id,
        organizationId=organization_id,
        totalResponsesAnalyzed=total,
        sentimentSummary=SentimentSummary(
            positive=pos_count,
            neutral=neu_count,
            negative=neg_count,
            averageScore=avg_score
        ),
        themes=themes,
        recurringIssues=recurring_issues,
        positiveHighlights=positive_highlights,
        recommendations=recommendations
    )
