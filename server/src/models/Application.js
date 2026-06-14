const mongoose = require('mongoose');

const StatusTimelineSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  },
  notes: String,
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const ApplicationSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: [
      'Applied',
      'Under Review',
      'Assessment Pending',
      'Assessment Completed',
      'Shortlisted',
      'Interview Scheduled',
      'Selected',
      'Rejected'
    ],
    default: 'Applied'
  },
  coverLetter: String,
  timeline: [StatusTimelineSchema],
  appliedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Populate the initial timeline entry on save
ApplicationSchema.pre('save', function (next) {
  if (this.isNew && this.timeline.length === 0) {
    this.timeline.push({
      status: 'Applied',
      notes: 'Application submitted successfully.',
      updatedAt: new Date()
    });
  }
  next();
});

module.exports = mongoose.model('Application', ApplicationSchema);
