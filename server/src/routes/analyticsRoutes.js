const express = require('express');
const {
  getRecruiterAnalytics,
  getTalentDiscovery,
  getPlatformAnalytics
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/roleGuard');

const router = express.Router();

router.get('/recruiter', protect, authorize('recruiter', 'admin'), getRecruiterAnalytics);
router.get('/talent-discovery', protect, authorize('recruiter', 'admin'), getTalentDiscovery);
router.get('/platform', protect, authorize('admin'), getPlatformAnalytics);

module.exports = router;
