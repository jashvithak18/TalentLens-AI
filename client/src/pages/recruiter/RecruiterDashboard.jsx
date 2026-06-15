import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import api from '../../utils/api';
import {
  Users,
  Briefcase,
  Layers,
  Heart,
  TrendingUp,
  AlertCircle,
  CheckCircle
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
  const { user } = useSelector((state) => state.auth);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Fetch recruiter analytics
  const { data, isLoading } = useQuery({
    queryKey: ['recruiterAnalytics'],
    queryFn: async () => {
      try {
        const res = await api.get('/analytics/recruiter');
        return res.data;
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch dashboard data.');
        setTimeout(() => setError(''), 3000);
        throw err;
      }
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6 pt-16 px-4 max-w-7xl mx-auto animate-pulse">
        {/* Header Banner Skeleton */}
        <div className="h-24 bg-slate-200 rounded-2xl w-full" />
        
        {/* KPI Skeleton Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-200 rounded-xl" />
          ))}
        </div>
        
        {/* Charts Skeleton Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-slate-200 rounded-2xl" />
          <div className="lg:col-span-1 h-80 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
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

  const COLORS = ['#4F46E5', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#14B8A6'];

  return (
    <div className="space-y-6 pt-16 px-4 max-w-7xl mx-auto pb-8">
      {/* Toast Messages */}
      {success && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs rounded-xl p-4 shadow-lg flex items-center space-x-2 animate-in fade-in slide-in-from-top-4 duration-250">
          <CheckCircle size={16} />
          <span className="font-bold">{success}</span>
        </div>
      )}
      {error && (
        <div className="fixed top-20 right-6 z-50 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl p-4 shadow-lg flex items-center space-x-2 animate-in fade-in slide-in-from-top-4 duration-250">
          <AlertCircle size={16} />
          <span className="font-bold">{error}</span>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brandPrimary/5 via-brandSecondary/5 to-transparent border border-brandPrimary/10 rounded-2xl p-6">
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900 font-jakarta">
          Welcome back, {user?.name || 'Recruiter'}
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-semibold">
          Monitor candidate pipelines, funnel KPIs, and AI-driven skill demands for your active listings.
        </p>
      </div>

      {/* KPI counters */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Active Jobs', val: kpis.totalJobs, icon: Briefcase, bg: 'bg-indigo-50 border-indigo-150 text-brandPrimary' },
          { label: 'Total Applicants', val: kpis.totalApplications, icon: Users, bg: 'bg-blue-50 border-blue-150 text-brandSecondary' },
          { label: 'Platform Pool', val: kpis.totalCandidates, icon: Layers, bg: 'bg-emerald-50 border-emerald-150 text-brandAccent' },
          { label: 'Interviews', val: kpis.interviews, icon: Heart, bg: 'bg-rose-50 border-rose-150 text-rose-600' },
          { label: 'Successful Hires', val: kpis.hires, icon: TrendingUp, bg: 'bg-purple-50 border-purple-150 text-purple-600' }
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-white border border-[#E5E7EB] rounded-xl p-4 flex items-center space-x-3.5 shadow-sm">
              <div className={`p-2.5 rounded-lg border ${kpi.bg}`}>
                <Icon size={18} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">{kpi.label}</span>
                <p className="text-xl font-extrabold text-slate-900 mt-0.5">{kpi.val}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Visualizers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recruitment Funnel */}
        <div className="lg:col-span-2 bg-white border border-[#E5E7EB] rounded-2xl p-5 space-y-4 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-jakarta">Pipeline Funnel Progress</h3>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: 10, color: '#0f172a' }}
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
        <div className="lg:col-span-1 bg-white border border-[#E5E7EB] rounded-2xl p-5 space-y-4 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-jakarta">Top Required Tech Skills</h3>
          {skillDemand.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400 font-semibold">No active skill metrics.</div>
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
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legends */}
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 font-semibold pb-2">
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
