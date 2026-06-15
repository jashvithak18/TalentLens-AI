import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import LoadingScreen from '../../components/LoadingScreen';
import { Sparkles, FileText, ArrowRight } from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid as Grid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from 'recharts';

const CandidateDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  // Fetch candidate profile and scores
  const { data, isLoading } = useQuery({
    queryKey: ['candidateDashboard'],
    queryFn: async () => {
      const res = await api.get('/candidates/profile');
      return res.data;
    }
  });

  useEffect(() => {
    // Log candidate dashboard view activity
    api.post('/activities/log', { action: 'dashboard_view', details: 'Candidate viewed dashboard' })
      .catch(err => console.error('Failed to log dashboard view activity', err));
  }, []);

  if (isLoading) {
    return <LoadingScreen text="Calibrating candidate DNA metrics..." fullScreen={false} />;
  }

  const profile = data?.profile || {};
  const scores = data?.scores || {
    dna: { problemSolving: 50, technicalDepth: 50, communication: 50, leadership: 50, adaptability: 50, reliability: 50, learningVelocity: 50, consistency: 50 },
    potential: { currentCapability: 50, futureGrowthPotential: 50, careerAccelerationScore: 50, learningVelocity: 50 },
    behavioral: { learningScore: 50, consistencyScore: 50 }
  };

  // Convert DNA object to array for Recharts Radar Chart with user-friendly labels
  const radarData = [
    { subject: 'Problem Solving Ability', A: scores.dna?.problemSolving || 50, fullMark: 100 },
    { subject: 'Technical Skills Strength', A: scores.dna?.technicalDepth || 50, fullMark: 100 },
    { subject: 'Communication Skills', A: scores.dna?.communication || 50, fullMark: 100 },
    { subject: 'Leadership Potential', A: scores.dna?.leadership || 50, fullMark: 100 },
    { subject: 'Adaptability in Learning & Work', A: scores.dna?.adaptability || 50, fullMark: 100 },
    { subject: 'Dependability', A: scores.dna?.reliability || 50, fullMark: 100 },
    { subject: 'How Fast You Learn', A: scores.dna?.learningVelocity || 50, fullMark: 100 },
    { subject: 'Consistency in Effort', A: scores.dna?.consistency || 50, fullMark: 100 }
  ];

  // Calculate profile completeness
  let scoreSum = 0;
  if (profile.title) scoreSum += 20;
  if (profile.bio) scoreSum += 20;
  if (profile.experience?.length > 0) scoreSum += 20;
  if (profile.education?.length > 0) scoreSum += 20;
  if (profile.projects?.length > 0) scoreSum += 20;

  // Custom Career Mentor advice generator based on actual metrics
  const getMentorAdvice = () => {
    const dna = scores.dna || {};
    const learning = scores.potential?.learningVelocity || dna.learningVelocity || 50;
    const consistency = scores.behavioral?.consistencyScore || dna.consistency || 50;
    
    if (learning >= 70 && consistency >= 70) {
      return "You are a fast learner with strong consistency. Improving communication and technical depth will make you internship-ready faster.";
    } else if (learning >= 70) {
      return "You demonstrate a strong ability to learn new concepts quickly. Focus on building consistency in your projects and strengthening technical skills strength to accelerate your readiness.";
    } else if (consistency >= 70) {
      return "Your consistency in project effort is outstanding. Leveling up how fast you adapt to new technologies will make you highly competitive for internship positions.";
    } else {
      return "You show solid potential across the board. Focusing on improving your coding consistency and expanding your technical skills strength will make you industry-ready even faster.";
    }
  };

  const behavioralMetrics = [
    {
      label: '⚡ You learn new concepts quickly',
      val: scores.potential?.learningVelocity || scores.dna?.learningVelocity || 82,
      color: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      desc: 'Based on how quickly you pick up new tech stacks and implement them in projects.'
    },
    {
      label: '📈 You stay consistent with your work',
      val: scores.behavioral?.consistencyScore || scores.dna?.consistency || 90,
      color: 'bg-gradient-to-r from-blue-400 to-blue-600',
      desc: 'Measures your regular coding updates and persistent progress across experience history.'
    },
    {
      label: '🤝 You adjust well to new tools & environments',
      val: scores.potential?.careerAccelerationScore || scores.dna?.adaptability || 80,
      color: 'bg-gradient-to-r from-indigo-500 to-blue-500',
      desc: 'Reflects your flexibility working across multiple framework layers and codebases.'
    }
  ];

  return (
    <div className="space-y-6 pt-16">
      
      {/* Welcome Header Banner */}
      <div className="bg-gradient-to-r from-brandPrimary/5 via-brandSecondary/5 to-transparent border border-brandPrimary/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 font-jakarta">Welcome, {user.name}</h1>
          <p className="text-xs text-slate-500 mt-1 font-semibold">Review your AI profile insights, status, and recommended listings.</p>
        </div>
        <div className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shrink-0 self-start md:self-center shadow-sm">
          Match Readiness: <span className="text-indigo-600 font-extrabold">{scores.potential.currentCapability}%</span>
        </div>
      </div>

      {/* Prominent AI Resume Parser CTA */}
      <div className="bg-white border border-indigo-600/10 rounded-2xl p-5 shadow-premium flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden glow-card">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-sm">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 font-jakarta flex items-center gap-1.5">
              Build & Sync Profile in Seconds
              <span className="bg-indigo-600 text-white text-[8px] px-1.5 py-0.5 rounded-full font-extrabold tracking-wider uppercase animate-pulse">AI Powered</span>
            </h2>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-xl">
              {profile.resumeUrl 
                ? `Your profile is synced from your resume (${profile.resumeParsingConfidence}% parsing confidence). Re-upload to automatically update experience, education, projects, and skills.`
                : 'Upload your PDF or Word resume. Our parser will instantly extract and auto-populate your experience history, education, projects, skills, and certifications.'
              }
            </p>
          </div>
        </div>
        <Link 
          to="/candidate/resume-parser" 
          className="w-full md:w-auto btn-primary text-xs font-semibold py-2.5 px-5 flex items-center justify-center space-x-1.5 shrink-0"
        >
          <span>{profile.resumeUrl ? 'Manage Resume' : 'Launch Resume Parser'}</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Primary KPI widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Strength */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profile Completeness</h3>
            <span className="text-3xl font-extrabold text-slate-800 mt-2 block">{scoreSum}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-4 overflow-hidden shadow-inner">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full" style={{ width: `${scoreSum}%` }} />
          </div>
        </div>

        {/* Resume Confidence Parser */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Parsing Confidence</h3>
            <span className="text-3xl font-extrabold text-indigo-600 mt-2 block">{profile.resumeParsingConfidence || 0}%</span>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold mt-3">Parser successfully matched experience timeline with date ranges.</p>
        </div>

        {/* Potential Capability Score */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Growth Potential Score</h3>
            <span className="text-3xl font-extrabold text-blue-600 mt-2 block">{scores.potential.futureGrowthPotential}%</span>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold mt-3">High coding & learning activities accelerated your metric scores.</p>
        </div>
      </div>

      {/* Main visual widgets: DNA radar and potential breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* DNA Radar Chart */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold text-slate-800 font-jakarta flex items-center gap-1.5">🧬 Candidate Profile</h3>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">Skill Radar Chart</span>
            </div>
            <p className="text-[11px] text-slate-500 font-semibold mb-4">
              📈 This is based on your resume projects & experience, not exam scores.
            </p>
          </div>
          <div className="w-full h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <Grid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 8, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 8 }} />
                <Radar name={user.name} dataKey="A" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Behavioral & Skill Inferences */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-4 font-jakarta">📊 Behavioral Insights</h3>
            <div className="space-y-4">
              {behavioralMetrics.map((m, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">{m.label}</span>
                    <span className="text-slate-800">{m.val}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
                    <div className={`${m.color} h-2 rounded-full`} style={{ width: `${m.val}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mentorship Advice Section */}
          <div className="pt-2 border-t border-slate-100">
            <div className="p-4 bg-gradient-to-br from-indigo-50/50 to-blue-50/30 border border-indigo-100/50 rounded-xl space-y-1.5 animate-all">
              <h4 className="text-xs font-bold text-indigo-700 flex items-center gap-1.5 uppercase tracking-wide">
                💬 What this means for you
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                {getMentorAdvice()}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 mb-3 font-jakarta">🧠 AI Inferred Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profile.inferredSkills?.length === 0 ? (
                <span className="text-xs text-slate-400 font-semibold">Add projects or experience to infer latent skills.</span>
              ) : (
                profile.inferredSkills?.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-cyan-50 text-cyan-700 border border-cyan-100 text-xs rounded-full font-bold shadow-sm"
                    title={`Source: ${s.source}`}
                  >
                    {s.skill}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
