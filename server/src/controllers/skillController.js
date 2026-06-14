const Skill = require('../models/Skill');

// @desc    Get all skills (Auto-seeds 50 default skills if database is empty)
// @route   GET /api/skills
// @access  Protected (Any authenticated student/recruiter)
exports.getSkills = async (req, res, next) => {
  try {
    const count = await Skill.countDocuments();
    if (count === 0) {
      const defaultSkills = [
        "JavaScript", "Python", "Java", "C++", "HTML5", "CSS3", "React", "Node.js",
        "TypeScript", "Express.js", "MongoDB", "SQL", "PostgreSQL", "Git", "Docker",
        "AWS", "Kubernetes", "Next.js", "Vue.js", "Angular", "Redux", "GraphQL",
        "Tailwind CSS", "RESTful APIs", "Data Structures", "Algorithms",
        "Machine Learning", "Deep Learning", "Data Analysis", "Mobile App Development",
        "Flutter", "React Native", "UI/UX Design", "Figma", "Project Management",
        "Agile Methodologies", "Software Engineering", "Cyber Security", "Linux",
        "Cloud Computing", "DevOps", "Object-Oriented Programming (OOP)", "Quality Assurance (QA)",
        "Communication Skills", "Teamwork", "Problem Solving", "Critical Thinking",
        "Leadership", "Time Management", "Public Speaking"
      ];
      const seedData = defaultSkills.map(name => ({ name }));
      await Skill.insertMany(seedData);
    }
    const skills = await Skill.find().sort({ name: 1 });
    res.status(200).json({ success: true, count: skills.length, skills });
  } catch (error) {
    next(error);
  }
};
