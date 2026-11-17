import re
from typing import List, Dict, Any, Optional
from .schemas import (
    FeedbackItem,
    AnalysisResponse,
    SentimentSummary,
    ThemeItem,
    RecurringIssue,
    PositiveHighlight,
    RecommendationItem,
)

# Multilingual sentiment lexicon
POSITIVE_WORDS = {
    "great", "excellent", "amazing", "wonderful", "insightful", "helpful", "good",
    "awesome", "love", "loved", "liked", "clear", "engaging", "valuable", "friendly",
    "organized", "smooth", "informative", "best", "brilliant", "inspiring", "useful",
    "scenic", "accurate", "electrifying", "flawless", "fast", "top-notch", "unforgettable",
    "उत्कृष्ट", "छान", "सुंदर", "मस्त", "सराहनीय", "ज्ञानवर्धक", "सुव्यवस्थित",
    "अप्रतिम", "वाखाणण्याजोगा", "प्रेरणादायी", "शानदार", "बढ़िया", "अद्भुत"
}

NEGATIVE_WORDS = {
    "bad", "poor", "terrible", "horrible", "delay", "delayed", "late", "rushed",
    "noisy", "inaudible", "cold", "hot", "crowded", "confusing", "slow", "broken",
    "wifi", "ac", "food", "audio", "mic", "screen", "disconnect", "boring", "useless",
    "shortage", "chaotic", "exhausted", "bottleneck", "congested", "depleted",
    "गोंधळ", "अस्वच्छ", "उशीर", "आवाज", "खराब", "कमी", "त्रास", "समस्या",
    "अडचणी", "धक्काधक्की", "देरी", "गड़बड़", "तंगी", "कठिनाई"
}

TOPIC_PATTERNS = {
    "Route & Course Safety": [
        r"\broute\b", r"\bcourse\b", r"\btrack\b", r"\bmarking\b", r"\bbarricade\b",
        r"\btraffic\b", r"\brunners\b", r"\bkm\b", r"\bकिलोमीटर\b", r"\bमार्ग\b", r"\bदिशा\b"
    ],
    "Hydration & Medical Aid": [
        r"\bhydration\b", r"\bwater\b", r"\belectrolyte\b", r"\bfirst aid\b", r"\bmedical\b",
        r"\bambulance\b", r"\bcramps\b", r"\bdrinks\b", r"\bपानी\b", r"\bपाणी\b", r"\bप्रथमोपचार\b"
    ],
    "Timing & Finish Line": [
        r"\btiming\b", r"\bchip\b", r"\bbib\b", r"\bmedal\b", r"\bfinish line\b", r"\bsms\b",
        r"\bresults\b", r"\bमेडल\b", r"\bपदक\b", r"\bटायमिंग\b", r"\bफिनिश\b"
    ],
    "Audio & Visual Acoustics": [
        r"\baudio\b", r"\bmic\b", r"\bmicrophone\b", r"\bsound\b", r"\bscreen\b",
        r"\bprojector\b", r"\bvolume\b", r"\bbass\b", r"\bacoustics\b", r"\binaudible\b",
        r"\bआवाज\b", r"\bध्वनी\b", r"\bसाउंड\b"
    ],
    "Stage & Lighting Production": [
        r"\blighting\b", r"\blasers\b", r"\bstage\b", r"\bdecor\b", r"\bvisuals\b",
        r"\bambience\b", r"\bartist\b", r"\bband\b", r"\bperformance\b", r"\bकलाकार\b", r"\bलाईट\b"
    ],
    "Crowd Control & Security": [
        r"\bcrowd\b", r"\bqueue\b", r"\bentry\b", r"\bgate\b", r"\bbarricades\b",
        r"\bsecurity\b", r"\bwaiting\b", r"\bbottleneck\b", r"\bभीड़\b", r"\bगर्दी\b", r"\bरांग\b"
    ],
    "Pitch, Turf & Playing Equipment": [
        r"\bpitch\b", r"\bground\b", r"\bturf\b", r"\bcourt\b", r"\bnet\b", r"\bball\b",
        r"\bfloodlight\b", r"\bequipment\b", r"\bमैदान\b", r"\bटर्फ\b"
    ],
    "Officiating & Refereeing": [
        r"\breferee\b", r"\bumpire\b", r"\bofficiating\b", r"\bfair\b", r"\bpenalty\b",
        r"\bdecision\b", r"\brules\b", r"\bपंच\b", r"\bनियम\b"
    ],
    "Content, Trainer & Materials": [
        r"\bcontent\b", r"\bslides\b", r"\bmaterials\b", r"\bexamples\b", r"\bhands-on\b",
        r"\bpractical\b", r"\bcode\b", r"\bspeaker\b", r"\binstructor\b", r"\btrainer\b",
        r"\bmentorship\b", r"\bप्रशिक्षक\b", r"\bअभ्यासक्रम\b"
    ],
    "Food, Catering & Refreshments": [
        r"\bfood\b", r"\bsnack\b", r"\blunch\b", r"\bbreakfast\b", r"\btea\b", r"\bcoffee\b",
        r"\bmeal\b", r"\bcatering\b", r"\bजेवण\b", r"\bनाश्ता\b", r"\bअल्पोपहार\b"
    ],
    "Schedule & Schedule Adherence": [
        r"\btime\b", r"\bdelay\b", r"\blate\b", r"\brushed\b", r"\bschedule\b", r"\bbreak\b",
        r"\bduration\b", r"\bpunctual\b", r"\bउशीर\b", r"\bवेळ\b", r"\bदेरी\b"
    ],
    "WiFi & Technical Infrastructure": [
        r"\bwifi\b", r"\binternet\b", r"\bnetwork\b", r"\bconnection\b", r"\bsignal\b",
        r"\bpower\b", r"\bbackup\b", r"\bवायफाय\b", r"\bइंटरनेट\b"
    ]
}

def calculate_text_sentiment(text: str, rating: Optional[float] = None) -> float:
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
        rating_score = (rating - 3.0) / 2.0
        return round(0.6 * rating_score + 0.4 * text_score, 2)

    return round(text_score, 2)

def analyze_feedback_batch(
    event_id: str,
    organization_id: str,
    event_title: str,
    responses: List[FeedbackItem],
    event_category: str = "Workshop",
    event_subcategory: str = ""
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
            topic_feedbacks.setdefault("General Experience", []).append({
                "text": combined_text,
                "score": score,
                "sentiment": sentiment_tag,
                "user": item.participantName
            })

    avg_score = round(sum(scores) / len(scores), 2) if scores else 0.0

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

        neg_items = [x for x in items if x["sentiment"] == "negative"]
        if neg_items:
            severity = "critical" if len(neg_items) >= 4 or t_avg < -0.4 else "high" if len(neg_items) >= 2 else "medium"
            recurring_issues.append(RecurringIssue(
                issue=f"Participants encountered repeated friction regarding {topic.lower()}.",
                severity=severity,
                frequency=len(neg_items),
                category=topic,
                evidence=[x["text"] for x in neg_items[:3]]
            ))

        pos_items = [x for x in items if x["sentiment"] == "positive"]
        if pos_items:
            positive_highlights.append(PositiveHighlight(
                highlight=f"High satisfaction and positive sentiment reported for {topic.lower()}.",
                frequency=len(pos_items),
                category=topic,
                evidence=[x["text"] for x in pos_items[:3]]
            ))

    # Category and subcategory tailored actionable recommendations
    cat_lower = (event_category or "").lower()
    recommendations: List[RecommendationItem] = []

    for issue in recurring_issues:
        rec_title = f"Resolve {issue.category} constraints"
        rec_action = f"Perform pre-event audit and dedicated checkpoint for {issue.category.lower()}."
        priority = "urgent" if issue.severity == "critical" else "high" if issue.severity == "high" else "medium"

        if "Hydration" in issue.category or "water" in issue.category.lower():
            rec_title = "Buffer aid station hydration stock by 35%"
            rec_action = "Position dedicated supply vehicle with extra electrolyte bottles cycling between stations 4 through 8."
        elif "Crowd" in issue.category or "queue" in issue.category.lower():
            rec_title = "Double entry scanner lanes & introduce express bag-free entry"
            rec_action = "Deploy volunteer barcode scanners and separate fast-track lanes to eliminate entry queue bottlenecks."
        elif "Audio" in issue.category or "sound" in issue.category.lower():
            rec_title = "Calibrate speaker throw & maintain standby wireless microphones"
            rec_action = "Perform acoustic check from furthest seating tier 45 minutes prior to session start; keep fresh transmitter batteries ready."
        elif "Pitch" in issue.category or "turf" in issue.category.lower():
            rec_title = "Standardize pitch maintenance & line marking checks"
            rec_action = "Inspect turf and net tension 1 hour prior to fixture kickoff with match officials."
        elif "Schedule" in issue.category or "time" in issue.category.lower():
            rec_title = "Incorporate 20-minute operational buffer between consecutive sessions"
            rec_action = "Introduce visual warning cards for speakers/match clocks to prevent cascading schedule delays."
        elif "WiFi" in issue.category or "network" in issue.category.lower():
            rec_title = "Provision isolated high-priority SSID with bandwidth QoS"
            rec_action = "Reserve guaranteed 50Mbps per active lab zone with automatic failover."

        recommendations.append(RecommendationItem(
            title=rec_title,
            description=f"Identified across {issue.frequency} attendee complaints. {issue.issue}",
            category=issue.category,
            priority=priority,
            impact="Projected to boost overall participant NPS and satisfaction by 15-25%.",
            suggestedAction=rec_action,
            supportingEvidence=issue.evidence
        ))

    # If no negative issues, recommend category excellence playbooks
    if not recommendations:
        if "marathon" in cat_lower or "running" in cat_lower:
            recommendations.append(RecommendationItem(
                title="Consolidate marathon course & volunteer playbook",
                description="Runners commended route safety, kilometer markers, and timing chip accuracy.",
                category="Race Operations",
                priority="medium",
                impact="Ensure consistent 5-star race experience across next year's half and full marathon editions.",
                suggestedAction="Document water station spacing and volunteer marshal positions as an organizational blueprint.",
                supportingEvidence=[h.highlight for h in positive_highlights[:2]]
            ))
        elif "concert" in cat_lower or "music" in cat_lower:
            recommendations.append(RecommendationItem(
                title="Standardize arena acoustic balance and artist production rider",
                description="Audiences praised audio clarity, bass resonance, and synchronized lighting.",
                category="Production & Acoustics",
                priority="medium",
                impact="Maintains pristine festival brand reputation and accelerates future artist bookings.",
                suggestedAction="Preserve current audio technician settings and laser rig maps as festival standard.",
                supportingEvidence=[h.highlight for h in positive_highlights[:2]]
            ))
        else:
            recommendations.append(RecommendationItem(
                title="Standardize event excellence and delivery playbooks",
                description="Participant feedback was overwhelmingly positive across key aspects.",
                category="Best Practices",
                priority="medium",
                impact="Ensure consistent high satisfaction across future organizational sessions.",
                suggestedAction="Document speaker preparation steps, logistics checklist, and venue layout as organizational templates.",
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
