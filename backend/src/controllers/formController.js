import { FeedbackForm, Question, Event } from '../models/index.js';
import { aiService } from '../services/aiService.js';
import { logAudit } from '../middleware/audit.js';

export const getFormByEventId = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const form = await FeedbackForm.findOne({ eventId });
    if (!form) {
      return res.status(404).json({ success: false, message: 'Feedback form not found for this event.' });
    }

    const questions = await Question.find({ formId: form._id }).sort({ order: 1 });

    res.json({
      success: true,
      form,
      questions,
    });
  } catch (err) {
    next(err);
  }
};

export const updateFormSettings = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const {
      title,
      description,
      isAnonymousAllowed,
      requireIdentification,
      supportedLanguages,
      allowVoiceFeedback,
      templateType,
    } = req.body;

    const form = await FeedbackForm.findOneAndUpdate(
      { eventId },
      {
        title,
        description,
        isAnonymousAllowed,
        requireIdentification,
        supportedLanguages,
        allowVoiceFeedback,
        templateType,
      },
      { new: true, runValidators: true }
    );

    if (!form) {
      return res.status(404).json({ success: false, message: 'Form not found' });
    }

    res.json({ success: true, form });
  } catch (err) {
    next(err);
  }
};

export const saveQuestions = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { questions } = req.body; // Array of question objects

    if (!Array.isArray(questions)) {
      return res.status(400).json({ success: false, message: 'Questions must be an array.' });
    }

    const form = await FeedbackForm.findOne({ eventId });
    if (!form) {
      return res.status(404).json({ success: false, message: 'Form not found' });
    }

    // Delete previous questions and replace with updated set
    await Question.deleteMany({ formId: form._id });

    const newQuestions = questions.map((q, idx) => ({
      formId: form._id,
      order: idx + 1,
      type: q.type || 'star_rating',
      category: q.category || 'overall',
      isRequired: Boolean(q.isRequired),
      prompt: {
        en: q.prompt?.en || q.prompt || 'Question Prompt',
        hi: q.prompt?.hi || '',
        mr: q.prompt?.mr || '',
      },
      description: {
        en: q.description?.en || '',
        hi: q.description?.hi || '',
        mr: q.description?.mr || '',
      },
      options: (q.options || []).map((opt, oIdx) => ({
        id: opt.id || `opt_${oIdx + 1}`,
        label: {
          en: typeof opt === 'string' ? opt : opt.label?.en || opt.label || `Option ${oIdx + 1}`,
          hi: opt.label?.hi || '',
          mr: opt.label?.mr || '',
        },
      })),
    }));

    const saved = await Question.insertMany(newQuestions);

    await logAudit({
      req,
      action: 'FORM_QUESTIONS_UPDATED',
      resourceType: 'FeedbackForm',
      resourceId: form._id.toString(),
      details: { questionCount: saved.length },
    });

    res.json({
      success: true,
      message: 'Questions updated successfully',
      questions: saved,
    });
  } catch (err) {
    next(err);
  }
};

export const generateAIQuestions = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const aiForm = await aiService.generateFormQuestions({
      title: event.title,
      category: event.category,
      subcategory: event.subcategory || '',
      description: event.description,
    });

    res.json({
      success: true,
      suggestedQuestions: aiForm.questions,
    });
  } catch (err) {
    next(err);
  }
};
