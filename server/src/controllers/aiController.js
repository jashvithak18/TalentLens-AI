const Job = require('../models/Job');
const CandidateProfile = require('../models/CandidateProfile');
const User = require('../models/User');
const Submission = require('../models/Submission');
const CandidateScore = require('../models/CandidateScore');
const AIRanking = require('../models/AIRanking');
const ActivityLog = require('../models/ActivityLog');
const {
  aiEvaluateCandidateFit,
  aiDetectHiddenSkills,
  aiGenerateCandidateDNA,
  aiRecruiterCopilotChat
} = require('../utils/aiHelpers');

// Semantic Candidate Matching
exports.getSemanticMatch = async (req, res, next) => {
  const { jobId, candidateId } = req.params;

  try {
    const job = await Job.findById(jobId);
    const candidate = await CandidateProfile.findOne({ user: candidateId });

    if (!job || !candidate) {
      return res.status(404).json({ success: false, error: 'Job or Candidate not found' });
    }

    // Log profile view activity if viewed by a recruiter
    if (req.user && req.user.role === 'recruiter') {
      await ActivityLog.create({
        user: candidateId,
        action: 'profile_view',
        details: `Profile viewed by recruiter: ${req.user.name} for job: ${job.title}`
      });
    }

    const fitData = await aiEvaluateCandidateFit(job, candidate);
    res.status(200).json({ success: true, fitData });
  } catch (error) {
    next(error);
  }
};

// Hidden Skill Detection
exports.getHiddenSkills = async (req, res, next) => {
  const { candidateId } = req.params;

  try {
    const candidate = await CandidateProfile.findOne({ user: candidateId });
    if (!candidate) {
      return res.status(404).json({ success: false, error: 'Candidate profile not found' });
    }

    const inferred = await aiDetectHiddenSkills(candidate);
    candidate.inferredSkills = inferred;
    await candidate.save();

    res.status(200).json({ success: true, inferredSkills: inferred });
  } catch (error) {
    next(error);
  }
};

// Candidate DNA & Potential & Behavioral score recalculation
exports.getCandidateDNA = async (req, res, next) => {
  const { candidateId } = req.params;

  try {
    const profile = await CandidateProfile.findOne({ user: candidateId });
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Candidate profile not found' });
    }

    const submissions = await Submission.find({ candidate: candidateId });
    const activities = await ActivityLog.find({ user: candidateId });
    const dnaData = await aiGenerateCandidateDNA(profile, submissions, activities);

    const scores = await CandidateScore.findOneAndUpdate(
      { candidate: candidateId },
      {
        candidate: candidateId,
        dna: dnaData.dna,
        behavioral: dnaData.behavioral,
        potential: dnaData.potential
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, scores });
  } catch (error) {
    next(error);
  }
};

// AI Recruiter Copilot (Chatbot connected to database)
exports.recruiterCopilot = async (req, res, next) => {
  const { messages } = req.body;

  try {
    // 1. Fetch Candidates and details
    const rawCandidates = await User.find({ role: 'candidate' });
    const candidates = [];

    for (const c of rawCandidates) {
      const profile = await CandidateProfile.findOne({ user: c._id });
      const score = await CandidateScore.findOne({ candidate: c._id });
      candidates.push({
        _id: c._id,
        name: c.name,
        email: c.email,
        profile,
        score
      });
    }

    // 2. Fetch Jobs
    const jobs = await Job.find({
      status: 'active',
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    });

    // 3. Send context to Groq AI
    const reply = await aiRecruiterCopilotChat(messages, candidates, jobs);

    res.status(200).json({ success: true, reply });
  } catch (error) {
    next(error);
  }
};
