import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email, password });
      if (res.data.success) {
        setSuccess('Password reset successfully. You can now log in.');
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-darkBg px-4 relative">
      <div className="w-full max-w-md glass-panel rounded-2xl p-8 border border-darkBorder">
        <h2 className="text-xl font-bold text-white text-center mb-2">Forgot Password</h2>
        <p className="text-xs text-textMuted text-center mb-6">Enter your email and new password to reset it directly.</p>

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

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">New Password</label>
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

          <button type="submit" disabled={loading} className="w-full btn-primary py-2.5 text-sm font-semibold">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-darkBorder pt-4">
          <Link to="/login" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
