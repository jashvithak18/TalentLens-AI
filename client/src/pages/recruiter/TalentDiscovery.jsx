import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import { Compass, User, Zap, Sparkles, TrendingUp, Layers, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

const TalentDiscovery = () => {
  const [activeCategory, setActiveCategory] = useState('underrated');
  const [blindMode, setBlindMode] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch talent discovery pool
  const { data, isLoading } = useQuery({
    queryKey: ['talentDiscovery'],
    queryFn: async () => {
      try {
        const res = await api.get('/analytics/talent-discovery');
        return res.data;
      } catch (err) {
        setErrorMsg(err.response?.data?.error || 'Failed to fetch talent discovery pool.');
        setTimeout(() => setErrorMsg(''), 3000);
        throw err;
      }
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6 pt-16 px-4 max-w-7xl mx-auto animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-slate-200 rounded-lg w-48" />
          <div className="h-6 bg-slate-200 rounded-lg w-32" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-200 rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-slate-200 rounded-2xl w-full" />
      </div>
    );
  }

  const pool = data?.discovery || { underrated: [], topTechnical: [], highestPotential: [], mostConsistent: [] };
  const currentList = pool[activeCategory] || [];

  const categories = [
    { id: 'underrated', label: 'Underrated Talent', icon: Sparkles, desc: 'Low experience profiles with exceptional future growth potential.' },
    { id: 'topTechnical', label: 'Top Technical Talent', icon: Zap, desc: 'Highest problem solving and technical depth scores.' },
    { id: 'highestPotential', label: 'Emerging Potential', icon: TrendingUp, desc: 'Candidates positioned for high learning velocity and adaptability.' },
    { id: 'mostConsistent', label: 'Most Consistent', icon: Layers, desc: 'Highest activity consistency scores and test completion indexes.' }
  ];

  const activeInfo = categories.find(c => c.id === activeCategory);

  const getAnonymizedName = (index) => {
    return `Candidate ${index + 1}`;
  };

  return (
    <div className="space-y-6 pt-16 px-4 max-w-7xl mx-auto pb-8">
      {/* Toast notifications */}
      {successMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs rounded-xl p-4 shadow-lg flex items-center space-x-2 animate-in fade-in slide-in-from-top-4 duration-250">
          <CheckCircle size={16} />
          <span className="font-bold">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="fixed top-20 right-6 z-50 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl p-4 shadow-lg flex items-center space-x-2 animate-in fade-in slide-in-from-top-4 duration-250">
          <AlertCircle size={16} />
          <span className="font-bold">{errorMsg}</span>
        </div>
      )}

      {/* Header with Blind Mode Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 font-jakarta">Talent Discovery Board</h1>
          <p className="text-xs text-textMuted mt-1 font-semibold">Discover hidden potentials, emerging developers, and consistent performers</p>
        </div>
        
        {/* Blind mode switch */}
        <div className="flex items-center space-x-4 bg-white border border-[#E5E7EB] px-4 py-2.5 rounded-xl shadow-sm">
          <div className="flex items-center space-x-2">
            <EyeOff size={16} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-700">Blind Hiring Mode</span>
          </div>
          <div
            onClick={() => setBlindMode(!blindMode)}
            className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
              blindMode ? 'bg-brandPrimary justify-end' : 'bg-slate-200 justify-start'
            }`}
          >
            <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {categories.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all shadow-sm cursor-pointer ${
                activeCategory === c.id
                  ? 'bg-brandPrimary/5 border-brandPrimary text-brandPrimary font-bold'
                  : 'bg-white border-[#E5E7EB] text-slate-500 hover:border-slate-350 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon size={18} className="mb-2" />
              <span className="text-xs font-bold">{c.label}</span>
            </div>
          );
        })}
      </div>

      {/* Discovery List */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 space-y-4 shadow-sm">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">{activeInfo.label}</h3>
          <p className="text-[10px] text-textMuted mt-0.5 font-semibold">{activeInfo.desc}</p>
        </div>

        {currentList.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 font-semibold">No candidates cataloged under this criteria.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-600">
              <thead className="text-[10px] uppercase text-slate-400 font-bold border-b border-[#E5E7EB]/70">
                <tr>
                  <th scope="col" className="py-3 pl-4">Candidate</th>
                  <th scope="col" className="py-3">Title</th>
                  <th scope="col" className="py-3">Primary Skills</th>
                  <th scope="col" className="py-3 text-center">Growth Potential %</th>
                  <th scope="col" className="py-3 text-center">Tech Depth %</th>
                </tr>
              </thead>
              <tbody>
                {currentList.map((cand, idx) => {
                  const profile = cand;
                  const uName = cand.user?.name || 'Candidate';
                  const dispName = blindMode ? getAnonymizedName(idx) : uName;
                  return (
                    <tr key={cand._id} className="border-b border-[#E5E7EB]/50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 pl-4 flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-50 border border-[#E5E7EB] flex items-center justify-center text-indigo-400 font-bold">
                          <User size={13} />
                        </div>
                        <span className="font-bold text-slate-800">
                          {dispName}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-500 font-semibold">{profile.title || 'MERN Developer'}</td>
                      <td className="py-3.5 max-w-xs truncate text-slate-500 font-semibold">{profile.skills?.slice(0, 5).join(', ') || 'N/A'}</td>
                      <td className="py-3.5 font-extrabold text-brandPrimary text-center">{profile.score?.potential?.futureGrowthPotential || 50}%</td>
                      <td className="py-3.5 font-extrabold text-emerald-600 text-center">{profile.score?.dna?.technicalDepth || 50}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TalentDiscovery;
