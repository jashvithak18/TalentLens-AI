const express = require('express');
const {
  getProfile,
  updateProfile,
  uploadResume,
  addExperience,
  addEducation,
  addProject,
  addCertification,
  getGraphs
} = require('../controllers/candidateController');
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/roleGuard');
const { upload } = require('../middleware/upload');

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/resume', protect, upload.single('resume'), uploadResume);
router.post('/experience', protect, addExperience);
router.post('/education', protect, addEducation);
router.post('/projects', protect, addProject);
router.post('/certifications', protect, addCertification);
router.get('/graphs/:candidateId?', protect, getGraphs);

module.exports = router;
