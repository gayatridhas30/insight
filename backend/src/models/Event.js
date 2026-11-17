import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide event title'],
      trim: true,
      maxlength: 200,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: true,
      default: 'Workshop',
      index: true,
    },
    subcategory: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    subcategories: {
      type: [String],
      default: [],
    },
    bannerUrl: {
      type: String,
      default: '',
    },
    venueType: {
      type: String,
      enum: ['in-person', 'virtual', 'hybrid'],
      default: 'in-person',
    },
    location: {
      type: String,
      default: 'Campus Main Auditorium',
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 2 * 60 * 60 * 1000),
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'ongoing', 'completed', 'archived'],
      default: 'published',
      index: true,
    },
    isFeedbackOpen: {
      type: Boolean,
      default: true,
    },
    feedbackDeadline: {
      type: Date,
    },
    tags: {
      type: [String],
      default: [],
    },
    targetResponses: {
      type: Number,
      default: 50,
      min: 1,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.index({ category: 1, subcategory: 1 });

export default mongoose.model('Event', eventSchema);
