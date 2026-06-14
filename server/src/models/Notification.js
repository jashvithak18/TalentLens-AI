const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'Job Applied',
      'Assessment Assigned',
      'Assessment Completed',
      'Candidate Shortlisted',
      'Interview Scheduled',
      'Candidate Selected',
      'Candidate Rejected'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  link: String // Destination path in frontend
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', NotificationSchema);
