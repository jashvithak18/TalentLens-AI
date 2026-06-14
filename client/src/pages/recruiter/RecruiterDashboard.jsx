import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import {
  Users,
  Briefcase,
  Layers,
  Heart,
  TrendingUp,
  Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie
} from 'recharts';

const RecruiterDashboard = () => {
  // Fetch recruiter analytics
  const { data, isLoading } = useQuery({
    queryKey: ['recruiterAnalytics'],
    queryFn: async () => {
      const res = await api.get('/analytics/recruiter');
      return res.data;
    }
  });

  if (isLoading) {
    return <div className="text-center py-12 text-slate-500 text-xs">Assembling KPI analytics engines...</div>;
  }

  const kpis = data?.kpis || { totalJobs: 0, totalCandidates: 0, totalApplications: 0, interviews: 0, hires: 0 };
  const funnel = data?.funnel || { applied: 0, underReview: 0, assessmentPending: 0, assessmentCompleted: 0, shortlisted: 0, interviewScheduled: 0, selected: 0, rejected: 0 };
  const skillDemand = data?.skillDemand || [];

  // Format funnel data for Recharts Bar Chart
  const funnelChartData = [
    { name: 'Applied', count: funnel.applied },
    { name: 'Under Review', count: funnel.underReview },
    { name: 'Test Assigned', count: funnel.assessmentPending },
    { name: 'Test Completed', count: funnel.assessmentCompleted },
    { name: 'Shortlisted', count: funnel.shortlisted },
    { name: 'Interviewing', count: funnel.interviewScheduled },
    { name: 'Hires', count: funnel.selected }
  ];

  const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Recruitment Hub</h1>
        <p className="text-xs text-textMuted mt-1">Monitor candidate pipelines, funnel KPIs, and AI-driven skill demands</p>
      </div>

      {/* KPI counters */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Active Jobs', val: kpis.totalJobs, icon: Briefcase, color: 'text-indigo-400' },
          { label: 'Total Applicants', val: kpis.totalApplications, icon: Users, color: 'text-cyan-400' },
          { label: 'Platform Pool', val: kpis.totalCandidates, icon: Layers, color: 'text-emerald-400' },
          { label: 'Interviews', val: kpis.interviews, icon: Heart, color: 'text-rose-400' },
          { label: 'Successful Hires', val: kpis.hires, icon: TrendingUp, color: 'text-violet-400' }
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="glass-panel border border-darkBorder rounded-xl p-4 flex items-center space-x-3.5">
              <div className={`p-2 bg-slate-900 border border-slate-800 rounded-lg ${kpi.color}`}>
                <Icon size={18} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-textMuted tracking-wider">{kpi.label}</span>
                <p className="text-xl font-bold text-white mt-0.5">{kpi.val}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Visualizers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recruitment Funnel */}
        <div className="lg:col-span-2 glass-panel border border-darkBorder rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200">Pipeline Funnel Progress</h3>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#131c2e', border: '1px solid #1e293b', borderRadius: '8px', fontSize: 10 }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {funnelChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Demand pie */}
        <div className="lg:col-span-1 glass-panel border border-darkBorder rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200">Top Required Tech Skills</h3>
          {skillDemand.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-500">No active skill metrics.</div>
          ) : (
            <div className="w-full h-72 flex flex-col justify-between">
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={skillDemand}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={65}
                      innerRadius={45}
                      paddingAngle={4}
                    >
                      {skillDemand.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#131c2e', border: '1px solid #1e293b', borderRadius: '8px', fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legends */}
              <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-300 font-medium pb-2">
                {skillDemand.slice(0, 6).map((s, idx) => (
                  <div key={idx} className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="capitalize truncate">{s.name} ({s.count})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
