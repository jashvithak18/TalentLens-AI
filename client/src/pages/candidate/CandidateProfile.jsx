import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import {
  Upload,
  User,
  Briefcase,
  BookOpen,
  Award,
  Plus,
  Trash,
  CheckCircle,
  FileText,
  AlertCircle
} from 'lucide-react';

const getResumeUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const apiBase = import.meta.env.VITE_API_URL || 'https://talentlens-ai-e57l.onrender.com/api';
  const serverUrl = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;
  const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
  return `${serverUrl}${normalizedUrl}`;
};

const CandidateProfile = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Skills state
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [allSkills, setAllSkills] = useState([]);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = React.useRef(null);

  useEffect(() => {
    // Log profile view activity from the candidate
    api.post('/activities/log', { action: 'profile_view', details: 'Candidate opened profile settings page' })
      .catch(err => console.error('Failed to log profile view activity', err));
  }, []);

  // Fetch profile
  const { data, isLoading } = useQuery({
    queryKey: ['candidateProfile'],
    queryFn: async () => {
      const res = await api.get('/candidates/profile');
      return res.data;
    }
  });

  // Load candidate skills on fetch
  useEffect(() => {
    if (data?.profile?.skills) {
      setSelectedSkills(data.profile.skills);
    }
  }, [data]);

  // Fetch all global skills
  useEffect(() => {
    const fetchAllSkills = async () => {
      try {
        const res = await api.get('/skills');
        if (res.data?.success) {
          setAllSkills(res.data.skills.map(s => s.name));
        }
      } catch (err) {
        console.error('Failed to fetch skills list:', err);
      }
    };
    fetchAllSkills();
  }, []);

  // Filter skills based on input
  useEffect(() => {
    if (!skillInput.trim()) {
      setFilteredSkills([]);
      return;
    }
    const term = skillInput.toLowerCase();
    const filtered = allSkills.filter(s => 
      s.toLowerCase().includes(term) && 
      !selectedSkills.some(selected => selected.toLowerCase() === s.toLowerCase())
    );
    setFilteredSkills(filtered);
  }, [skillInput, allSkills, selectedSkills]);

  // Handle clicking outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddSkill = (skill) => {
    const trimmed = skill.trim();
    if (trimmed && !selectedSkills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setSelectedSkills([...selectedSkills, trimmed]);
      if (!allSkills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
        setAllSkills([...allSkills, trimmed].sort());
      }
    }
    setSkillInput('');
    setShowDropdown(false);
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skillToRemove));
  };

  // Mutator for updating general details
  const updateGeneralMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.put('/candidates/profile', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidateProfile'] });
      showSuccess('General info updated successfully!');
    }
  });

  // Mutator for upload resume
  const uploadResumeMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await api.post('/candidates/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidateProfile'] });
      queryClient.invalidateQueries({ queryKey: ['candidateDashboard'] });
      showSuccess('Resume parsed and profile updated!');
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.error || 'Failed to parse resume.');
    }
  });

  // Mutators for sub-sections
  const addSubSectionMutation = useMutation({
    mutationFn: async ({ type, payload }) => {
      let endpoint = `/candidates/${type}`;
      const res = await api.post(endpoint, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidateProfile'] });
      showSuccess('Entry added successfully!');
    }
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await api.post('/candidates/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidateProfile'] });
      showSuccess('Profile picture updated successfully!');
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.error || 'Failed to upload profile picture.');
    }
  });

  const addCertificationMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await api.post('/candidates/certifications', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidateProfile'] });
      showSuccess('Certification added successfully!');
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.error || 'Failed to add certification.');
    }
  });

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 rounded w-1/3" />
        <div className="h-64 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  const profile = data?.profile || {};

  // Form states
  const handleGeneralSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    updateGeneralMutation.mutate({
      title: fd.get('title'),
      headline: fd.get('headline'),
      pronouns: fd.get('pronouns'),
      location: fd.get('location'),
      city: fd.get('city'),
      country: fd.get('country'),
      bio: fd.get('bio'),
      skills: selectedSkills
    });
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fd = new FormData();
      fd.append('avatar', file);
      uploadAvatarMutation.mutate(fd);
    }
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fd = new FormData();
      fd.append('resume', file);
      uploadResumeMutation.mutate(fd);
    }
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const technologies = fd.get('technologies').split(',').map(s => s.trim()).filter(Boolean);
    addSubSectionMutation.mutate({
      type: 'projects',
      payload: {
        title: fd.get('title'),
        description: fd.get('description'),
        technologies,
        githubLink: fd.get('githubLink')
      }
    });
    e.target.reset();
  };

  const handleAddExperience = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    addSubSectionMutation.mutate({
      type: 'experience',
      payload: {
        company: fd.get('company'),
        role: fd.get('role'),
        startDate: fd.get('startDate'),
        endDate: fd.get('endDate') || null,
        current: fd.get('current') === 'on',
        description: fd.get('description')
      }
    });
    e.target.reset();
  };

  const handleAddEducation = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    addSubSectionMutation.mutate({
      type: 'education',
      payload: {
        institution: fd.get('institution'),
        degree: fd.get('degree'),
        fieldOfStudy: fd.get('fieldOfStudy'),
        startDate: fd.get('startDate') || null,
        endDate: fd.get('endDate') || null,
        grade: fd.get('grade')
      }
    });
    e.target.reset();
  };

  const handleAddCertification = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    addCertificationMutation.mutate(fd);
    e.target.reset();
  };

  return (
    <div className="space-y-6 max-w-4xl pt-16">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 font-jakarta">My Profile</h1>
        <p className="text-xs text-textMuted mt-1">Manage resume parsing and professional profile metadata</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs rounded-lg p-3 flex items-center space-x-2">
          <CheckCircle size={16} />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-lg p-3 flex items-center space-x-2">
          <AlertCircle size={16} />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-darkBorder pb-px">
        {[
          { id: 'general', label: 'General Info', icon: User },
          { id: 'resume', label: 'Resume Parser', icon: FileText },
          { id: 'education', label: 'Education', icon: BookOpen },
          { id: 'experience', label: 'Experience', icon: Briefcase },
          { id: 'projects', label: 'Projects', icon: Award },
          { id: 'certifications', label: 'Certifications', icon: Award }
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                activeTab === t.id
                  ? 'border-brandPrimary text-brandPrimary'
                  : 'border-transparent text-textMuted hover:text-brandPrimary'
              }`}
            >
              <Icon size={14} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content panes */}
      <div className="glass-panel border border-darkBorder rounded-xl p-6 glow-card">
        {activeTab === 'general' && (
          <form onSubmit={handleGeneralSubmit} className="space-y-5">
            {/* Profile Picture Uploader */}
            <div className="flex items-center space-x-5 pb-5 border-b border-darkBorder mb-5">
              <div className="relative group">
                {profile.avatar ? (
                  <img
                    src={getResumeUrl(profile.avatar)}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full object-cover border-2 border-indigo-600 shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-indigo-50 border-2 border-indigo-200 flex items-center justify-center text-indigo-600 font-bold text-xl">
                    <User size={36} />
                  </div>
                )}
                <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Upload size={18} className="text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Profile Picture</h4>
                <p className="text-[11px] text-textMuted mt-0.5">Upload a professional avatar (JPEG/PNG, max 5MB)</p>
                {uploadAvatarMutation.isPending && (
                  <span className="text-[10px] text-indigo-600 font-semibold animate-pulse block mt-1">Uploading new avatar...</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Professional Title</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={profile.title || ''}
                  placeholder="e.g. Senior MERN Developer"
                  className="custom-input text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Headline</label>
                <input
                  type="text"
                  name="headline"
                  defaultValue={profile.headline || ''}
                  placeholder="e.g. Passionate Developer & Team Lead"
                  className="custom-input text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Pronouns</label>
                <input
                  type="text"
                  name="pronouns"
                  defaultValue={profile.pronouns || ''}
                  placeholder="e.g. he/him, she/her, they/them"
                  className="custom-input text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Location (Full)</label>
                <input
                  type="text"
                  name="location"
                  defaultValue={profile.location || ''}
                  placeholder="e.g. San Francisco, CA"
                  className="custom-input text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">City</label>
                <input
                  type="text"
                  name="city"
                  defaultValue={profile.city || ''}
                  placeholder="e.g. San Francisco"
                  className="custom-input text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Country</label>
                <input
                  type="text"
                  name="country"
                  defaultValue={profile.country || ''}
                  placeholder="e.g. United States"
                  className="custom-input text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Bio / Summary</label>
              <textarea
                name="bio"
                rows={3}
                defaultValue={profile.bio || ''}
                placeholder="Brief professional intro..."
                className="custom-input text-xs"
              />
            </div>

            <div className="space-y-1.5" ref={dropdownRef}>
              <label className="text-xs font-semibold text-slate-700">Skills</label>
              
              {/* Selected Skills Badges */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {selectedSkills.map((skill, index) => (
                  <div 
                    key={index} 
                    className="flex items-center bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs px-2.5 py-1 rounded-full space-x-1.5"
                  >
                    <span>{skill}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-indigo-500 hover:text-indigo-750 focus:outline-none font-bold text-[10px] cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {selectedSkills.length === 0 && (
                  <span className="text-xs text-textMuted italic">No skills added yet.</span>
                )}
              </div>

              {/* Autocomplete Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type a skill (e.g. React, Python...)"
                  value={skillInput}
                  onChange={(e) => {
                    setSkillInput(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="custom-input text-xs w-full"
                />
                
                {showDropdown && skillInput.trim() !== '' && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                    {filteredSkills.map((skill, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleAddSkill(skill)}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                      >
                        {skill}
                      </button>
                    ))}
                    
                    {/* Add Custom Skill Option */}
                    {!allSkills.some(s => s.toLowerCase() === skillInput.trim().toLowerCase()) && (
                      <button
                        type="button"
                        onClick={() => handleAddSkill(skillInput.trim())}
                        className="w-full text-left px-4 py-2 text-xs text-indigo-600 font-semibold hover:bg-indigo-50 hover:text-indigo-850 transition-colors border-t border-slate-100"
                      >
                        + Add "{skillInput.trim()}" as a new skill
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button type="submit" disabled={updateGeneralMutation.isPending} className="btn-primary text-xs font-semibold">
              {updateGeneralMutation.isPending ? 'Updating...' : 'Save General Info'}
            </button>
          </form>
        )}

        {activeTab === 'resume' && (
          <div className="space-y-6 text-center py-6">
            <div className="border-2 border-dashed border-darkBorder rounded-xl p-8 max-w-md mx-auto hover:border-brandPrimary transition-all cursor-pointer relative">
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={handleResumeUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload size={36} className="text-indigo-600 mx-auto mb-4" />
              <p className="text-xs font-semibold text-slate-800">Upload PDF or DOCX resume</p>
              <p className="text-[10px] text-textMuted mt-1">Our AI will automatically parse skills, projects, and work history.</p>
            </div>

            {uploadResumeMutation.isPending && (
              <div className="space-y-2 max-w-sm mx-auto">
                <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-1 rounded-full animate-pulse w-2/3" />
                </div>
                <p className="text-[10px] text-textMuted">Running semantic parser, hidden skill indexer...</p>
              </div>
            )}

            {profile.resumeUrl && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-between max-w-md mx-auto">
                <div className="flex items-center space-x-3 text-left">
                  <FileText className="text-indigo-600" size={20} />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Current Resume</p>
                    <span className="text-[10px] text-textMuted">Parsing confidence: {profile.resumeParsingConfidence}%</span>
                  </div>
                </div>
                <a
                  href={getResumeUrl(profile.resumeUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  View File
                </a>
              </div>
            )}
          </div>
        )}

        {activeTab === 'experience' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form onSubmit={handleAddExperience} className="lg:col-span-1 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Add Experience</h3>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-700">Company</label>
                <input type="text" name="company" required className="custom-input text-xs" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-700">Role</label>
                <input type="text" name="role" required className="custom-input text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-700">Start Date</label>
                  <input type="date" name="startDate" required className="custom-input text-xs" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-700">End Date</label>
                  <input type="date" name="endDate" className="custom-input text-xs" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" name="current" id="curr" />
                <label htmlFor="curr" className="text-[10px] text-slate-650 font-semibold">I currently work here</label>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-700">Description</label>
                <textarea name="description" rows={3} className="custom-input text-xs" />
              </div>
              <button type="submit" className="w-full btn-primary text-xs font-semibold py-2">
                Add Role
              </button>
            </form>

            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Work Timeline</h3>
              {profile.experience?.length === 0 ? (
                <p className="text-xs text-slate-500">No work experience entries yet.</p>
              ) : (
                <div className="space-y-3">
                  {profile.experience?.map((exp, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 relative">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-slate-800">{exp.role}</p>
                          <p className="text-[10px] text-indigo-600 mt-0.5">{exp.company}</p>
                          <span className="text-[9px] text-slate-550">
                            {new Date(exp.startDate).toLocaleDateString()} - {exp.current ? 'Present' : new Date(exp.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">{exp.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form onSubmit={handleAddProject} className="lg:col-span-1 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Add Project</h3>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-700">Project Title</label>
                <input type="text" name="title" required className="custom-input text-xs" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-700">Technologies (Comma-separated)</label>
                <input type="text" name="technologies" required placeholder="React, Node.js" className="custom-input text-xs" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-700">GitHub Link</label>
                <input type="url" name="githubLink" placeholder="https://github.com/..." className="custom-input text-xs" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-700">Description</label>
                <textarea name="description" rows={3} className="custom-input text-xs" />
              </div>
              <button type="submit" className="w-full btn-primary text-xs font-semibold py-2">
                Add Project
              </button>
            </form>

            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Projects Portfolio</h3>
              {profile.projects?.length === 0 ? (
                <p className="text-xs text-slate-500">No project entries yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {profile.projects?.map((proj, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
                      <p className="text-xs font-bold text-slate-800">{proj.title}</p>
                      <p className="text-[11px] text-slate-600 mt-1.5 line-clamp-2">{proj.description}</p>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {proj.technologies?.map((tech, tIdx) => (
                          <span key={tIdx} className="px-1.5 py-0.5 bg-indigo-50 border border-indigo-100 text-[9px] text-indigo-700 rounded font-medium">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'education' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form onSubmit={handleAddEducation} className="lg:col-span-1 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Add Education</h3>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-700">Institution</label>
                <input type="text" name="institution" required placeholder="e.g. Stanford University" className="custom-input text-xs" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-700">Degree</label>
                <input type="text" name="degree" required placeholder="e.g. Bachelor of Science" className="custom-input text-xs" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-700">Field of Study</label>
                <input type="text" name="fieldOfStudy" placeholder="e.g. Computer Science" className="custom-input text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-700">Start Date</label>
                  <input type="date" name="startDate" className="custom-input text-xs" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-700">End Date</label>
                  <input type="date" name="endDate" className="custom-input text-xs" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-700">Grade / GPA</label>
                <input type="text" name="grade" placeholder="e.g. 3.8 / 4.0" className="custom-input text-xs" />
              </div>
              <button type="submit" className="w-full btn-primary text-xs font-semibold py-2">
                Add Education
              </button>
            </form>

            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Education History</h3>
              {profile.education?.length === 0 ? (
                <p className="text-xs text-slate-500">No education entries yet.</p>
              ) : (
                <div className="space-y-3">
                  {profile.education?.map((edu, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 relative">
                      <div>
                        <p className="text-xs font-bold text-slate-800">{edu.degree} in {edu.fieldOfStudy || 'General study'}</p>
                        <p className="text-[10px] text-indigo-600 mt-0.5">{edu.institution}</p>
                        <span className="text-[9px] text-slate-550 block mt-0.5">
                          {edu.startDate ? new Date(edu.startDate).toLocaleDateString() : ''} - {edu.endDate ? new Date(edu.endDate).toLocaleDateString() : 'Present'}
                        </span>
                        {edu.grade && (
                          <span className="inline-block mt-2 text-[10px] bg-slate-200 text-slate-750 px-2 py-0.5 rounded font-medium">
                            Grade: {edu.grade}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'certifications' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form onSubmit={handleAddCertification} className="lg:col-span-1 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Add Certification</h3>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-700">Certification Name</label>
                <input type="text" name="name" required placeholder="e.g. AWS Solutions Architect" className="custom-input text-xs" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-700">Issuer</label>
                <input type="text" name="issuer" placeholder="e.g. Amazon Web Services" className="custom-input text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-700">Issue Date</label>
                  <input type="date" name="issueDate" className="custom-input text-xs" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-700">Expiry Date</label>
                  <input type="date" name="expiryDate" className="custom-input text-xs" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-700">Credential URL</label>
                <input type="url" name="credentialUrl" placeholder="https://..." className="custom-input text-xs" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-700">Certificate PDF Upload</label>
                <div className="border border-dashed border-darkBorder rounded-lg p-3 hover:border-brandPrimary transition-all cursor-pointer relative text-center">
                  <input type="file" name="pdf" accept=".pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <Upload size={18} className="text-indigo-500 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-605 block">Choose certificate PDF</span>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={addCertificationMutation.isPending}
                className="w-full btn-primary text-xs font-semibold py-2"
              >
                {addCertificationMutation.isPending ? 'Adding...' : 'Add Certification'}
              </button>
            </form>

            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Certifications Portfolio</h3>
              {profile.certifications?.length === 0 ? (
                <p className="text-xs text-slate-500">No certifications entries yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {profile.certifications?.map((cert, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800">{cert.name}</p>
                        <p className="text-[10px] text-indigo-600 mt-0.5">{cert.issuer}</p>
                        <span className="text-[9px] text-slate-550 block mt-0.5">
                          Issued: {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : 'N/A'} 
                          {cert.expiryDate && ` • Expires: ${new Date(cert.expiryDate).toLocaleDateString()}`}
                        </span>
                      </div>
                      <div className="flex space-x-2 mt-3 pt-2 border-t border-slate-100">
                        {cert.credentialUrl && (
                          <a 
                            href={cert.credentialUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-[10px] text-indigo-600 hover:text-indigo-850 font-semibold"
                          >
                            Verify Link
                          </a>
                        )}
                        {cert.pdfUrl && (
                          <a 
                            href={getResumeUrl(cert.pdfUrl)} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-[10px] text-emerald-600 hover:text-emerald-850 font-semibold"
                          >
                            View PDF
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateProfile;
