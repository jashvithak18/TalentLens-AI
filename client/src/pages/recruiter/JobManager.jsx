import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Plus, Briefcase, MapPin, DollarSign, PlusCircle, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';

const JobManager = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Fetch jobs
  const { data, isLoading } = useQuery({
    queryKey: ['recruiterJobs'],
    queryFn: async () => {
      const res = await api.get('/jobs');
      return res.data;
    }
  });

  // Create Job Mutation
  const createJobMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post('/jobs', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiterJobs'] });
      setSuccessMsg('Job post published successfully!');
      setShowCreateModal(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const requiredSkills = fd.get('requiredSkills').split(',').map(s => s.trim()).filter(Boolean);
    const preferredSkills = fd.get('preferredSkills').split(',').map(s => s.trim()).filter(Boolean);

    createJobMutation.mutate({
      title: fd.get('title'),
      description: fd.get('description'),
      location: fd.get('location'),
      employmentType: fd.get('employmentType'),
      experience: Number(fd.get('experience')),
      requiredSkills,
      preferredSkills,
      salaryRange: {
        min: Number(fd.get('minSalary')),
        max: Number(fd.get('maxSalary'))
      }
    });
  };

  if (isLoading) {
    return <div className="text-center py-12 text-slate-500 text-xs">Assembling job collections...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">Job Postings</h1>
          <p className="text-xs text-textMuted mt-1">Manage active listings and review applicant rankings</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary text-xs font-semibold flex items-center space-x-1.5"
        >
          <PlusCircle size={14} />
          <span>Publish Listing</span>
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg p-3.5 flex items-center space-x-2">
          <CheckCircle size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Listings grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(data?.jobs || []).map((job) => (
          <div
            key={job._id}
            className="glass-panel border border-darkBorder rounded-xl p-5 flex flex-col justify-between hover:border-indigo-600/40 transition-all space-y-4"
          >
            <div>
              <div className="flex justify-between items-start">
                <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[9px] font-bold rounded text-indigo-400 capitalize">
                  {job.employmentType}
                </span>
                <span className="text-[10px] text-textMuted font-mono">Min Exp: {job.experience} yrs</span>
              </div>

              <h3 className="text-sm font-bold text-gray-100 mt-3">{job.title}</h3>
              <p className="text-xs text-textMuted mt-1.5 line-clamp-2 leading-relaxed">{job.description}</p>
            </div>

            <div className="border-t border-darkBorder/40 pt-4 space-y-3 mt-auto">
              <div className="flex justify-between items-center text-[10px] text-textMuted">
                <span className="flex items-center space-x-1">
                  <MapPin size={12} />
                  <span>{job.location}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <DollarSign size={12} />
                  <span>{job.salaryRange ? `$${(job.salaryRange.min/1000)}k - $${(job.salaryRange.max/1000)}k` : 'Negotiable'}</span>
                </span>
              </div>

              <button
                onClick={() => navigate(`/recruiter/jobs/${job._id}/rankings`)}
                className="w-full btn-secondary text-xs flex items-center justify-center space-x-1 py-1.5"
              >
                <FileSpreadsheet size={12} />
                <span>AI Talent Rankings</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <form
            onSubmit={handleCreateSubmit}
            className="w-full max-w-xl bg-darkCard border border-darkBorder rounded-2xl p-6 space-y-4 my-8"
          >
            <div>
              <h3 className="text-sm font-bold text-gray-100">Publish New Job Listing</h3>
              <p className="text-xs text-textMuted mt-0.5">Publish role requirements and calibration profiles</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-gray-300">Job Title</label>
                <input type="text" name="title" required placeholder="e.g. Senior MERN Developer" className="custom-input text-xs" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-gray-300">Location</label>
                <input type="text" name="location" required placeholder="e.g. Remote, US" className="custom-input text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-gray-300">Employment Type</label>
                <select name="employmentType" className="custom-input text-xs">
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-gray-300">Minimum Experience (Years)</label>
                <input type="number" name="experience" min="0" required placeholder="e.g. 3" className="custom-input text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-gray-300">Minimum Salary ($)</label>
                <input type="number" name="minSalary" required placeholder="80000" className="custom-input text-xs" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-gray-300">Maximum Salary ($)</label>
                <input type="number" name="maxSalary" required placeholder="120000" className="custom-input text-xs" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-gray-300">Required Skills (Comma-separated)</label>
              <input type="text" name="requiredSkills" required placeholder="React, Node.js, Express" className="custom-input text-xs" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-gray-300">Preferred Skills (Comma-separated)</label>
              <input type="text" name="preferredSkills" placeholder="AWS, TypeScript, Docker" className="custom-input text-xs" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-gray-300">Job Description</label>
              <textarea name="description" rows={4} required placeholder="Detailed role requirements..." className="custom-input text-xs" />
            </div>

            <div className="flex space-x-3 justify-end text-xs pt-2">
              <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary px-4 py-2">
                Cancel
              </button>
              <button type="submit" disabled={createJobMutation.isPending} className="btn-primary px-5 py-2.5">
                {createJobMutation.isPending ? 'Publishing...' : 'Publish Job'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default JobManager;
