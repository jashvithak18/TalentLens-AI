import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  User, 
  MapPin, 
  Briefcase, 
  BookOpen, 
  Award 
} from 'lucide-react';

const getResumeUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  let apiBase = import.meta.env.VITE_API_URL;
  if (!apiBase) {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      apiBase = 'http://localhost:5000/api';
    } else {
      apiBase = 'https://talentlens-ai-e57l.onrender.com/api';
    }
  }
  const serverUrl = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;
  const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
  return `${serverUrl}${normalizedUrl}`;
};

const ResumeParser = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch candidate profile to display current status
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['candidateProfile'],
    queryFn: async () => {
      const res = await api.get('/candidates/profile');
      return res.data;
    }
  });

  const profile = profileData?.profile || {};

  const uploadResumeMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await api.post('/candidates/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['candidateProfile'] });
      queryClient.invalidateQueries({ queryKey: ['candidateDashboard'] });
      setSuccessData(data);
      setStatusText('');
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.error || 'Failed to parse resume.');
      setStatusText('');
    }
  });

  // Cycle loader status messages
  useEffect(() => {
    if (!uploadResumeMutation.isPending) return;
    const statuses = [
      'Uploading resume document to secure storage...',
      'Initiating AI parser engine...',
      'Extracting skills, experience, and history...',
      'Mapping profile details (location, headline, bio)...',
      'Synthesizing latent skills index...'
    ];
    let idx = 0;
    setStatusText(statuses[0]);
    const interval = setInterval(() => {
      idx = (idx + 1) % statuses.length;
      setStatusText(statuses[idx]);
    }, 3500);
    return () => clearInterval(interval);
  }, [uploadResumeMutation.isPending]);

  const handleFile = (file) => {
    if (!file) return;
    const allowed = ['.pdf', '.docx', '.doc'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowed.includes(ext)) {
      setErrorMsg('Invalid file type. Please upload a PDF or DOCX file.');
      return;
    }
    setErrorMsg('');
    setSuccessData(null);
    const fd = new FormData();
    fd.append('resume', file);
    uploadResumeMutation.mutate(fd);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pt-16 mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 font-jakarta flex items-center gap-2">
          <Sparkles className="text-indigo-600 w-6 h-6 animate-pulse" />
          AI Resume Parser
        </h1>
        <p className="text-xs text-textMuted mt-1">
          Upload your resume to instantly build and pre-populate your professional profile.
        </p>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl p-4 flex items-center space-x-2">
          <AlertCircle size={16} />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upload Column */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-premium relative overflow-hidden">
            {uploadResumeMutation.isPending ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-6">
                <div className="relative w-20 h-20">
                  {/* Ring loader */}
                  <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto text-indigo-600 w-8 h-8 animate-pulse" />
                </div>
                <div className="text-center space-y-2 max-w-sm">
                  <h3 className="text-sm font-bold text-slate-800">Analyzing Resume</h3>
                  <p className="text-xs text-textMuted font-semibold animate-pulse h-8">
                    {statusText}
                  </p>
                </div>
              </div>
            ) : successData ? (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-700">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold">Resume Parsed Successfully!</p>
                    <p className="text-[10px] text-emerald-600 mt-0.5">Your profile details, experience, skills, and education are now synced.</p>
                  </div>
                </div>

                {/* Summary of parsed details */}
                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-150 pb-2">AI Extraction Summary</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                    <div className="flex items-center space-x-2">
                      <User className="text-indigo-600 w-4 h-4" />
                      <span>Name: <strong className="text-slate-900">{successData.parsedData?.name || 'Updated'}</strong></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="text-indigo-600 w-4 h-4" />
                      <span>Location: <strong className="text-slate-900">{successData.parsedData?.location || 'N/A'}</strong></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Briefcase className="text-indigo-600 w-4 h-4" />
                      <span>Experience: <strong className="text-slate-900">{successData.parsedData?.experience?.length || 0} roles</strong></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BookOpen className="text-indigo-600 w-4 h-4" />
                      <span>Education: <strong className="text-slate-900">{successData.parsedData?.education?.length || 0} entries</strong></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Award className="text-indigo-600 w-4 h-4" />
                      <span>Projects: <strong className="text-slate-900">{successData.parsedData?.projects?.length || 0} items</strong></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Award className="text-indigo-600 w-4 h-4" />
                      <span>Certifications: <strong className="text-slate-900">{successData.parsedData?.certifications?.length || 0} items</strong></span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 bg-white p-3 rounded-lg border border-slate-100">
                    <strong className="text-slate-700 block mb-0.5">Bio / Summary Extracted:</strong>
                    {successData.parsedData?.bio || 'No intro summary found.'}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button 
                    onClick={() => setSuccessData(null)} 
                    className="btn-secondary text-xs py-2 px-4 font-semibold"
                  >
                    Parse Another File
                  </button>
                  <button 
                    onClick={() => navigate('/candidate/profile')} 
                    className="btn-primary text-xs py-2 px-4 font-semibold flex items-center space-x-1"
                  >
                    <span>Go to Profile</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <label 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all relative ${
                    dragActive 
                      ? 'border-brandPrimary bg-indigo-50/20' 
                      : 'border-[#E5E7EB] hover:border-brandPrimary bg-slate-50/20'
                  }`}
                >
                  <input 
                    type="file" 
                    accept=".pdf,.docx,.doc" 
                    onChange={handleChange} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  />
                  <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 shadow-sm border border-indigo-100/50">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    Drag & drop your resume file here
                  </p>
                  <p className="text-[10px] text-textMuted mt-1">
                    Supports PDF, DOCX, and DOC (Max 10MB)
                  </p>
                  <span className="mt-4 text-[10px] bg-indigo-600 text-white px-3 py-1 rounded-full font-bold shadow-sm">
                    Browse Files
                  </span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Current Resume Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-premium space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Current Resume</h3>
            
            {profileLoading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-4 bg-slate-100 rounded w-2/3" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
            ) : profile.resumeUrl ? (
              <div className="space-y-4">
                <div className="flex items-start space-x-2.5">
                  <FileText className="text-indigo-600 mt-0.5 shrink-0" size={18} />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-800 truncate" title="Resume Document">
                      {profile.resumeUrl.substring(profile.resumeUrl.lastIndexOf('/') + 1)}
                    </p>
                    <span className="text-[9px] text-textMuted block font-semibold mt-0.5">
                      Parsing Confidence: <strong className="text-indigo-600">{profile.resumeParsingConfidence}%</strong>
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2 pt-2 border-t border-slate-100">
                  <a 
                    href={getResumeUrl(profile.resumeUrl)} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex-1 btn-secondary text-center text-[10px] py-1.5 font-bold"
                  >
                    View File
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <FileText className="text-slate-300 mx-auto mb-2" size={32} />
                <p className="text-[10px] text-textMuted font-semibold">No resume uploaded yet.</p>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-brandPrimary/5 to-transparent border border-brandPrimary/10 rounded-2xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-slate-800">AI Parsing Benefits</h4>
            <ul className="text-[10px] text-slate-605 font-medium space-y-1 list-disc pl-4 leading-relaxed">
              <li>Populates Name, Title, Bio and Location instantly.</li>
              <li>Auto-creates work experiences timeline.</li>
              <li>Fills education history and grades.</li>
              <li>Populates certifications portfolio.</li>
              <li>Detects hidden skills from descriptions.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeParser;
