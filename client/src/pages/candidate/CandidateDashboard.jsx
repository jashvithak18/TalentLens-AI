import React from 'react';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import LoadingScreen from '../../components/LoadingScreen';
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

  if (isLoading) {
    return <LoadingScreen text="Calibrating candidate DNA metrics..." fullScreen={false} />;
  }

  const profile = data?.profile || {};
  const scores = data?.scores || {
    dna: { problemSolving: 50, technicalDepth: 50, communication: 50, leadership: 50, adaptability: 50, reliability: 50, learningVelocity: 50, consistency: 50 },
    potential: { currentCapability: 50, futureGrowthPotential: 50, careerAccelerationScore: 50, learningVelocity: 50 },
    behavioral: { learningScore: 50, consistencyScore: 50 }
  };

  // Convert DNA object to array for Recharts Radar Chart
  const radarData = [
    { subject: 'Problem Solving', A: scores.dna.problemSolving, fullMark: 100 },
    { subject: 'Technical Depth', A: scores.dna.technicalDepth, fullMark: 100 },
    { subject: 'Communication', A: scores.dna.communication, fullMark: 100 },
    { subject: 'Leadership', A: scores.dna.leadership, fullMark: 100 },
    { subject: 'Adaptability', A: scores.dna.adaptability, fullMark: 100 },
    { subject: 'Reliability', A: scores.dna.reliability, fullMark: 100 },
    { subject: 'Learning Velocity', A: scores.dna.learningVelocity, fullMark: 100 },
    { subject: 'Consistency', A: scores.dna.consistency, fullMark: 100 }
  ];

  // Calculate profile completeness
  let scoreSum = 0;
  if (profile.title) scoreSum += 20;
  if (profile.bio) scoreSum += 20;
  if (profile.experience?.length > 0) scoreSum += 20;
  if (profile.education?.length > 0) scoreSum += 20;
  if (profile.projects?.length > 0) scoreSum += 20;

  return (
    <div className="space-y-6 pt-16">
      
      {/* Welcome Header Banner */}
      <div className="bg-gradient-to-r from-brandPrimary/5 via-brandSecondary/5 to-transparent border border-brandPrimary/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 font-jakarta">Welcome, {user.name}</h1>
          <p className="text-xs text-slate-500 mt-1 font-semibold">Review your AI DNA scores, profile status, and recommended listings.</p>
        </div>
        <div className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shrink-0 self-start md:self-center shadow-sm">
          Match Readiness: <span className="text-brandPrimary font-extrabold">{scores.potential.currentCapability}%</span>
        </div>
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
            <div className="bg-brandPrimary h-2 rounded-full" style={{ width: `${scoreSum}%` }} />
          </div>
        </div>

        {/* Resume Confidence Parser */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Parsing Confidence</h3>
            <span className="text-3xl font-extrabold text-brandAccent mt-2 block">{profile.resumeParsingConfidence || 0}%</span>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold mt-3">Parser successfully matched experience timeline with date ranges.</p>
        </div>

        {/* Potential Capability Score */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Growth Potential Score</h3>
            <span className="text-3xl font-extrabold text-brandSecondary mt-2 block">{scores.potential.futureGrowthPotential}%</span>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold mt-3">High coding & learning activities accelerated your metric scores.</p>
        </div>
      </div>

      {/* Main visual widgets: DNA radar and potential breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* DNA Radar Chart */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4 font-jakarta">Candidate DNA Profile</h3>
          <div className="w-full h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <Grid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 9, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 8 }} />
                <Radar name={user.name} dataKey="A" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Behavioral & Skill Inferences */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-4 font-jakarta">Behavioral Intelligence Metrics</h3>
            <div className="space-y-4">
              {[
                { label: 'Learning Velocity', val: scores.potential.learningVelocity, color: 'bg-indigo-600' },
                { label: 'Consistency Index', val: scores.behavioral.consistencyScore, color: 'bg-emerald-500' },
                { label: 'Adaptability Score', val: scores.potential.careerAccelerationScore, color: 'bg-blue-500' }
              ].map((m, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500">{m.label}</span>
                    <span className="text-slate-800">{m.val}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden shadow-inner">
                    <div className={`${m.color} h-1.5 rounded-full`} style={{ width: `${m.val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 mb-3 font-jakarta">AI Inferred Skills</h3>
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
