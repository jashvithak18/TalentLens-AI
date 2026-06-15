const Job = require('../models/Job');
const Application = require('../models/Application');
const CandidateProfile = require('../models/CandidateProfile');
const AIRanking = require('../models/AIRanking');
const Notification = require('../models/Notification');
const { aiEvaluateCandidateFit } = require('../utils/aiHelpers');

// Create Job
exports.createJob = async (req, res, next) => {
  try {
    const jobData = { ...req.body, recruiter: req.user.id };
    const job = await Job.create(jobData);
    res.status(201).json({ success: true, job });
  } catch (error) {
    next(error);
  }
};

// Get all jobs (with query filters)
exports.getJobs = async (req, res, next) => {
  const { search, location, type, minSalary } = req.query;
  const filter = {
    status: 'active',
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  };

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { requiredSkills: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  if (location) {
    filter.location = { $regex: location, $options: 'i' };
  }

  if (type) {
    filter.employmentType = type;
  }

  if (minSalary) {
    filter['salaryRange.min'] = { $gte: Number(minSalary) };
  }

  try {
    const jobs = await Job.find(filter).populate('recruiter', 'name').lean();
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const applicantCount = await Application.countDocuments({ job: job._id });
        return { ...job, applicantCount };
      })
    );
    res.status(200).json({ success: true, count: jobsWithCounts.length, jobs: jobsWithCounts });
  } catch (error) {
    next(error);
  }
};

// Get single job details
exports.getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('recruiter', 'name');
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    res.status(200).json({ success: true, job });
  } catch (error) {
    next(error);
  }
};

// Update job status (archive, close, reopen)
exports.updateJobStatus = async (req, res, next) => {
  const { status } = req.body;
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    // Verify ownership
    if (job.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to modify this job' });
    }

    job.status = status;
    await job.save();

    res.status(200).json({ success: true, job });
  } catch (error) {
    next(error);
  }
};

// Apply to Job
exports.applyJob = async (req, res, next) => {
  const { coverLetter } = req.body;
  const jobId = req.params.id;

  try {
    // Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job || job.status !== 'active') {
      return res.status(400).json({ success: false, error: 'Job is not accepting applications' });
    }

    // Check existing application
    const existingApp = await Application.findOne({ job: jobId, candidate: req.user.id });
    if (existingApp) {
      return res.status(400).json({ success: false, error: 'You have already applied to this job' });
    }

    const application = await Application.create({
      job: jobId,
      candidate: req.user.id,
      coverLetter
    });

    // Log user activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'apply',
      details: `Applied to job: ${job.title} (${jobId})`
    });

    // Notify Recruiter
    await Notification.create({
      recipient: job.recruiter,
      type: 'Job Applied',
      title: 'New Application',
      message: `A candidate has applied for ${job.title}`,
      link: `/recruiter/jobs/${job._id}`
    });

    // Run AI Evaluation in background
    const candidateProfile = await CandidateProfile.findOne({ user: req.user.id });
    if (candidateProfile) {
      try {
        const fitData = await aiEvaluateCandidateFit(job, candidateProfile);
        await AIRanking.findOneAndUpdate(
          { job: jobId, candidate: req.user.id },
          {
            matchScore: fitData.matchScore,
            fitDetails: fitData.fitDetails,
            reasons: fitData.reasons,
            missing: fitData.missing,
            risks: fitData.risks,
            whyNotHigher: fitData.whyNotHigher
          },
          { upsert: true }
        );
      } catch (aiErr) {
        console.error('Background AI Candidate matching failed:', aiErr);
      }
    }

    res.status(201).json({ success: true, application });
  } catch (error) {
    next(error);
  }
};

// Get job applications (Recruiter view)
exports.getJobApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ job: req.params.id })
      .populate('candidate', 'name email')
      .populate({
        path: 'candidate',
        populate: { path: 'profile' }
      });
    res.status(200).json({ success: true, count: applications.length, applications });
  } catch (error) {
    next(error);
  }
};

// Update Application Status (Recruiter view)
exports.updateApplicationStatus = async (req, res, next) => {
  const { status, notes } = req.body;

  try {
    const application = await Application.findById(req.params.id).populate('job');
    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    application.status = status;
    application.timeline.push({
      status,
      notes,
      updatedBy: req.user.id,
      updatedAt: new Date()
    });

    await application.save();

    // Create Notification for Candidate
    await Notification.create({
      recipient: application.candidate,
      type: `Candidate ${status.replace(' ', '')}`,
      title: `Application Status Update`,
      message: `Your application status for "${application.job.title}" has been updated to "${status}".`,
      link: `/candidate/applications`
    });

    res.status(200).json({ success: true, application });
  } catch (error) {
    next(error);
  }
};

// Get candidate applications
exports.getCandidateApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ candidate: req.user.id })
      .populate('job', 'title location employmentType salaryRange')
      .sort('-appliedAt');
    res.status(200).json({ success: true, count: applications.length, applications });
  } catch (error) {
    next(error);
  }
};

// Get AI Rankings for a specific job (JD Simulator Integrated)
exports.getJobRankings = async (req, res, next) => {
  const jobId = req.params.id;
  
  // Custom weights from JD Simulator (if query weights are sent)
  const customWeights = req.query.weights ? JSON.parse(req.query.weights) : null;

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    // Find all evaluations for this job
    const rankings = await AIRanking.find({ job: jobId })
      .populate('candidate', 'name email')
      .populate({
        path: 'candidate',
        populate: [
          { path: 'profile' },
          { path: 'score' }
        ]
      });

    // If custom weights are supplied (JD Simulator action), calculate updated scores in real-time
    const finalRankings = rankings.map(rank => {
      let score = rank.matchScore;
      if (customWeights) {
        // Calculate weighted average
        const fit = rank.fitDetails;
        const totalWeight =
          (customWeights.technicalFit || 0) +
          (customWeights.experienceFit || 0) +
          (customWeights.projectFit || 0) +
          (customWeights.growthFit || 0) +
          (customWeights.behavioralFit || 0);

        if (totalWeight > 0) {
          const weightedSum =
            (fit.technicalFit * (customWeights.technicalFit || 0)) +
            (fit.experienceFit * (customWeights.experienceFit || 0)) +
            (fit.projectFit * (customWeights.projectFit || 0)) +
            (fit.growthFit * (customWeights.growthFit || 0)) +
            (fit.behavioralFit * (customWeights.behavioralFit || 0));

          score = Math.round(weightedSum / totalWeight);
        }
      }

      return {
        ...rank.toObject(),
        matchScore: score // Override with dynamically calculated score
      };
    }).sort((a, b) => b.matchScore - a.matchScore); // Re-rank based on new score

    res.status(200).json({ success: true, rankings: finalRankings });
  } catch (error) {
    next(error);
  }
};
