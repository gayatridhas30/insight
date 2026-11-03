import mongoose from 'mongoose';

const aiAnalysisSchema = new mongoose.Schema(
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
    analyzedAt: {
      type: Date,
      default: Date.now,
    },
    totalResponsesAnalyzed: {
      type: Number,
      default: 0,
    },
    sentimentSummary: {
      positive: { type: Number, default: 0 },
      neutral: { type: Number, default: 0 },
      negative: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
    },
    themes: [
      {
        name: { type: String, required: true },
        sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },
        responseCount: { type: Number, default: 1 },
        representativeQuotes: { type: [String], default: [] },
        keywords: { type: [String], default: [] },
      },
    ],
    recurringIssues: [
      {
        issue: { type: String, required: true },
        severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
        frequency: { type: Number, default: 1 },
        category: { type: String, default: 'General' },
        evidence: { type: [String], default: [] },
      },
    ],
    positiveHighlights: [
      {
        highlight: { type: String, required: true },
        frequency: { type: Number, default: 1 },
        category: { type: String, default: 'General' },
        evidence: { type: [String], default: [] },
      },
    ],
    complaintClusters: [
      {
        clusterName: { type: String, required: true },
        count: { type: Number, default: 1 },
        examples: { type: [String], default: [] },
      },
    ],
  },
  {
    timestamps: true,
  }
);

aiAnalysisSchema.index({ eventId: 1, createdAt: -1 });

export default mongoose.model('AIAnalysis', aiAnalysisSchema);
