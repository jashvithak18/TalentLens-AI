const express = require('express');
const {
  getAssessments,
  createAssessment,
  getAssessmentDetails,
  submitAssessment
} = require('../controllers/assessmentController');
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/roleGuard');

const router = express.Router();

router.get('/', protect, getAssessments);
router.get('/:id', protect, getAssessmentDetails);
router.post('/submit', protect, submitAssessment);

// Recruiter/Admin only
router.post('/', protect, authorize('recruiter', 'admin'), createAssessment);

module.exports = router;
