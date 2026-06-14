const mongoose = require('mongoose');

const ExperienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  current: { type: Boolean, default: false },
  description: String
});

const EducationSchema = new mongoose.Schema({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  fieldOfStudy: String,
  startDate: Date,
  endDate: Date,
  grade: String
});

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  technologies: [String],
  link: String,
  githubLink: String
});

const CertificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  issuer: String,
  issueDate: Date,
  expiryDate: Date,
  credentialUrl: String
});

const CandidateProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  title: String,
  bio: String,
  location: String,
  avatar: String,
  resumeUrl: String,
  resumePublicId: String,
  resumeText: String, // Stored for semantic search and parsing
  skills: [String], // Verified/Explicit skills
  inferredSkills: [{ // Hidden skills detected by AI
    skill: String,
    source: String, // "Resume", "Projects", "GitHub", etc.
    confidence: Number
  }],
  experience: [ExperienceSchema],
  education: [EducationSchema],
  projects: [ProjectSchema],
  certifications: [CertificationSchema],
  socialLinks: {
    github: String,
    linkedin: String,
    portfolio: String
  },
  resumeParsingConfidence: {
    type: Number,
    default: 0
  },
  resumeScore: {
    type: Number,
    default: 0
  },
  isBlindModeEnabled: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CandidateProfile', CandidateProfileSchema);
