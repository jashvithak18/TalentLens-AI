const mongoose = require('mongoose');

const RecruiterProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  companyWebsite: String,
  companyLogo: String,
  companySize: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
    default: '1-10'
  },
  companyBio: String,
  title: String // Job title of recruiter within the company (e.g. HR Manager)
}, {
  timestamps: true
});

module.exports = mongoose.model('RecruiterProfile', RecruiterProfileSchema);
