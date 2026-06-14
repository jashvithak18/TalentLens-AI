const mongoose = require('mongoose');

const TestCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
  isPublic: { type: Boolean, default: true } // Public test cases are shown to the user, private ones are not
});

const TemplateSchema = new mongoose.Schema({
  language: { type: String, required: true }, // "javascript", "python", etc.
  code: { type: String, required: true } // Starter code block
});

const CodingProblemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String, // Problem statement in markdown
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  category: {
    type: String,
    default: 'DSA'
  },
  templates: [TemplateSchema],
  testCases: [TestCaseSchema],
  timeLimitMs: {
    type: Number,
    default: 2000
  },
  points: {
    type: Number,
    default: 100
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CodingProblem', CodingProblemSchema);
