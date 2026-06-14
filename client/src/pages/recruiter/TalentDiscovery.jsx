import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import { Compass, User, Zap, Sparkles, TrendingUp, Layers } from 'lucide-react';
import { useSelector } from 'react-redux';

const TalentDiscovery = () => {
  const [activeCategory, setActiveCategory] = useState('underrated');
  const { isBlindMode } = useSelector(state => state.auth);

  // Fetch talent discovery pool
  const { data, isLoading } = useQuery({
    queryKey: ['talentDiscovery'],
    queryFn: async () => {
      const res = await api.get('/analytics/talent-discovery');
      return res.data;
    }
  });

  if (isLoading) {
    return <div className="text-center py-12 text-slate-500 text-xs">Calibrating talent discovery directories...</div>;
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

  return (
    <div className="space-y-6 pt-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 font-jakarta">Talent Discovery Board</h1>
        <p className="text-xs text-textMuted mt-1">Discover hidden potentials, emerging developers, and consistent performers</p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {categories.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all shadow-sm ${
                activeCategory === c.id
                  ? 'bg-brandPrimary/5 border-brandPrimary text-brandPrimary font-bold'
                  : 'bg-white border-[#E5E7EB] text-slate-500 hover:border-slate-300 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon size={18} className="mb-2" />
              <span className="text-xs font-semibold">{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* Discovery List */}
      <div className="glass-panel border border-darkBorder rounded-2xl p-6 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-200">{activeInfo.label}</h3>
          <p className="text-[10px] text-textMuted mt-0.5">{activeInfo.desc}</p>
        </div>

        {currentList.length === 0 ? (
          <p className="text-xs text-slate-500 py-6">No candidates cataloged under this criteria.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-gray-300">
              <thead className="text-[10px] uppercase text-slate-500 font-bold border-b border-darkBorder/40">
                <tr>
                  <th scope="col" className="py-3">Candidate</th>
                  <th scope="col" className="py-3">Title</th>
                  <th scope="col" className="py-3">Primary Skills</th>
                  <th scope="col" className="py-3">Growth Potential</th>
                  <th scope="col" className="py-3">Tech Depth</th>
                </tr>
              </thead>
              <tbody>
                {currentList.map((cand) => {
                  const profile = cand;
                  const uName = cand.user?.name || 'Candidate';
                  return (
                    <tr key={cand._id} className="border-b border-darkBorder/20 hover:bg-slate-900/10">
                      <td className="py-3.5 flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 font-bold">
                          <User size={14} />
                        </div>
                        <span className="font-semibold text-gray-200">
                          {isBlindMode ? 'Anonymized Candidate' : uName}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-400">{profile.title || 'MERN Developer'}</td>
                      <td className="py-3.5 max-w-xs truncate">{profile.skills?.join(', ') || 'N/A'}</td>
                      <td className="py-3.5 font-semibold text-indigo-400">{profile.score?.potential?.futureGrowthPotential || 50}%</td>
                      <td className="py-3.5 font-semibold text-emerald-400">{profile.score?.dna?.technicalDepth || 50}%</td>
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
