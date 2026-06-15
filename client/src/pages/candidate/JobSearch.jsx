import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import {
  Search,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  CheckCircle,
  AlertCircle,
  Eye,
  Send
} from 'lucide-react';

const JobSearch = ({ defaultTab = 'search' }) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch Jobs
  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['jobs', search, location, type],
    queryFn: async () => {
      const res = await api.get('/jobs', {
        params: { search, location, type }
      });
      return res.data;
    }
  });

  // Fetch Applications
  const { data: appsData, isLoading: appsLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: async () => {
      const res = await api.get('/jobs/my-applications');
      return res.data;
    }
  });

  // Apply Mutation
  const applyMutation = useMutation({
    mutationFn: async ({ jobId, coverLetter }) => {
      const res = await api.post(`/jobs/${jobId}/apply`, { coverLetter });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      setShowSuccessModal(true);
      setSelectedJob(null);
      setCoverLetter('');
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.error || 'Failed to submit application.');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  });

  const handleApplySubmit = (e) => {
    e.preventDefault();
    if (!selectedJob) return;
    applyMutation.mutate({ jobId: selectedJob._id, coverLetter });
  };

  return (
    <div className="space-y-6 pt-16">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 font-jakarta">Talent Gateway</h1>
        <p className="text-xs text-textMuted mt-1">Discover premium jobs matched semantically to your talent profile</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs rounded-lg p-3.5 flex items-center space-x-2">
          <CheckCircle size={16} />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-lg p-3.5 flex items-center space-x-2">
          <AlertCircle size={16} />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-darkBorder pb-px">
        <button
          onClick={() => setActiveTab('search')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'search'
              ? 'border-brandPrimary text-indigo-400'
              : 'border-transparent text-textMuted hover:text-slate-900'
          }`}
        >
          Search Openings
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'applications'
              ? 'border-brandPrimary text-indigo-400'
              : 'border-transparent text-textMuted hover:text-slate-900'
          }`}
        >
          My Applications
        </button>
      </div>

      {activeTab === 'search' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Filters column */}
          <div className="lg:col-span-1 glass-panel border border-darkBorder rounded-xl p-5 space-y-4 h-fit">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Search Filters</h3>
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-700 font-semibold">Job Title / Keyword</label>
              <div className="relative">
                <Search size={14} className="absolute inset-y-0 left-3 mt-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. React Developer"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="custom-input pl-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-700 font-semibold">Location</label>
              <div className="relative">
                <MapPin size={14} className="absolute inset-y-0 left-3 mt-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="custom-input pl-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-700 font-semibold">Employment Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="custom-input text-xs"
              >
                <option value="">Any Type</option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
          </div>

          {/* Results column */}
          <div className="lg:col-span-2 space-y-4">
            {jobsLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-24 bg-slate-800 rounded-xl" />
                <div className="h-24 bg-slate-800 rounded-xl" />
              </div>
            ) : (jobsData?.jobs || []).length === 0 ? (
              <div className="glass-panel rounded-xl border border-darkBorder p-8 text-center">
                <Briefcase className="mx-auto text-slate-600 mb-3" size={32} />
                <p className="text-xs text-textMuted">No jobs found matching filters.</p>
              </div>
            ) : (
              (jobsData?.jobs || []).map((job) => (
                <div
                  key={job._id}
                  className="glass-panel border border-darkBorder rounded-xl p-5 hover:border-indigo-600/40 transition-all space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold text-slate-805">{job.title}</h3>
                      <p className="text-[10px] text-indigo-600 mt-0.5">{job.recruiter?.name || 'Recruiter'}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-indigo-50 text-[10px] border border-indigo-100 rounded text-indigo-700 font-semibold capitalize">
                      {job.employmentType}
                    </span>
                  </div>

                  <p className="text-xs text-textMuted line-clamp-2 leading-relaxed">{job.description}</p>

                  <div className="flex flex-wrap gap-1.5 py-1">
                    {job.requiredSkills.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-[9px] text-slate-700 font-medium rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-darkBorder/40 pt-3">
                    <div className="flex space-x-4 text-[10px] text-textMuted">
                      <span className="flex items-center space-x-1">
                        <MapPin size={12} />
                        <span>{job.location}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <DollarSign size={12} />
                        <span>{job.salaryRange ? `₹${job.salaryRange.min.toLocaleString('en-IN')} - ₹${job.salaryRange.max.toLocaleString('en-IN')}` : 'Negotiable'}</span>
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-[10px] font-bold rounded-lg text-white"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="space-y-4 max-w-3xl">
          {appsLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-24 bg-slate-200 rounded-xl" />
              <div className="h-24 bg-slate-200 rounded-xl" />
            </div>
          ) : (appsData?.applications || []).length === 0 ? (
            <div className="glass-panel border border-darkBorder rounded-xl p-8 text-center">
              <Briefcase className="mx-auto text-slate-600 mb-3" size={32} />
              <p className="text-xs text-textMuted">No applications submitted yet.</p>
            </div>
          ) : (
            (appsData?.applications || []).map((app) => (
              <div key={app._id} className="glass-panel border border-darkBorder rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-darkBorder/40">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{app.job?.title}</h3>
                    <p className="text-[10px] text-textMuted mt-0.5">{app.job?.location} • {app.job?.employmentType}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs rounded-full font-bold">
                    {app.status}
                  </span>
                </div>

                {/* Status timeline */}
                <div className="py-2">
                  <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-3">Timeline Journey</h4>
                  <div className="relative border-l border-darkBorder pl-4 ml-2 space-y-4">
                    {app.timeline.map((event, idx) => (
                      <div key={idx} className="relative">
                        <span className="absolute -left-[21px] mt-0.5 w-2.5 h-2.5 bg-indigo-500 rounded-full border border-darkBg" />
                        <div className="text-[11px]">
                          <span className="font-semibold text-slate-800">{event.status}</span>
                          <span className="text-[9px] text-slate-650 ml-2">
                            {new Date(event.updatedAt).toLocaleDateString()}
                          </span>
                          <p className="text-textMuted mt-0.5">{event.notes}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Apply Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleApplySubmit} className="w-full max-w-md bg-darkCard border border-darkBorder rounded-2xl p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Apply to {selectedJob.title}</h3>
              <p className="text-xs text-textMuted mt-0.5">{selectedJob.recruiter?.name}</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-700 font-semibold">Cover Letter / Note</label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Explain why you are a great fit..."
                rows={4}
                required
                className="custom-input text-xs"
              />
            </div>

            <div className="flex space-x-3 justify-end text-xs">
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="btn-secondary px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={applyMutation.isPending}
                className="btn-primary px-4 py-2 flex items-center space-x-1"
              >
                <Send size={12} />
                <span>{applyMutation.isPending ? 'Sending...' : 'Send Application'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Success Modal Pop-up */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-4 shadow-xl transform scale-100 transition-all">
            <div className="mx-auto w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
              <CheckCircle size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 font-jakarta">Application Submitted</h3>
              <p className="text-xs text-slate-500 font-semibold">Your application has been submitted successfully!</p>
            </div>
            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold rounded-xl text-white transition-all shadow-md shadow-indigo-600/10"
            >
              Great, thank you!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobSearch;
