const mongoose = require('mongoose');

const AIRankingSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  matchScore: {
    type: Number, // Overall match percentage (0-100)
    required: true,
    default: 0
  },
  // Detailed Fit breakdown
  fitDetails: {
    technicalFit: { type: Number, default: 0 },
    experienceFit: { type: Number, default: 0 },
    projectFit: { type: Number, default: 0 },
    growthFit: { type: Number, default: 0 },
    behavioralFit: { type: Number, default: 0 }
  },
  // Explainable AI Ranking
  reasons: [String],
  missing: [String],
  // Hiring Risk Analysis
  risks: {
    skillGap: { score: Number, explanation: String },
    experience: { score: Number, explanation: String },
    communication: { score: Number, explanation: String },
    team: { score: Number, explanation: String },
    assessment: { score: Number, explanation: String }
  },
  // Why Not This Candidate Analysis
  whyNotHigher: {
    reasons: [String],
    improvementAreas: [String]
  },
  lastAnalyzed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for uniqueness
AIRankingSchema.index({ job: 1, candidate: 1 }, { unique: true });

module.exports = mongoose.model('AIRanking', AIRankingSchema);
