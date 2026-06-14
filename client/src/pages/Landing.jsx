import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Play, Calendar, Check, X, Shield, Users, 
  Cpu, FileText, Database, Sparkles, TrendingUp, Trophy, 
  ChevronRight, Brain, Zap, MessageSquare, BarChart3, AlertCircle 
} from 'lucide-react';
import { Logo } from '../components/Logo';

// Hook for count-up animation
const useCountUp = (target, duration = 2) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(target);
    if (start === end) return;

    let totalMiliseconds = duration * 1000;
    let incrementTime = Math.abs(Math.floor(totalMiliseconds / end));
    incrementTime = Math.max(incrementTime, 20); // Limit speed to 50fps

    const timer = setInterval(() => {
      start += Math.ceil(end / (totalMiliseconds / incrementTime));
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [target, duration]);

  return count;
};

// SVG Animated Radar Chart for Landing Page
const LandingRadarChart = ({ problemSolving = 85, communication = 70, leadership = 65, adaptability = 80, reliability = 90, learningVelocity = 95 }) => {
  const points = [
    { label: "Problem Solving", val: problemSolving, angle: 0 },
    { label: "Communication", val: communication, angle: 60 },
    { label: "Leadership", val: leadership, angle: 120 },
    { label: "Adaptability", val: adaptability, angle: 180 },
    { label: "Reliability", val: reliability, angle: 240 },
    { label: "Learning Velocity", val: learningVelocity, angle: 300 }
  ];

  const getCoordinates = (angle, value) => {
    const rad = (angle * Math.PI) / 180;
    const r = (value / 100) * 40; // max radius 40
    return {
      x: 50 + r * Math.cos(rad),
      y: 50 + r * Math.sin(rad)
    };
  };

  const polyPoints = points.map(p => {
    const coords = getCoordinates(p.angle, p.val);
    return `${coords.x},${coords.y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 100 100" className="w-64 h-64 mx-auto text-brandPrimary">
      {/* Background hexagons */}
      {[20, 40, 60, 80, 100].map((level, idx) => {
        const gridPoints = points.map(p => {
          const coords = getCoordinates(p.angle, level);
          return `${coords.x},${coords.y}`;
        }).join(' ');
        return (
          <polygon 
            key={idx} 
            points={gridPoints} 
            fill="none" 
            stroke="currentColor" 
            strokeOpacity="0.08" 
            strokeWidth="0.5" 
          />
        );
      })}
      
      {/* Axis Lines */}
      {points.map((p, idx) => {
        const outer = getCoordinates(p.angle, 100);
        return (
          <line 
            key={idx} 
            x1="50" y1="50" 
            x2={outer.x} y2={outer.y} 
            stroke="currentColor" 
            strokeOpacity="0.1" 
            strokeWidth="0.5" 
          />
        );
      })}

      {/* Main Radar Polygon */}
      <motion.polygon 
        points={polyPoints} 
        fill="currentColor" 
        fillOpacity="0.15" 
        stroke="currentColor" 
        strokeWidth="1.5"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />

      {/* Nodes */}
      {points.map((p, idx) => {
        const coord = getCoordinates(p.angle, p.val);
        return (
          <circle 
            key={idx} 
            cx={coord.x} 
            cy={coord.y} 
            r="1.5" 
            fill="currentColor" 
            className="text-brandSecondary"
          />
        );
      })}

      {/* Labels */}
      {points.map((p, idx) => {
        const textPos = getCoordinates(p.angle, 115);
        let anchor = "middle";
        if (p.angle === 0) anchor = "start";
        if (p.angle === 180) anchor = "end";
        return (
          <text 
            key={idx} 
            x={textPos.x} 
            y={textPos.y} 
            fontSize="3.2" 
            fontWeight="bold" 
            fill="#334155" 
            textAnchor={anchor}
            alignmentBaseline="middle"
          >
            {p.label}
          </text>
        );
      })}
    </svg>
  );
};

export const Landing = () => {
  const navigate = useNavigate();
  const [pipelineStep, setPipelineStep] = useState(0);
  const [copilotMessages, setCopilotMessages] = useState([
    { role: 'user', text: 'Find high-potential MERN stack developers.' }
  ]);
  const [typing, setTyping] = useState(false);
  const storyRef = useRef(null);
  
  // Custom pipeline cycling
  useEffect(() => {
    const timer = setInterval(() => {
      setPipelineStep(prev => (prev + 1) % 5);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Copilot Chat Simulation
  useEffect(() => {
    const interval = setTimeout(() => {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        setCopilotMessages(prev => [
          ...prev,
          { 
            role: 'system', 
            text: 'Found 12 candidates. 3 demonstrate exceptional learning velocity (top 5%) and consistently high assessment performance in MongoDB & React.' 
          }
        ]);
      }, 2000);
    }, 4000);
    return () => clearTimeout(interval);
  }, []);

  // Stats Counters
  const countProfiles = useCountUp(50000, 1.5);
  const countAccuracy = useCountUp(95, 1.5);
  const countSkills = useCountUp(100000, 1.5);
  const countRecruiters = useCountUp(500, 1.5);

  return (
    <div className="bg-[#FAFAFA] min-h-screen selection:bg-brandPrimary/10 overflow-x-hidden">
      
      {/* 1. Header/Navigation */}
      <header className="border-b border-[#E5E7EB] bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo iconSize="h-8 w-8" textSize="text-xl" />
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-brandPrimary transition-colors">Features</a>
            <a href="#problem" className="hover:text-brandPrimary transition-colors">The Solution</a>
            <a href="#demo" className="hover:text-brandPrimary transition-colors">Demo</a>
            <a href="#pricing" className="hover:text-brandPrimary transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="text-sm font-semibold text-slate-700 hover:text-brandPrimary transition-colors px-4 py-2"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="btn-primary text-sm font-semibold py-2 px-4 shadow-sm"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-20 pb-24 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 grid-bg opacity-40 -z-10 pointer-events-none" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-brandPrimary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Hero Left Content */}
        <div className="lg:col-span-6 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-brandPrimary/5 border border-brandPrimary/10 rounded-full text-brandPrimary text-xs font-semibold"
          >
            <Sparkles className="h-3 w-3" />
            Next-Gen AI Talent Intelligence
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.08] font-jakarta"
          >
            Hire Talent. <br />
            <span className="text-brandPrimary bg-clip-text">Not Keywords.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-slate-500 max-w-lg leading-relaxed font-sans"
          >
            Discover hidden skills, identify high-potential candidates, and make smarter hiring decisions with AI-powered talent intelligence.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <button onClick={() => navigate('/register')} className="btn-primary py-3 px-6 text-sm font-semibold">
              Get Started
            </button>
            <a href="#demo" className="btn-secondary py-3 px-6 text-sm font-semibold">
              <Play className="h-4 w-4 fill-slate-500 text-slate-500" /> Watch Demo
            </a>
          </motion.div>
        </div>

        {/* Hero Right: Interactive Pipeline Visualizer */}
        <div className="lg:col-span-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-card max-w-lg mx-auto relative overflow-hidden"
          >
            <div className="absolute top-3 left-4 flex gap-1.5">
              <span className="w-3 h-3 bg-red-400 rounded-full" />
              <span className="w-3 h-3 bg-yellow-400 rounded-full" />
              <span className="w-3 h-3 bg-green-400 rounded-full" />
            </div>
            
            <div className="text-center py-2 border-b border-[#E5E7EB] mb-6 text-xs text-slate-400 font-semibold uppercase tracking-wider">
              TalentLens Engine Pipeline
            </div>

            {/* Interactive Steps */}
            <div className="space-y-4">
              {[
                { icon: FileText, title: "1. Resume Upload", desc: "Raw resume PDF parsed into semantic data structures" },
                { icon: Brain, title: "2. AI Analysis", desc: "Deep capability mapping using Large Language Models" },
                { icon: Zap, title: "3. Hidden Skills", desc: "Reveals inferred skills not explicitly stated in text" },
                { icon: BarChart3, title: "4. Candidate DNA", desc: "Generates multi-dimensional capability metrics" },
                { icon: Trophy, title: "5. Smart Hiring", desc: "Unbiased comparison, scoring, and automated rankings" }
              ].map((step, idx) => {
                const isActive = pipelineStep === idx;
                const Icon = step.icon;
                return (
                  <motion.div 
                    key={idx}
                    animate={{ 
                      backgroundColor: isActive ? "rgba(79, 70, 229, 0.04)" : "rgba(255, 255, 255, 1)",
                      borderColor: isActive ? "#4F46E5" : "#E5E7EB"
                    }}
                    transition={{ duration: 0.3 }}
                    className="flex items-start gap-4 p-3.5 border rounded-xl"
                  >
                    <div className={`p-2.5 rounded-lg border ${
                      isActive ? 'bg-brandPrimary text-white border-brandPrimary' : 'bg-slate-50 text-slate-400 border-[#E5E7EB]'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>{step.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{step.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Trust Bar & Counters */}
      <section className="bg-white border-y border-[#E5E7EB] py-10 px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Empowering modern teams at
          </div>
          {/* Company Logos Row */}
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-45 grayscale hover:grayscale-0 transition-all">
            <span className="font-extrabold text-xl text-slate-700 tracking-tight">Google</span>
            <span className="font-extrabold text-xl text-slate-700 tracking-tight">Microsoft</span>
            <span className="font-extrabold text-xl text-slate-700 tracking-tight">amazon</span>
            <span className="font-extrabold text-xl text-slate-700 tracking-tight">Meta</span>
            <span className="font-extrabold text-xl text-slate-700 tracking-tight">NETFLIX</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-8 border-t border-[#F3F4F6] text-center">
            <div>
              <div className="text-4xl font-extrabold text-brandPrimary tracking-tight font-jakarta">
                {countProfiles.toLocaleString()}+
              </div>
              <div className="text-xs text-slate-400 mt-1 font-semibold uppercase">Profiles Analyzed</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-brandPrimary tracking-tight font-jakarta">
                {countAccuracy}%
              </div>
              <div className="text-xs text-slate-400 mt-1 font-semibold uppercase">Match Accuracy</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-brandPrimary tracking-tight font-jakarta">
                {countSkills.toLocaleString()}+
              </div>
              <div className="text-xs text-slate-400 mt-1 font-semibold uppercase">Skills Mapped</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-brandPrimary tracking-tight font-jakarta">
                {countRecruiters}+
              </div>
              <div className="text-xs text-slate-400 mt-1 font-semibold uppercase">Active Recruiters</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. The Problem vs Solution */}
      <section id="problem" className="py-24 px-6 max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-jakarta">
            Traditional Hiring Is Broken
          </h2>
          <p className="text-slate-500">
            Keyword-based filters overlook raw capability and block high-potential candidates. Here is how TalentLens changes the status quo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Old Traditional Screening */}
          <div className="bg-white border border-red-100 rounded-2xl p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-red-500 font-jakarta flex items-center gap-2">
              <AlertCircle className="h-5 w-5" /> Traditional Keyword Search
            </h3>
            <ul className="space-y-4 text-sm text-slate-500">
              <li className="flex gap-2 items-center">
                <X className="h-4 w-4 text-red-400 shrink-0" />
                <span><strong>Keyword Filtering</strong>: Skips qualified candidates who omit exact search terms.</span>
              </li>
              <li className="flex gap-2 items-center">
                <X className="h-4 w-4 text-red-400 shrink-0" />
                <span><strong>Manual Screening</strong>: Overwhelming stack of PDF reviews wasting recruiting hours.</span>
              </li>
              <li className="flex gap-2 items-center">
                <X className="h-4 w-4 text-red-400 shrink-0" />
                <span><strong>Resume Bias</strong>: Decisions skewed by candidate university names or layouts.</span>
              </li>
              <li className="flex gap-2 items-center">
                <X className="h-4 w-4 text-red-400 shrink-0" />
                <span><strong>Unseen Potential</strong>: Blind to logical agility, learning speed, and behavioral traits.</span>
              </li>
            </ul>
          </div>

          {/* New AI-Powered Screening */}
          <div className="bg-white border border-brandPrimary/10 rounded-2xl p-8 shadow-sm space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brandPrimary/5 rounded-full blur-xl pointer-events-none" />
            <h3 className="text-lg font-bold text-brandPrimary font-jakarta flex items-center gap-2">
              <Sparkles className="h-5 w-5" /> TalentLens AI Solution
            </h3>
            <ul className="space-y-4 text-sm text-slate-600">
              <li className="flex gap-2 items-center">
                <Check className="h-4 w-4 text-brandAccent shrink-0" strokeWidth={3} />
                <span><strong>Semantic Matching</strong>: Understands the context of experience, not just matching keys.</span>
              </li>
              <li className="flex gap-2 items-center">
                <Check className="h-4 w-4 text-brandAccent shrink-0" strokeWidth={3} />
                <span><strong>AI Analysis</strong>: Automates sorting and profiles candidates instantly based on merit.</span>
              </li>
              <li className="flex gap-2 items-center">
                <Check className="h-4 w-4 text-brandAccent shrink-0" strokeWidth={3} />
                <span><strong>Anonymized Screening</strong>: Blind Mode strips personal details to eliminate bias.</span>
              </li>
              <li className="flex gap-2 items-center">
                <Check className="h-4 w-4 text-brandAccent shrink-0" strokeWidth={3} />
                <span><strong>Candidate DNA</strong>: Maps problem solving, velocity, and core potential from tests.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 5. Hidden Talent Section */}
      <section className="bg-white border-y border-[#E5E7EB] py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <div className="text-xs font-bold text-brandPrimary uppercase tracking-widest">
              Semantic Transformation
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 font-jakarta leading-tight">
              Reveal the Talents Beneath the Text
            </h2>
            <p className="text-slate-500 leading-relaxed text-sm">
              Standard resumes are terrible descriptions of capability. TalentLens translates simple resume claims into verified skill matrices, calculating underlying potential, consistency, and depth.
            </p>
            <div className="pt-4">
              <div className="flex gap-3 items-center text-xs font-semibold text-slate-700 bg-slate-50 p-3 rounded-lg border border-[#E5E7EB] inline-flex">
                <Brain className="h-4 w-4 text-brandPrimary" /> Powered by Groq AI Models
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Raw Resume card */}
            <div className="bg-slate-50 border border-[#E5E7EB] rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 bg-[#E5E7EB] h-2.5 flex items-center justify-between px-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                Raw Resume Submission
              </div>
              <div className="space-y-4 pt-4 text-xs font-mono text-slate-500">
                <p><strong>Name</strong>: Sarah Chen</p>
                <p><strong>Experience</strong>: Built several web pages using React and Node.js. Maintained database servers.</p>
                <p><strong>Keywords found</strong>: React, Node, Web, Database</p>
                <div className="border-t border-[#E5E7EB] pt-3 text-[10px] text-red-400">
                  ⚠️ Match rating: Low (No keyword matches for System Design)
                </div>
              </div>
            </div>

            {/* AI Scanned DNA badges */}
            <div className="bg-white border border-brandPrimary/20 rounded-2xl p-6 shadow-glow relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 bg-brandPrimary/10 h-2.5 flex items-center justify-between px-3 text-[9px] font-bold text-brandPrimary uppercase tracking-wider">
                TalentLens AI Scanned DNA
              </div>
              <div className="space-y-4 pt-4">
                <h4 className="text-sm font-bold text-slate-900 font-jakarta">Sarah Chen - MAPPED SKILLS</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg text-xs font-semibold">React (Expert)</span>
                  <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg text-xs font-semibold">Node.js (Advanced)</span>
                  <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-lg text-xs font-semibold">System Architecture</span>
                  <span className="px-2.5 py-1 bg-cyan-50 border border-cyan-100 text-cyan-600 rounded-lg text-xs font-semibold">NoSQL (MongoDB)</span>
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between text-xs">
                  <span className="text-slate-400">Learning Velocity:</span>
                  <span className="font-bold text-brandAccent">95% (Exceptional)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Candidate DNA Radar Chart */}
      <section className="py-24 px-6 max-w-7xl mx-auto text-center space-y-12">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="text-xs font-bold text-brandPrimary uppercase tracking-widest">
            Visual Competency Matrix
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 font-jakarta tracking-tight">
            Multi-Dimensional Candidate DNA
          </h2>
          <p className="text-slate-500">
            No more flat screening. Generate behavioral, adaptive, and logical indexes for every applicant mapped using automated assessments and code challenges.
          </p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-3xl p-8 max-w-xl mx-auto shadow-sm flex flex-col items-center">
          <LandingRadarChart />
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-brandPrimary" /> Technical Skills
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-brandSecondary" /> Cognitive Aptitude
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-brandAccent" /> Behavioral Core
            </span>
          </div>
        </div>
      </section>

      {/* 7. Recruiter Copilot Chat */}
      <section className="bg-white border-y border-[#E5E7EB] py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-5 space-y-6">
            <div className="text-xs font-bold text-brandPrimary uppercase tracking-widest">
              Interactive AI Copilot
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 font-jakarta leading-tight">
              Talk to Your Candidate Pool Instantly
            </h2>
            <p className="text-slate-500 leading-relaxed text-sm">
              Use natural language queries to filter, identify, and score applicants. The AI Copilot scans your databases, parses test results, and recommends the top candidates based on actual performance.
            </p>
          </div>

          {/* Right Mock Chat Window */}
          <div className="lg:col-span-7 bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl shadow-card overflow-hidden">
            <div className="bg-white border-b border-[#E5E7EB] px-4 py-3 flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-brandAccent animate-pulse" />
              <span className="text-xs font-bold text-slate-700 font-jakarta">TalentLens Copilot</span>
            </div>
            
            <div className="p-6 space-y-4 h-64 overflow-y-auto flex flex-col justify-end text-xs">
              <AnimatePresence>
                {copilotMessages.map((msg, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`max-w-[80%] rounded-xl p-3.5 ${
                      msg.role === 'user' 
                        ? 'bg-brandPrimary text-white self-end rounded-br-none' 
                        : 'bg-white border border-[#E5E7EB] text-slate-700 self-start rounded-bl-none shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </motion.div>
                ))}
              </AnimatePresence>

              {typing && (
                <div className="bg-white border border-[#E5E7EB] text-slate-400 self-start rounded-xl rounded-bl-none p-3 shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-75" />
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-150" />
                </div>
              )}
            </div>

            <div className="bg-white p-4 border-t border-[#E5E7EB] flex items-center gap-3">
              <input 
                type="text" 
                placeholder="Ask your talent pool a question..." 
                className="flex-1 bg-slate-50 border border-[#E5E7EB] rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-brandPrimary focus:ring-1 focus:ring-brandPrimary"
                disabled
              />
              <button className="btn-primary py-1.5 px-3.5 text-xs font-semibold shrink-0">Send</button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Candidate Battle */}
      <section className="py-24 px-6 max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="text-xs font-bold text-brandPrimary uppercase tracking-widest">
            Side-By-Side Battle Modality
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 font-jakarta tracking-tight">
            Unbiased Candidate Comparison
          </h2>
          <p className="text-slate-500">
            Select any two applicants to trigger a head-to-head match scoring breakdown covering experience, assessments, and AI potential index.
          </p>
        </div>

        {/* Mock Comparison Grid */}
        <div className="max-w-4xl mx-auto bg-white border border-[#E5E7EB] rounded-3xl p-8 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          
          {/* Candidate A */}
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-brandPrimary mx-auto text-lg">
              SC
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 font-jakarta">Sarah Chen</h4>
              <p className="text-xs text-slate-400 mt-0.5">Software Engineer</p>
            </div>
            
            <div className="space-y-2 text-xs text-slate-500 pt-4 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Assessments:</span>
                <span className="font-bold text-slate-700">92%</span>
              </div>
              <div className="flex justify-between">
                <span>Code Challenge:</span>
                <span className="font-bold text-slate-700">95%</span>
              </div>
              <div className="flex justify-between">
                <span>Consistency:</span>
                <span className="font-bold text-slate-700">High</span>
              </div>
            </div>
          </div>

          {/* VS Divider / Score Recommendation */}
          <div className="text-center space-y-4 border-y md:border-y-0 md:border-x border-slate-100 py-6 md:py-0 md:px-6">
            <div className="inline-block px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-slate-600 text-[10px] font-bold uppercase">
              VS
            </div>
            <div className="bg-brandPrimary/5 border border-brandPrimary/10 rounded-xl p-4 space-y-1">
              <span className="text-[10px] text-brandPrimary font-bold uppercase tracking-wider block">AI Match Recommendation</span>
              <p className="text-sm font-extrabold text-brandPrimary">Sarah Chen (94% Match)</p>
              <p className="text-[10px] text-slate-400 leading-normal mt-2">Sarah scores 15% higher in learning agility and problem consistency compared to Alex.</p>
            </div>
          </div>

          {/* Candidate B */}
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-brandSecondary mx-auto text-lg">
              AL
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 font-jakarta">Alex Lee</h4>
              <p className="text-xs text-slate-400 mt-0.5">Systems Developer</p>
            </div>

            <div className="space-y-2 text-xs text-slate-500 pt-4 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Assessments:</span>
                <span className="font-bold text-slate-700">88%</span>
              </div>
              <div className="flex justify-between">
                <span>Code Challenge:</span>
                <span className="font-bold text-slate-700">80%</span>
              </div>
              <div className="flex justify-between">
                <span>Consistency:</span>
                <span className="font-bold text-slate-700">Moderate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Talent Discovery Cards */}
      <section className="bg-white border-y border-[#E5E7EB] py-24 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div className="text-xs font-bold text-brandPrimary uppercase tracking-widest">
              Talent Pools
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 font-jakarta tracking-tight">
              Pre-Segmented Talent Discovery
            </h2>
            <p className="text-slate-500">
              Automated clusters identify top candidates without requiring manual searches. Click to view rankings instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { title: "Underrated Talent", desc: "Highly skilled profiles that recruiters typically overlook because of sparse keywords.", color: "border-brandPrimary/20 text-brandPrimary bg-brandPrimary/5" },
              { title: "Future Leaders", desc: "Candidates showing high scores in communication, adaptability, and leadership indices.", color: "border-cyan-200 text-cyan-600 bg-cyan-50" },
              { title: "Emerging Developers", desc: "Top junior graduates with flawless test scores and exceptional potential indices.", color: "border-emerald-200 text-emerald-600 bg-emerald-50" },
              { title: "Top Problem Solvers", desc: "Highest scores recorded in VM-sandboxed complex coding assessments.", color: "border-yellow-200 text-yellow-600 bg-yellow-50" },
              { title: "Fastest Learners", desc: "Profiles showing steep skills expansion and rapid test completion rates.", color: "border-purple-200 text-purple-600 bg-purple-50" },
              { title: "High Potential", desc: "A combined matrix of high cognitive ability and deep technical capabilities.", color: "border-indigo-200 text-indigo-600 bg-indigo-50" }
            ].map((card, idx) => (
              <div key={idx} className="bg-white border border-[#E5E7EB] rounded-2xl p-6 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
                <div className="space-y-4">
                  <div className={`px-2.5 py-1 rounded-lg border font-bold text-xs inline-block ${card.color}`}>
                    {card.title}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{card.desc}</p>
                </div>
                <div className="pt-6 flex justify-end">
                  <span className="text-[10px] font-bold text-brandPrimary flex items-center gap-1 cursor-pointer">
                    View Pool <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. How It Works Timeline */}
      <section className="py-24 px-6 max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="text-xs font-bold text-brandPrimary uppercase tracking-widest">
            Workflow Steps
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 font-jakarta tracking-tight">
            How TalentLens Works
          </h2>
          <p className="text-slate-500">
            A comprehensive, automated roadmap from candidate sourcing to selection.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: "01", title: "Upload Resume", desc: "Drop CVs in bulk. AI instantly parses structure." },
            { step: "02", title: "AI Analysis", desc: "Groq mappings detect hidden capabilities." },
            { step: "03", title: "Assessments", desc: "Automate technical MCQ & VM coding challenges." },
            { step: "04", title: "Hire Decisions", desc: "View clean dashboards, rankings, and compare profiles." }
          ].map((item, idx) => (
            <div key={idx} className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-3xl font-extrabold text-brandPrimary/20 block font-jakarta">{item.step}</span>
                <h4 className="text-sm font-extrabold text-slate-900 mt-2 font-jakarta">{item.title}</h4>
              </div>
              <p className="text-xs text-slate-400 mt-3 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 11. Testimonials */}
      <section className="bg-white border-y border-[#E5E7EB] py-24 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-extrabold text-slate-900 font-jakarta tracking-tight">
              Loved by Recruiting Leaders
            </h2>
            <p className="text-slate-500">
              Hear how Ashby-grade teams scale talent profiling with TalentLens.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: "Jessica Mercer", role: "Head of Talent, Ashby", quote: "We replaced manual screening pipelines with TalentLens and saved 40+ hours per job post. Blind mode is incredible.", avatar: "JM" },
              { name: "Robert Chen", role: "VP Engineering, Vercel", quote: "The VM sandboxed coding tests let us verify candidate skills immediately. Real skills, not just rote memo algorithms.", avatar: "RC" },
              { name: "Aria Sterling", role: "Director of HR, Linear", quote: "No more keyword matching. TalentLens discovers hidden potentials that our recruiters would have skipped.", avatar: "AS" }
            ].map((t, idx) => (
              <div key={idx} className="bg-slate-50 border border-[#E5E7EB] rounded-2xl p-6 flex flex-col justify-between">
                <p className="text-xs text-slate-600 leading-relaxed italic">"{t.quote}"</p>
                <div className="mt-6 flex items-center gap-3 pt-4 border-t border-slate-200/60">
                  <div className="w-10 h-10 rounded-full bg-brandPrimary/10 border border-brandPrimary/20 flex items-center justify-center font-bold text-brandPrimary text-xs">
                    {t.avatar}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 font-jakarta">{t.name}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. Pricing Section */}
      <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="text-xs font-bold text-brandPrimary uppercase tracking-widest">
            Pricing Plans
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 font-jakarta tracking-tight">
            Transparent SaaS Pricing
          </h2>
          <p className="text-slate-500">
            Get started for free or upgrade for enterprise screening pipelines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Starter */}
          <div className="bg-white border border-[#E5E7EB] rounded-3xl p-8 shadow-sm flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-500 font-jakarta">Starter</h4>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900 font-jakarta">$0</span>
                  <span className="text-slate-400 text-xs font-semibold">/month</span>
                </div>
              </div>
              <ul className="space-y-3.5 text-xs text-slate-500 border-t border-slate-100 pt-6">
                <li className="flex gap-2 items-center"><Check className="h-4 w-4 text-brandAccent" /> 5 candidate parses/mo</li>
                <li className="flex gap-2 items-center"><Check className="h-4 w-4 text-brandAccent" /> 1 open job posting</li>
                <li className="flex gap-2 items-center"><Check className="h-4 w-4 text-brandAccent" /> Basic assessments</li>
              </ul>
            </div>
            <button onClick={() => navigate('/register')} className="btn-secondary w-full py-2.5 mt-8 font-semibold text-xs">Get Started</button>
          </div>

          {/* Professional */}
          <div className="bg-white border-2 border-brandPrimary rounded-3xl p-8 shadow-md relative flex flex-col justify-between">
            <div className="absolute top-0 right-8 -translate-y-1/2 bg-brandPrimary text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Most Popular
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-brandPrimary font-jakarta">Professional</h4>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900 font-jakarta">$149</span>
                  <span className="text-slate-400 text-xs font-semibold">/month</span>
                </div>
              </div>
              <ul className="space-y-3.5 text-xs text-slate-600 border-t border-slate-100 pt-6">
                <li className="flex gap-2 items-center"><Check className="h-4 w-4 text-brandAccent" /> 100 candidate parses/mo</li>
                <li className="flex gap-2 items-center"><Check className="h-4 w-4 text-brandAccent" /> Unlimited active jobs</li>
                <li className="flex gap-2 items-center"><Check className="h-4 w-4 text-brandAccent" /> AI Copilot access</li>
                <li className="flex gap-2 items-center"><Check className="h-4 w-4 text-brandAccent" /> Custom MCQ + coding VM runner</li>
              </ul>
            </div>
            <button onClick={() => navigate('/register')} className="btn-primary w-full py-2.5 mt-8 font-semibold text-xs shadow-sm">Upgrade to Pro</button>
          </div>

          {/* Enterprise */}
          <div className="bg-white border border-[#E5E7EB] rounded-3xl p-8 shadow-sm flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-500 font-jakarta">Enterprise</h4>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900 font-jakarta">Custom</span>
                </div>
              </div>
              <ul className="space-y-3.5 text-xs text-slate-500 border-t border-slate-100 pt-6">
                <li className="flex gap-2 items-center"><Check className="h-4 w-4 text-brandAccent" /> Unlimited candidate parses</li>
                <li className="flex gap-2 items-center"><Check className="h-4 w-4 text-brandAccent" /> Custom VM execution environments</li>
                <li className="flex gap-2 items-center"><Check className="h-4 w-4 text-brandAccent" /> API access & ATS integrations</li>
                <li className="flex gap-2 items-center"><Check className="h-4 w-4 text-brandAccent" /> Dedicated support team</li>
              </ul>
            </div>
            <button onClick={() => navigate('/register')} className="btn-secondary w-full py-2.5 mt-8 font-semibold text-xs">Contact Sales</button>
          </div>
        </div>
      </section>

      {/* 13. Final CTA */}
      <section className="bg-slate-900 text-white py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-5" />
        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <h2 className="text-4xl lg:text-5xl font-extrabold font-jakarta tracking-tight">
            Ready to Discover Talent Beyond Keywords?
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto text-sm leading-relaxed">
            Join thousands of modern recruiters mapping capabilities instead of reading raw resumes.
          </p>
          <div className="flex justify-center gap-4 flex-wrap pt-4">
            <button onClick={() => navigate('/register')} className="btn-primary py-3 px-6 text-sm font-semibold">
              Get Started for Free
            </button>
            <a href="#demo" className="btn-secondary py-3 px-6 text-sm font-semibold border-slate-700 bg-slate-800 text-gray-200 hover:bg-slate-700">
              Book Demo
            </a>
          </div>
        </div>
      </section>

      {/* 14. Footer */}
      <footer className="border-t border-[#E5E7EB] bg-white py-12 px-6 text-center text-xs text-slate-400 font-semibold uppercase tracking-wider">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo iconSize="h-6 w-6" textSize="text-md" />
          <div>
            © {new Date().getFullYear()} TalentLens AI. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
