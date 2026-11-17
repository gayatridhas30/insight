import mongoose from 'mongoose';

const feedbackFormSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      default: 'Event Feedback Form',
    },
    description: {
      type: String,
      default: 'Please share your valuable feedback with us. Your responses help us improve future events!',
    },
    isAnonymousAllowed: {
      type: Boolean,
      default: true,
    },
    requireIdentification: {
      type: Boolean,
      default: false,
    },
    supportedLanguages: {
      type: [String],
      default: ['en', 'hi', 'mr'],
    },
    allowVoiceFeedback: {
      type: Boolean,
      default: true,
    },
    allowDuplicateSubmissions: {
      type: Boolean,
      default: false,
    },
    maxSubmissionsPerUser: {
      type: Number,
      default: 1,
    },
    templateType: {
      type: String,
      default: 'standard',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('FeedbackForm', feedbackFormSchema);
