const CandidateProfile = require('../models/CandidateProfile');
const User = require('../models/User');
const Submission = require('../models/Submission');
const CandidateScore = require('../models/CandidateScore');
const Skill = require('../models/Skill');
const ActivityLog = require('../models/ActivityLog');
const { uploadToCloudinary } = require('../middleware/upload');
const { aiParseResume, aiDetectHiddenSkills, aiGenerateCandidateDNA } = require('../utils/aiHelpers');
const fs = require('fs');

// Get candidate profile
exports.getProfile = async (req, res, next) => {
  try {
    let profile = await CandidateProfile.findOne({ user: req.user.id }).populate('user', 'name email role');
    if (!profile) {
      profile = await CandidateProfile.create({ user: req.user.id });
    }

    const scores = await CandidateScore.findOne({ candidate: req.user.id });
    res.status(200).json({ success: true, profile, scores });
  } catch (error) {
    next(error);
  }
};

// Update profile basic fields
exports.updateProfile = async (req, res, next) => {
  const { title, headline, pronouns, bio, location, city, country, socialLinks, skills, isBlindModeEnabled } = req.body;

  try {
    let profile = await CandidateProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new CandidateProfile({ user: req.user.id });
    }

    if (title !== undefined) profile.title = title;
    if (headline !== undefined) profile.headline = headline;
    if (pronouns !== undefined) profile.pronouns = pronouns;
    if (bio !== undefined) profile.bio = bio;
    if (location !== undefined) profile.location = location;
    if (city !== undefined) profile.city = city;
    if (country !== undefined) profile.country = country;
    if (socialLinks !== undefined) profile.socialLinks = socialLinks;
    if (skills !== undefined) {
      profile.skills = skills;
      
      // Dynamically add new skills to the global shared collection
      for (const skillName of skills) {
        const trimmedSkillName = skillName.trim();
        if (trimmedSkillName) {
          // Check if skill exists case-insensitively, if not add it
          await Skill.findOneAndUpdate(
            { name: { $regex: new RegExp(`^${trimmedSkillName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') } },
            { $setOnInsert: { name: trimmedSkillName } },
            { upsert: true }
          );
        }
      }
    }
    if (isBlindModeEnabled !== undefined) profile.isBlindModeEnabled = isBlindModeEnabled;

    await profile.save();

    // Log update profile activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'update_profile',
      details: 'Updated profile details and skills list'
    });

    // Trigger AI DNA calculation in background if skills change
    if (skills !== undefined) {
      const submissions = await Submission.find({ candidate: req.user.id });
      const activities = await ActivityLog.find({ user: req.user.id });
      const dnaData = await aiGenerateCandidateDNA(profile, submissions, activities);
      await CandidateScore.findOneAndUpdate(
        { candidate: req.user.id },
        {
          dna: dnaData.dna,
          behavioral: dnaData.behavioral,
          potential: dnaData.potential
        },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

// Upload and parse resume
exports.uploadResume = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'Please upload a resume file.' });
  }

  try {
    // 1. Upload to Cloudinary (or fallback to local relative route)
    const uploadResult = await uploadToCloudinary(req.file.path, 'resumes');

    // 2. Perform AI Parsing (Read the local file text or simulated parsing)
    // For local parsing, we'll read text if pdf, or mock parser.
    let resumeText = `Name: ${req.user.name}\nEmail: ${req.user.email}\n`;
    try {
      // Simple text readout if we want, otherwise use the path
      resumeText += fs.readFileSync(req.file.path, 'utf8');
    } catch (readErr) {
      resumeText += "Simulated text readout from resume file.";
    }

    // Call AI Parser
    const parsedData = await aiParseResume(resumeText);

    // Save to CandidateProfile
    let profile = await CandidateProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new CandidateProfile({ user: req.user.id });
    }

    profile.resumeUrl = uploadResult.url;
    profile.resumePublicId = uploadResult.public_id;
    profile.resumeText = resumeText;
    profile.skills = [...new Set([...(profile.skills || []), ...(parsedData.skills || [])])];
    profile.resumeParsingConfidence = parsedData.confidence || 85;

    // Populate experience, education, projects if empty
    if (profile.experience.length === 0 && parsedData.experience) {
      profile.experience = parsedData.experience;
    }
    if (profile.education.length === 0 && parsedData.education) {
      profile.education = parsedData.education;
    }
    if (profile.projects.length === 0 && parsedData.projects) {
      profile.projects = parsedData.projects;
    }

    await profile.save();

    // Trigger AI Inferred Skills detection
    const inferred = await aiDetectHiddenSkills(profile);
    profile.inferredSkills = inferred;
    await profile.save();

    // Log user activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'upload_resume',
      details: `Uploaded and parsed resume with confidence: ${profile.resumeParsingConfidence}%`
    });

    // Trigger DNA calculation
    const submissions = await Submission.find({ candidate: req.user.id });
    const activities = await ActivityLog.find({ user: req.user.id });
    const dnaData = await aiGenerateCandidateDNA(profile, submissions, activities);
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

    res.status(200).json({ success: true, profile, parsedData });
  } catch (error) {
    next(error);
  }
};

// Sub-arrays managers (Experience, Education, Projects, Certifications)
exports.addExperience = async (req, res, next) => {
  try {
    const profile = await CandidateProfile.findOne({ user: req.user.id });
    profile.experience.push(req.body);
    await profile.save();
    res.status(200).json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

exports.addEducation = async (req, res, next) => {
  try {
    const profile = await CandidateProfile.findOne({ user: req.user.id });
    profile.education.push(req.body);
    await profile.save();
    res.status(200).json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

exports.addProject = async (req, res, next) => {
  try {
    const profile = await CandidateProfile.findOne({ user: req.user.id });
    profile.projects.push(req.body);
    await profile.save();
    
    // Recalculate inferred skills when adding a project
    const inferred = await aiDetectHiddenSkills(profile);
    profile.inferredSkills = inferred;
    await profile.save();

    res.status(200).json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

exports.addCertification = async (req, res, next) => {
  try {
    const profile = await CandidateProfile.findOne({ user: req.user.id });
    let certData = { ...req.body };
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.path, 'certifications');
      certData.pdfUrl = uploadResult.url;
      certData.pdfPublicId = uploadResult.public_id;
    }
    profile.certifications.push(certData);
    await profile.save();
    res.status(200).json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

exports.uploadAvatar = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'Please upload an image file.' });
  }

  try {
    const uploadResult = await uploadToCloudinary(req.file.path, 'avatars');
    let profile = await CandidateProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new CandidateProfile({ user: req.user.id });
    }

    profile.avatar = uploadResult.url;
    await profile.save();

    res.status(200).json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

// Get React Flow Skill Evidence Graph and Knowledge Graph
exports.getGraphs = async (req, res, next) => {
  const candidateId = req.params.candidateId || req.user.id;

  try {
    const profile = await CandidateProfile.findOne({ user: candidateId }).populate('user', 'name');
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Candidate profile not found' });
    }

    const submissions = await Submission.find({ candidate: candidateId }).populate('assessment');

    // 1. Construct Skill Evidence Graph (focus on React Flow structure)
    // Nodes: Skill (Center) -> Projects, Assessments, Certifications, Experience (Evidence)
    const evidenceNodes = [];
    const evidenceEdges = [];

    // Center nodes (Skills)
    const skillsToShow = profile.skills.slice(0, 5); // Limit to top 5 for visual clarity
    skillsToShow.forEach((skill, idx) => {
      evidenceNodes.push({
        id: `skill-${idx}`,
        type: 'input',
        data: { label: `${skill} (Core Skill)` },
        position: { x: 250, y: 150 + idx * 100 },
        style: { background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px' }
      });

      // Find evidence in projects
      profile.projects.forEach((proj, pIdx) => {
        if (proj.technologies.some(t => t.toLowerCase().includes(skill.toLowerCase()))) {
          const nodeId = `proj-${pIdx}`;
          if (!evidenceNodes.some(n => n.id === nodeId)) {
            evidenceNodes.push({
              id: nodeId,
              data: { label: `Project: ${proj.title}` },
              position: { x: 50, y: 100 + pIdx * 100 },
              style: { background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px' }
            });
          }
          evidenceEdges.push({
            id: `edge-skill-${idx}-${nodeId}`,
            source: `skill-${idx}`,
            target: nodeId,
            animated: true,
            label: 'Used in'
          });
        }
      });

      // Find evidence in assessments
      submissions.forEach((sub, sIdx) => {
        if (sub.assessment.category.toLowerCase().includes(skill.toLowerCase())) {
          const nodeId = `sub-${sIdx}`;
          if (!evidenceNodes.some(n => n.id === nodeId)) {
            evidenceNodes.push({
              id: nodeId,
              data: { label: `Assessment: ${sub.assessment.title} (${sub.score}%)` },
              position: { x: 450, y: 100 + sIdx * 120 },
              style: { background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px' }
            });
          }
          evidenceEdges.push({
            id: `edge-skill-${idx}-${nodeId}`,
            source: `skill-${idx}`,
            target: nodeId,
            animated: true,
            label: 'Proved by'
          });
        }
      });
    });

    // 2. Construct Knowledge Graph (linking all entities)
    const knowledgeNodes = [
      {
        id: 'candidate-root',
        type: 'input',
        data: { label: profile.user.name || 'Candidate' },
        position: { x: 350, y: 50 },
        style: { background: '#3b82f6', color: '#fff', fontSize: '16px', fontWeight: 'bold', borderRadius: '8px', padding: '12px' }
      }
    ];
    const knowledgeEdges = [];

    // Add nodes for Skills, Projects, Experience, Education
    // Connect them to Root
    profile.skills.slice(0, 6).forEach((skill, idx) => {
      const id = `k-skill-${idx}`;
      knowledgeNodes.push({
        id,
        data: { label: `Skill: ${skill}` },
        position: { x: 100 + idx * 100, y: 200 },
        style: { background: '#6366f1', color: '#fff', borderRadius: '6px' }
      });
      knowledgeEdges.push({ id: `e-root-${id}`, source: 'candidate-root', target: id });
    });

    profile.projects.slice(0, 3).forEach((p, idx) => {
      const id = `k-proj-${idx}`;
      knowledgeNodes.push({
        id,
        data: { label: `Project: ${p.title}` },
        position: { x: 150 + idx * 180, y: 350 },
        style: { background: '#10b981', color: '#fff', borderRadius: '6px' }
      });
      knowledgeEdges.push({ id: `e-root-${id}`, source: 'candidate-root', target: id });
    });

    res.status(200).json({
      success: true,
      evidenceGraph: { nodes: evidenceNodes, edges: evidenceEdges },
      knowledgeGraph: { nodes: knowledgeNodes, edges: knowledgeEdges }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteSubSection = async (req, res, next) => {
  const { type, id } = req.params;
  const validTypes = ['experience', 'education', 'projects', 'certifications'];
  
  if (!validTypes.includes(type)) {
    return res.status(400).json({ success: false, error: 'Invalid sub-section type' });
  }

  try {
    const profile = await CandidateProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }

    // Pull the sub-document by its _id
    profile[type].pull({ _id: id });
    await profile.save();

    // If type is projects or experience, recalculate inferred skills
    if (type === 'projects' || type === 'experience') {
      const inferred = await aiDetectHiddenSkills(profile);
      profile.inferredSkills = inferred;
      await profile.save();
    }

    res.status(200).json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};
