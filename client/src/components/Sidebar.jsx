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
import Logo from './Logo';

const Sidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, isBlindMode } = useSelector((state) => state.auth);

  if (!user) return null;

  const handleLogout = () => {
    dispatch(logout());
  };

  const candidateLinks = [
    { label: 'Dashboard', path: '/candidate/dashboard', icon: LayoutDashboard },
    { label: 'Resume Parser', path: '/candidate/resume-parser', icon: FileText },
    { label: 'My Profile', path: '/candidate/profile', icon: User },
    { label: 'Search Jobs', path: '/candidate/jobs', icon: Briefcase },
    { label: 'Applications', path: '/candidate/applications', icon: FileText },
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
    <aside className="hidden md:flex w-64 bg-white border-r border-[#E5E7EB] flex-col justify-between h-screen fixed left-0 top-0 pt-16 z-30">
      <div className="px-4 py-6 flex-1 overflow-y-auto">
        {/* Navigation links */}
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-brandPrimary/5 text-brandPrimary border-l-4 border-brandPrimary'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
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
      <div className="p-4 border-t border-[#E5E7EB] space-y-4">
        {user.role === 'recruiter' && (
          <button
            onClick={() => dispatch(toggleBlindMode())}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
              isBlindMode
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                : 'bg-slate-50 text-slate-500 border-[#E5E7EB] hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              {isBlindMode ? <EyeOff size={14} /> : <Eye size={14} />}
              <span>Blind Hiring Mode</span>
            </div>
            <span className={`w-2 h-2 rounded-full ${isBlindMode ? 'bg-brandAccent animate-pulse' : 'bg-slate-400'}`} />
          </button>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-bold text-rose-600 hover:bg-rose-50 transition-all duration-200"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
