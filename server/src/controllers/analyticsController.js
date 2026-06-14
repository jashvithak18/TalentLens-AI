const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Assessment = require('../models/Assessment');
const CandidateProfile = require('../models/CandidateProfile');
const CandidateScore = require('../models/CandidateScore');
const Submission = require('../models/Submission');

// Recruiter analytics summary
exports.getRecruiterAnalytics = async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiter: req.user.id });
    const jobIds = jobs.map(j => j._id);

    const totalJobs = jobs.length;
    const totalCandidates = await User.countDocuments({ role: 'candidate' });
    const totalApplications = await Application.countDocuments({ job: { $in: jobIds } });

    // Funnel stats
    const statusGroups = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const funnel = {
      applied: 0,
      underReview: 0,
      assessmentPending: 0,
      assessmentCompleted: 0,
      shortlisted: 0,
      interviewScheduled: 0,
      selected: 0,
      rejected: 0
    };

    statusGroups.forEach(grp => {
      // Convert "Interview Scheduled" -> "interviewScheduled" (remove all spaces, lowercase first char)
      const raw = grp._id.replace(/\s+/g, '');
      const key = raw.charAt(0).toLowerCase() + raw.slice(1);
      if (Object.prototype.hasOwnProperty.call(funnel, key)) {
        funnel[key] = grp.count;
      }
    });

    // Skill demand: count most requested skills in active jobs
    const skillList = await Job.aggregate([
      { $match: { status: 'active' } },
      { $unwind: '$requiredSkills' },
      { $group: { _id: { $toLower: '$requiredSkills' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);

    res.status(200).json({
      success: true,
      kpis: {
        totalJobs,
        totalCandidates,
        totalApplications,
        interviews: funnel.interviewScheduled,
        hires: funnel.selected
      },
      funnel,
      skillDemand: skillList.map(s => ({ name: s._id, count: s.count }))
    });
  } catch (error) {
    next(error);
  }
};

// Talent Discovery Dashboard (Underrated, top tech, emerging, highest potential, most consistent)
exports.getTalentDiscovery = async (req, res, next) => {
  try {
    const candidates = await CandidateProfile.find()
      .populate('user', 'name email')
      .lean();

    const scores = await CandidateScore.find().lean();

    // Map scores to candidates
    const candidatesWithScores = candidates.map(c => {
      const candScore = scores.find(s => s.candidate.toString() === c.user._id.toString()) || {
        dna: { problemSolving: 50, technicalDepth: 50, consistency: 50 },
        potential: { futureGrowthPotential: 50 },
        behavioral: { learningScore: 50, consistencyScore: 50 }
      };
      return { ...c, score: candScore };
    });

    // 1. Underrated Talent: Low years of experience (< 2 years) but high future growth potential (> 80)
    const underrated = candidatesWithScores.filter(c => {
      const yearsExp = c.experience ? c.experience.length : 0;
      const potential = c.score?.potential?.futureGrowthPotential || 50;
      return yearsExp <= 2 && potential >= 80;
    }).slice(0, 6);

    // 2. Top Technical Talent: High technical depth and problem solving
    const topTechnical = [...candidatesWithScores].sort((a, b) => {
      const scoreA = (a.score?.dna?.problemSolving || 50) + (a.score?.dna?.technicalDepth || 50);
      const scoreB = (b.score?.dna?.problemSolving || 50) + (b.score?.dna?.technicalDepth || 50);
      return scoreB - scoreA;
    }).slice(0, 6);

    // 3. Highest Potential Talent: High future growth potential
    const highestPotential = [...candidatesWithScores].sort((a, b) => {
      return (b.score?.potential?.futureGrowthPotential || 50) - (a.score?.potential?.futureGrowthPotential || 50);
    }).slice(0, 6);

    // 4. Most Consistent Candidates: High consistency scores
    const mostConsistent = [...candidatesWithScores].sort((a, b) => {
      return (b.score?.dna?.consistency || 50) - (a.score?.dna?.consistency || 50);
    }).slice(0, 6);

    res.status(200).json({
      success: true,
      discovery: {
        underrated,
        topTechnical,
        highestPotential,
        mostConsistent
      }
    });
  } catch (error) {
    next(error);
  }
};

// Platform administration metrics (Admin Dashboard)
exports.getPlatformAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCandidates = await User.countDocuments({ role: 'candidate' });
    const totalRecruiters = await User.countDocuments({ role: 'recruiter' });
    const totalJobs = await Job.countDocuments();
    const totalAssessments = await Assessment.countDocuments();
    const totalSubmissions = await Submission.countDocuments();

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalCandidates,
        totalRecruiters,
        totalJobs,
        totalAssessments,
        totalSubmissions
      }
    });
  } catch (error) {
    next(error);
  }
};
