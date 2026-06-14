import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard,
  User,
  Briefcase,
  Award,
  Sliders,
  Compass,
  MessageSquare
} from 'lucide-react';

export const BottomNavigation = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  if (!user) return null;

  const candidateItems = [
    { label: 'Home', path: '/candidate/dashboard', icon: LayoutDashboard },
    { label: 'Jobs', path: '/candidate/jobs', icon: Briefcase },
    { label: 'Graph', path: '/candidate/skills-graph', icon: Sliders },
    { label: 'Profile', path: '/candidate/profile', icon: User }
  ];

  const recruiterItems = [
    { label: 'Home', path: '/recruiter/dashboard', icon: LayoutDashboard },
    { label: 'Jobs', path: '/recruiter/jobs', icon: Briefcase },
    { label: 'Discover', path: '/recruiter/talent-discovery', icon: Compass },
    { label: 'AI Chat', path: '/recruiter/copilot', icon: MessageSquare }
  ];

  const items = user.role === 'candidate' ? candidateItems : recruiterItems;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] h-16 px-4 flex items-center justify-around z-40 shadow-lg pb-safe">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-bold ${
              isActive ? 'text-brandPrimary' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className="mb-0.5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNavigation;
