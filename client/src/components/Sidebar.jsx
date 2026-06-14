import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import {
  LayoutDashboard,
  User,
  Briefcase,
  FileText,
  Award,
  Users,
  Compass,
  MessageSquare,
  Sliders,
  Bell,
  Settings,
  LogOut,
  Shield,
  EyeOff,
  Eye
} from 'lucide-react';
import { toggleBlindMode } from '../redux/authSlice';

const Sidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, isBlindMode } = useSelector((state) => state.auth);

  if (!user) return null;

  const handleLogout = () => {
    dispatch(logout());
  };

  // Define links based on Role
  const candidateLinks = [
    { label: 'Dashboard', path: '/candidate/dashboard', icon: LayoutDashboard },
    { label: 'My Profile', path: '/candidate/profile', icon: User },
    { label: 'Search Jobs', path: '/candidate/jobs', icon: Briefcase },
    { label: 'Applications', path: '/candidate/applications', icon: FileText },
    { label: 'Assessments', path: '/candidate/assessments', icon: Award },
    { label: 'Skill Graph', path: '/candidate/skills-graph', icon: Sliders }
  ];

  const recruiterLinks = [
    { label: 'Dashboard', path: '/recruiter/dashboard', icon: LayoutDashboard },
    { label: 'Manage Jobs', path: '/recruiter/jobs', icon: Briefcase },
    { label: 'Talent Discovery', path: '/recruiter/talent-discovery', icon: Compass },
    { label: 'AI Copilot', path: '/recruiter/copilot', icon: MessageSquare }
  ];

  const adminLinks = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: Shield },
    { label: 'Manage Users', path: '/admin/users', icon: Users },
  ];

  const links = user.role === 'candidate'
    ? candidateLinks
    : user.role === 'recruiter'
      ? recruiterLinks
      : adminLinks;

  return (
    <aside className="w-64 glass-panel border-r border-darkBorder flex flex-col justify-between h-screen fixed left-0 top-0 pt-16 z-30">
      <div className="px-4 py-6 flex-1 overflow-y-auto">
        <div className="flex items-center space-x-3 mb-8 px-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/40">
            TL
          </div>
          <div>
            <h2 className="font-semibold text-white tracking-wide text-sm font-sans">TalentLens AI</h2>
            <span className="text-xs text-brandSecondary capitalize font-medium">{user.role} Portal</span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600/10 text-indigo-400 border-l-4 border-indigo-600'
                    : 'text-textMuted hover:bg-slate-900 hover:text-gray-100'
                }`}
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Recruiter Blind Hiring Switcher */}
      <div className="p-4 border-t border-darkBorder space-y-4">
        {user.role === 'recruiter' && (
          <button
            onClick={() => dispatch(toggleBlindMode())}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
              isBlindMode
                ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-900 text-textMuted border-darkBorder hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2">
              {isBlindMode ? <EyeOff size={14} /> : <Eye size={14} />}
              <span>Blind Hiring Mode</span>
            </div>
            <span className={`w-2 h-2 rounded-full ${isBlindMode ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
          </button>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-950/20 transition-all duration-200"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
