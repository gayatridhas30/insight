import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: 'General',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    impact: {
      type: String,
      default: 'Medium improvement to participant satisfaction',
    },
    suggestedAction: {
      type: String,
      required: true,
    },
    supportingEvidence: {
      type: [String],
      default: [],
    },
    isConvertedToTask: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Recommendation', recommendationSchema);
