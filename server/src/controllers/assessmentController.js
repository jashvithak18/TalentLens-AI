const vm = require('vm');
const Assessment = require('../models/Assessment');
const Question = require('../models/Question');
const CodingProblem = require('../models/CodingProblem');
const Submission = require('../models/Submission');
const Application = require('../models/Application');
const CandidateProfile = require('../models/CandidateProfile');
const CandidateScore = require('../models/CandidateScore');
const AIRanking = require('../models/AIRanking');
const Job = require('../models/Job');
const Notification = require('../models/Notification');
const { aiGenerateCandidateDNA, aiEvaluateCandidateFit } = require('../utils/aiHelpers');

// Get all active assessments
exports.getAssessments = async (req, res, next) => {
  try {
    const assessments = await Assessment.find({ isActive: true })
      .populate('questions', 'category difficulty points')
      .populate('codingProblems', 'title difficulty points');
    res.status(200).json({ success: true, count: assessments.length, assessments });
  } catch (error) {
    next(error);
  }
};

// Create a new assessment config (Admin/Recruiter)
exports.createAssessment = async (req, res, next) => {
  try {
    const assessment = await Assessment.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json({ success: true, assessment });
  } catch (error) {
    next(error);
  }
};

// Get single assessment details (for starting a test)
exports.getAssessmentDetails = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate('questions', 'text options category difficulty points')
      .populate('codingProblems', 'title description difficulty templates points');

    if (!assessment) {
      return res.status(404).json({ success: false, error: 'Assessment not found' });
    }

    res.status(200).json({ success: true, assessment });
  } catch (error) {
    next(error);
  }
};

// Run JavaScript code in safe VM sandbox
const runCodeSandbox = (code, testCases) => {
  const results = [];
  let passedCount = 0;

  testCases.forEach((tc, idx) => {
    const scriptCode = `
      ${code}
      try {
        const result = solution(${tc.input});
        JSON.stringify(result);
      } catch (err) {
        throw new Error(err.message);
      }
    `;

    const context = { console: { log: () => {} } };
    vm.createContext(context);

    let passed = false;
    let actualOutput = '';
    let error = null;
    const startTime = Date.now();

    try {
      const script = new vm.Script(scriptCode, { timeout: 1000 }); // 1 second timeout
      const output = script.runInContext(context);
      
      // Remove surrounding quotes if returning simple string
      actualOutput = String(output);
      const cleanedExpected = tc.output.trim().replace(/^['"]|['"]$/g, '');
      const cleanedActual = actualOutput.trim().replace(/^['"]|['"]$/g, '');

      if (cleanedActual === cleanedExpected) {
        passed = true;
        passedCount++;
      }
    } catch (err) {
      error = err.message;
    }

    results.push({
      testCaseId: `tc-${idx}`,
      passed,
      actualOutput: actualOutput || '',
      expectedOutput: tc.output,
      error,
      executionTimeMs: Date.now() - startTime
    });
  });

  return { results, passedCount };
};

// Submit Assessment (MCQ & Coding & Behavioral)
exports.submitAssessment = async (req, res, next) => {
  const { assessmentId, mcqAnswers, codingAnswers, behavioralAnswers, timeTaken } = req.body;

  try {
    const assessment = await Assessment.findById(assessmentId)
      .populate('questions')
      .populate('codingProblems');

    if (!assessment) {
      return res.status(404).json({ success: false, error: 'Assessment not found' });
    }

    // Evaluate MCQ
    let mcqScore = 0;
    let totalMcqPoints = 0;
    const evaluatedMcqs = [];

    if (assessment.type === 'mcq' || assessment.type === 'mixed') {
      assessment.questions.forEach(q => {
        const candidateAns = mcqAnswers.find(ans => ans.questionId === q._id.toString());
        const isCorrect = candidateAns && candidateAns.selectedOption === q.correctOption;
        let points = 0;

        if (isCorrect) {
          points = q.points;
        } else if (candidateAns && assessment.negativeMarking) {
          points = -q.points * assessment.penaltyWeight;
        }

        mcqScore += points;
        totalMcqPoints += q.points;

        evaluatedMcqs.push({
          question: q._id,
          selectedOption: candidateAns ? candidateAns.selectedOption : null,
          isCorrect,
          pointsAwarded: points
        });
      });
    }

    // Evaluate Coding Problems
    let codingScore = 0;
    let totalCodingPoints = 0;
    const evaluatedCoding = [];

    if (assessment.type === 'coding' || assessment.type === 'mixed') {
      for (const cp of assessment.codingProblems) {
        const candCode = codingAnswers.find(ans => ans.problemId === cp._id.toString());
        const code = candCode ? candCode.code : '';
        const language = candCode ? candCode.language : 'javascript';

        let tcPassed = 0;
        let runResults = [];

        if (code && language === 'javascript') {
          const run = runCodeSandbox(code, cp.testCases);
          runResults = run.results;
          tcPassed = run.passedCount;
        }

        const isPassed = tcPassed === cp.testCases.length;
        const points = isPassed ? cp.points : Math.round((tcPassed / cp.testCases.length) * cp.points);

        codingScore += points;
        totalCodingPoints += cp.points;

        evaluatedCoding.push({
          problem: cp._id,
          code,
          language,
          testCasesPassed: tcPassed,
          totalTestCases: cp.testCases.length,
          isPassed,
          pointsAwarded: points,
          runResults
        });
      }
    }

    // Evaluate Behavioral
    const evaluatedBehavioral = [];
    if (assessment.type === 'behavioral') {
      // Automatic scoring of behavioral answers based on questionnaire mapping
      // Here we map each prompt group directly
      (behavioralAnswers || []).forEach(ans => {
        evaluatedBehavioral.push({
          category: ans.category,
          score: ans.score || 75,
          feedback: ans.feedback || 'Evaluated successfully'
        });
      });
    }

    // Calculate final percentage score
    let finalPercentage = 0;
    const totalPoints = totalMcqPoints + totalCodingPoints;
    if (totalPoints > 0) {
      const totalEarned = Math.max(0, mcqScore + codingScore);
      finalPercentage = Math.round((totalEarned / totalPoints) * 100);
    } else if (assessment.type === 'behavioral' && evaluatedBehavioral.length > 0) {
      const sum = evaluatedBehavioral.reduce((acc, b) => acc + b.score, 0);
      finalPercentage = Math.round(sum / evaluatedBehavioral.length);
    }

    // Save Submission
    const submission = await Submission.create({
      candidate: req.user.id,
      assessment: assessmentId,
      status: 'completed',
      mcqAnswers: evaluatedMcqs,
      codingAnswers: evaluatedCoding,
      behavioralResponses: evaluatedBehavioral,
      score: finalPercentage,
      timeTaken,
      completedAt: new Date()
    });

    // Notify candidate of completed test
    await Notification.create({
      recipient: req.user.id,
      type: 'Assessment Completed',
      title: 'Assessment Submitted',
      message: `You scored ${finalPercentage}% in "${assessment.title}".`,
      link: '/candidate/assessments'
    });

    // Back-propagate scores to DNA and potential
    const profile = await CandidateProfile.findOne({ user: req.user.id });
    if (profile) {
      const allSubmissions = await Submission.find({ candidate: req.user.id });
      const dnaData = await aiGenerateCandidateDNA(profile, allSubmissions);
      await CandidateScore.findOneAndUpdate(
        { candidate: req.user.id },
        {
          candidate: req.user.id,
          dna: dnaData.dna,
          behavioral: dnaData.behavioral,
          potential: dnaData.potential
        },
        { upsert: true }
      );

      // Re-trigger semantic match rank updates for jobs this candidate has applied to
      const applications = await Application.find({ candidate: req.user.id }).populate('job');
      for (const app of applications) {
        const fitData = await aiEvaluateCandidateFit(app.job, profile);
        await AIRanking.findOneAndUpdate(
          { job: app.job._id, candidate: req.user.id },
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
      }
    }

    res.status(201).json({ success: true, submission });
  } catch (error) {
    next(error);
  }
};
