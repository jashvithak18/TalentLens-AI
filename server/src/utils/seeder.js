const mongoose = require('mongoose');
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
const Application = require('../models/Application');

const seedData = async (shouldCloseConnection = false) => {
  try {
    // Clear existing collections for a clean slate
    await User.deleteMany();
    await CandidateProfile.deleteMany();
    await RecruiterProfile.deleteMany();
    await Job.deleteMany();
    await Application.deleteMany();
    await Question.deleteMany();
    await CodingProblem.deleteMany();
    await Assessment.deleteMany();
    await Submission.deleteMany();
    await CandidateScore.deleteMany();
    await AIRanking.deleteMany();
    console.log('Cleared existing data for seeding.');

    // 1. Create Users
    const defaultPassword = 'password123';

    const admin = await User.create({
      name: 'Global Admin',
      email: 'admin@talentlens.ai',
      password: defaultPassword,
      role: 'admin',
      isVerified: true
    });

    const recruiter = await User.create({
      name: 'Jashvi Thakkar (Recruiter)',
      email: 'jashvithak00@gmail.com',
      password: defaultPassword,
      role: 'recruiter',
      isVerified: true
    });

    await RecruiterProfile.create({
      user: recruiter._id,
      companyName: 'TalentLens AI Corp',
      companyWebsite: 'https://talentlens.ai',
      companySize: '51-200',
      companyBio: 'Building the next generation of AI-powered talent intelligence and recruitment automation platforms.',
      title: 'Lead Recruiter'
    });

    // 2. Create Jobs (with 6-month expiry)
    const expiryDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000); // 6 months from now

    const job1 = await Job.create({
      recruiter: recruiter._id,
      title: 'Senior MERN Developer',
      description: 'Looking for a Senior Software Engineer with deep expertise in React, Node.js, and MongoDB. Must have experience optimizing database performance, implementing JWT, and scaling Express servers.',
      requiredSkills: ['React', 'Node.js', 'MongoDB', 'Express.js', 'JavaScript'],
      preferredSkills: ['TypeScript', 'AWS', 'Redux Toolkit'],
      experience: 4,
      salaryRange: { min: 1200000, max: 2000000 },
      location: 'Remote, India',
      employmentType: 'full-time',
      status: 'active',
      expiresAt: expiryDate
    });

    const job2 = await Job.create({
      recruiter: recruiter._id,
      title: 'AI / ML Engineer',
      description: 'Looking for an AI/ML Engineer to deploy generative models and integrate agent frameworks. Experience with PyTorch, TensorFlow, and REST APIs is required.',
      requiredSkills: ['Python', 'TensorFlow', 'PyTorch', 'REST APIs', 'Algorithms'],
      preferredSkills: ['FastAPI', 'Docker', 'Machine Learning'],
      experience: 2,
      salaryRange: { min: 900000, max: 1500000 },
      location: 'Bengaluru, Karnataka',
      employmentType: 'full-time',
      status: 'active',
      expiresAt: expiryDate
    });

    const job3 = await Job.create({
      recruiter: recruiter._id,
      title: 'Frontend Specialist (React)',
      description: 'Join our design systems team to build responsive component libraries in React and Tailwind CSS.',
      requiredSkills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS'],
      preferredSkills: ['TypeScript', 'Figma', 'Next.js'],
      experience: 2,
      salaryRange: { min: 600000, max: 1000000 },
      location: 'Mumbai, Maharashtra',
      employmentType: 'full-time',
      status: 'active',
      expiresAt: expiryDate
    });

    const job4 = await Job.create({
      recruiter: recruiter._id,
      title: 'DevOps & Cloud Specialist',
      description: 'Responsible for building robust, scalable cloud architectures, container orchestration, and automating deployment pipelines using Docker, Kubernetes, and AWS.',
      requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
      preferredSkills: ['Terraform', 'Linux', 'Python'],
      experience: 4,
      salaryRange: { min: 1500000, max: 2500000 },
      location: 'Hyderabad, Telangana',
      employmentType: 'full-time',
      status: 'active',
      expiresAt: expiryDate
    });

    const job5 = await Job.create({
      recruiter: recruiter._id,
      title: 'Backend Developer (Node.js & Go)',
      description: 'Develop low-latency REST and gRPC API microservices, database design, and caching systems.',
      requiredSkills: ['Node.js', 'Express.js', 'MongoDB', 'SQL', 'Go'],
      preferredSkills: ['Redis', 'RESTful APIs', 'Docker'],
      experience: 3,
      salaryRange: { min: 800000, max: 1300000 },
      location: 'Pune, Maharashtra',
      employmentType: 'full-time',
      status: 'active',
      expiresAt: expiryDate
    });

    // 3. Create Questions & Problems
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

    // Create Assessment configs
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

    // 4. Define 12 Diverse Candidates
    const candidatesData = [
      {
        name: 'Rohan Sharma',
        email: 'rohan.sharma@example.com',
        title: 'Senior MERN Developer',
        location: 'Bengaluru, Karnataka',
        skills: ['React', 'Node.js', 'Express.js', 'MongoDB', 'JavaScript', 'TypeScript', 'Redux', 'HTML5', 'CSS3'],
        bio: 'Enthusiastic full-stack developer with 5+ years experience scaling responsive web applications in Indian startups.',
        experience: [{ company: 'InnoTech Solutions Bengaluru', role: 'Full Stack Engineer', startDate: new Date('2022-03-01'), current: true, description: 'Re-architected candidate pipeline resulting in 40% performance gain.' }],
        education: [{ institution: 'IIT Bombay', degree: 'Bachelor of Technology', fieldOfStudy: 'Computer Science', grade: 'CGPA 9.2' }],
        projects: [{ title: 'E-Commerce Platform Microservice', description: 'A scalable checkout api service using JWT and Razorpay gateway.', technologies: ['Node.js', 'Express.js', 'MongoDB', 'JWT'] }],
        score: 100,
        matchScore: 94,
        dna: { problemSolving: 92, technicalDepth: 90, communication: 85, leadership: 70, adaptability: 88, reliability: 94, learningVelocity: 92, consistency: 95 },
        behavioral: { learningScore: 94, consistencyScore: 96, reliabilityScore: 95, growthScore: 92, adaptabilityScore: 88 },
        potential: { currentCapability: 90, futureGrowthPotential: 95, careerAccelerationScore: 93, learningVelocity: 94, reasoning: 'Top scores on technical assessments, solid projects, and rapid skill acquisition.' },
        reasons: ['Outstanding React & Node.js match.', 'Scored 100% on the core React MCQ test.', 'Has production experience in MongoDB checkout microservices.'],
        missing: ['AWS certifications are elementary.'],
        risks: { skillGap: { score: 10, explanation: 'Lacks deep DevOps Kubernetes.' }, experience: { score: 5, explanation: 'Exceeds the requirements.' } }
      },
      {
        name: 'Anjali Rao',
        email: 'anjali.rao@example.com',
        title: 'Frontend Specialist (React)',
        location: 'Mumbai, Maharashtra',
        skills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Figma', 'Redux'],
        bio: 'Frontend developer focused on building pixel-perfect responsive user interfaces and robust design systems for leading Indian fintechs.',
        experience: [{ company: 'WebFlow Agency India', role: 'Frontend Developer', startDate: new Date('2023-01-01'), current: true, description: 'Built complex dashboards using Tailwind and React.' }],
        education: [{ institution: 'BITS Pilani', degree: 'Bachelor of Engineering', fieldOfStudy: 'Computer Science', grade: 'CGPA 8.8' }],
        projects: [{ title: 'Component Library', description: 'Reusable custom web component kit with dark/light themes.', technologies: ['React', 'Tailwind CSS', 'Figma'] }],
        score: 80,
        matchScore: 88,
        dna: { problemSolving: 78, technicalDepth: 82, communication: 90, leadership: 65, adaptability: 85, reliability: 88, learningVelocity: 85, consistency: 80 },
        behavioral: { learningScore: 84, consistencyScore: 82, reliabilityScore: 88, growthScore: 80, adaptabilityScore: 86 },
        potential: { currentCapability: 82, futureGrowthPotential: 88, careerAccelerationScore: 84, learningVelocity: 85, reasoning: 'Strong design/interactive capabilities and highly collaborative communication.' },
        reasons: ['Excellent Tailwind and Figma experience.', 'Scored 80% on frontend coding evaluations.', 'Active in design systems and layout architecture.'],
        missing: ['No backend Node.js or database experience.'],
        risks: { skillGap: { score: 35, explanation: 'Significant gaps in backend and data structures.' }, experience: { score: 15, explanation: 'Meets the basic frontend experience requirements.' } }
      },
      {
        name: 'Aarav Mehta',
        email: 'aarav.mehta@example.com',
        title: 'Python & Machine Learning Engineer',
        location: 'Hyderabad, Telangana',
        skills: ['Python', 'SQL', 'TensorFlow', 'Data Structures', 'Algorithms', 'FastAPI', 'Pandas', 'Docker'],
        bio: 'Data structures enthusiast and machine learning engineer with a focus on prediction algorithms and data pipelines.',
        experience: [{ company: 'DataCore Labs Hyderabad', role: 'ML Engineer', startDate: new Date('2021-06-01'), current: true, description: 'Engineered analytics engines running on Python FastAPI.' }],
        education: [{ institution: 'IIIT Hyderabad', degree: 'B.Tech & MS Dual Degree', fieldOfStudy: 'Computer Science & Data Sciences', grade: 'CGPA 9.5' }],
        projects: [{ title: 'Predictive Pipeline', description: 'Real-time forecasting script with automated ETL.', technologies: ['Python', 'FastAPI', 'Docker'] }],
        score: 95,
        matchScore: 72, // Low technical MERN match, high algorithms
        dna: { problemSolving: 96, technicalDepth: 92, communication: 70, leadership: 60, adaptability: 75, reliability: 92, learningVelocity: 95, consistency: 94 },
        behavioral: { learningScore: 92, consistencyScore: 94, reliabilityScore: 93, growthScore: 90, adaptabilityScore: 78 },
        potential: { currentCapability: 88, futureGrowthPotential: 93, careerAccelerationScore: 91, learningVelocity: 95, reasoning: 'Brilliant algorithmic abilities but missing specific MERN technologies.' },
        reasons: ['Highest score on coding problems (Two Sum completed in under 5 minutes).', 'Solid database indexing knowledge.'],
        missing: ['No React.js experience.', 'Lacks HTML/CSS knowledge.'],
        risks: { skillGap: { score: 55, explanation: 'Missing core frontend React stack.' }, experience: { score: 10, explanation: 'Highly proficient backend skills.' } }
      },
      {
        name: 'Priya Nair',
        email: 'priya.nair@example.com',
        title: 'QA & Automation Engineer',
        location: 'Pune, Maharashtra',
        skills: ['JavaScript', 'Cypress', 'Playwright', 'Selenium', 'CI/CD', 'Git', 'Node.js'],
        bio: 'Detail-oriented QA engineer dedicated to end-to-end integration testing and automated release pipelines for Indian SaaS projects.',
        experience: [{ company: 'QualityFirst India', role: 'Test Automation Lead', startDate: new Date('2022-02-01'), current: true, description: 'Decreased production bug leakage by 35% using Cypress.' }],
        education: [{ institution: 'NIT Trichy', degree: 'Bachelor of Technology', fieldOfStudy: 'Electronics & Communication', grade: 'CGPA 8.2' }],
        projects: [{ title: 'CI Automation Framework', description: 'Automated test suite running on Github Actions.', technologies: ['Playwright', 'Git', 'CI/CD'] }],
        score: 75,
        matchScore: 65,
        dna: { problemSolving: 72, technicalDepth: 68, communication: 85, leadership: 75, adaptability: 80, reliability: 92, learningVelocity: 82, consistency: 88 },
        behavioral: { learningScore: 80, consistencyScore: 90, reliabilityScore: 92, growthScore: 84, adaptabilityScore: 82 },
        potential: { currentCapability: 74, futureGrowthPotential: 82, careerAccelerationScore: 78, learningVelocity: 82, reasoning: 'Strong reliability and structured testing experience, moderate dev skills.' },
        reasons: ['Familiar with JavaScript/Node.', 'Very high consistency indexes.'],
        missing: ['Lacks active application development and database design.'],
        risks: { skillGap: { score: 45, explanation: 'Lacks core app development skills.' }, experience: { score: 10, explanation: 'Has 4 years in software testing.' } }
      },
      {
        name: 'Vikram Malhotra',
        email: 'vikram.malhotra@example.com',
        title: 'DevOps & Cloud Infrastructure Engineer',
        location: 'Delhi NCR',
        skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux', 'Python', 'Node.js'],
        bio: 'Infrastructure specialist building robust, scalable cloud architectures and automated pipelines for Indian enterprises.',
        experience: [{ company: 'CloudWorks Delhi', role: 'DevOps Architect', startDate: new Date('2020-09-01'), current: true, description: 'Migrated monolithic app to Kubernetes cluster.' }],
        education: [{ institution: 'IIT Delhi', degree: 'B.Tech', fieldOfStudy: 'Computer Engineering', grade: 'CGPA 8.0' }],
        projects: [{ title: 'Terraform AWS Setup', description: 'Infrastructure-as-code deployment scripts.', technologies: ['Terraform', 'AWS'] }],
        score: 70,
        matchScore: 68,
        dna: { problemSolving: 85, technicalDepth: 94, communication: 72, leadership: 80, adaptability: 90, reliability: 88, learningVelocity: 88, consistency: 85 },
        behavioral: { learningScore: 86, consistencyScore: 84, reliabilityScore: 88, growthScore: 92, adaptabilityScore: 90 },
        potential: { currentCapability: 86, futureGrowthPotential: 90, careerAccelerationScore: 88, learningVelocity: 88, reasoning: 'Excellent containerization and deployment knowledge, minimal UI development.' },
        reasons: ['Outstanding AWS, Docker, and Kubernetes expertise.', 'Node.js scripting abilities.'],
        missing: ['No React or frontend design knowledge.'],
        risks: { skillGap: { score: 50, explanation: 'No frontend development experience.' }, experience: { score: 5, explanation: '6+ years in systems engineering.' } }
      },
      {
        name: 'Siddharth Mehta',
        email: 'siddharth.mehta@example.com',
        title: 'Backend Systems Developer',
        location: 'Chennai, Tamil Nadu',
        skills: ['Go', 'Java', 'PostgreSQL', 'Redis', 'Docker', 'MongoDB', 'RESTful APIs', 'gRPC'],
        bio: 'High-performance API developer focusing on low-latency microservices and database clustering in Chennai tech hubs.',
        experience: [{ company: 'CoreSystems Chennai', role: 'Backend Dev', startDate: new Date('2021-01-01'), current: true, description: 'Optimized sql queries reducing response time by 50%.' }],
        education: [{ institution: 'IIT Madras', degree: 'M.Tech', fieldOfStudy: 'Computer Science', grade: 'CGPA 9.0' }],
        projects: [{ title: 'Distributed Cache System', description: 'gRPC based memory caching mechanism.', technologies: ['Go', 'Redis', 'gRPC'] }],
        score: 85,
        matchScore: 78,
        dna: { problemSolving: 90, technicalDepth: 88, communication: 76, leadership: 60, adaptability: 80, reliability: 92, learningVelocity: 88, consistency: 90 },
        behavioral: { learningScore: 86, consistencyScore: 92, reliabilityScore: 93, growthScore: 85, adaptabilityScore: 82 },
        potential: { currentCapability: 84, futureGrowthPotential: 88, careerAccelerationScore: 86, learningVelocity: 88, reasoning: 'Superb database scaling and microservice knowledge, missing UI layer.' },
        reasons: ['Excellent MongoDB and RESTful API structures.', 'High problem-solving scores.'],
        missing: ['No React or CSS/HTML layouts.'],
        risks: { skillGap: { score: 40, explanation: 'Missing frontend interactive libraries.' }, experience: { score: 8, explanation: 'Solid backend history.' } }
      },
      {
        name: 'Kavya Iyer',
        email: 'kavya.iyer@example.com',
        title: 'UI/UX Designer & Developer',
        location: 'Gurugram, Haryana',
        skills: ['React', 'Tailwind CSS', 'Figma', 'JavaScript', 'HTML5', 'CSS3', 'Next.js'],
        bio: 'Bridging the gap between gorgeous designs and scalable front-end code bases for Indian internet consumer apps.',
        experience: [{ company: 'CreativeTech Gurgaon', role: 'UI Engineer', startDate: new Date('2023-03-01'), current: true, description: 'Designed and implemented main landing flows.' }],
        education: [{ institution: 'IIT Kharagpur', degree: 'Bachelor of Architecture & Design', fieldOfStudy: 'Visual Communication', grade: 'CGPA 8.7' }],
        projects: [{ title: 'App Redesign Mockups', description: 'Interactive prototypes built in Figma and converted to Tailwind.', technologies: ['Figma', 'Tailwind CSS', 'React'] }],
        score: 75,
        matchScore: 84,
        dna: { problemSolving: 74, technicalDepth: 76, communication: 94, leadership: 70, adaptability: 92, reliability: 85, learningVelocity: 90, consistency: 82 },
        behavioral: { learningScore: 90, consistencyScore: 80, reliabilityScore: 86, growthScore: 88, adaptabilityScore: 92 },
        potential: { currentCapability: 80, futureGrowthPotential: 90, careerAccelerationScore: 86, learningVelocity: 90, reasoning: 'Creative visual designs and fast adaptation to frontend interactive libraries.' },
        reasons: ['Top tier CSS, Tailwind, and Figma layouts.', 'Reasonable core React knowledge.'],
        missing: ['Lacks backend database architecture experience.'],
        risks: { skillGap: { score: 30, explanation: 'No SQL/NoSQL databases.' }, experience: { score: 10, explanation: '3 years experience.' } }
      },
      {
        name: 'Kabir Patel',
        email: 'kabir.patel@example.com',
        title: 'Junior Frontend Developer',
        location: 'Kolkata, West Bengal',
        skills: ['JavaScript', 'React', 'HTML5', 'CSS3', 'Git', 'Tailwind CSS'],
        bio: 'Self-taught developer from Kolkata with high curiosity and motivation to scale development capabilities.',
        experience: [{ company: 'Local Kolkata Startups', role: 'Contractor', startDate: new Date('2025-05-01'), current: true, description: 'Helped bootstrap startup components.' }],
        education: [{ institution: 'Delhi Technological University', degree: 'Bachelor of Technology', fieldOfStudy: 'Information Technology', grade: 'CGPA 7.8' }],
        projects: [{ title: 'Portfolio Website', description: 'Personal blog and coding challenge collection.', technologies: ['React', 'CSS3'] }],
        score: 65,
        matchScore: 70,
        dna: { problemSolving: 76, technicalDepth: 65, communication: 82, leadership: 50, adaptability: 94, reliability: 80, learningVelocity: 96, consistency: 78 },
        behavioral: { learningScore: 96, consistencyScore: 75, reliabilityScore: 82, growthScore: 95, adaptabilityScore: 94 },
        potential: { currentCapability: 68, futureGrowthPotential: 94, careerAccelerationScore: 84, learningVelocity: 96, reasoning: 'Exceptional learning velocity and adaptability scores, moderate experience.' },
        reasons: ['Strong passion and high growth index.', 'Familiar with React basics.'],
        missing: ['Lacks professional experience scaling production apps.', 'No database skills.'],
        risks: { skillGap: { score: 40, explanation: 'Lacks database, testing, and production experience.' }, experience: { score: 25, explanation: 'Only 1 year professional experience.' } }
      },
      {
        name: 'Aisha Khan',
        email: 'aisha.khan@example.com',
        title: 'Security & Node Developer',
        location: 'Noida, Uttar Pradesh',
        skills: ['Node.js', 'Express.js', 'OWASP', 'JWT', 'MongoDB', 'JavaScript', 'Linux'],
        bio: 'Secure coding evangelist building hardened APIs and tracking security patches for Noida SaaS startups.',
        experience: [{ company: 'SecureNet Noida', role: 'Security Dev', startDate: new Date('2023-05-01'), current: true, description: 'Reviewed secure code and automated vulnerability scans.' }],
        education: [{ institution: 'IIT Roorkee', degree: 'B.Tech', fieldOfStudy: 'Computer Science', grade: 'CGPA 8.5' }],
        projects: [{ title: 'Auth Security Middleware', description: 'Express middleware checking token expiry and cross-site scripting.', technologies: ['Node.js', 'Express.js', 'JWT'] }],
        score: 85,
        matchScore: 82,
        dna: { problemSolving: 88, technicalDepth: 85, communication: 80, leadership: 60, adaptability: 82, reliability: 94, learningVelocity: 86, consistency: 90 },
        behavioral: { learningScore: 85, consistencyScore: 90, reliabilityScore: 94, growthScore: 84, adaptabilityScore: 82 },
        potential: { currentCapability: 82, futureGrowthPotential: 86, careerAccelerationScore: 84, learningVelocity: 85, reasoning: 'Extremely high reliability score, focused on security, moderate frontend skills.' },
        reasons: ['Outstanding Node.js, Express, and JWT integration.', 'Strong API vulnerability handling.'],
        missing: ['No React.js or modern CSS frameworks.'],
        risks: { skillGap: { score: 30, explanation: 'Lacks modern UI library experience.' }, experience: { score: 10, explanation: '3 years in backend security.' } }
      },
      {
        name: 'Aditya Verma',
        email: 'aditya.verma@example.com',
        title: 'Senior Systems Programmer',
        location: 'Bengaluru, Karnataka',
        skills: ['C++', 'Rust', 'WebAssembly', 'Linux', 'Docker', 'SQL', 'Algorithms'],
        bio: '8+ years engineer developing low-level network routers and high-performance WebAssembly engines in Bengaluru tech parks.',
        experience: [{ company: 'SysCore Labs India', role: 'Principal Programmer', startDate: new Date('2018-01-01'), current: true, description: 'Led core network router codebase development.' }],
        education: [{ institution: 'NIT Surathkal', degree: 'Bachelor of Technology', fieldOfStudy: 'Information Technology', grade: 'CGPA 9.1' }],
        projects: [{ title: 'Wasm Decoder', description: 'Extremely fast file decoder running inside browser sandbox.', technologies: ['Rust', 'WebAssembly'] }],
        score: 95,
        matchScore: 60,
        dna: { problemSolving: 98, technicalDepth: 98, communication: 65, leadership: 75, adaptability: 70, reliability: 94, learningVelocity: 82, consistency: 95 },
        behavioral: { learningScore: 80, consistencyScore: 96, reliabilityScore: 95, growthScore: 82, adaptabilityScore: 72 },
        potential: { currentCapability: 94, futureGrowthPotential: 86, careerAccelerationScore: 90, learningVelocity: 82, reasoning: 'Elite systems engineering programmer but completely out-of-stack for web apps.' },
        reasons: ['Brilliant problem-solving performance.', 'Unmatched system memory optimization knowledge.'],
        missing: ['Lacks modern React, Node, or web application frameworks.'],
        risks: { skillGap: { score: 70, explanation: 'Completely missing frontend and web application stacks.' }, experience: { score: 2, explanation: 'Extremely senior.' } }
      },
      {
        name: 'Sneha Reddy',
        email: 'sneha.reddy@example.com',
        title: 'Junior Full Stack Developer',
        location: 'Hyderabad, Telangana',
        skills: ['JavaScript', 'React', 'Node.js', 'Express.js', 'SQL', 'HTML5', 'CSS3'],
        bio: 'Recent graduate looking to apply full stack javascript skills to dynamic web apps in Hyderabad startups.',
        experience: [{ company: 'Freelance Hyderabad', role: 'Web Developer', startDate: new Date('2025-08-01'), current: true, description: 'Built landing pages and API mocks.' }],
        education: [{ institution: 'VIT Vellore', degree: 'B.Tech', fieldOfStudy: 'Computer Science', grade: 'CGPA 8.3' }],
        projects: [{ title: 'Recipe Tracker', description: 'Simple database app listing ingredients and instructions.', technologies: ['React', 'Express.js', 'SQL'] }],
        score: 70,
        matchScore: 78,
        dna: { problemSolving: 74, technicalDepth: 70, communication: 85, leadership: 55, adaptability: 90, reliability: 82, learningVelocity: 92, consistency: 80 },
        behavioral: { learningScore: 92, consistencyScore: 80, reliabilityScore: 84, growthScore: 90, adaptabilityScore: 90 },
        potential: { currentCapability: 72, futureGrowthPotential: 90, careerAccelerationScore: 82, learningVelocity: 92, reasoning: 'Adaptable junior developer with full stack javascript familiarity.' },
        reasons: ['Covers React, Node, and Express.', 'Good communication index.'],
        missing: ['No MongoDB experience.', 'Lacks professional experience.'],
        risks: { skillGap: { score: 25, explanation: 'Needs guidance in production level architectures.' }, experience: { score: 20, explanation: 'Only 1 year experience.' } }
      },
      {
        name: 'Arjun Das',
        email: 'arjun.das@example.com',
        title: 'Mobile App Developer',
        location: 'Mumbai, Maharashtra',
        skills: ['Flutter', 'React Native', 'JavaScript', 'Firebase', 'HTML5', 'CSS3', 'Node.js'],
        bio: 'Mobile enthusiast building cross-platform native iOS and Android apps with beautiful widgets in Mumbai.',
        experience: [{ company: 'MobileScale Mumbai', role: 'App Developer', startDate: new Date('2023-06-01'), current: true, description: 'Shipped 3 React Native apps to Apple Store.' }],
        education: [{ institution: 'IIT Kanpur', degree: 'B.Tech', fieldOfStudy: 'Computer Science', grade: 'CGPA 8.6' }],
        projects: [{ title: 'Fitness Tracker App', description: 'Cross-platform app logging workout sessions.', technologies: ['Flutter', 'Firebase'] }],
        score: 80,
        matchScore: 80,
        dna: { problemSolving: 80, technicalDepth: 78, communication: 82, leadership: 60, adaptability: 88, reliability: 86, learningVelocity: 88, consistency: 84 },
        behavioral: { learningScore: 88, consistencyScore: 85, reliabilityScore: 86, growthScore: 86, adaptabilityScore: 88 },
        potential: { currentCapability: 78, futureGrowthPotential: 88, careerAccelerationScore: 84, learningVelocity: 88, reasoning: 'Strong mobile app frameworks and good styling/CSS familiarity.' },
        reasons: ['Familiar with JavaScript/Node.', 'High UI widget building skills.'],
        missing: ['No Express.js or MongoDB database architecture experience.'],
        risks: { skillGap: { score: 30, explanation: 'Missing backend web servers.' }, experience: { score: 10, explanation: '3 years mobile experience.' } }
      }
    ];

    console.log('Seeding 12 candidates...');
    for (const cData of candidatesData) {
      const u = await User.create({
        name: cData.name,
        email: cData.email,
        password: defaultPassword,
        role: 'candidate',
        isVerified: true
      });

      const profile = await CandidateProfile.create({
        user: u._id,
        title: cData.title,
        bio: cData.bio,
        location: cData.location,
        skills: cData.skills,
        experience: cData.experience,
        education: cData.education,
        projects: cData.projects,
        resumeUrl: '/uploads/sample_resume.pdf',
        resumeParsingConfidence: 94
      });

      // Create test submissions
      await Submission.create({
        candidate: u._id,
        assessment: testAssessment._id,
        status: 'completed',
        mcqAnswers: [
          { question: q1._id, selectedOption: 1, isCorrect: true, pointsAwarded: 10 },
          { question: q2._id, selectedOption: 2, isCorrect: true, pointsAwarded: 10 }
        ],
        score: cData.score,
        timeTaken: 150,
        completedAt: new Date()
      });

      // Create scores
      await CandidateScore.create({
        candidate: u._id,
        dna: cData.dna,
        behavioral: cData.behavioral,
        potential: cData.potential
      });

      // Determine which jobs this candidate applies to
      const targetJobs = [];
      const index = candidatesData.indexOf(cData);

      if (index === 0) { // Rohan Sharma - MERN
        targetJobs.push({ job: job1, status: 'Selected', matchScore: 94 });
        targetJobs.push({ job: job5, status: 'Shortlisted', matchScore: 88 });
      } else if (index === 1) { // Anjali Rao - Frontend React
        targetJobs.push({ job: job3, status: 'Interview Scheduled', matchScore: 92 });
        targetJobs.push({ job: job1, status: 'Under Review', matchScore: 78 });
      } else if (index === 2) { // Aarav Mehta - Python ML
        targetJobs.push({ job: job2, status: 'Selected', matchScore: 95 });
      } else if (index === 3) { // Priya Nair - QA
        targetJobs.push({ job: job3, status: 'Rejected', matchScore: 52 });
        targetJobs.push({ job: job4, status: 'Applied', matchScore: 60 });
      } else if (index === 4) { // Vikram Malhotra - DevOps
        targetJobs.push({ job: job4, status: 'Shortlisted', matchScore: 94 });
      } else if (index === 5) { // Siddharth Mehta - Backend
        targetJobs.push({ job: job5, status: 'Interview Scheduled', matchScore: 90 });
        targetJobs.push({ job: job4, status: 'Under Review', matchScore: 76 });
      } else if (index === 6) { // Kavya Iyer - UI/UX
        targetJobs.push({ job: job3, status: 'Shortlisted', matchScore: 86 });
      } else if (index === 7) { // Kabir Patel - Jr Frontend
        targetJobs.push({ job: job3, status: 'Under Review', matchScore: 72 });
        targetJobs.push({ job: job1, status: 'Applied', matchScore: 64 });
      } else if (index === 8) { // Aisha Khan - Security Node
        targetJobs.push({ job: job5, status: 'Shortlisted', matchScore: 85 });
        targetJobs.push({ job: job1, status: 'Under Review', matchScore: 80 });
      } else if (index === 9) { // Aditya Verma - Systems
        targetJobs.push({ job: job5, status: 'Applied', matchScore: 70 });
        targetJobs.push({ job: job2, status: 'Under Review', matchScore: 68 });
      } else if (index === 10) { // Sneha Reddy - Jr Full Stack
        targetJobs.push({ job: job1, status: 'Applied', matchScore: 74 });
        targetJobs.push({ job: job3, status: 'Applied', matchScore: 72 });
        targetJobs.push({ job: job5, status: 'Applied', matchScore: 70 });
      } else if (index === 11) { // Arjun Das - Mobile
        targetJobs.push({ job: job3, status: 'Under Review', matchScore: 78 });
      }

      for (const target of targetJobs) {
        // Create Application record
        await Application.create({
          job: target.job._id,
          candidate: u._id,
          status: target.status,
          coverLetter: `Hello, I am excited to apply for the ${target.job.title} role. My experience matches your requirements well.`,
          timeline: [
            { status: 'Applied', notes: 'Application submitted successfully.', updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
            { status: target.status, notes: `Status updated to ${target.status} during review.`, updatedAt: new Date() }
          ]
        });

        // Create AI ranking records
        await AIRanking.create({
          job: target.job._id,
          candidate: u._id,
          matchScore: target.matchScore,
          fitDetails: {
            technicalFit: cData.dna.technicalDepth,
            experienceFit: target.matchScore - 10 > 50 ? target.matchScore - 10 : 60,
            projectFit: cData.dna.problemSolving,
            growthFit: cData.potential.futureGrowthPotential,
            behavioralFit: cData.behavioral.reliabilityScore
          },
          reasons: cData.reasons,
          missing: cData.missing,
          risks: cData.risks,
          whyNotHigher: {
            reasons: ['Could demonstrate broader system containerization capabilities.'],
            improvementAreas: ['Obtain intermediate system certifications.']
          }
        });
      }
    }

    console.log('Database seeded with 12 candidates successfully!');
    if (shouldCloseConnection) {
      mongoose.connection.close();
    }
  } catch (error) {
    console.error('Seeding error:', error);
    if (shouldCloseConnection) {
      process.exit(1);
    }
  }
};

const autoSeedIfNeeded = async () => {
  try {
    const candidateCount = await User.countDocuments({ role: 'candidate' });
    if (candidateCount >= 5) {
      console.log('Database already has seeded candidates, skipping auto-seed.');
      return;
    }
    console.log(`Database candidate count is ${candidateCount}. Seeding fresh demo dataset...`);
    await seedData(false);
  } catch (error) {
    console.error('Auto seeding check failed:', error);
  }
};

module.exports = { seedData, autoSeedIfNeeded };
