import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { 
  User as UserIcon, 
  Menu, 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  Sliders, 
  Compass, 
  MessageSquare, 
  Shield, 
  Users, 
  LogOut, 
  Eye, 
  EyeOff, 
  ChevronDown 
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { logout, toggleBlindMode } from '../redux/authSlice';
import Logo from './Logo';

const Navbar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  
  const { user, isBlindMode } = useSelector((state) => state.auth);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  
  const dropdownRef = useRef(null);

  // Click outside listener for profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  const handleLogout = () => {
    dispatch(logout());
  };

  // Define links lists per role (excluding Profile for Candidates)
  const candidateLinks = [
    { label: 'Dashboard', path: '/candidate/dashboard', icon: LayoutDashboard },
    { label: 'Resume Parser', path: '/candidate/resume-parser', icon: FileText },
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
    { label: 'Manage Users', path: '/admin/users', icon: Users }
  ];

  const links = !user 
    ? [] 
    : user.role === 'candidate'
      ? candidateLinks
      : user.role === 'recruiter'
        ? recruiterLinks
        : adminLinks;

  return (
    <header className="h-16 bg-white border-b border-[#E5E7EB] fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6">
      <div className="flex items-center space-x-6">
        {/* Brand logo */}
        <Logo showText={true} iconSize="h-7 w-7" textSize="text-md" />
        
        {/* Horizontal Navigation Links for desktop */}
        {user && (
          <nav className="hidden md:flex items-center space-x-1 border-l border-slate-150 pl-6">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-250 ${
                    isActive
                      ? 'bg-brandPrimary/5 text-brandPrimary'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon size={14} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </div>

      {/* User Actions */}
      {user && (
        <div className="flex items-center space-x-4 ml-auto">
          {/* User Profile Summary & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center space-x-3 pl-2 border-l border-[#E5E7EB] cursor-pointer focus:outline-none group select-none text-left"
            >
              <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-brandPrimary font-bold border border-[#E5E7EB] group-hover:bg-slate-100 group-hover:text-brandDark transition-colors">
                <UserIcon size={16} />
              </div>
              <div className="hidden md:block">
                <div className="flex items-center space-x-1">
                  <p className="text-xs font-bold text-slate-800 truncate max-w-[100px]">{user.name}</p>
                  <ChevronDown size={12} className="text-slate-400 group-hover:text-slate-700 transition-colors" />
                </div>
                <p className="text-[10px] text-slate-450 font-semibold capitalize mt-0.5">{user.role}</p>
              </div>
            </button>

            {/* User Profile Dropdown Menu */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-3 w-48 bg-white border border-[#E5E7EB] rounded-xl shadow-lg py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                {user.role === 'candidate' && (
                  <Link
                    to="/candidate/profile"
                    onClick={() => setShowProfileDropdown(false)}
                    className="flex items-center space-x-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition-colors"
                  >
                    <UserIcon size={14} />
                    <span>My Profile</span>
                  </Link>
                )}
                
                {user.role === 'recruiter' && (
                  <button
                    onClick={() => {
                      dispatch(toggleBlindMode());
                      setShowProfileDropdown(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition-colors"
                  >
                    <div className="flex items-center space-x-2.5">
                      {isBlindMode ? <EyeOff size={14} /> : <Eye size={14} />}
                      <span>Blind Hiring Mode</span>
                    </div>
                    <span className={`w-2 h-2 rounded-full ${isBlindMode ? 'bg-brandAccent animate-pulse' : 'bg-slate-400'}`} />
                  </button>
                )}

                <button
                  onClick={() => {
                    handleLogout();
                    setShowProfileDropdown(false);
                  }}
                  className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50/50 transition-colors text-left border-t border-[#E5E7EB] mt-1"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
