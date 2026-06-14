const express = require('express');
const { getSkills } = require('../controllers/skillController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getSkills);

module.exports = router;
