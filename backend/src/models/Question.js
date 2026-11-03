import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeedbackForm',
      required: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    type: {
      type: String,
      enum: ['star_rating', 'nps', 'single_choice', 'multi_choice', 'yes_no', 'short_text', 'long_text'],
      required: true,
      default: 'star_rating',
    },
    prompt: {
      en: { type: String, required: true },
      hi: { type: String, default: '' },
      mr: { type: String, default: '' },
    },
    description: {
      en: { type: String, default: '' },
      hi: { type: String, default: '' },
      mr: { type: String, default: '' },
    },
    options: [
      {
        id: { type: String, required: true },
        label: {
          en: { type: String, required: true },
          hi: { type: String, default: '' },
          mr: { type: String, default: '' },
        },
      },
    ],
    isRequired: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      enum: ['overall', 'content', 'organization', 'speaker', 'venue_logistics', 'food', 'other'],
      default: 'overall',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Question', questionSchema);
