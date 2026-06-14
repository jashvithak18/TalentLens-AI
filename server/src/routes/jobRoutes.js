const express = require('express');
const {
  createJob,
  getJobs,
  getJob,
  updateJobStatus,
  applyJob,
  getJobApplications,
  updateApplicationStatus,
  getCandidateApplications,
  getJobRankings
} = require('../controllers/jobController');
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/roleGuard');

const router = express.Router();

// Candidate Routes
router.get('/', getJobs);
router.get('/my-applications', protect, authorize('candidate'), getCandidateApplications);
router.post('/:id/apply', protect, authorize('candidate'), applyJob);
router.get('/:id', getJob);

// Recruiter/Admin Routes
router.post('/', protect, authorize('recruiter', 'admin'), createJob);
router.put('/:id/status', protect, authorize('recruiter', 'admin'), updateJobStatus);
router.get('/:id/applications', protect, authorize('recruiter', 'admin'), getJobApplications);
router.put('/applications/:id', protect, authorize('recruiter', 'admin'), updateApplicationStatus);
router.get('/:id/rankings', protect, authorize('recruiter', 'admin'), getJobRankings);

module.exports = router;
