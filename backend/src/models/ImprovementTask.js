import mongoose from 'mongoose';

const improvementTaskSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    relatedEventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    recommendationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recommendation',
    },
    issue: {
      type: String,
      required: true,
    },
    recommendedAction: {
      type: String,
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['backlog', 'todo', 'in_progress', 'completed', 'verified'],
      default: 'todo',
      index: true,
    },
    dueDate: {
      type: Date,
    },
    notes: {
      type: String,
      default: '',
    },
    verifiedInFutureEventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('ImprovementTask', improvementTaskSchema);
