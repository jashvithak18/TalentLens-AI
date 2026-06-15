import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import {
  Sliders,
  EyeOff,
  User,
  Zap,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Award,
  TrendingUp,
  X,
  Plus
} from 'lucide-react';

const AIRankingDashboard = () => {
  const { id } = useParams();
  
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // JD Simulator Weights
  const [weights, setWeights] = useState({
    technicalFit: 35,
    experienceFit: 20,
    projectFit: 20,
    growthFit: 15,
    behavioralFit: 10
  });

  const [blindMode, setBlindMode] = useState(false);
  const [expandedCand, setExpandedCand] = useState(null);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Fetch rankings with simulator weights
  const { data: rankData, isLoading: rankLoading } = useQuery({
    queryKey: ['jobRankings', id, weights],
    queryFn: async () => {
      try {
        const res = await api.get(`/jobs/${id}/rankings`, {
          params: { weights: JSON.stringify(weights) }
        });
        return res.data;
      } catch (err) {
        setErrorMsg(err.response?.data?.error || 'Failed to fetch candidate rankings.');
        setTimeout(() => setErrorMsg(''), 3000);
        throw err;
      }
    }
  });

  // Fetch job details
  const { data: jobData, isLoading: jobLoading } = useQuery({
    queryKey: ['jobDetails', id],
    queryFn: async () => {
      try {
        const res = await api.get(`/jobs/${id}`);
        return res.data;
      } catch (err) {
        setErrorMsg(err.response?.data?.error || 'Failed to fetch job details.');
        setTimeout(() => setErrorMsg(''), 3000);
        throw err;
      }
    }
  });

  const handleSliderChange = (key, val) => {
    setWeights(prev => ({ ...prev, [key]: Number(val) }));
  };

  const handleCheckboxChange = (candidateId) => {
    setSelectedForCompare(prev => {
      if (prev.includes(candidateId)) {
        return prev.filter(cId => cId !== candidateId);
      }
      if (prev.length >= 2) {
        return prev; // Lock at max 2
      }
      return [...prev, candidateId];
    });
  };

  const getAnonymizedName = (index) => {
    return `Candidate ${String.fromCharCode(65 + index)}`;
  };

  const getRiskColor = (score) => {
    if (score > 70) return 'bg-rose-50 text-rose-600 border-rose-200';
    if (score > 35) return 'bg-amber-50 text-amber-600 border-amber-200';
    return 'bg-emerald-50 text-emerald-600 border-emerald-200';
  };

  const getMatchScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-brandPrimary';
    return 'text-slate-500';
  };

  if (rankLoading || jobLoading) {
    return (
      <div className="space-y-6 pt-16 px-4 max-w-7xl mx-auto animate-pulse">
        <div className="h-10 bg-slate-200 rounded-lg w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 h-96 bg-slate-200 rounded-2xl" />
          <div className="lg:col-span-2 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-44 bg-slate-200 rounded-2xl w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const rankings = rankData?.rankings || [];
  const job = jobData?.job || {};

  // Resolve compared candidates
  const comp1 = rankings.find(r => r.candidate?._id === selectedForCompare[0]);
  const comp2 = rankings.find(r => r.candidate?._id === selectedForCompare[1]);
  
  // Decide winner for comparison
  let winner = null;
  let loser = null;
  if (comp1 && comp2) {
    winner = comp1.matchScore >= comp2.matchScore ? comp1 : comp2;
    loser = comp1.matchScore < comp2.matchScore ? comp1 : comp2;
  }

  return (
    <div className="space-y-6 pt-16 px-4 max-w-7xl mx-auto pb-16 relative">
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

      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900 font-jakarta">
          AI Calibration: {job.title}
        </h1>
        <p className="text-xs text-textMuted mt-1 font-semibold">
          Adjust requirements weights in the JD Simulator to dynamically re-rank and evaluate candidates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar: JD Simulator */}
        <div className="lg:col-span-1 bg-white border border-[#E5E7EB] rounded-2xl p-5 space-y-5 h-fit shadow-sm">
          <div className="flex items-center space-x-2 text-brandPrimary">
            <Sliders size={18} />
            <h3 className="text-xs font-bold uppercase tracking-wider">Dynamic JD Simulator</h3>
          </div>
          <p className="text-[10px] text-textMuted font-semibold leading-relaxed">
            Drag the sliders to change weighting. Candidates will be re-scored and sorted automatically.
          </p>

          <div className="space-y-4">
            {[
              { key: 'technicalFit', label: 'Technical Fit' },
              { key: 'experienceFit', label: 'Experience Match' },
              { key: 'projectFit', label: 'Project Portfolio' },
              { key: 'growthFit', label: 'Growth Potential' },
              { key: 'behavioralFit', label: 'Behavioral Signals' }
            ].map(slider => (
              <div key={slider.key} className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-700">
                  <span>{slider.label}</span>
                  <span className="text-brandPrimary">{weights[slider.key]}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights[slider.key]}
                  onChange={(e) => handleSliderChange(slider.key, e.target.value)}
                  className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brandPrimary"
                />
              </div>
            ))}
          </div>

          <div className="border-t border-[#E5E7EB] pt-4">
            <div className="flex items-center justify-between">
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
        </div>

        {/* Main Content: Candidate Cards Grid */}
        <div className="lg:col-span-2 space-y-4">
          {rankings.length === 0 ? (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center text-slate-400 text-xs font-bold shadow-sm">
              No evaluations available for this job posting yet.
            </div>
          ) : (
            rankings.map((rank, index) => {
              const candName = blindMode ? getAnonymizedName(index) : rank.candidate?.name || 'Candidate';
              const candLocation = blindMode ? 'Anonymized Location' : rank.candidate?.profile?.location || 'Remote';
              const isSelected = selectedForCompare.includes(rank.candidate?._id);
              const isExpanded = expandedCand === rank._id;
              
              return (
                <div
                  key={rank._id}
                  className={`bg-white border rounded-2xl p-5 shadow-sm transition-all space-y-4 ${
                    isSelected ? 'border-brandPrimary ring-2 ring-brandPrimary/10' : 'border-[#E5E7EB]'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-8 h-8 rounded-full bg-slate-50 border border-[#E5E7EB] flex items-center justify-center font-extrabold text-slate-700 text-xs shadow-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">{candName}</h3>
                        <p className="text-[10px] text-textMuted mt-0.5 font-bold">
                          {rank.candidate?.profile?.title || 'Software Engineer'} • {candLocation}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block">Match Score</span>
                        <span className={`text-lg font-extrabold ${getMatchScoreColor(rank.matchScore)}`}>
                          {rank.matchScore}%
                        </span>
                      </div>

                      {/* Compare Checkbox */}
                      <div className="flex items-center space-x-1 bg-slate-50 border border-[#E5E7EB] px-2.5 py-1.5 rounded-lg">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleCheckboxChange(rank.candidate?._id)}
                          className="w-3.5 h-3.5 rounded text-brandPrimary border-slate-300 focus:ring-brandPrimary cursor-pointer"
                        />
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Compare</span>
                      </div>
                    </div>
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1">
                    {(rank.candidate?.profile?.skills || []).slice(0, 6).map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-slate-50 border border-[#E5E7EB] text-[9px] text-slate-600 font-semibold rounded">
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Expandable trigger */}
                  <div className="flex space-x-4 border-t border-[#E5E7EB]/50 pt-3">
                    <div
                      onClick={() => setExpandedCand(isExpanded ? null : rank._id)}
                      className="flex items-center space-x-1 text-[10px] font-bold text-brandPrimary hover:underline cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      <span>{isExpanded ? 'Hide AI Analysis' : 'Show AI Analysis'}</span>
                    </div>
                  </div>

                  {/* Expanded AI Analysis Section */}
                  {isExpanded && (
                    <div className="space-y-4 border-t border-[#E5E7EB]/50 pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* Strengths and Gaps panels */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5 space-y-2">
                          <h4 className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center space-x-1">
                            <CheckCircle size={12} />
                            <span>Strengths</span>
                          </h4>
                          <ul className="text-[11px] text-slate-600 font-semibold space-y-1.5 list-disc pl-4 leading-relaxed">
                            {rank.reasons?.map((reason, idx) => (
                              <li key={idx}>{reason}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-3.5 space-y-2">
                          <h4 className="text-[10px] font-bold uppercase tracking-wider text-rose-600 flex items-center space-x-1">
                            <AlertCircle size={12} />
                            <span>Why not higher / Gaps</span>
                          </h4>
                          <ul className="text-[11px] text-slate-600 font-semibold space-y-1.5 list-disc pl-4 leading-relaxed">
                            {rank.missing?.map((gap, idx) => (
                              <li key={idx}>{gap}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Risk Grid */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hiring Risk Profile</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                          {[
                            { key: 'skillGap', label: 'Skill Gap' },
                            { key: 'experience', label: 'Experience' },
                            { key: 'communication', label: 'Communication' },
                            { key: 'team', label: 'Team Fit' },
                            { key: 'assessment', label: 'Assessment' }
                          ].map(risk => {
                            const riskObj = rank.risks?.[risk.key] || { score: 0, explanation: '' };
                            return (
                              <div
                                key={risk.key}
                                className={`border rounded-xl p-2.5 flex flex-col items-center text-center space-y-1 ${getRiskColor(riskObj.score)}`}
                                title={riskObj.explanation}
                              >
                                <span className="text-[9px] uppercase font-bold tracking-wider opacity-90">{risk.label}</span>
                                <span className="text-sm font-extrabold">{riskObj.score}%</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Fit Details breakdown */}
                      <div className="space-y-2.5">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Weight breakdown</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                          {[
                            { key: 'technicalFit', label: 'Technical Fit' },
                            { key: 'experienceFit', label: 'Experience Fit' },
                            { key: 'projectFit', label: 'Project Fit' },
                            { key: 'growthFit', label: 'Growth Fit' },
                            { key: 'behavioralFit', label: 'Behavioral Fit' }
                          ].map(fit => {
                            const val = rank.fitDetails?.[fit.key] || 0;
                            return (
                              <div key={fit.key} className="flex items-center justify-between text-[11px] font-semibold">
                                <span className="text-slate-600 text-xs">{fit.label}</span>
                                <div className="flex items-center space-x-2.5 w-1/2 justify-end">
                                  <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-brandPrimary h-full" style={{ width: `${val}%` }} />
                                  </div>
                                  <span className="text-slate-800 w-8 text-right">{val}%</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Floating Launch Comparison Button */}
      {selectedForCompare.length === 2 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-white border border-[#E5E7EB] rounded-full px-6 py-3 shadow-xl flex items-center space-x-4 hover:shadow-2xl transition-all">
          <span className="text-xs font-bold text-slate-700">2 Candidates Selected</span>
          <div
            onClick={() => setShowCompareModal(true)}
            className="btn-primary text-xs font-bold py-1.5 px-4 rounded-full cursor-pointer flex items-center space-x-1 shadow-sm"
          >
            <span>Compare Profiles</span>
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      {showCompareModal && comp1 && comp2 && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white border border-[#E5E7EB] rounded-2xl p-6 relative my-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <div
              onClick={() => setShowCompareModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer p-1.5"
            >
              <X size={18} />
            </div>

            <div className="text-center mb-6">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 font-jakarta">Candidate Comparison Portal</h3>
              <p className="text-[10px] text-textMuted mt-1 font-semibold">Side by side evaluation of technical scores, project profiles, and behavioral metrics</p>
            </div>

            {/* Candidates Side by Side cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-[#E5E7EB]/50">
              {/* Candidate 1 */}
              <div className="bg-slate-50 border border-[#E5E7EB] rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">
                      {blindMode ? 'Candidate A' : comp1.candidate?.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                      {comp1.candidate?.profile?.title || 'Engineer'}
                    </p>
                  </div>
                  <span className="text-lg font-extrabold text-brandPrimary">{comp1.matchScore}%</span>
                </div>

                {/* Score breakdown bars */}
                <div className="space-y-2 border-t border-[#E5E7EB] pt-3">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Weight alignment</span>
                  {[
                    { key: 'technicalFit', label: 'Technical Fit' },
                    { key: 'experienceFit', label: 'Experience Match' },
                    { key: 'projectFit', label: 'Project Portfolio' },
                    { key: 'growthFit', label: 'Growth Potential' },
                    { key: 'behavioralFit', label: 'Behavioral Signals' }
                  ].map(fit => (
                    <div key={fit.key} className="flex items-center justify-between text-[10px] font-semibold text-slate-700">
                      <span>{fit.label}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-200 rounded-full h-1 overflow-hidden">
                          <div className="bg-brandPrimary h-full" style={{ width: `${comp1.fitDetails?.[fit.key] || 0}%` }} />
                        </div>
                        <span className="w-8 text-right font-extrabold">{comp1.fitDetails?.[fit.key] || 0}%</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* DNA Metrics */}
                <div className="space-y-2 border-t border-[#E5E7EB] pt-3">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">🧬 Core DNA Metrics</span>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[10px] font-semibold text-slate-700">
                    <div>Problem Solving: <span className="text-slate-900 font-extrabold">{comp1.candidate?.score?.dna?.problemSolving || 50}%</span></div>
                    <div>Tech Skills: <span className="text-slate-900 font-extrabold">{comp1.candidate?.score?.dna?.technicalDepth || 50}%</span></div>
                    <div>Communication: <span className="text-slate-900 font-extrabold">{comp1.candidate?.score?.dna?.communication || 50}%</span></div>
                    <div>Leadership: <span className="text-slate-900 font-extrabold">{comp1.candidate?.score?.dna?.leadership || 50}%</span></div>
                    <div>Adaptability: <span className="text-slate-900 font-extrabold">{comp1.candidate?.score?.dna?.adaptability || 50}%</span></div>
                    <div>Dependability: <span className="text-slate-900 font-extrabold">{comp1.candidate?.score?.dna?.reliability || 50}%</span></div>
                  </div>
                </div>
              </div>

              {/* Candidate 2 */}
              <div className="bg-slate-50 border border-[#E5E7EB] rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">
                      {blindMode ? 'Candidate B' : comp2.candidate?.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                      {comp2.candidate?.profile?.title || 'Engineer'}
                    </p>
                  </div>
                  <span className="text-lg font-extrabold text-brandPrimary">{comp2.matchScore}%</span>
                </div>

                {/* Score breakdown bars */}
                <div className="space-y-2 border-t border-[#E5E7EB] pt-3">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Weight alignment</span>
                  {[
                    { key: 'technicalFit', label: 'Technical Fit' },
                    { key: 'experienceFit', label: 'Experience Match' },
                    { key: 'projectFit', label: 'Project Portfolio' },
                    { key: 'growthFit', label: 'Growth Potential' },
                    { key: 'behavioralFit', label: 'Behavioral Signals' }
                  ].map(fit => (
                    <div key={fit.key} className="flex items-center justify-between text-[10px] font-semibold text-slate-700">
                      <span>{fit.label}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-200 rounded-full h-1 overflow-hidden">
                          <div className="bg-brandPrimary h-full" style={{ width: `${comp2.fitDetails?.[fit.key] || 0}%` }} />
                        </div>
                        <span className="w-8 text-right font-extrabold">{comp2.fitDetails?.[fit.key] || 0}%</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* DNA Metrics */}
                <div className="space-y-2 border-t border-[#E5E7EB] pt-3">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">🧬 Core DNA Metrics</span>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[10px] font-semibold text-slate-700">
                    <div>Problem Solving: <span className="text-slate-900 font-extrabold">{comp2.candidate?.score?.dna?.problemSolving || 50}%</span></div>
                    <div>Tech Skills: <span className="text-slate-900 font-extrabold">{comp2.candidate?.score?.dna?.technicalDepth || 50}%</span></div>
                    <div>Communication: <span className="text-slate-900 font-extrabold">{comp2.candidate?.score?.dna?.communication || 50}%</span></div>
                    <div>Leadership: <span className="text-slate-900 font-extrabold">{comp2.candidate?.score?.dna?.leadership || 50}%</span></div>
                    <div>Adaptability: <span className="text-slate-900 font-extrabold">{comp2.candidate?.score?.dna?.adaptability || 50}%</span></div>
                    <div>Dependability: <span className="text-slate-900 font-extrabold">{comp2.candidate?.score?.dna?.reliability || 50}%</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Recommendation Banner */}
            {winner && loser && (
              <div className="mt-6 bg-indigo-50/50 border border-brandPrimary/10 rounded-2xl p-5 space-y-2.5">
                <h4 className="text-xs font-bold text-brandPrimary uppercase tracking-wider flex items-center space-x-2">
                  <Zap size={15} />
                  <span>Winner Recommendation: {blindMode ? (winner === comp1 ? 'Candidate A' : 'Candidate B') : winner.candidate?.name}</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  Based on the dynamic JD weights, {blindMode ? (winner === comp1 ? 'Candidate A' : 'Candidate B') : winner.candidate?.name} is recommended for this role with a match fit score of {winner.matchScore}%. They demonstrate higher alignment with technical fit metrics ({winner.fitDetails?.technicalFit}%) and overall suitability calibration.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIRankingDashboard;
