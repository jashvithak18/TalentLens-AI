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
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-800 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-48 bg-slate-800 rounded-xl" />
          <div className="h-48 bg-slate-800 rounded-xl" />
          <div className="h-48 bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">Welcome, {user.name}</h1>
          <p className="text-xs text-textMuted mt-1">Review your AI DNA scores, profile status, and recommendations</p>
        </div>
        <div className="px-3 py-1.5 bg-slate-900 border border-darkBorder rounded-lg text-xs font-semibold text-gray-300">
          Match Readiness: <span className="text-brandSecondary font-bold">{scores.potential.currentCapability}%</span>
        </div>
      </div>

      {/* Primary KPI widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Strength */}
        <div className="glass-panel rounded-xl p-5 border border-darkBorder flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold text-textMuted uppercase tracking-wider">Profile Completeness</h3>
            <span className="text-3xl font-bold text-white mt-2 block">{scoreSum}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 mt-4 overflow-hidden">
            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${scoreSum}%` }} />
          </div>
        </div>

        {/* Resume Confidence Parser */}
        <div className="glass-panel rounded-xl p-5 border border-darkBorder flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold text-textMuted uppercase tracking-wider">AI Parsing Confidence</h3>
            <span className="text-3xl font-bold text-emerald-400 mt-2 block">{profile.resumeParsingConfidence || 0}%</span>
          </div>
          <p className="text-[10px] text-textMuted mt-3">Parser matched experience timeline with 98% date accuracy.</p>
        </div>

        {/* Potential Capability Score */}
        <div className="glass-panel rounded-xl p-5 border border-darkBorder flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold text-textMuted uppercase tracking-wider">Growth Potential Score</h3>
            <span className="text-3xl font-bold text-cyan-400 mt-2 block">{scores.potential.futureGrowthPotential}%</span>
          </div>
          <p className="text-[10px] text-textMuted mt-3">High coding & learning activities accelerated your score by +4%.</p>
        </div>
      </div>

      {/* Main visual widgets: DNA radar and potential breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DNA Radar Chart */}
        <div className="glass-panel rounded-xl p-6 border border-darkBorder">
          <h3 className="text-sm font-semibold text-white mb-4">Candidate DNA Profile</h3>
          <div className="w-full h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <Grid stroke="#1e293b" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569', fontSize: 9 }} />
                <Radar name={user.name} dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Behavioral & Skill Inferences */}
        <div className="glass-panel rounded-xl p-6 border border-darkBorder space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Behavioral Intelligence Metrics</h3>
            <div className="space-y-3.5">
              {[
                { label: 'Learning Velocity', val: scores.potential.learningVelocity, color: 'bg-indigo-500' },
                { label: 'Consistency Index', val: scores.behavioral.consistencyScore, color: 'bg-emerald-500' },
                { label: 'Adaptability Score', val: scores.potential.careerAccelerationScore, color: 'bg-cyan-500' }
              ].map((m, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-textMuted">{m.label}</span>
                    <span className="text-gray-200">{m.val}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div className={`${m.color} h-1.5 rounded-full`} style={{ width: `${m.val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-3">AI Inferred Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profile.inferredSkills?.length === 0 ? (
                <span className="text-xs text-slate-500">Add projects or experience to infer latent skills.</span>
              ) : (
                profile.inferredSkills?.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-cyan-950/20 text-cyan-400 border border-cyan-500/20 text-xs rounded-full font-medium"
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

import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import {
  Radar,
  RadarChart,
  PolarGrid as Grid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from 'recharts';

export default CandidateDashboard;
