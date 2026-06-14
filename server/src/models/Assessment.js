const mongoose = require('mongoose');

const AssessmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  type: {
    type: String,
    enum: ['mcq', 'coding', 'behavioral', 'mixed'],
    required: true
  },
  category: {
    type: String, // "React", "Node.js", "MongoDB", "DSA", "Behavioral", etc.
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true,
    default: 30
  },
  passingScore: {
    type: Number,
    default: 60
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  codingProblems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CodingProblem'
  }],
  negativeMarking: {
    type: Boolean,
    default: false
  },
  penaltyWeight: {
    type: Number, // e.g. 0.25 negative marks per wrong answer
    default: 0.25
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Assessment', AssessmentSchema);
