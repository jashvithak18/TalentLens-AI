import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import { Shield, Users, Briefcase, Award, Layers } from 'lucide-react';

const AdminDashboard = () => {
  // Fetch platform stats
  const { data, isLoading } = useQuery({
    queryKey: ['platformStats'],
    queryFn: async () => {
      const res = await api.get('/analytics/platform');
      return res.data;
    }
  });

  if (isLoading) {
    return <div className="text-center py-12 text-slate-500 text-xs">Assembling administrative system dashboards...</div>;
  }

  const stats = data?.stats || { totalUsers: 0, totalCandidates: 0, totalRecruiters: 0, totalJobs: 0, totalAssessments: 0, totalSubmissions: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
          <Shield className="text-indigo-400" size={24} />
          <span>Platform Administrator Control Panel</span>
        </h1>
        <p className="text-xs text-textMuted mt-1">Review operational system volumes, active accounts, and evaluations</p>
      </div>

      {/* KPI counters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Registrations', val: stats.totalUsers, desc: `${stats.totalCandidates} Candidates, ${stats.totalRecruiters} Recruiters`, icon: Users, color: 'text-indigo-400' },
          { label: 'Active Postings', val: stats.totalJobs, desc: 'Overall job listings', icon: Briefcase, color: 'text-cyan-400' },
          { label: 'Configured Assessments', val: stats.totalAssessments, desc: `${stats.totalSubmissions} Total submissions completed`, icon: Award, color: 'text-emerald-400' }
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="glass-panel border border-darkBorder rounded-xl p-5 flex items-center space-x-4">
              <div className={`p-3 bg-slate-900 border border-slate-800 rounded-lg ${kpi.color}`}>
                <Icon size={20} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-textMuted tracking-wider">{kpi.label}</span>
                <p className="text-2xl font-bold text-white mt-0.5">{kpi.val}</p>
                <span className="text-[10px] text-slate-500 block mt-1">{kpi.desc}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminDashboard;
