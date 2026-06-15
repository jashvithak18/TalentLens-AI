import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setCredentials } from '../redux/authSlice';
import { authAPI } from '../utils/api';
import { Shield, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import Logo from '../components/Logo';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGooglePicker, setShowGooglePicker] = useState(false);
  const [role, setRole] = useState('candidate');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleLogin = async (googleEmail) => {
    setError('');
    setLoading(true);
    setShowGooglePicker(false);

    try {
      const res = await authAPI.login({ email: googleEmail, password: 'password123' });
      if (res.data.success) {
        localStorage.setItem('refreshToken', res.data.refreshToken);
        dispatch(setCredentials({
          user: res.data.user,
          token: res.data.token,
          profile: res.data.profile
        }));

        if (res.data.user.role === 'candidate') {
          navigate('/candidate/dashboard');
        } else if (res.data.user.role === 'recruiter') {
          navigate('/recruiter/dashboard');
        } else {
          navigate('/admin/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Google Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredentialResponse = async (response) => {
    setError('');
    setLoading(true);

    try {
      const res = await authAPI.googleLogin({ credential: response.credential, role });
      if (res.data.success) {
        localStorage.setItem('refreshToken', res.data.refreshToken);
        dispatch(setCredentials({
          user: res.data.user,
          token: res.data.token,
          profile: res.data.profile
        }));

        if (res.data.user.role === 'candidate') {
          navigate('/candidate/dashboard');
        } else if (res.data.user.role === 'recruiter') {
          navigate('/recruiter/dashboard');
        } else {
          navigate('/admin/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Google Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    /* global google */
    if (typeof window !== 'undefined' && window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "255856469546-jm9anpcsg05ek73fhkpi40ses535lc1k.apps.googleusercontent.com",
        callback: handleGoogleCredentialResponse
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-signin-btn"),
        { theme: "outline", size: "large", width: 384, text: "continue_with" }
      );
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authAPI.login({ email, password });
      if (res.data.success) {
        // Store refresh token in localStorage separately
        localStorage.setItem('refreshToken', res.data.refreshToken);

        // Dispatch user & access token to Redux
        dispatch(setCredentials({
          user: res.data.user,
          token: res.data.token,
          profile: res.data.profile
        }));

        // Redirect based on role
        if (res.data.user.role === 'candidate') {
          navigate('/candidate/dashboard');
        } else if (res.data.user.role === 'recruiter') {
          navigate('/recruiter/dashboard');
        } else {
          navigate('/admin/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-darkBg px-4 relative overflow-hidden grid-bg">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brandPrimary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brandSecondary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-card relative z-10">
        <div className="text-center mb-8 flex flex-col items-center">
          <Link to="/" className="mb-6">
            <Logo showText={true} iconSize="h-10 w-10" textSize="text-2xl" />
          </Link>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 font-jakarta">Welcome Back</h1>
          <p className="text-xs text-textMuted mt-1.5 font-semibold">Sign in to your TalentLens AI account</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-lg p-3.5 mb-6 flex items-start space-x-2.5">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
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
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
              <Link to="/forgot-password" className="text-xs font-semibold text-brandPrimary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Lock size={16} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="custom-input pl-10 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center space-x-2 py-2.5 text-sm font-semibold"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <span className="relative bg-white px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
            or continue with
          </span>
        </div>

        {/* Role Selector for Google Sign-In */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 border border-[#E5E7EB] rounded-lg mb-4">
          <button
            type="button"
            onClick={() => setRole('candidate')}
            className={`py-1.5 text-xs font-bold rounded-md transition-all ${
              role === 'candidate'
                ? 'bg-brandPrimary text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            I am a Candidate
          </button>
          <button
            type="button"
            onClick={() => setRole('recruiter')}
            className={`py-1.5 text-xs font-bold rounded-md transition-all ${
              role === 'recruiter'
                ? 'bg-brandPrimary text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            I am a Recruiter
          </button>
        </div>

        {/* Real Google Sign-In Button */}
        <div className="flex justify-center w-full mb-3">
          <div id="google-signin-btn" className="w-full flex justify-center"></div>
        </div>

        {/* Try Demo Accounts Fallback Link */}
        <div className="text-center w-full">
          <button
            type="button"
            onClick={() => setShowGooglePicker(true)}
            className="text-xs text-brandPrimary hover:underline font-bold"
          >
            Or use offline/demo account credentials
          </button>
        </div>

        <div className="mt-6 text-center border-t border-[#E5E7EB] pt-4">
          <p className="text-xs text-textMuted font-semibold">
            Don't have an account?{' '}
            <Link to="/register" className="text-brandPrimary hover:underline font-bold">
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Google Account Chooser Modal */}
      {showGooglePicker && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-sm border border-slate-200 rounded-2xl p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowGooglePicker(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-semibold"
            >
              Close
            </button>
            <div className="text-center mb-6 flex flex-col items-center">
              <svg className="h-6 w-6 mb-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <h2 className="text-lg font-bold text-slate-800 font-jakarta">Choose an account</h2>
              <p className="text-xs text-slate-500 mt-1 font-semibold">to continue to TalentLens AI</p>
            </div>

            <div className="space-y-2.5">
              {[
                { name: 'Jashvi Thakkar', email: 'jashvithak00@gmail.com', role: 'Recruiter', initials: 'JT' },
                { name: 'Rohan Sharma', email: 'rohan.sharma@example.com', role: 'Candidate', initials: 'RS' },
                { name: 'Anjali Rao', email: 'anjali.rao@example.com', role: 'Candidate', initials: 'AR' }
              ].map((acc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleGoogleLogin(acc.email)}
                  className="w-full text-left p-3 border border-slate-150 hover:border-brandPrimary/30 hover:bg-slate-50 rounded-xl transition-all flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-brandPrimary/5 border border-brandPrimary/10 flex items-center justify-center font-bold text-brandPrimary text-xs shrink-0">
                    {acc.initials}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">{acc.name}</div>
                    <div className="text-[10px] text-slate-400 font-semibold">{acc.email}</div>
                  </div>
                  <span className="ml-auto text-[9px] font-bold text-brandPrimary bg-brandPrimary/5 px-2 py-0.5 rounded-full border border-brandPrimary/10">
                    {acc.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
