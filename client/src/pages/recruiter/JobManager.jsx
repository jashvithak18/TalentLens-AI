import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Plus, Briefcase, MapPin, DollarSign, CheckCircle, AlertCircle, FileSpreadsheet, Power } from 'lucide-react';

const JobManager = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    employmentType: 'full-time',
    experience: '',
    requiredSkills: '',
    preferredSkills: '',
    minSalary: '',
    maxSalary: ''
  });

  // Fetch jobs
  const { data, isLoading } = useQuery({
    queryKey: ['recruiterJobs'],
    queryFn: async () => {
      try {
        const res = await api.get('/jobs');
        return res.data;
      } catch (err) {
        setErrorMsg(err.response?.data?.error || 'Failed to load jobs list.');
        setTimeout(() => setErrorMsg(''), 3000);
        throw err;
      }
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
      setFormData({
        title: '',
        description: '',
        location: '',
        employmentType: 'full-time',
        experience: '',
        requiredSkills: '',
        preferredSkills: '',
        minSalary: '',
        maxSalary: ''
      });
      setTimeout(() => setSuccessMsg(''), 3000);
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.error || 'Failed to publish job.');
      setTimeout(() => setErrorMsg(''), 3000);
    }
  });

  // Update Status Mutation (Close/Reopen Job)
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await api.put(`/jobs/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiterJobs'] });
      setSuccessMsg('Job listing status updated!');
      setTimeout(() => setSuccessMsg(''), 3000);
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.error || 'Failed to update job status.');
      setTimeout(() => setErrorMsg(''), 3000);
    }
  });

  const handleCreateSubmit = () => {
    if (!formData.title || !formData.description || !formData.location || !formData.experience || !formData.requiredSkills || !formData.minSalary || !formData.maxSalary) {
      setErrorMsg('Please fill in all required fields.');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }

    const requiredSkills = formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean);
    const preferredSkills = formData.preferredSkills.split(',').map(s => s.trim()).filter(Boolean);

    createJobMutation.mutate({
      title: formData.title,
      description: formData.description,
      location: formData.location,
      employmentType: formData.employmentType,
      experience: Number(formData.experience),
      requiredSkills,
      preferredSkills,
      salaryRange: {
        min: Number(formData.minSalary),
        max: Number(formData.maxSalary)
      }
    });
  };

  const handleToggleStatus = (job) => {
    const nextStatus = job.status === 'active' ? 'closed' : 'active';
    toggleStatusMutation.mutate({ id: job._id, status: nextStatus });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pt-16 px-4 max-w-7xl mx-auto animate-pulse">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-slate-200 rounded-lg w-48" />
            <div className="h-4 bg-slate-200 rounded-lg w-64 mt-2" />
          </div>
          <div className="h-10 bg-slate-200 rounded-lg w-36" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-56 bg-slate-200 rounded-2xl w-full" />
          ))}
        </div>
      </div>
    );
  }

  const jobsList = data?.jobs || [];

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

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 font-jakarta">Job Postings</h1>
          <p className="text-xs text-textMuted mt-1 font-semibold">Manage active listings and review applicant rankings</p>
        </div>
        <div
          onClick={() => setShowCreateModal(true)}
          className="btn-primary text-xs font-semibold flex items-center space-x-1.5 cursor-pointer py-2.5 px-4 shadow-sm"
        >
          <Plus size={14} />
          <span>Publish Listing</span>
        </div>
      </div>

      {/* Listings grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobsList.map((job) => (
          <div
            key={job._id}
            className="bg-white border border-[#E5E7EB] rounded-2xl p-5 flex flex-col justify-between hover:border-brandPrimary/30 hover:shadow-md transition-all space-y-4"
          >
            <div>
              <div className="flex justify-between items-start">
                <span className="px-2 py-0.5 bg-slate-950 border border-slate-900 text-[9px] font-bold rounded text-indigo-400 capitalize">
                  {job.employmentType}
                </span>
                <span className="text-[10px] text-textMuted font-mono font-bold">Min Exp: {job.experience} yrs</span>
              </div>

              <h3 className="text-sm font-bold text-slate-800 mt-3">{job.title}</h3>
              <p className="text-xs text-textMuted mt-1.5 line-clamp-2 leading-relaxed font-semibold">{job.description}</p>
              
              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1 mt-3">
                {job.requiredSkills?.slice(0, 4).map((skill, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-slate-50 border border-[#E5E7EB] text-[9px] text-slate-600 font-semibold rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t border-[#E5E7EB] pt-4 space-y-3 mt-auto">
              <div className="flex justify-between items-center text-[10px] text-textMuted font-semibold">
                <span className="flex items-center space-x-1">
                  <MapPin size={12} />
                  <span>{job.location}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <DollarSign size={12} />
                  <span>{job.salaryRange ? `₹${(job.salaryRange.min/100000)} LPA - ₹${(job.salaryRange.max/100000)} LPA` : 'Negotiable'}</span>
                </span>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold bg-slate-50 border border-[#E5E7EB] px-3 py-1.5 rounded-lg">
                <span>Total Candidates:</span>
                <span className="text-brandPrimary font-extrabold">{job.applicantCount || 0}</span>
              </div>

              <div className="flex gap-2">
                <div
                  onClick={() => navigate(`/recruiter/jobs/${job._id}/rankings`)}
                  className="flex-1 btn-primary text-xs flex items-center justify-center space-x-1.5 py-2 cursor-pointer font-bold shadow-sm"
                >
                  <FileSpreadsheet size={13} />
                  <span>View Rankings</span>
                </div>
                
                <div
                  onClick={() => handleToggleStatus(job)}
                  className={`p-2 border rounded-xl flex items-center justify-center cursor-pointer transition-all ${
                    job.status === 'active' 
                      ? 'bg-emerald-50 border-emerald-255 text-emerald-600 hover:bg-emerald-100/50' 
                      : 'bg-rose-50 border-rose-255 text-rose-600 hover:bg-rose-100/50'
                  }`}
                  title={job.status === 'active' ? 'Status: Active (Click to Close)' : 'Status: Closed (Click to Reopen)'}
                >
                  <Power size={14} className={job.status === 'active' ? '' : 'rotate-180'} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Creation Modal (No Form HTML Element) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-xl bg-white border border-[#E5E7EB] rounded-2xl p-6 space-y-4 my-8">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Publish New Job Listing</h3>
              <p className="text-xs text-textMuted mt-0.5 font-semibold">Publish role requirements and calibration profiles</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Job Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Senior MERN Developer"
                  className="custom-input text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Remote, India"
                  className="custom-input text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Employment Type *</label>
                <select
                  value={formData.employmentType}
                  onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                  className="custom-input text-xs cursor-pointer"
                >
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Min Experience (Years) *</label>
                <input
                  type="number"
                  min="0"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="e.g. 3"
                  className="custom-input text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Min Salary (₹ Per Annum) *</label>
                <input
                  type="number"
                  value={formData.minSalary}
                  onChange={(e) => setFormData({ ...formData, minSalary: e.target.value })}
                  placeholder="1200000"
                  className="custom-input text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Max Salary (₹ Per Annum) *</label>
                <input
                  type="number"
                  value={formData.maxSalary}
                  onChange={(e) => setFormData({ ...formData, maxSalary: e.target.value })}
                  placeholder="2000000"
                  className="custom-input text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Required Skills (Comma-separated) *</label>
              <input
                type="text"
                value={formData.requiredSkills}
                onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                placeholder="React, Node.js, Express"
                className="custom-input text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Preferred Skills (Comma-separated)</label>
              <input
                type="text"
                value={formData.preferredSkills}
                onChange={(e) => setFormData({ ...formData, preferredSkills: e.target.value })}
                placeholder="AWS, TypeScript, Docker"
                className="custom-input text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Job Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Detailed role requirements..."
                className="custom-input text-xs"
              />
            </div>

            <div className="flex space-x-3 justify-end text-xs pt-2">
              <div
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary px-4 py-2 cursor-pointer font-bold"
              >
                Cancel
              </div>
              <div
                onClick={handleCreateSubmit}
                className={`btn-primary px-5 py-2.5 cursor-pointer font-bold ${
                  createJobMutation.isPending ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                {createJobMutation.isPending ? 'Publishing...' : 'Publish Job'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobManager;
