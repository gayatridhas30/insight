import { Event, EventSession, FeedbackForm, Question, FeedbackResponse, AIAnalysis } from '../models/index.js';
import { qrService } from '../services/qrService.js';
import { logAudit } from '../middleware/audit.js';
import { getDefaultQuestionsForCategory, getCategoryConfig } from '../config/eventCategories.js';

export const createEvent = async (req, res, next) => {
  try {
    const {
      organizationId,
      title,
      category = 'Workshop',
      subcategory = '',
      subcategories = [],
      description,
      venueType = 'in-person',
      location,
      startDate,
      endDate,
      targetResponses = 50,
      tags = [],
    } = req.body;

    if (!title || !organizationId) {
      return res.status(400).json({ success: false, message: 'Event title and organizationId are required.' });
    }

    // Generate clean alphanumeric code (e.g., TECH-4921 or RUN-3829)
    const categoryPrefix = category ? category.slice(0, 4).toUpperCase().replace(/[^A-Z]/g, 'EVT') : 'EVT';
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const code = `${categoryPrefix}-${randomSuffix}`;

    const subcats = Array.isArray(subcategories) && subcategories.length > 0
      ? subcategories
      : subcategory ? [subcategory] : [];

    const event = await Event.create({
      organizationId,
      title,
      code,
      category,
      subcategory: subcategory || (subcats[0] || ''),
      subcategories: subcats,
      description: description || '',
      venueType,
      location: location || 'Main Auditorium',
      startDate: startDate || new Date(),
      endDate: endDate || new Date(Date.now() + 3 * 3600 * 1000),
      targetResponses,
      tags,
      status: 'published',
      isFeedbackOpen: true,
      createdBy: req.user._id,
    });

    // Create default feedback form
    const form = await FeedbackForm.create({
      eventId: event._id,
      title: `${title} Feedback`,
      description: `We appreciate your feedback for ${title}. Your responses help us continuously improve.`,
      isAnonymousAllowed: true,
      supportedLanguages: ['en', 'hi', 'mr'],
      allowVoiceFeedback: true,
      templateType: category.toLowerCase(),
    });

    // Dynamically retrieve category and subcategory-tailored questions
    const templateQuestions = getDefaultQuestionsForCategory(category, event.subcategory);
    const seededQuestions = templateQuestions.map((q, idx) => ({
      formId: form._id,
      order: idx + 1,
      type: q.type,
      category: q.category || 'overall',
      isRequired: Boolean(q.isRequired),
      prompt: {
        en: (q.prompt?.en || '').replace(/\$\{title\}/g, title),
        hi: (q.prompt?.hi || '').replace(/\$\{title\}/g, title),
        mr: (q.prompt?.mr || '').replace(/\$\{title\}/g, title),
      },
      description: q.description || { en: '', hi: '', mr: '' },
      options: q.options || [],
    }));

    await Question.insertMany(seededQuestions);

    // Generate QR Code data
    const qrData = await qrService.generateFeedbackQRCode(event.code);

    await logAudit({
      req,
      action: 'EVENT_CREATED',
      resourceType: 'Event',
      resourceId: event._id.toString(),
      details: { title: event.title, code: event.code, category, subcategory: event.subcategory },
      organizationId,
    });

    res.status(201).json({
      success: true,
      event,
      formId: form._id,
      qr: qrData,
    });
  } catch (err) {
    next(err);
  }
};

export const getEvents = async (req, res, next) => {
  try {
    const { organizationId, status, category, subcategory, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (organizationId) query.organizationId = organizationId;
    if (status) query.status = status;
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { subcategory: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    // Attach response counts to each event
    const eventIds = events.map((e) => e._id);
    const counts = await FeedbackResponse.aggregate([
      { $match: { eventId: { $in: eventIds } } },
      { $group: { _id: '$eventId', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    counts.forEach((c) => {
      countMap[c._id.toString()] = c.count;
    });

    const enrichedEvents = events.map((e) => ({
      ...e,
      id: e._id,
      responsesCount: countMap[e._id.toString()] || 0,
      responseRate: Math.round(((countMap[e._id.toString()] || 0) / (e.targetResponses || 1)) * 100),
    }));

    res.json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      events: enrichedEvents,
    });
  } catch (err) {
    next(err);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const form = await FeedbackForm.findOne({ eventId: event._id });
    const sessions = await EventSession.find({ eventId: event._id }).sort({ startTime: 1 });
    const responsesCount = await FeedbackResponse.countDocuments({ eventId: event._id });
    const qr = await qrService.generateFeedbackQRCode(event.code);

    res.json({
      success: true,
      event,
      form,
      sessions,
      responsesCount,
      qr,
    });
  } catch (err) {
    next(err);
  }
};

export const getEventByCode = async (req, res, next) => {
  try {
    const event = await Event.findOne({ code: req.params.code.toUpperCase() })
      .populate('organizationId', 'name logo category')
      .lean();

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found with that code.' });
    }

    const form = await FeedbackForm.findOne({ eventId: event._id }).lean();
    let questions = [];
    if (form) {
      questions = await Question.find({ formId: form._id }).sort({ order: 1 }).lean();
    }
    const sessions = await EventSession.find({ eventId: event._id }).sort({ startTime: 1 }).lean();

    res.json({
      success: true,
      event: {
        id: event._id,
        _id: event._id,
        title: event.title,
        code: event.code,
        category: event.category,
        subcategory: event.subcategory || '',
        subcategories: event.subcategories || [],
        description: event.description,
        venueType: event.venueType,
        location: event.location,
        startDate: event.startDate,
        endDate: event.endDate,
        status: event.status,
        isFeedbackOpen: event.isFeedbackOpen,
        feedbackDeadline: event.feedbackDeadline,
        organization: event.organizationId,
      },
      form,
      questions,
      sessions,
    });
  } catch (err) {
    next(err);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    await logAudit({
      req,
      action: 'EVENT_UPDATED',
      resourceType: 'Event',
      resourceId: event._id.toString(),
      details: req.body,
      organizationId: event.organizationId,
    });

    res.json({ success: true, event });
  } catch (err) {
    next(err);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    await Event.deleteOne({ _id: event._id });
    await FeedbackForm.deleteMany({ eventId: event._id });
    await Question.deleteMany({ formId: { $in: await FeedbackForm.find({ eventId: event._id }).distinct('_id') } });
    await FeedbackResponse.deleteMany({ eventId: event._id });

    await logAudit({
      req,
      action: 'EVENT_DELETED',
      resourceType: 'Event',
      resourceId: event._id.toString(),
      organizationId: event.organizationId,
    });

    res.json({ success: true, message: 'Event and related records deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export const createSession = async (req, res, next) => {
  try {
    const { title, speakerName, startTime, endTime, roomOrLink, description } = req.body;
    const session = await EventSession.create({
      eventId: req.params.id,
      title,
      speakerName,
      startTime,
      endTime,
      roomOrLink,
      description,
    });

    res.status(201).json({ success: true, session });
  } catch (err) {
    next(err);
  }
};

export const compareEvents = async (req, res, next) => {
  try {
    const { eventIds } = req.body; // array of 2-3 event IDs
    if (!eventIds || !Array.isArray(eventIds) || eventIds.length < 2) {
      return res.status(400).json({ success: false, message: 'Please provide at least 2 event IDs to compare.' });
    }

    const events = await Event.find({ _id: { $in: eventIds } }).lean();
    const comparisonData = [];

    for (const evt of events) {
      const responses = await FeedbackResponse.find({ eventId: evt._id }).lean();
      const analysis = await AIAnalysis.findOne({ eventId: evt._id }).sort({ createdAt: -1 }).lean();

      const totalResponses = responses.length;
      let totalRating = 0;
      let ratingCount = 0;

      responses.forEach((r) => {
        const rVal = r.answers?.find((a) => a.ratingValue !== undefined)?.ratingValue;
        if (rVal) {
          totalRating += rVal;
          ratingCount++;
        }
      });

      const avgRating = ratingCount > 0 ? Number((totalRating / ratingCount).toFixed(2)) : 0;

      comparisonData.push({
        event: {
          id: evt._id,
          title: evt.title,
          code: evt.code,
          category: evt.category,
          subcategory: evt.subcategory || '',
          date: evt.startDate,
        },
        metrics: {
          totalResponses,
          targetResponses: evt.targetResponses,
          responseRate: Math.round((totalResponses / (evt.targetResponses || 1)) * 100),
          averageRating: avgRating,
          sentimentScore: analysis?.sentimentSummary?.averageScore || 0,
          sentimentPositive: analysis?.sentimentSummary?.positive || 0,
          sentimentNeutral: analysis?.sentimentSummary?.neutral || 0,
          sentimentNegative: analysis?.sentimentSummary?.negative || 0,
        },
        recurringIssuesCount: analysis?.recurringIssues?.length || 0,
        positiveHighlightsCount: analysis?.positiveHighlights?.length || 0,
      });
    }

    res.json({ success: true, comparison: comparisonData });
  } catch (err) {
    next(err);
  }
};
