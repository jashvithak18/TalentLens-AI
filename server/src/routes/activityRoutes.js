const express = require('express');
const { logActivity } = require('../controllers/activityController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/log', protect, logActivity);

module.exports = router;
