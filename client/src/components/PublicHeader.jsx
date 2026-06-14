import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowRight } from 'lucide-react';
import { Logo } from './Logo';

export const PublicHeader = () => {
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);

  return (
    <header className="border-b border-[#E5E7EB] bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo iconSize="h-8 w-8" textSize="text-xl" />
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <Link to="/" className="hover:text-brandPrimary transition-colors">About</Link>
        </nav>
        <div className="flex items-center gap-4">
          {token ? (
            <Link 
              to={
                user?.role === 'candidate' 
                  ? '/candidate/dashboard' 
                  : user?.role === 'recruiter' 
                    ? '/recruiter/dashboard' 
                    : '/admin/dashboard'
              } 
              className="btn-primary text-sm font-semibold py-2 px-4 shadow-sm"
            >
              Go to Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link 
              to="/register" 
              className="btn-primary text-sm font-semibold py-2 px-4 shadow-sm"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;
