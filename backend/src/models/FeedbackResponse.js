import mongoose from 'mongoose';

const answerItemSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    questionType: {
      type: String,
      required: true,
    },
    questionPrompt: {
      type: String,
    },
    ratingValue: {
      type: Number,
    },
    selectedOptions: {
      type: [String],
      default: [],
    },
    textResponseOriginal: {
      type: String,
      default: '',
    },
    textResponseTranslated: {
      type: String,
      default: '',
    },
    audioUrl: {
      type: String,
      default: '',
    },
    audioTranscriptionOriginal: {
      type: String,
      default: '',
    },
    audioTranscriptionEdited: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const feedbackResponseSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeedbackForm',
      required: true,
      index: true,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EventSession',
    },
    isAnonymous: {
      type: Boolean,
      default: true,
    },
    participantName: {
      type: String,
      default: 'Anonymous Participant',
    },
    participantEmail: {
      type: String,
      default: '',
    },
    submissionLanguage: {
      type: String,
      enum: ['en', 'hi', 'mr'],
      default: 'en',
    },
    answers: [answerItemSchema],
    ipHash: {
      type: String,
      index: true,
    },
    sentimentScore: {
      type: Number,
      default: 0,
    },
    sentimentLabel: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      default: 'neutral',
    },
    processedByAI: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

feedbackResponseSchema.index({ eventId: 1, createdAt: -1 });

export default mongoose.model('FeedbackResponse', feedbackResponseSchema);
