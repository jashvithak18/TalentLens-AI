import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Award, Clock, ArrowRight, Play, CheckCircle } from 'lucide-react';

const Assessments = () => {
  const navigate = useNavigate();

  // Fetch assessments
  const { data, isLoading } = useQuery({
    queryKey: ['assessments'],
    queryFn: async () => {
      const res = await api.get('/assessments');
      return res.data;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-40 bg-slate-200 rounded-xl" />
          <div className="h-40 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl pt-16">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 font-jakarta">Assessment Hub</h1>
        <p className="text-xs text-textMuted mt-1">Complete technical challenges and behavioral tests to calibrate your DNA score</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(data?.assessments || []).map((test) => {
          const isCoding = test.type === 'coding';
          return (
            <div
              key={test._id}
              className="glass-panel border border-darkBorder rounded-xl p-5 flex flex-col justify-between hover:border-indigo-600/40 transition-all space-y-4"
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-[10px] font-bold rounded text-indigo-700 uppercase">
                    {test.category} ({test.type})
                  </span>
                  <div className="flex items-center space-x-1 text-[10px] text-textMuted font-semibold">
                    <Clock size={12} />
                    <span>{test.duration} mins</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-800 mt-3">{test.title}</h3>
                <p className="text-xs text-textMuted mt-1 leading-relaxed">{test.description}</p>
              </div>

              <div className="flex items-center justify-between border-t border-darkBorder/40 pt-4 mt-auto">
                <span className="text-[10px] text-slate-500">Passing requirement: {test.passingScore}%</span>
                <button
                  onClick={() => navigate(isCoding ? `/candidate/coding/${test._id}` : `/candidate/assessment/${test._id}`)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white rounded-lg flex items-center space-x-1.5"
                >
                  <Play size={12} />
                  <span>Start Challenge</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Assessments;
