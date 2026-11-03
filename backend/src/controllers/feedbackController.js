import crypto from 'crypto';
import { FeedbackResponse, Event, FeedbackForm, Question } from '../models/index.js';
import { bhashiniService } from '../services/bhashiniService.js';
import { aiService } from '../services/aiService.js';

export const submitFeedback = async (req, res, next) => {
  try {
    const {
      eventCode,
      sessionId,
      isAnonymous = true,
      participantName,
      participantEmail,
      submissionLanguage = 'en',
      answers, // Array of answers: { questionId, ratingValue, selectedOptions, textResponse, audioUrl, audioTranscription }
    } = req.body;

    if (!eventCode || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Event code and answers array are required.' });
    }

    const event = await Event.findOne({ code: eventCode.toUpperCase() });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found with that code.' });
    }

    if (!event.isFeedbackOpen) {
      return res.status(403).json({ success: false, message: 'Feedback collection for this event has been closed.' });
    }

    if (event.feedbackDeadline && new Date() > new Date(event.feedbackDeadline)) {
      return res.status(403).json({ success: false, message: 'The deadline for submitting feedback has passed.' });
    }

    const form = await FeedbackForm.findOne({ eventId: event._id });
    if (!form) {
      return res.status(404).json({ success: false, message: 'Feedback form not found.' });
    }

    // Hash client IP for duplicate check if duplicate submissions disabled
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const ipHash = crypto.createHash('sha256').update(rawIp + event._id.toString()).digest('hex');

    if (!form.allowDuplicateSubmissions) {
      const existingResponse = await FeedbackResponse.findOne({ eventId: event._id, ipHash });
      if (existingResponse) {
        return res.status(429).json({
          success: false,
          message: 'You have already submitted feedback for this event. Duplicate submissions are restricted.',
        });
      }
    }

    // Process each answer: translate multilingual text via Bhashini
    const processedAnswers = [];
    let ratingSum = 0;
    let ratingCount = 0;

    for (const ans of answers) {
      const question = await Question.findById(ans.questionId);
      const originalText = (ans.textResponse || ans.audioTranscription || '').trim();
      let translatedText = originalText;

      // Translate if submission language is not English
      if (originalText && submissionLanguage !== 'en') {
        const transResult = await bhashiniService.translateText({
          sourceText: originalText,
          sourceLanguage: submissionLanguage,
          targetLanguage: 'en',
        });
        translatedText = transResult.translatedText;
      }

      if (ans.ratingValue !== undefined && ans.ratingValue !== null) {
        ratingSum += ans.ratingValue;
        ratingCount++;
      }

      processedAnswers.push({
        questionId: ans.questionId,
        questionType: question?.type || ans.questionType || 'short_text',
        questionPrompt: question?.prompt?.en || 'Question',
        ratingValue: ans.ratingValue,
        selectedOptions: ans.selectedOptions || [],
        textResponseOriginal: originalText,
        textResponseTranslated: translatedText,
        audioUrl: ans.audioUrl || '',
        audioTranscriptionOriginal: ans.audioTranscriptionOriginal || originalText,
        audioTranscriptionEdited: ans.audioTranscriptionEdited || originalText,
      });
    }

    // Initial sentiment estimate
    let sentimentScore = 0;
    let sentimentLabel = 'neutral';
    if (ratingCount > 0) {
      const avgR = ratingSum / ratingCount;
      sentimentScore = Number(((avgR - 3) / 2).toFixed(2));
      if (avgR >= 3.8) sentimentLabel = 'positive';
      else if (avgR <= 2.5) sentimentLabel = 'negative';
      else sentimentLabel = 'neutral';
    }

    const savedResponse = await FeedbackResponse.create({
      eventId: event._id,
      formId: form._id,
      sessionId: sessionId || null,
      isAnonymous: Boolean(isAnonymous),
      participantName: isAnonymous ? 'Anonymous Participant' : participantName || 'Attendee',
      participantEmail: isAnonymous ? '' : participantEmail || '',
      submissionLanguage,
      answers: processedAnswers,
      ipHash,
      sentimentScore,
      sentimentLabel,
      processedByAI: false,
    });

    // Fire asynchronous background AI update without blocking the user
    setImmediate(async () => {
      try {
        const allResponses = await FeedbackResponse.find({ eventId: event._id }).lean();
        const formatted = allResponses.map((r) => {
          const txtAns = r.answers?.find((a) => a.textResponseOriginal || a.textResponseTranslated);
          const rateAns = r.answers?.find((a) => a.ratingValue !== undefined);
          return {
            eventId: r.eventId.toString(),
            participantName: r.participantName,
            submissionLanguage: r.submissionLanguage,
            textOriginal: txtAns?.textResponseOriginal || '',
            textTranslated: txtAns?.textResponseTranslated || '',
            rating: rateAns?.ratingValue,
          };
        });

        await aiService.analyzeFeedbackBatch({
          eventId: event._id.toString(),
          organizationId: event.organizationId.toString(),
          eventTitle: event.title,
          eventCategory: event.category,
          responses: formatted,
        });
      } catch (aiErr) {
        console.warn('[Feedback] Background AI trigger notice:', aiErr.message);
      }
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully! Thank you for sharing your experience.',
      responseId: savedResponse._id,
      sentimentLabel,
    });
  } catch (err) {
    next(err);
  }
};

export const getResponsesByEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 20, sentiment, language, isAnonymous } = req.query;

    const query = { eventId };
    if (sentiment) query.sentimentLabel = sentiment;
    if (language) query.submissionLanguage = language;
    if (isAnonymous !== undefined) query.isAnonymous = isAnonymous === 'true';

    const total = await FeedbackResponse.countDocuments(query);
    const responses = await FeedbackResponse.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('sessionId', 'title speakerName')
      .lean();

    res.json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      responses,
    });
  } catch (err) {
    next(err);
  }
};

export const getResponseById = async (req, res, next) => {
  try {
    const response = await FeedbackResponse.findById(req.params.id)
      .populate('eventId', 'title code category')
      .populate('sessionId', 'title speakerName');

    if (!response) {
      return res.status(404).json({ success: false, message: 'Response not found' });
    }

    res.json({ success: true, response });
  } catch (err) {
    next(err);
  }
};
