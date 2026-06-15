const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Job description is required']
  },
  requiredSkills: [{
    type: String,
    trim: true
  }],
  preferredSkills: [{
    type: String,
    trim: true
  }],
  experience: {
    type: Number, // Minimum years of experience
    required: true,
    default: 0
  },
  salaryRange: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'USD' }
  },
  location: {
    type: String,
    required: true
  },
  employmentType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship'],
    default: 'full-time'
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'closed'],
    default: 'active'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) // 180 days (6 months) from now
  },
  // Weights configuration for JD Simulator
  weights: {
    technicalFit: { type: Number, default: 0.35 },
    experienceFit: { type: Number, default: 0.20 },
    projectFit: { type: Number, default: 0.20 },
    growthFit: { type: Number, default: 0.15 },
    behavioralFit: { type: Number, default: 0.10 }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Job', JobSchema);
