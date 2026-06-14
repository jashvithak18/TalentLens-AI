const express = require('express');
const {
  getSemanticMatch,
  getHiddenSkills,
  getCandidateDNA,
  recruiterCopilot
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/roleGuard');

const router = express.Router();

router.get('/match/:jobId/:candidateId', protect, getSemanticMatch);
router.get('/hidden-skills/:candidateId', protect, getHiddenSkills);
router.get('/dna/:candidateId', protect, getCandidateDNA);
router.post('/copilot', protect, authorize('recruiter', 'admin'), recruiterCopilot);

module.exports = router;
