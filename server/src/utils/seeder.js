const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load models
const User = require('../models/User');
const CandidateProfile = require('../models/CandidateProfile');
const RecruiterProfile = require('../models/RecruiterProfile');
const Job = require('../models/Job');
const Question = require('../models/Question');
const CodingProblem = require('../models/CodingProblem');
const Assessment = require('../models/Assessment');
const Submission = require('../models/Submission');
const CandidateScore = require('../models/CandidateScore');
const AIRanking = require('../models/AIRanking');

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/talentlens-ai');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany();
    await CandidateProfile.deleteMany();
    await RecruiterProfile.deleteMany();
    await Job.deleteMany();
    await Question.deleteMany();
    await CodingProblem.deleteMany();
    await Assessment.deleteMany();
    await Submission.deleteMany();
    await CandidateScore.deleteMany();
    await AIRanking.deleteMany();
    console.log('Cleared existing data.');

    // 1. Create Users
    console.log('Creating users...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const admin = await User.create({
      name: 'Global Admin',
      email: 'admin@talentlens.ai',
      password: hashedPassword,
      role: 'admin',
      isVerified: true
    });

    const recruiter = await User.create({
      name: 'Sarah Connor',
      email: 'sarah@skynet.com',
      password: hashedPassword,
      role: 'recruiter',
      isVerified: true
    });

    const candidate = await User.create({
      name: 'Alex Rivera',
      email: 'alex.rivera@example.com',
      password: hashedPassword,
      role: 'candidate',
      isVerified: true
    });

    // 2. Create Profiles
    await RecruiterProfile.create({
      user: recruiter._id,
      companyName: 'Skynet HRTech',
      companyWebsite: 'https://skynet.com',
      companySize: '51-200',
      companyBio: 'Building the future of automation and artificial intelligence recruiting platforms.',
      title: 'Head of Talent Acquisition'
    });

    const candidateProf = await CandidateProfile.create({
      user: candidate._id,
      title: 'Senior MERN Developer',
      bio: 'Enthusiastic full-stack developer with 5+ years experience scaling responsive web applications.',
      location: 'San Francisco, CA',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      skills: ['React', 'Node.js', 'Express.js', 'MongoDB', 'JavaScript', 'TypeScript', 'Redux', 'HTML5', 'CSS3'],
      inferredSkills: [
        { skill: 'RESTful APIs', source: 'E-commerce Project description', confidence: 95 },
        { skill: 'JWT Auth', source: 'E-commerce Project description', confidence: 92 },
        { skill: 'Database Optimization', source: 'Aggregations inside portfolio analytics', confidence: 85 }
      ],
      experience: [
        {
          company: 'InnoTech Solutions',
          role: 'Full Stack Engineer',
          startDate: new Date('2022-03-01'),
          current: true,
          description: 'Re-architected candidate pipeline resulting in 40% performance gain. Managed team of 4 frontend devs.'
        },
        {
          company: 'ByteLabs',
          role: 'Software Developer',
          startDate: new Date('2020-01-15'),
          endDate: new Date('2022-02-28'),
          current: false,
          description: 'Maintained and deployed REST APIs for custom dashboard systems using Express and PostgreSQL.'
        }
      ],
      education: [
        {
          institution: 'Stanford University',
          degree: 'Bachelor of Science',
          fieldOfStudy: 'Computer Science',
          grade: 'GPA 3.8'
        }
      ],
      projects: [
        {
          title: 'E-Commerce Platform Microservice',
          description: 'A scalable checkout api service handling high request rates using JWT validation and Stripe gateway integrations.',
          technologies: ['Node.js', 'Express.js', 'MongoDB', 'JWT'],
          githubLink: 'https://github.com/alexrivera/ecommerce-checkout'
        }
      ],
      certifications: [
        {
          name: 'AWS Certified Cloud Practitioner',
          issuer: 'Amazon Web Services',
          issueDate: new Date('2023-05-12')
        }
      ],
      resumeUrl: '/uploads/sample_resume.pdf',
      resumeParsingConfidence: 94
    });

    // 3. Create Jobs
    console.log('Creating jobs...');
    const job1 = await Job.create({
      recruiter: recruiter._id,
      title: 'Senior MERN Developer',
      description: 'Looking for a Senior Software Engineer with deep expertise in React, Node.js, and MongoDB. Must have experience optimizing database performance, implementing JWT, and scaling Express servers.',
      requiredSkills: ['React', 'Node.js', 'MongoDB', 'Express.js', 'JavaScript'],
      preferredSkills: ['TypeScript', 'AWS', 'Redux Toolkit'],
      experience: 4,
      salaryRange: { min: 110000, max: 150000 },
      location: 'Remote, US',
      employmentType: 'full-time',
      status: 'active'
    });

    const job2 = await Job.create({
      recruiter: recruiter._id,
      title: 'Frontend Specialist (React)',
      description: 'Join our design systems team to build responsive component libraries in React and Tailwind CSS.',
      requiredSkills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS'],
      preferredSkills: ['TypeScript', 'Figma'],
      experience: 2,
      salaryRange: { min: 80000, max: 110000 },
      location: 'San Francisco, CA',
      employmentType: 'full-time',
      status: 'active'
    });

    // 4. Create Questions & Problems
    console.log('Creating assessment configs...');
    const q1 = await Question.create({
      text: 'Which hook should be used to memoize complex computations in React?',
      options: ['useCallback', 'useMemo', 'useEffect', 'useRef'],
      correctOption: 1, // useMemo
      category: 'React',
      difficulty: 'medium'
    });

    const q2 = await Question.create({
      text: 'What is the purpose of middleware in Express.js?',
      options: [
        'To style client side templates',
        'To handle DB drivers',
        'To intercept and execute code on request/response cycles',
        'To load configuration properties'
      ],
      correctOption: 2, // Intercept request/response
      category: 'Node.js',
      difficulty: 'easy'
    });

    const codingProblem = await CodingProblem.create({
      title: 'Two Sum Problem',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nWrite your function as `function solution(input) { ... }` where input is an object containing `{ nums: Array, target: Number }`. Return an array `[index1, index2]`.',
      difficulty: 'easy',
      category: 'DSA',
      templates: [
        {
          language: 'javascript',
          code: 'function solution(input) {\n  const { nums, target } = input;\n  // Write your code here\n}'
        }
      ],
      testCases: [
        { input: '{ nums: [2, 7, 11, 15], target: 9 }', output: '[0, 1]' },
        { input: '{ nums: [3, 2, 4], target: 6 }', output: '[1, 2]' }
      ]
    });

    // 5. Create Assessment config
    const testAssessment = await Assessment.create({
      title: 'React & JavaScript Technical Assessment',
      description: 'Tests memoization, hook lifecycle rules, and JavaScript optimization techniques.',
      type: 'mcq',
      category: 'React',
      duration: 15,
      passingScore: 60,
      questions: [q1._id, q2._id],
      createdBy: recruiter._id
    });

    const codingAssessment = await Assessment.create({
      title: 'JavaScript DSA Coding Assessment',
      description: 'Solve real-time algorithm questions to prove problem-solving depth.',
      type: 'coding',
      category: 'DSA',
      duration: 30,
      passingScore: 50,
      codingProblems: [codingProblem._id],
      createdBy: recruiter._id
    });

    // 6. Seed Submissions & AI Scores
    console.log('Seeding candidate scores & submissions...');
    const sub = await Submission.create({
      candidate: candidate._id,
      assessment: testAssessment._id,
      status: 'completed',
      mcqAnswers: [
        { question: q1._id, selectedOption: 1, isCorrect: true, pointsAwarded: 10 },
        { question: q2._id, selectedOption: 2, isCorrect: true, pointsAwarded: 10 }
      ],
      score: 100,
      timeTaken: 120,
      completedAt: new Date()
    });

    await CandidateScore.create({
      candidate: candidate._id,
      dna: {
        problemSolving: 90,
        technicalDepth: 88,
        communication: 82,
        leadership: 60,
        adaptability: 85,
        reliability: 90,
        learningVelocity: 94,
        consistency: 92
      },
      behavioral: {
        learningScore: 92,
        consistencyScore: 90,
        reliabilityScore: 89,
        growthScore: 95,
        adaptabilityScore: 84
      },
      potential: {
        currentCapability: 85,
        futureGrowthPotential: 94,
        careerAccelerationScore: 90,
        learningVelocity: 95,
        reasoning: 'Exceptional test record. Demonstrates high adaptability and solid technical understanding of database architecture.'
      }
    });

    // 7. Seed AI Matching ranking
    await AIRanking.create({
      job: job1._id,
      candidate: candidate._id,
      matchScore: 88,
      fitDetails: {
        technicalFit: 92,
        experienceFit: 85,
        projectFit: 90,
        growthFit: 95,
        behavioralFit: 80
      },
      reasons: [
        'Exceptional React and Node.js alignment.',
        'High assessment score (100%) in Core React test.',
        'Inferred skill overlap includes RESTful APIs and JWT authentication.'
      ],
      missing: [
        'AWS Certified Practitioner is basic, doesn\'t show deep DevOps automation.'
      ],
      risks: {
        skillGap: { score: 15, explanation: 'Minor gap in cloud deployment tools.' },
        experience: { score: 10, explanation: '5 years of professional work meets the requirements.' },
        communication: { score: 15, explanation: 'Coached team of developers.' },
        team: { score: 20, explanation: 'High reliability index.' },
        assessment: { score: 5, explanation: 'Scored 100% in React MCQs.' }
      },
      whyNotHigher: {
        reasons: ['Lacks Docker/Kubernetes containerization experience.'],
        improvementAreas: ['Obtain AWS Certified Developer Associate or study Docker deployment.']
      }
    });

    console.log('Database seeded successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
