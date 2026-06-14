const mongoose = require('mongoose');

const McqAnswerSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  selectedOption: Number, // Index of selected option
  isCorrect: Boolean,
  pointsAwarded: Number
});

const CodingAnswerSchema = new mongoose.Schema({
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CodingProblem',
    required: true
  },
  code: String,
  language: String,
  testCasesPassed: Number,
  totalTestCases: Number,
  isPassed: Boolean,
  pointsAwarded: Number,
  runResults: [{
    testCaseId: String,
    passed: Boolean,
    actualOutput: String,
    expectedOutput: String,
    error: String,
    executionTimeMs: Number
  }]
});

const BehavioralResponseSchema = new mongoose.Schema({
  category: {
    type: String, // "Communication", "Leadership", "Adaptability", "Teamwork", "Reliability", "Learning Mindset"
    required: true
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  feedback: String
});

const SubmissionSchema = new mongoose.Schema({
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assessment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment',
    required: true
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'timed-out'],
    default: 'in-progress'
  },
  mcqAnswers: [McqAnswerSchema],
  codingAnswers: [CodingAnswerSchema],
  behavioralResponses: [BehavioralResponseSchema],
  score: {
    type: Number, // Percentage score
    default: 0
  },
  timeTaken: {
    type: Number, // in seconds
    default: 0
  },
  completedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Submission', SubmissionSchema);
