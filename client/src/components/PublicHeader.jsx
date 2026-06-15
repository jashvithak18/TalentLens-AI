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
      </div>
    </header>
  );
};

export default PublicHeader;
