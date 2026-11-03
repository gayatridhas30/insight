import { AIAnalysis, Recommendation, FeedbackResponse, Event } from '../models/index.js';
import { aiService } from '../services/aiService.js';
import { logAudit } from '../middleware/audit.js';

export const runEventAnalysis = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const responses = await FeedbackResponse.find({ eventId }).lean();
    if (responses.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No responses collected yet. AI analysis requires at least one submitted feedback.',
      });
    }

    const formattedResponses = responses.map((r) => {
      const txtAns = r.answers?.find((a) => a.textResponseOriginal || a.textResponseTranslated);
      const rateAns = r.answers?.find((a) => a.ratingValue !== undefined);
      return {
        eventId: r.eventId.toString(),
        organizationId: event.organizationId.toString(),
        participantName: r.participantName,
        submissionLanguage: r.submissionLanguage,
        textOriginal: txtAns?.textResponseOriginal || txtAns?.audioTranscriptionOriginal || '',
        textTranslated: txtAns?.textResponseTranslated || '',
        rating: rateAns?.ratingValue,
      };
    });

    const aiResult = await aiService.analyzeFeedbackBatch({
      eventId: event._id.toString(),
      organizationId: event.organizationId.toString(),
      eventTitle: event.title,
      eventCategory: event.category,
      responses: formattedResponses,
    });

    // Save AIAnalysis record
    const savedAnalysis = await AIAnalysis.create({
      eventId: event._id,
      organizationId: event.organizationId,
      totalResponsesAnalyzed: responses.length,
      sentimentSummary: aiResult.sentimentSummary,
      themes: aiResult.themes,
      recurringIssues: aiResult.recurringIssues,
      positiveHighlights: aiResult.positiveHighlights,
      complaintClusters: (aiResult.recurringIssues || []).map((iss) => ({
        clusterName: iss.category,
        count: iss.frequency,
        examples: iss.evidence,
      })),
    });

    // Save recommendations
    const savedRecommendations = [];
    if (aiResult.recommendations && aiResult.recommendations.length > 0) {
      // Clear previous recommendations for clean run
      await Recommendation.deleteMany({ eventId: event._id });
      for (const rec of aiResult.recommendations) {
        const createdRec = await Recommendation.create({
          eventId: event._id,
          organizationId: event.organizationId,
          title: rec.title,
          description: rec.description,
          category: rec.category,
          priority: rec.priority,
          impact: rec.impact,
          suggestedAction: rec.suggestedAction,
          supportingEvidence: rec.supportingEvidence,
        });
        savedRecommendations.push(createdRec);
      }
    }

    // Mark responses as processed
    await FeedbackResponse.updateMany({ eventId: event._id }, { processedByAI: true });

    await logAudit({
      req,
      action: 'AI_ANALYSIS_EXECUTED',
      resourceType: 'AIAnalysis',
      resourceId: savedAnalysis._id.toString(),
      details: { totalResponses: responses.length },
      organizationId: event.organizationId,
    });

    res.json({
      success: true,
      analysis: savedAnalysis,
      recommendations: savedRecommendations,
    });
  } catch (err) {
    next(err);
  }
};

export const getEventAnalysis = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const analysis = await AIAnalysis.findOne({ eventId }).sort({ createdAt: -1 });
    const recommendations = await Recommendation.find({ eventId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      analysis: analysis || null,
      recommendations: recommendations || [],
    });
  } catch (err) {
    next(err);
  }
};

export const queryRAGAssistant = async (req, res, next) => {
  try {
    const { query, organizationId, eventId } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, message: 'Query is required.' });
    }

    // Ensure organizationId is scoped to user's organization
    const orgId = organizationId || req.orgMembership?.organizationId;
    if (!orgId) {
      return res.status(400).json({ success: false, message: 'Organization scope is required for RAG query.' });
    }

    const ragResult = await aiService.queryRAG({
      organizationId: orgId.toString(),
      eventId: eventId ? eventId.toString() : null,
      query,
    });

    await logAudit({
      req,
      action: 'RAG_QUERY_EXECUTED',
      resourceType: 'RAGAssistant',
      details: { query, sourcesCount: ragResult.sourcesCount },
      organizationId: orgId,
    });

    res.json({
      success: true,
      result: ragResult,
    });
  } catch (err) {
    next(err);
  }
};
