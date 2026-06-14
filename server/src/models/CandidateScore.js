const mongoose = require('mongoose');

const CandidateScoreSchema = new mongoose.Schema({
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Candidate DNA Profile (AI Scores 0-100)
  dna: {
    problemSolving: { type: Number, default: 50 },
    technicalDepth: { type: Number, default: 50 },
    communication: { type: Number, default: 50 },
    leadership: { type: Number, default: 50 },
    adaptability: { type: Number, default: 50 },
    reliability: { type: Number, default: 50 },
    learningVelocity: { type: Number, default: 50 },
    consistency: { type: Number, default: 50 }
  },
  // Behavioral Intelligence Engine
  behavioral: {
    learningScore: { type: Number, default: 50 },
    consistencyScore: { type: Number, default: 50 },
    reliabilityScore: { type: Number, default: 50 },
    growthScore: { type: Number, default: 50 },
    adaptabilityScore: { type: Number, default: 50 }
  },
  // Candidate Potential Score
  potential: {
    currentCapability: { type: Number, default: 50 },
    futureGrowthPotential: { type: Number, default: 50 },
    careerAccelerationScore: { type: Number, default: 50 },
    learningVelocity: { type: Number, default: 50 },
    reasoning: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CandidateScore', CandidateScoreSchema);
