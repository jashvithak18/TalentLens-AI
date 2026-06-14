import React from 'react';

export const LogoIcon = ({ className = "h-8 w-8", ...props }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Outer Lens/Aperture Ring */}
      <circle 
        cx="50" 
        cy="50" 
        r="44" 
        stroke="currentColor" 
        strokeWidth="8" 
        strokeLinecap="round"
        className="text-brandPrimary"
      />
      {/* AI Network/Potential Grid Lines */}
      <path 
        d="M50 20 V80 M20 50 H80" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeOpacity="0.2"
        className="text-brandSecondary"
      />
      <circle 
        cx="50" 
        cy="50" 
        r="24" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeDasharray="4 4"
        strokeOpacity="0.3"
        className="text-brandSecondary"
      />
      
      {/* Human Shape Nodes */}
      {/* Head */}
      <circle 
        cx="50" 
        cy="40" 
        r="10" 
        fill="currentColor" 
        className="text-slate-800"
      />
      {/* Torso/Shoulders Arc */}
      <path 
        d="M32 66 C32 55 40 54 50 54 C60 54 68 55 68 66" 
        stroke="currentColor" 
        strokeWidth="6" 
        strokeLinecap="round"
        className="text-slate-800"
      />

      {/* Hidden Talent / Focus Sparkle (Accent node) */}
      <circle 
        cx="65" 
        cy="35" 
        r="7" 
        fill="currentColor" 
        className="text-brandAccent animate-pulse"
      />
      <path 
        d="M65 24 V30 M65 40 V46 M54 35 H60 M70 35 H76" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"
        className="text-brandAccent"
      />
    </svg>
  );
};

export const Logo = ({ className = "", iconSize = "h-8 w-8", textSize = "text-xl", showText = true }) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoIcon className={iconSize} />
      {showText && (
        <span className={`font-jakarta font-extrabold tracking-tight text-slate-900 ${textSize}`}>
          TalentLens<span className="text-brandPrimary font-medium">.AI</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
