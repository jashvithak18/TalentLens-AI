const express = require('express');
const {
  getSemanticMatch,
  getHiddenSkills,
  getCandidateDNA,
  recruiterCopilot
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/roleGuard');
const axios = require('axios');

const router = express.Router();

router.get('/test-groq', async (req, res) => {
  try {
    const key = process.env.GROQ_API_KEY;
    if (!key) {
      return res.status(400).json({ success: false, error: 'GROQ_API_KEY is not defined in process.env' });
    }
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: 'Respond with "Groq is working!"' }]
      },
      {
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    return res.json({ success: true, keyLength: key.length, response: response.data.choices[0].message.content });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
      data: err.response?.data || null
    });
  }
});

router.get('/match/:jobId/:candidateId', protect, getSemanticMatch);
router.get('/hidden-skills/:candidateId', protect, getHiddenSkills);
router.get('/dna/:candidateId', protect, getCandidateDNA);
router.post('/copilot', protect, authorize('recruiter', 'admin'), recruiterCopilot);

module.exports = router;
