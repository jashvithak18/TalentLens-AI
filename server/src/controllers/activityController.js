const ActivityLog = require('../models/ActivityLog');

// @desc    Log candidate activity (e.g. github click, profile view)
// @route   POST /api/activities/log
// @access  Private
exports.logActivity = async (req, res, next) => {
  const { action, details } = req.body;

  try {
    if (!action) {
      return res.status(400).json({ success: false, error: 'Action is required' });
    }

    const log = await ActivityLog.create({
      user: req.user.id,
      action,
      details,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json({ success: true, log });
  } catch (error) {
    next(error);
  }
};
