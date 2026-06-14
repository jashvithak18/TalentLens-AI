const axios = require('axios');

// Central router to execute prompts exclusively via Groq API
const callAIModel = async (prompt, systemInstruction = '', useJson = false) => {
  if (!process.env.GROQ_API_KEY) {
    console.warn('WARNING: GROQ_API_KEY is not defined. Running in mock/fallback mode.');
    return null;
  }

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-8b-8192',
        messages: [
          ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
          { role: 'user', content: prompt }
        ],
        response_format: useJson ? { type: 'json_object' } : undefined
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );
    return response.data.choices[0].message.content;
  } catch (err) {
    console.error('Groq API call failed:', err.response?.data || err.message);
    return null;
  }
};

// Helper to clean JSON block from raw response texts
const cleanJsonResponse = (text) => {
  try {
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.substring(7);
    }
    if (cleanText.endsWith('```')) {
      cleanText = cleanText.substring(0, cleanText.length - 3);
    }
    return JSON.parse(cleanText.trim());
  } catch (err) {
    console.error('Failed to parse AI JSON output, raw text was:', text);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (innerErr) {
        console.error('Inner JSON regex parse failure:', innerErr);
      }
    }
    throw new Error('AI returned malformed response. Please try again.');
  }
};

// 1. AI Resume Parser
exports.aiParseResume = async (resumeText) => {
  const fallbackData = {
    name: "Rohan Sharma",
    email: "rohan.sharma@example.com",
    title: "Senior Full Stack Engineer",
    location: "Bengaluru, Karnataka",
    bio: "Passionate Full Stack Engineer with 5+ years of experience building high-performance web applications and cloud architectures in Indian startups.",
    skills: ["React", "Node.js", "Express.js", "MongoDB", "JavaScript", "TypeScript", "AWS", "Docker", "Tailwind CSS"],
    experience: [
      { company: "TechCorp Solutions India", role: "Senior Software Engineer", startDate: "2023-01-01", current: true, description: "Led development of a high-traffic e-commerce microservice platform." },
      { company: "WebFlow Agency Bengaluru", role: "Frontend Developer", startDate: "2020-03-01", endDate: "2022-12-31", current: false, description: "Built customized React and Vue dashboards for enterprise clients." }
    ],
    education: [
      { institution: "IIT Bombay", degree: "Bachelor of Technology", fieldOfStudy: "Computer Science", grade: "CGPA 9.2" }
    ],
    projects: [
      { title: "Realtime Analytics Dashboard", description: "A high-performance socket.io monitoring panel with visual canvas charts.", technologies: ["React", "Node.js", "Socket.io", "D3.js"] }
    ],
    certifications: [
      { name: "AWS Certified Developer", issuer: "Amazon Web Services", issueDate: "2024-02-15" }
    ],
    confidence: 92
  };

  if (!process.env.GROQ_API_KEY) {
    return fallbackData;
  }

  const prompt = `
    Analyze the following extracted resume text. Extract details into a clean JSON structure.
    Return ONLY JSON with these exact fields:
    {
      "name": "string",
      "email": "string",
      "title": "string",
      "location": "string",
      "bio": "string",
      "skills": ["string"],
      "experience": [{"company": "string", "role": "string", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD or null", "current": boolean, "description": "string"}],
      "education": [{"institution": "string", "degree": "string", "fieldOfStudy": "string", "grade": "string"}],
      "projects": [{"title": "string", "description": "string", "technologies": ["string"]}],
      "certifications": [{"name": "string", "issuer": "string", "issueDate": "YYYY-MM-DD"}],
      "confidence": number (between 50 and 100)
    }

    Resume Text:
    ${resumeText}
  `;

  try {
    const resultText = await callAIModel(prompt, '', true);
    if (!resultText) throw new Error('AI returned empty response');
    return cleanJsonResponse(resultText);
  } catch (error) {
    console.error('aiParseResume error (falling back to mock data):', error);
    return fallbackData;
  }
};

// 2. Semantic Matching + Explainable AI Ranking + Risk + Why Not Higher
exports.aiEvaluateCandidateFit = async (jobDetails, candidateDetails) => {
  if (!process.env.GROQ_API_KEY) {
    return {
      matchScore: 84,
      fitDetails: {
        technicalFit: 88,
        experienceFit: 80,
        projectFit: 90,
        growthFit: 85,
        behavioralFit: 75
      },
      reasons: [
        "Strong MERN stack expertise with matching production experience.",
        "Created complex real-time analytics projects resembling job needs.",
        "Shows rapid career progression and high learning mindset."
      ],
      missing: [
        "Lacks production AWS or cloud orchestration exposure.",
        "No direct team lead experience."
      ],
      risks: {
        skillGap: { score: 20, explanation: "Minor gap in cloud deployment/AWS architecture." },
        experience: { score: 15, explanation: "Exceeds the basic experience minimum requirements." },
        communication: { score: 10, explanation: "High evidence of teamwork and clear project summaries." },
        team: { score: 15, explanation: "Collaborative role history supports rapid integration." },
        assessment: { score: 30, explanation: "Scored well in React assessments, Node.js is untested." }
      },
      whyNotHigher: {
        reasons: ["Candidate lacks DevOps and CI/CD automation certifications.", "Aptitude assessments were slightly below average."],
        improvementAreas: ["Gain AWS or GCP developer credentials.", "Work on system design fundamentals."]
      }
    };
  }

  const prompt = `
    Conduct a detailed semantic analysis of Candidate fit for a Job.
    Job Details:
    Title: ${jobDetails.title}
    Description: ${jobDetails.description}
    Required Skills: ${JSON.stringify(jobDetails.requiredSkills)}
    Preferred Skills: ${JSON.stringify(jobDetails.preferredSkills)}
    Experience Minimum: ${jobDetails.experience} years

    Candidate Details:
    Skills: ${JSON.stringify(candidateDetails.skills)}
    Experience: ${JSON.stringify(candidateDetails.experience)}
    Projects: ${JSON.stringify(candidateDetails.projects)}
    Education: ${JSON.stringify(candidateDetails.education)}

    Analyze compatibility and return JSON only, structured exactly like:
    {
      "matchScore": number (0-100),
      "fitDetails": {
        "technicalFit": number (0-100),
        "experienceFit": number (0-100),
        "projectFit": number (0-100),
        "growthFit": number (0-100),
        "behavioralFit": number (0-100)
      },
      "reasons": ["string of core match reasons"],
      "missing": ["string of missing skills/experience"],
      "risks": {
        "skillGap": { "score": number (0-100), "explanation": "string" },
        "experience": { "score": number (0-100), "explanation": "string" },
        "communication": { "score": number (0-100), "explanation": "string" },
        "team": { "score": number (0-100), "explanation": "string" },
        "assessment": { "score": number (0-100), "explanation": "string" }
      },
      "whyNotHigher": {
        "reasons": ["string of why candidate was not ranked at 100%"],
        "improvementAreas": ["string of specific actions/skills to improve"]
      }
    }
  `;

  try {
    const resultText = await callAIModel(prompt, '', true);
    if (!resultText) throw new Error('AI returned empty response');
    return cleanJsonResponse(resultText);
  } catch (error) {
    console.error('aiEvaluateCandidateFit error:', error);
    throw error;
  }
};

// 3. Hidden Skill Detection
exports.aiDetectHiddenSkills = async (candidateDetails) => {
  if (!process.env.GROQ_API_KEY) {
    return [
      { skill: "MERN Stack", source: "Projects & Resume Context", confidence: 95 },
      { skill: "RESTful APIs", source: "E-commerce Project description", confidence: 90 },
      { skill: "Database Optimization", source: "MongoDB query tuning experience", confidence: 85 },
      { skill: "OAuth 2.0", source: "Auth middleware implementation", confidence: 80 }
    ];
  }

  const prompt = `
    Analyze the Candidate's profile (projects, resume, experience) to detect implicit / hidden skills.
    For example, if they built a "Payment Gateway Microservice", they probably have skills in "Node.js", "Express", "API Integration", "Stripe API", and "Security protocols", even if they didn't explicitly write them.

    Candidate Profile:
    Experience: ${JSON.stringify(candidateDetails.experience)}
    Projects: ${JSON.stringify(candidateDetails.projects)}
    Explicit Skills: ${JSON.stringify(candidateDetails.skills)}

    Return ONLY a JSON array of detected hidden skills, structured like this:
    [
      { "skill": "string", "source": "string description of project or experience evidence", "confidence": number (50-100) }
    ]
  `;

  try {
    const resultText = await callAIModel(prompt, '', true);
    if (!resultText) throw new Error('AI returned empty response');
    return cleanJsonResponse(resultText);
  } catch (error) {
    console.error('aiDetectHiddenSkills error:', error);
    return [];
  }
};

// 4. Candidate DNA + Potential Profile + Behavioral Analytics
exports.aiGenerateCandidateDNA = async (candidateDetails, submissionHistory = [], activityHistory = []) => {
  const fallbackDNA = {
    dna: {
      problemSolving: 85,
      technicalDepth: 80,
      communication: 75,
      leadership: 65,
      adaptability: 90,
      reliability: 88,
      learningVelocity: 95,
      consistency: 90
    },
    behavioral: {
      learningScore: 92,
      consistencyScore: 88,
      reliabilityScore: 90,
      growthScore: 95,
      adaptabilityScore: 87
    },
    potential: {
      currentCapability: 78,
      futureGrowthPotential: 94,
      careerAccelerationScore: 89,
      learningVelocity: 96,
      reasoning: "Excellent track record of project releases, high assessment scores, and rapid acquisition of new skills (TypeScript, AWS) in short durations."
    }
  };

  if (!process.env.GROQ_API_KEY) {
    return fallbackDNA;
  }

  const prompt = `
    Evaluate the candidate's profile, assessment history, and activity signals to generate a complete talent profile.
    This includes DNA metrics (Radar values 0-100), Behavioral Intelligence (0-100), and Growth Potential (0-100).
    
    Candidate Data:
    Skills: ${JSON.stringify(candidateDetails.skills)}
    Experience: ${JSON.stringify(candidateDetails.experience)}
    Projects: ${JSON.stringify(candidateDetails.projects)}
    Submissions: ${JSON.stringify(submissionHistory)}
    Activity Logs (behavioral/activity signals): ${JSON.stringify(activityHistory)}

    Analyze the candidate's activity / behavioral signals (e.g. profile views, test response time, profile update frequency, GitHub/portfolio links clicks) to adjust metrics like "reliabilityScore", "learningScore", "adaptability", "potential", and "consistency".

    Return ONLY JSON matching this exact scheme:
    {
      "dna": {
        "problemSolving": number (0-100),
        "technicalDepth": number (0-100),
        "communication": number (0-100),
        "leadership": number (0-100),
        "adaptability": number (0-100),
        "reliability": number (0-100),
        "learningVelocity": number (0-100),
        "consistency": number (0-100)
      },
      "behavioral": {
        "learningScore": number (0-100),
        "consistencyScore": number (0-100),
        "reliabilityScore": number (0-100),
        "growthScore": number (0-100),
        "adaptabilityScore": number (0-100)
      },
      "potential": {
        "currentCapability": number (0-100),
        "futureGrowthPotential": number (0-100),
        "careerAccelerationScore": number (0-100),
        "learningVelocity": number (0-100),
        "reasoning": "string explanation"
      }
    }
  `;

  try {
    const resultText = await callAIModel(prompt, '', true);
    if (!resultText) throw new Error('AI returned empty response');
    return cleanJsonResponse(resultText);
  } catch (error) {
    console.error('aiGenerateCandidateDNA error (falling back to mock data):', error);
    return fallbackDNA;
  }
};

// 5. Recruiter AI Copilot (Chat)
exports.aiRecruiterCopilotChat = async (messages, candidateDataList, jobDataList) => {
  if (!process.env.GROQ_API_KEY) {
    const userQuery = messages[messages.length - 1].content;
    const queryLower = userQuery.toLowerCase();

    // Check if it's a request to explain ranking for a candidate
    if (queryLower.includes('compare candidate') || queryLower.includes('why are they ranked') || queryLower.includes('explain')) {
      const match = userQuery.match(/candidate ([^,.]+)/i);
      const name = match ? match[1].trim() : 'this candidate';
      return `**AI Fit Explanation for ${name}:**\n- **Technical Alignment:** Demonstrates high alignment with the core job requirements. Code samples show strong structure.\n- **Strengths:** Excellent project contributions, high assessment completion rates, and positive behavioral indicators.\n- **Risks & Gaps:** Minor gaps in specialized system tools. Overall fit remains very strong.`;
    }

    if (queryLower.includes('first') || queryLower.includes('rank')) {
      return "Candidate Alex Rivera is ranked first due to outstanding MERN stack technical scores and an exceptional DSA score of 95% on the technical assessment.";
    }
    if (queryLower.includes('underrated') || queryLower.includes('growth')) {
      return "Candidate Jordan Smith has high future growth potential (94%) and robust self-taught projects, making them underrated despite having only 1 year of professional experience.";
    }
    return "I am ready to help you analyze candidate DNA scores, compare candidates, or suggest a shortlist. Please ask me about the available candidates.";
  }

  const context = `
    You are the Recruiter AI Copilot inside TalentLens AI.
    Below is the list of candidates, jobs, and rankings currently in the database.
    Use this information to answer the recruiter's questions. Be concise and precise.

    Jobs Available:
    ${jobDataList.map(j => `- Job ID: ${j._id}, Title: ${j.title}, Required Skills: ${j.requiredSkills.join(', ')}`).join('\n')}

    Candidates Available:
    ${candidateDataList.map(c => `- Name: ${c.name}, Role: ${c.profile?.title}, Skills: ${(c.profile?.skills || []).join(', ')}, DNA Problem Solving: ${c.score?.dna?.problemSolving || 'N/A'}, Potential Score: ${c.score?.potential?.futureGrowthPotential || 'N/A'}`).join('\n')}
  `;

  const prompt = `
    ${context}

    Conversation History:
    ${messages.map(m => `${m.sender === 'user' ? 'Recruiter' : 'AI Copilot'}: ${m.content}`).join('\n')}
    
    Answer the last question as the Recruiter AI Copilot:
  `;

  try {
    const resultText = await callAIModel(prompt, '');
    return resultText ? resultText.trim() : 'I received an empty response from the AI assistant.';
  } catch (error) {
    console.error('aiRecruiterCopilotChat error:', error);
    return 'Apologies, I encountered an issue querying the model. Please check the API configuration.';
  }
};
