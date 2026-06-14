const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctOption: {
    type: Number, // Index (0, 1, 2, 3)
    required: true
  },
  category: {
    type: String, // "React", "Node.js", "MongoDB", "JavaScript", "TypeScript", "Python", "SQL", "DSA", "Aptitude", "Behavioral"
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  points: {
    type: Number,
    default: 10
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Question', QuestionSchema);
