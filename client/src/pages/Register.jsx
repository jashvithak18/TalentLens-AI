import React, { useState } from 'react';
import { useNavigate as useNav, Link as RouterLink } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { Shield, Mail, Lock, User, Building, AlertCircle, CheckCircle } from 'lucide-react';

const Register = () => {
  const [role, setRole] = useState('candidate');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNav();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload = { name, email, password, role };
      if (role === 'recruiter') {
        payload.companyName = companyName;
      }
      
      const res = await authAPI.register(payload);
      if (res.data.success) {
        setSuccess(res.data.message || 'Registration successful! Verification link sent.');
        // Reset form
        setName('');
        setEmail('');
        setPassword('');
        setCompanyName('');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-darkBg px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md glass-panel rounded-2xl p-8 border border-darkBorder glow-card relative z-10">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-600/30">
            <Shield className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Create your account</h1>
          <p className="text-xs text-textMuted mt-1.5">Discover Talent Beyond Keywords</p>
        </div>

        {/* Role Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/80 border border-darkBorder rounded-lg mb-6">
          <button
            type="button"
            onClick={() => setRole('candidate')}
            className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
              role === 'candidate'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-textMuted hover:text-white'
            }`}
          >
            Candidate
          </button>
          <button
            type="button"
            onClick={() => setRole('recruiter')}
            className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
              role === 'recruiter'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-textMuted hover:text-white'
            }`}
          >
            Recruiter
          </button>
        </div>

        {error && (
          <div className="bg-rose-950/30 border border-rose-500/20 text-rose-400 text-xs rounded-lg p-3.5 mb-6 flex items-start space-x-2.5">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg p-3.5 mb-6 flex items-start space-x-2.5">
            <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <User size={16} />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="custom-input pl-10 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="custom-input pl-10 text-sm"
              />
            </div>
          </div>

          {role === 'recruiter' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Company Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Building size={16} />
                </span>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Skynet Solutions"
                  className="custom-input pl-10 text-sm"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock size={16} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="custom-input pl-10 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-2.5 text-sm font-semibold"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-darkBorder pt-4">
          <p className="text-xs text-textMuted">
            Already have an account?{' '}
            <RouterLink to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-all">
              Sign in
            </RouterLink>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
