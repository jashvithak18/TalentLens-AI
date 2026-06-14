import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogoIcon } from './Logo';

const LOADER_PHRASES = [
  "Analyzing Candidate Profiles…",
  "Discovering Hidden Skills…",
  "Generating Candidate DNA…",
  "Calculating Match Scores…",
  "Building Talent Intelligence…",
  "Scrutinizing Semantic Capabilities…",
  "Calibrating Assessment Frameworks…"
];

export const LoadingScreen = ({ text, fullScreen = true }) => {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    if (text) return; // If a static text is passed, don't cycle
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % LOADER_PHRASES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [text]);

  const displayPhrase = text || LOADER_PHRASES[phraseIndex];

  return (
    <div 
      className={`flex flex-col items-center justify-center bg-darkBg/80 grid-bg ${
        fullScreen ? 'fixed inset-0 z-[100] backdrop-blur-md' : 'w-full py-16'
      }`}
    >
      <div className="relative flex flex-col items-center max-w-sm px-6 text-center">
        {/* Animated outer ring */}
        <div className="relative mb-8">
          <motion.div 
            className="absolute -inset-4 rounded-full border border-dashed border-brandPrimary/40"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
          />
          <motion.div 
            className="absolute -inset-1 rounded-full bg-gradient-to-r from-brandPrimary to-brandSecondary opacity-10 blur-md"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          />
          <div className="relative p-4 bg-white rounded-full shadow-lg border border-darkBorder flex items-center justify-center">
            <LogoIcon className="h-12 w-12 text-brandPrimary" />
          </div>
        </div>

        {/* Dynamic AI-themed status phrase */}
        <div className="h-8 mb-4">
          <AnimatePresence mode="wait">
            <motion.p
              key={displayPhrase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-sm font-semibold tracking-wide text-slate-700 font-jakarta"
            >
              {displayPhrase}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Loading Progress Bar */}
        <div className="w-48 bg-slate-200 h-1.5 rounded-full overflow-hidden relative shadow-inner">
          <motion.div 
            className="bg-gradient-to-r from-brandPrimary to-brandSecondary h-full rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ 
              repeat: Infinity, 
              duration: 2, 
              ease: "easeInOut",
              repeatDelay: 0.2
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
