import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  ArrowRight, ArrowDown, Play, Check, X, Shield, Users, 
  Cpu, FileText, Database, Sparkles, TrendingUp, Trophy, 
  ChevronRight, Brain, Zap, MessageSquare, BarChart3, AlertCircle,
  Star, Target, Lightbulb, Rocket, Award, GitBranch, Code2,
  Search, Filter, LayoutDashboard, Layers
} from 'lucide-react';
import { Logo } from '../components/Logo';

// ─── Neural Network Background SVG ───────────────────────────────────────────
const NeuralBackground = ({ opacity = 0.06 }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <radialGradient id="nodeGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#4F46E5" stopOpacity="1" />
        <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
      </radialGradient>
    </defs>
    {/* Connection lines */}
    {[
      [120, 80, 280, 200], [280, 200, 180, 350], [180, 350, 400, 420],
      [400, 420, 600, 300], [600, 300, 750, 150], [750, 150, 900, 280],
      [900, 280, 1050, 180], [1050, 180, 1200, 300], [120, 80, 400, 120],
      [400, 120, 600, 300], [180, 350, 600, 450], [600, 450, 900, 380],
    ].map(([x1, y1, x2, y2], i) => (
      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} 
        stroke="#4F46E5" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="4 8" />
    ))}
    {/* Nodes */}
    {[
      [120, 80], [280, 200], [180, 350], [400, 420], [600, 300],
      [750, 150], [900, 280], [1050, 180], [1200, 300], [400, 120], [600, 450], [900, 380]
    ].map(([cx, cy], i) => (
      <circle key={i} cx={cx} cy={cy} r="4" fill="#4F46E5" fillOpacity="0.5" />
    ))}
  </svg>
);

// ─── Animated Count-Up ────────────────────────────────────────────────────────
const CountUp = ({ target, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

// ─── Enhanced Animated Radar Chart ───────────────────────────────────────────
const PremiumRadarChart = ({ metrics, size = 240, animated = true }) => {
  const [hovered, setHovered] = useState(null);
  const chartInView = useInView(useRef(null), { once: true });
  const [progress, setProgress] = useState(animated ? 0 : 1);

  useEffect(() => {
    if (!animated) return;
    let frame;
    let start = null;
    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      setProgress(Math.min(elapsed / 1500, 1));
      if (elapsed < 1500) frame = requestAnimationFrame(animate);
    };
    const timeout = setTimeout(() => { frame = requestAnimationFrame(animate); }, 400);
    return () => { clearTimeout(timeout); cancelAnimationFrame(frame); };
  }, [animated]);

  const center = size / 2;
  const maxR = center * 0.72;

  const getCoords = (angle, val) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    const r = (val / 100) * maxR * progress;
    return { x: center + r * Math.cos(rad), y: center + r * Math.sin(rad) };
  };

  const gridCoords = (angle, level) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    const r = (level / 100) * maxR;
    return { x: center + r * Math.cos(rad), y: center + r * Math.sin(rad) };
  };

  const polyPoints = metrics.map(m => {
    const c = getCoords(m.angle, m.value);
    return `${c.x},${c.y}`;
  }).join(' ');

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="overflow-visible">
        {/* Grid rings */}
        {[20, 40, 60, 80, 100].map((level, i) => {
          const pts = metrics.map(m => {
            const c = gridCoords(m.angle, level);
            return `${c.x},${c.y}`;
          }).join(' ');
          return (
            <polygon key={i} points={pts} fill="none"
              stroke="#E5E7EB" strokeWidth="0.8"
              strokeOpacity={i === 4 ? 0.6 : 0.3} />
          );
        })}

        {/* Axis lines */}
        {metrics.map((m, i) => {
          const outer = gridCoords(m.angle, 100);
          return (
            <line key={i} x1={center} y1={center} x2={outer.x} y2={outer.y}
              stroke="#E5E7EB" strokeWidth="0.8" strokeOpacity="0.5" />
          );
        })}

        {/* Fill polygon */}
        <polygon points={polyPoints}
          fill="#4F46E5" fillOpacity="0.12"
          stroke="#4F46E5" strokeWidth="2"
          strokeLinejoin="round" />

        {/* Data point nodes */}
        {metrics.map((m, i) => {
          const c = getCoords(m.angle, m.value);
          const isHov = hovered === i;
          return (
            <g key={i}>
              <circle cx={c.x} cy={c.y} r={isHov ? 7 : 4}
                fill={isHov ? '#4F46E5' : '#fff'}
                stroke="#4F46E5" strokeWidth="2"
                style={{ cursor: 'pointer', transition: 'r 0.2s, fill 0.2s' }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)} />
            </g>
          );
        })}

        {/* Labels */}
        {metrics.map((m, i) => {
          const c = gridCoords(m.angle, 120);
          const anchor = m.angle < 180 ? (m.angle === 90 || m.angle === 270 ? 'middle' : 'start') : (m.angle === 270 ? 'middle' : 'end');
          return (
            <text key={i} x={c.x} y={c.y}
              fontSize={size * 0.046} fontWeight="600"
              fill={hovered === i ? '#4F46E5' : '#64748B'}
              textAnchor={
                m.angle === 0 || m.angle === 60 ? 'start' :
                m.angle === 180 || m.angle === 240 ? 'end' : 'middle'
              }
              dominantBaseline="middle"
              style={{ transition: 'fill 0.2s', fontSize: `${size * 0.042}px` }}>
              {m.label}
            </text>
          );
        })}
      </svg>

      {/* Hover tooltip */}
      <AnimatePresence>
        {hovered !== null && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.92 }}
            transition={{ duration: 0.18 }}
            className="absolute left-1/2 -translate-x-1/2 -top-16 z-50 bg-slate-900 text-white rounded-xl px-4 py-2.5 text-xs font-bold shadow-xl whitespace-nowrap pointer-events-none">
            <div className="font-bold">{metrics[hovered]?.label}</div>
            <div className="text-emerald-400 text-sm font-extrabold mt-0.5">{metrics[hovered]?.value}%</div>
            <div className="text-slate-400 text-[10px] mt-0.5 font-normal">{metrics[hovered]?.desc}</div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2.5 h-2.5 bg-slate-900 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Hero Animation Machine ───────────────────────────────────────────────────
const HeroAnimation = () => {
  const [phase, setPhase] = useState(0);
  // Phases: 0=resume, 1=scanning, 2=skills, 3=blueprint, 4=score, 5=leaderboard

  useEffect(() => {
    const timings = [2200, 2200, 2000, 2000, 2200, 2500];
    const advance = () => {
      setPhase(p => {
        const next = (p + 1) % 6;
        return next;
      });
    };
    const timeout = setTimeout(advance, timings[phase]);
    return () => clearTimeout(timeout);
  }, [phase]);

  const skills = ['React', 'Node.js', 'MongoDB', 'System Design', 'Leadership'];
  const skillColors = [
    'bg-indigo-100 text-indigo-700 border-indigo-200',
    'bg-cyan-100 text-cyan-700 border-cyan-200',
    'bg-emerald-100 text-emerald-700 border-emerald-200',
    'bg-violet-100 text-violet-700 border-violet-200',
    'bg-amber-100 text-amber-700 border-amber-200',
  ];

  const radarMetrics = [
    { label: 'Problem Solving', value: 92, angle: 0, desc: 'Exceptional' },
    { label: 'Communication', value: 78, angle: 60, desc: 'Strong' },
    { label: 'Leadership', value: 70, angle: 120, desc: 'Good' },
    { label: 'Adaptability', value: 85, angle: 180, desc: 'Very High' },
    { label: 'Reliability', value: 95, angle: 240, desc: 'Top 2%' },
    { label: 'Learning Velocity', value: 97, angle: 300, desc: 'Exceptional' },
  ];

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Card container */}
      <div className="relative bg-white rounded-2xl border border-slate-200 shadow-[0_20px_60px_-12px_rgba(79,70,229,0.18)] overflow-hidden"
        style={{ minHeight: 380 }}>

        {/* Window chrome */}
        <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            TalentLens AI Engine
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        <div className="p-6 relative" style={{ minHeight: 330 }}>

          {/* Phase 0 — Resume card */}
          <AnimatePresence mode="wait">
            {phase === 0 && (
              <motion.div key="resume"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-6">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Resume Received
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 font-mono text-xs text-slate-600">
                  <div><span className="text-slate-400">Name: </span><strong className="text-slate-800">Sarah Chen</strong></div>
                  <div><span className="text-slate-400">Role: </span>Frontend Developer</div>
                  <div><span className="text-slate-400">Projects:</span>
                    <div className="ml-3 mt-1 space-y-0.5 text-slate-500">
                      <div>• E-commerce Platform</div>
                      <div>• Study Vault App</div>
                      <div>• Complaint Mgmt System</div>
                    </div>
                  </div>
                  <div><span className="text-slate-400">Keywords: </span>React, Node, CSS, DB</div>
                  <div className="text-red-400 text-[10px] pt-2 border-t border-slate-200">
                    ⚠ Standard ATS Score: 62% — May be rejected
                  </div>
                </div>
              </motion.div>
            )}

            {/* Phase 1 — AI Scanning */}
            {phase === 1 && (
              <motion.div key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-6">
                <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                  AI Scanning Resume...
                </div>
                <div className="relative bg-slate-50 border border-indigo-200 rounded-xl p-4 overflow-hidden">
                  {/* Scan beam */}
                  <div className="absolute left-0 right-0 h-8 pointer-events-none"
                    style={{
                      background: 'linear-gradient(180deg, transparent, rgba(79,70,229,0.12), transparent)',
                      animation: 'scanning 1.8s ease-in-out infinite',
                      top: 0
                    }} />
                  <div className="space-y-2.5 font-mono text-xs relative z-10">
                    {['Parsing semantic structure...', 'Extracting skill graph...', 'Inferring hidden capabilities...', 'Mapping behavioral patterns...'].map((t, i) => (
                      <motion.div key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.3 }}
                        className="flex items-center gap-2 text-slate-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                        {t}
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-4 bg-indigo-50 rounded-lg px-3 py-2">
                    <div className="flex justify-between text-[10px] font-bold text-indigo-700 mb-1.5">
                      <span>Processing</span><span>87%</span>
                    </div>
                    <div className="h-1.5 bg-indigo-100 rounded-full overflow-hidden">
                      <motion.div className="h-full bg-indigo-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '87%' }}
                        transition={{ duration: 1.8, ease: 'easeOut' }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Phase 2 — Hidden skills emerge */}
            {phase === 2 && (
              <motion.div key="skills"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-6">
                <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Sparkles className="h-3 w-3" />
                  Hidden Skills Discovered!
                </div>
                <div className="text-xs text-slate-500 mb-4">Skills not visible in raw resume:</div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s, i) => (
                    <motion.span key={s}
                      initial={{ opacity: 0, scale: 0, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: i * 0.18, type: 'spring', stiffness: 400, damping: 20 }}
                      className={`px-3 py-1.5 border rounded-full text-xs font-bold ${skillColors[i]}`}>
                      ✦ {s}
                    </motion.span>
                  ))}
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="mt-5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold">
                  🧠 5 hidden competencies surfaced by AI analysis
                </motion.div>
              </motion.div>
            )}

            {/* Phase 3 — Blueprint forms */}
            {phase === 3 && (
              <motion.div key="blueprint"
                initial={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-6 flex flex-col items-center justify-center">
                <div className="text-[10px] font-bold text-violet-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Brain className="h-3 w-3" />
                  Talent Blueprint Generated
                </div>
                <PremiumRadarChart metrics={radarMetrics} size={200} animated={true} />
              </motion.div>
            )}

            {/* Phase 4 — Match score */}
            {phase === 4 && (
              <motion.div key="score"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-6 flex flex-col items-center justify-center text-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">AI Match Score</div>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 250, damping: 22, delay: 0.2 }}
                  className="relative">
                  <div className="w-36 h-36 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-[0_0_40px_rgba(79,70,229,0.35)]">
                    <div className="text-white text-center">
                      <div className="text-4xl font-extrabold font-jakarta">94%</div>
                      <div className="text-indigo-200 text-[10px] font-bold mt-0.5">MATCH</div>
                    </div>
                  </div>
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                    className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[9px] font-extrabold px-2 py-1 rounded-full">
                    TOP 5%
                  </motion.div>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                  className="text-xs text-slate-500 mt-5 max-w-[200px]">
                  Exceptional learning velocity · High problem-solving consistency
                </motion.p>
              </motion.div>
            )}

            {/* Phase 5 — Leaderboard */}
            {phase === 5 && (
              <motion.div key="leaderboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-6">
                <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Trophy className="h-3 w-3" />
                  Talent Leaderboard
                </div>
                <div className="space-y-2">
                  {[
                    { rank: 1, name: 'Sarah Chen', score: '94%', badge: '🏆', highlight: true },
                    { rank: 2, name: 'Priya Sharma', score: '87%', badge: '' },
                    { rank: 3, name: 'Alex Lee', score: '81%', badge: '' },
                    { rank: 4, name: 'Rahul Gupta', score: '76%', badge: '' },
                  ].map((c, i) => (
                    <motion.div key={c.rank}
                      initial={{ x: 30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.15, type: 'spring', stiffness: 300, damping: 25 }}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-xs ${
                        c.highlight
                          ? 'bg-indigo-50 border-indigo-300 shadow-sm'
                          : 'bg-white border-slate-100'
                      }`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-[10px] ${
                        c.highlight ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>#{c.rank}</div>
                      <span className={`flex-1 font-bold ${c.highlight ? 'text-indigo-800' : 'text-slate-700'}`}>{c.name}</span>
                      {c.badge && <span>{c.badge}</span>}
                      <span className={`font-extrabold ${c.highlight ? 'text-indigo-700' : 'text-slate-500'}`}>{c.score}</span>
                    </motion.div>
                  ))}
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                  className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[10px] font-bold text-emerald-700 text-center">
                  ✅ Sarah Chen — Recommended for Interview
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Phase indicator dots */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {[0,1,2,3,4,5].map(i => (
            <div key={i} className={`rounded-full transition-all duration-300 ${
              phase === i ? 'w-5 h-1.5 bg-indigo-500' : 'w-1.5 h-1.5 bg-slate-200'
            }`} />
          ))}
        </div>
      </div>

      {/* Floating skill badges around the card */}
      <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -left-4 top-16 bg-white border border-indigo-200 rounded-xl px-3 py-1.5 shadow-lg text-xs font-bold text-indigo-700 flex items-center gap-1.5">
        <Brain className="h-3.5 w-3.5" /> AI-Powered
      </motion.div>
      <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute -right-4 top-24 bg-white border border-emerald-200 rounded-xl px-3 py-1.5 shadow-lg text-xs font-bold text-emerald-700 flex items-center gap-1.5">
        <TrendingUp className="h-3.5 w-3.5" /> 94% Match
      </motion.div>
      <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute -right-3 bottom-20 bg-white border border-amber-200 rounded-xl px-3 py-1.5 shadow-lg text-xs font-bold text-amber-700 flex items-center gap-1.5">
        <Trophy className="h-3.5 w-3.5" /> #1 Ranked
      </motion.div>
    </div>
  );
};

// ─── Scroll-Telling Section ───────────────────────────────────────────────────
const ScrollTellingSection = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });
  const scene = useTransform(scrollYProgress, [0, 0.17, 0.34, 0.5, 0.67, 0.84, 1], [0, 1, 2, 3, 4, 5, 5]);
  const [currentScene, setCurrentScene] = useState(0);

  useEffect(() => {
    return scene.onChange(v => setCurrentScene(Math.round(v)));
  }, [scene]);

  const sceneContent = [
    {
      title: "Resume Received",
      subtitle: "Sarah Chen — Frontend Developer",
      content: (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg max-w-sm mx-auto">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <FileText className="h-3.5 w-3.5" /> Resume PDF
          </div>
          <div className="space-y-2 font-mono text-xs text-slate-600">
            <p><strong className="text-slate-900">Sarah Chen</strong></p>
            <p className="text-slate-500">Frontend Developer, 3 years exp.</p>
            <div className="border-t border-slate-100 pt-2 mt-2 space-y-1">
              <p>📁 E-commerce Platform</p>
              <p>📁 Study Vault</p>
              <p>📁 Complaint Management System</p>
            </div>
            <div className="border-t border-slate-100 pt-2 text-slate-400">
              Keywords: React, Node.js, CSS
            </div>
          </div>
        </div>
      )
    },
    {
      title: "AI Begins Analysis",
      subtitle: "Deep semantic understanding of every line",
      content: (
        <div className="bg-white rounded-2xl border border-indigo-200 p-6 shadow-lg max-w-sm mx-auto relative overflow-hidden">
          <div className="absolute inset-0 animate-shimmer pointer-events-none" />
          <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Brain className="h-3.5 w-3.5 animate-pulse" /> Analyzing Sections
          </div>
          <div className="space-y-3">
            {['Experience Block', 'Project Descriptions', 'Skill Keywords', 'Achievement Patterns', 'Behavioral Signals'].map((item, i) => (
              <motion.div key={item}
                initial={{ opacity: 0.3 }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }}
                className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-400" />
                <div className="flex-1 h-2 bg-indigo-50 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-indigo-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${60 + i * 8}%` }}
                    transition={{ duration: 1, delay: i * 0.2 }} />
                </div>
                <span className="text-[10px] text-slate-500 font-semibold w-16">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "Hidden Skills Surface",
      subtitle: "Capabilities invisible to traditional ATS",
      content: (
        <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-lg max-w-sm mx-auto">
          <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" /> Discovered Skills
          </div>
          <div className="flex flex-wrap gap-2">
            {['System Design', 'API Architecture', 'Problem Solving', 'Leadership', 'Communication', 'Adaptability'].map((s, i) => (
              <motion.div key={s}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.15, type: 'spring', stiffness: 400 }}
                className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-full">
                ✦ {s}
              </motion.div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-slate-50 rounded-xl text-[10px] text-slate-500">
            🧠 These skills were not on the resume — surfaced from project patterns and behavioral signals
          </div>
        </div>
      )
    },
    {
      title: "Talent Blueprint Forms",
      subtitle: "Multi-dimensional capability visualization",
      content: (
        <div className="bg-white rounded-2xl border border-violet-200 p-6 shadow-lg max-w-sm mx-auto flex flex-col items-center">
          <div className="text-[10px] font-bold text-violet-600 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Target className="h-3.5 w-3.5" /> Candidate DNA
          </div>
          <PremiumRadarChart
            metrics={[
              { label: 'Problem Solving', value: 92, angle: 0, desc: 'Exceptional' },
              { label: 'Communication', value: 78, angle: 60, desc: 'Strong' },
              { label: 'Leadership', value: 70, angle: 120, desc: 'Good' },
              { label: 'Adaptability', value: 85, angle: 180, desc: 'Very High' },
              { label: 'Reliability', value: 95, angle: 240, desc: 'Top 2%' },
              { label: 'Learning Speed', value: 97, angle: 300, desc: 'Exceptional' },
            ]}
            size={220}
            animated={currentScene === 3}
          />
        </div>
      )
    },
    {
      title: "Leaderboard Entry",
      subtitle: "Sarah Chen rises to the top",
      content: (
        <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-lg max-w-sm mx-auto">
          <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Trophy className="h-3.5 w-3.5" /> Talent Rankings
          </div>
          <div className="space-y-2">
            {[
              { rank: 1, name: 'Sarah Chen', score: 94, highlight: true },
              { rank: 2, name: 'Priya Sharma', score: 87 },
              { rank: 3, name: 'Alex Lee', score: 81 },
              { rank: 4, name: 'Rahul Gupta', score: 76 },
            ].map((c, i) => (
              <motion.div key={c.rank}
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.15 }}
                className={`flex items-center gap-3 p-3 rounded-xl border text-sm ${
                  c.highlight ? 'bg-indigo-50 border-indigo-300' : 'border-slate-100'
                }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  c.highlight ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>#{c.rank}</div>
                <span className={`flex-1 font-semibold text-sm ${c.highlight ? 'text-indigo-800' : 'text-slate-700'}`}>{c.name}</span>
                <div className="text-right">
                  <div className={`font-extrabold text-sm ${c.highlight ? 'text-indigo-700' : 'text-slate-500'}`}>{c.score}%</div>
                  <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                    <motion.div className="h-full bg-indigo-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${c.score}%` }}
                      transition={{ duration: 1, delay: i * 0.2 }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "Recruiter Notified",
      subtitle: "Intelligent recommendation delivered",
      content: (
        <div className="max-w-sm mx-auto space-y-3">
          <motion.div
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">
                AI
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">TalentLens AI Copilot</div>
                <div className="text-[10px] text-slate-400 mb-2">Just now</div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Sarah Chen is ready for interview. She ranks #1 with a 94% match score, exceptional learning velocity (top 3%), and consistent technical performance.
                </p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
            className="bg-emerald-600 text-white rounded-2xl p-5 shadow-lg text-center">
            <div className="text-2xl font-extrabold font-jakarta">✅ Recommended</div>
            <div className="text-emerald-100 text-sm mt-1">for Interview</div>
            <div className="text-xs text-emerald-200 mt-3">Sarah Chen · 94% Match · Frontend Lead</div>
          </motion.div>
        </div>
      )
    }
  ];

  return (
    <div ref={containerRef} className="relative" style={{ height: `${6 * 100}vh` }}>
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col bg-slate-950">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid-bg absolute inset-0" />
        </div>
        <NeuralBackground opacity={0.04} />

        {/* Section header */}
        <div className="text-center pt-16 pb-8 relative z-10">
          <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">
            AI In Action
          </div>
          <h2 className="text-4xl font-extrabold text-white font-jakarta tracking-tight">
            Watch TalentLens Think
          </h2>
          <p className="text-slate-400 mt-3 text-sm">Scroll to experience the AI transformation</p>
        </div>

        {/* Scene indicator */}
        <div className="flex justify-center gap-2 mb-6 relative z-10">
          {sceneContent.map((s, i) => (
            <button key={i} onClick={() => {}} className={`transition-all duration-300 rounded-full ${
              currentScene === i ? 'w-8 h-2 bg-indigo-500' : 'w-2 h-2 bg-slate-700'
            }`} />
          ))}
        </div>

        {/* Scene content */}
        <div className="flex-1 flex items-start justify-center px-6 relative z-10" style={{ paddingTop: '1rem' }}>
          <div className="w-full max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div key={currentScene}
                initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
                transition={{ duration: 0.5 }}>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-xs font-bold mb-3">
                    Scene {currentScene + 1} of {sceneContent.length}
                  </div>
                  <h3 className="text-2xl font-extrabold text-white font-jakarta">
                    {sceneContent[currentScene]?.title}
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">
                    {sceneContent[currentScene]?.subtitle}
                  </p>
                </div>
                {sceneContent[currentScene]?.content}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="text-center pb-8 text-slate-600 text-xs font-semibold relative z-10 animate-scroll-bounce">
          ↓ Keep scrolling
        </div>
      </div>
    </div>
  );
};

// ─── Copilot Chat Demo ────────────────────────────────────────────────────────
const CopilotDemo = () => {
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [showCandidates, setShowCandidates] = useState(false);
  const [userTyped, setUserTyped] = useState('');
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const fullQuery = 'Find high-potential MERN developers.';
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!inView) return;
    // Type the user message
    let i = 0;
    const typingInterval = setInterval(() => {
      i++;
      setUserTyped(fullQuery.slice(0, i));
      if (i >= fullQuery.length) {
        clearInterval(typingInterval);
        setTimeout(() => {
          setMessages([{ role: 'user', text: fullQuery }]);
          setUserTyped('');
          setTyping(true);
          setTimeout(() => {
            setTyping(false);
            setMessages(prev => [...prev, {
              role: 'ai',
              text: 'Found 12 candidates. 3 demonstrate exceptional learning speed and consistently strong assessment performance.',
              candidates: true
            }]);
            setTimeout(() => setShowCandidates(true), 400);
          }, 2200);
        }, 300);
      }
    }, 60);
    return () => clearInterval(typingInterval);
  }, [inView]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const candidates = [
    { name: 'Priya Sharma', role: 'Full-Stack Dev', score: 94, skills: ['React', 'Node', 'Mongo'] },
    { name: 'Arjun Mehta', role: 'Backend Dev', score: 91, skills: ['Express', 'MongoDB', 'Redis'] },
    { name: 'Sneha Reddy', role: 'MERN Dev', score: 88, skills: ['React', 'Node', 'GraphQL'] },
  ];

  return (
    <div ref={ref} className="bg-[#0F0F1A] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-slate-900/80 border-b border-slate-800 px-5 py-3.5 flex items-center gap-3">
        <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
        <span className="text-sm font-bold text-white font-jakarta">TalentLens Copilot</span>
        <div className="ml-auto text-[10px] font-bold text-slate-500 bg-slate-800 px-2 py-1 rounded-full">
          AI-Powered
        </div>
      </div>

      {/* Chat area */}
      <div className="p-5 space-y-4 min-h-56 flex flex-col justify-end">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-xl px-4 py-3 text-xs font-semibold leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
              }`}>
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 rounded-xl rounded-bl-none px-4 py-3 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full think-dot-1" />
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full think-dot-2" />
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full think-dot-3" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Candidate cards appearing */}
      <AnimatePresence>
        {showCandidates && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="border-t border-slate-800 p-5">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
              Top Matches
            </div>
            <div className="space-y-2.5">
              {candidates.map((c, i) => (
                <motion.div key={c.name}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.15 }}
                  className="bg-slate-900 border border-slate-700 rounded-xl p-3.5 flex items-center gap-3 hover:border-indigo-500/40 transition-colors cursor-pointer">
                  <div className="w-9 h-9 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs shrink-0">
                    {c.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white">{c.name}</div>
                    <div className="text-[10px] text-slate-500">{c.role}</div>
                    <div className="flex gap-1 mt-1.5">
                      {c.skills.map(s => (
                        <span key={s} className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[9px] font-bold text-slate-400">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-extrabold text-indigo-400">{c.score}%</div>
                    <div className="text-[9px] text-slate-600">match</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="border-t border-slate-800 p-4 flex items-center gap-3 bg-slate-900/50">
        <div className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-400 flex items-center min-h-[36px]">
          {userTyped || <span className="text-slate-600">Ask your talent pool a question...</span>}
          {userTyped && <span className="w-0.5 h-4 bg-indigo-400 ml-0.5 animate-cursor inline-block" />}
        </div>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shrink-0">
          Send
        </button>
      </div>
    </div>
  );
};

// ─── Candidate Battle Section ─────────────────────────────────────────────────
const CandidateBattle = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const metrics = [
    { label: 'Assessments', sarah: 92, alex: 88 },
    { label: 'Code Challenge', sarah: 95, alex: 80 },
    { label: 'Learning Speed', sarah: 97, alex: 79 },
    { label: 'Problem Solving', sarah: 92, alex: 84 },
    { label: 'Consistency', sarah: 94, alex: 76 },
  ];

  return (
    <div ref={ref} className="max-w-5xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        {/* VS Header */}
        <div className="grid grid-cols-3 gap-6 items-center mb-8">
          {/* Candidate A */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={inView ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, type: 'spring' }}
            className="text-center">
            <div className="w-20 h-20 rounded-full bg-indigo-50 border-2 border-indigo-300 flex items-center justify-center font-extrabold text-indigo-700 mx-auto text-xl shadow-sm mb-3">
              SC
            </div>
            <h4 className="font-extrabold text-slate-900 font-jakarta">Sarah Chen</h4>
            <p className="text-xs text-slate-400 mt-0.5">Frontend Lead</p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full text-xs font-bold text-indigo-700">
              <Trophy className="h-3 w-3" /> 94% Match
            </div>
          </motion.div>

          {/* VS */}
          <div className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-extrabold text-sm mb-4">
              VS
            </div>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={inView ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: 0.8, duration: 0.5, type: 'spring' }}
              className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-4 text-white text-center shadow-lg">
              <div className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-1">AI Recommendation</div>
              <div className="font-extrabold text-lg font-jakarta">Sarah Chen</div>
              <div className="text-indigo-200 text-[10px] mt-1">15% higher learning agility</div>
            </motion.div>
          </div>

          {/* Candidate B */}
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={inView ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, type: 'spring' }}
            className="text-center">
            <div className="w-20 h-20 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center font-extrabold text-blue-600 mx-auto text-xl shadow-sm mb-3">
              AL
            </div>
            <h4 className="font-extrabold text-slate-900 font-jakarta">Alex Lee</h4>
            <p className="text-xs text-slate-400 mt-0.5">Systems Developer</p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs font-semibold text-slate-500">
              81% Match
            </div>
          </motion.div>
        </div>

        {/* Metric bars */}
        <div className="space-y-4 border-t border-slate-100 pt-6">
          {metrics.map((m, i) => (
            <div key={m.label}>
              <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">
                <span className="text-indigo-600">{m.sarah}%</span>
                <span>{m.label}</span>
                <span className="text-slate-400">{m.alex}%</span>
              </div>
              <div className="flex gap-2 items-center">
                {/* Sarah bar (grows right from center) */}
                <div className="flex-1 flex justify-end">
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-indigo-500 rounded-full ml-auto"
                      initial={{ width: 0 }}
                      animate={inView ? { width: `${m.sarah}%` } : { width: 0 }}
                      transition={{ duration: 1.2, delay: i * 0.1, ease: 'easeOut' }}
                      style={{ marginLeft: 'auto' }} />
                  </div>
                </div>
                <div className="w-px h-4 bg-slate-200 shrink-0" />
                {/* Alex bar */}
                <div className="flex-1">
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-blue-300 rounded-full"
                      initial={{ width: 0 }}
                      animate={inView ? { width: `${m.alex}%` } : { width: 0 }}
                      transition={{ duration: 1.2, delay: i * 0.1, ease: 'easeOut' }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Bento Grid ───────────────────────────────────────────────────────────────
const BentoGrid = () => {
  const cards = [
    {
      title: 'Underrated Talent',
      desc: 'Highly skilled profiles missed by keyword filters',
      color: 'from-indigo-50 to-indigo-100/50',
      border: 'border-indigo-200',
      badge: 'bg-indigo-100 text-indigo-700',
      chart: [30, 45, 38, 62, 55, 80, 94],
      avatars: ['AK', 'MS', 'RV'],
      trend: '+23%',
      trendUp: true,
      icon: Sparkles,
      iconColor: 'text-indigo-600',
    },
    {
      title: 'Future Leaders',
      desc: 'High adaptability, communication & leadership scores',
      color: 'from-cyan-50 to-cyan-100/50',
      border: 'border-cyan-200',
      badge: 'bg-cyan-100 text-cyan-700',
      chart: [50, 60, 55, 70, 75, 82, 91],
      avatars: ['SK', 'PR', 'AM'],
      trend: '+18%',
      trendUp: true,
      icon: TrendingUp,
      iconColor: 'text-cyan-600',
    },
    {
      title: 'Fast Learners',
      desc: 'Top learning velocity in automated tracking',
      color: 'from-emerald-50 to-emerald-100/50',
      border: 'border-emerald-200',
      badge: 'bg-emerald-100 text-emerald-700',
      chart: [40, 55, 70, 65, 88, 92, 97],
      avatars: ['NP', 'VS', 'AR'],
      trend: '+31%',
      trendUp: true,
      icon: Zap,
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Emerging Developers',
      desc: 'Junior talent with exceptional test performance',
      color: 'from-violet-50 to-violet-100/50',
      border: 'border-violet-200',
      badge: 'bg-violet-100 text-violet-700',
      chart: [25, 35, 42, 58, 65, 72, 85],
      avatars: ['KR', 'TM', 'SN'],
      trend: '+15%',
      trendUp: true,
      icon: Code2,
      iconColor: 'text-violet-600',
    },
    {
      title: 'Top Problem Solvers',
      desc: 'Highest scores in sandboxed complex challenges',
      color: 'from-amber-50 to-amber-100/50',
      border: 'border-amber-200',
      badge: 'bg-amber-100 text-amber-700',
      chart: [60, 72, 68, 81, 85, 90, 96],
      avatars: ['RK', 'AP', 'DJ'],
      trend: '+27%',
      trendUp: true,
      icon: Brain,
      iconColor: 'text-amber-600',
    },
    {
      title: 'High Potential',
      desc: 'Combined matrix of cognitive ability and technical depth',
      color: 'from-rose-50 to-rose-100/50',
      border: 'border-rose-200',
      badge: 'bg-rose-100 text-rose-700',
      chart: [45, 52, 60, 71, 78, 86, 93],
      avatars: ['AS', 'BM', 'CP'],
      trend: '+22%',
      trendUp: true,
      icon: Award,
      iconColor: 'text-rose-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const w = 80;
        const h = 40;
        const max = Math.max(...card.chart);
        const min = Math.min(...card.chart);
        const pts = card.chart.map((v, i) => {
          const x = (i / (card.chart.length - 1)) * w;
          const y = h - ((v - min) / (max - min)) * h;
          return `${x},${y}`;
        }).join(' ');

        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: idx * 0.08, duration: 0.5 }}
            whileHover={{ y: -6, boxShadow: '0 20px 40px -8px rgba(79,70,229,0.12)' }}
            className={`bg-gradient-to-br ${card.color} border ${card.border} rounded-2xl p-5 cursor-pointer transition-all duration-300`}>

            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-xl bg-white shadow-sm ${card.iconColor}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className={`px-2 py-1 rounded-full text-[10px] font-bold ${card.badge} flex items-center gap-1`}>
                <TrendingUp className="h-3 w-3" />
                {card.trend}
              </div>
            </div>

            <h3 className="font-extrabold text-slate-900 font-jakarta text-sm mb-1">{card.title}</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-4">{card.desc}</p>

            {/* Mini sparkline chart */}
            <div className="mb-4">
              <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} className="overflow-visible">
                <polyline points={pts} fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className={card.iconColor} />
                {/* Fill area */}
                <polyline
                  points={`0,${h} ${pts} ${w},${h}`}
                  fill="currentColor" fillOpacity="0.08"
                  stroke="none" className={card.iconColor} />
              </svg>
            </div>

            {/* Avatars */}
            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                {card.avatars.map((av, i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-white border-2 border-white shadow-sm flex items-center justify-center text-[9px] font-bold text-slate-600">
                    {av}
                  </div>
                ))}
                <div className="w-7 h-7 rounded-full bg-white border-2 border-white shadow-sm flex items-center justify-center text-[9px] font-bold text-slate-400">
                  +
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                View Pool <ChevronRight className="h-3 w-3" />
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// ─── Resume Transformation ─────────────────────────────────────────────────────
const ResumeTransformation = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <div ref={ref} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
      {/* Before — Raw Resume */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="relative">
        <div className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2">
          <X className="h-3.5 w-3.5" /> Before — Raw Resume
        </div>
        <div className="bg-white border-2 border-dashed border-red-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-slate-400" />
            <span className="text-sm font-bold text-slate-500">sarah_chen_cv.pdf</span>
          </div>
          <div className="space-y-3 font-mono text-xs text-slate-500">
            <div className="h-3 bg-slate-100 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-full" />
            <div className="h-3 bg-slate-100 rounded w-5/6" />
            <div className="h-3 bg-slate-100 rounded w-2/3" />
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <div className="h-3 bg-slate-100 rounded w-full" />
              <div className="h-3 bg-slate-100 rounded w-4/5" />
              <div className="h-3 bg-slate-100 rounded w-3/4" />
            </div>
          </div>
          <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-500 font-semibold">
            ⚠️ ATS Score: 62% — High risk of rejection
          </div>
        </div>
      </motion.div>

      {/* Arrow / AI nodes */}
      <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.4, type: 'spring' }}
          className="w-12 h-12 rounded-full bg-indigo-600 shadow-lg flex items-center justify-center">
          <ArrowRight className="h-5 w-5 text-white" />
        </motion.div>
      </div>

      {/* After — Talent Blueprint */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative">
        <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Check className="h-3.5 w-3.5" /> After — Talent Blueprint
        </div>
        <div className="bg-white border-2 border-indigo-300 rounded-2xl p-6 shadow-[0_8px_30px_-6px_rgba(79,70,229,0.2)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">SC</div>
              <div>
                <div className="text-sm font-bold text-slate-900">Sarah Chen</div>
                <div className="text-[10px] text-indigo-600 font-semibold">94% Job Match</div>
              </div>
            </div>
            <div className="px-2.5 py-1 bg-indigo-600 text-white text-[10px] font-extrabold rounded-full">#1 Ranked</div>
          </div>

          <div className="space-y-2.5">
            {[
              { label: 'Technical Skills', value: 94, color: 'bg-indigo-500' },
              { label: 'Learning Speed', value: 97, color: 'bg-emerald-500' },
              { label: 'Communication', value: 78, color: 'bg-cyan-500' },
              { label: 'Leadership', value: 70, color: 'bg-violet-500' },
              { label: 'Growth Potential', value: 91, color: 'bg-amber-500' },
            ].map((m, i) => (
              <div key={m.label}>
                <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                  <span>{m.label}</span><span>{m.value}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div className={`h-full ${m.color} rounded-full`}
                    initial={{ width: 0 }}
                    animate={inView ? { width: `${m.value}%` } : { width: 0 }}
                    transition={{ duration: 1, delay: 0.5 + i * 0.1, ease: 'easeOut' }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-700 text-center">
            ✅ Recommended for Interview
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main About Component ─────────────────────────────────────────────────────
export const About = () => {
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);
  const [pipelineStep, setPipelineStep] = useState(0);

  const radarMetrics = [
    { label: 'Problem Solving', value: 85, angle: 0, desc: 'Identifies root causes and implements elegant solutions' },
    { label: 'Communication', value: 70, angle: 60, desc: 'Written + verbal clarity in team environments' },
    { label: 'Leadership', value: 65, angle: 120, desc: 'Initiative-taking and team guidance capability' },
    { label: 'Adaptability', value: 80, angle: 180, desc: 'Flexibility across tech stacks and domains' },
    { label: 'Reliability', value: 90, angle: 240, desc: 'Consistent delivery and deadline adherence' },
    { label: 'Learning Speed', value: 95, angle: 300, desc: 'Rate of skill acquisition and knowledge depth growth' },
  ];

  const stats = [
    { value: 10000, suffix: '+', label: 'Candidates Analyzed', icon: Users },
    { value: 94, suffix: '%', label: 'Match Accuracy', icon: Target },
    { value: 3, suffix: 'x', label: 'Faster Hiring', icon: Zap },
    { value: 40, suffix: '%', label: 'Bias Reduced', icon: Shield },
  ];

  const statsRef = useRef(null);

  return (
    <div className="mesh-gradient min-h-screen selection:bg-brandPrimary/10 overflow-x-hidden">

      {/* ──────────────── HERO SECTION ──────────────── */}
      <section className="relative pt-20 pb-24 px-6 max-w-7xl mx-auto overflow-hidden">
        {/* Backgrounds */}
        <div className="absolute inset-0 grid-bg opacity-40 -z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-indigo-100/60 via-violet-50/40 to-transparent -z-10 blur-3xl pointer-events-none animate-spotlight" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-emerald-50/60 -z-10 blur-3xl pointer-events-none animate-float-alt" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left hero content */}
          <div className="lg:col-span-6 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-full text-indigo-700 text-xs font-bold shadow-sm">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              Next-Gen AI Talent Intelligence · Powered by Groq
            </motion.div>

            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.06] font-jakarta">
                Stop Reading<br />
                Resumes.
              </motion.h1>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.06] font-jakarta mt-1">
                <span className="animate-gradient-text">Start Discovering</span>
                <span className="text-slate-900"> Talent.</span>
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-lg text-slate-500 max-w-xl leading-relaxed">
              TalentLens AI helps recruiters identify the best candidates faster by analyzing skills, assessments, growth potential, and real-world abilities — not just keywords.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap gap-4">
              {token ? (
                <button
                  onClick={() => navigate(
                    user?.role === 'candidate' ? '/candidate/dashboard' :
                    user?.role === 'recruiter' ? '/recruiter/dashboard' : '/admin/dashboard'
                  )}
                  className="btn-primary py-3.5 px-7 text-sm font-bold magnetic-btn shadow-lg shadow-indigo-500/20">
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <>
                  <button onClick={() => navigate('/register')}
                    className="btn-primary py-3.5 px-7 text-sm font-bold magnetic-btn shadow-lg shadow-indigo-500/20">
                    Get Started Free <ArrowRight className="h-4 w-4" />
                  </button>
                  <button onClick={() => navigate('/register')}
                    className="btn-secondary py-3.5 px-7 text-sm font-bold magnetic-btn flex items-center gap-2">
                    <Play className="h-4 w-4" /> Watch Demo
                  </button>
                </>
              )}
            </motion.div>

            {/* Social proof mini bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-2.5">
                {['AK', 'MS', 'RV', 'PK', 'AS'].map((av, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-white border-2 border-white shadow text-[10px] font-bold text-slate-600 flex items-center justify-center">
                    {av}
                  </div>
                ))}
              </div>
              <div className="text-xs text-slate-500">
                <span className="font-bold text-slate-800">2,400+</span> recruiters trust TalentLens
                <div className="flex gap-0.5 mt-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right hero animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-6">
            <HeroAnimation />
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-400 text-xs font-semibold animate-scroll-bounce">
          <ArrowDown className="h-4 w-4" />
          Scroll to explore
        </motion.div>
      </section>

      {/* ──────────────── STATS BAR ──────────────── */}
      <section className="py-16 border-y border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-3">
                  <Icon className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="text-3xl font-extrabold text-slate-900 font-jakarta">
                  <CountUp target={s.value} suffix={s.suffix} />
                </div>
                <div className="text-xs text-slate-400 font-semibold mt-1">{s.label}</div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ──────────────── SCROLL-TELLING ──────────────── */}
      <ScrollTellingSection />

      {/* ──────────────── PROBLEM VS SOLUTION ──────────────── */}
      <section className="py-24 px-6 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Visual Storytelling</div>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight font-jakarta">
              Why Traditional Hiring<br />Misses Great Talent
            </h2>
            <p className="text-slate-500 leading-relaxed">
              Keyword filters reject the next great hire. Here's what changes with TalentLens.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Traditional Process */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-red-50/60 border-2 border-dashed border-red-200 rounded-3xl p-8">
              <h3 className="font-extrabold text-red-600 font-jakarta mb-6 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" /> Traditional Process
              </h3>
              <div className="space-y-4">
                {['Resume', 'Keyword Search', 'Rejected ❌'].map((step, i) => (
                  <motion.div key={step}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                    className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${
                      i === 2 ? 'bg-red-500 border-red-500 text-white' : 'bg-white border-red-200 text-red-500'
                    }`}>{i + 1}</div>
                    <div className={`flex-1 p-3 rounded-xl border text-sm font-semibold ${
                      i === 2 ? 'bg-red-100 border-red-300 text-red-700' : 'bg-white border-red-100 text-slate-700'
                    }`}>{step}</div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 text-xs text-red-400 font-semibold text-center">
                Great talent goes unnoticed. 🚫
              </div>
            </motion.div>

            {/* TalentLens Process */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-b from-indigo-50/60 to-emerald-50/30 border-2 border-indigo-200 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100/40 rounded-full blur-2xl pointer-events-none" />
              <h3 className="font-extrabold text-indigo-700 font-jakarta mb-6 flex items-center gap-2">
                <Sparkles className="h-5 w-5" /> TalentLens Process
              </h3>
              <div className="space-y-3">
                {['Resume', 'Skills Analysis', 'Assessments', 'Behavior Mapping', 'Growth Potential', 'Talent Blueprint', '✅ Shortlisted'].map((step, i) => (
                  <motion.div key={step}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${
                      i === 6 ? 'bg-emerald-500 border-emerald-500 text-white' :
                      i > 0 ? 'bg-indigo-100 border-indigo-200 text-indigo-700' :
                      'bg-white border-indigo-200 text-indigo-500'
                    }`}>{i + 1}</div>
                    <div className={`flex-1 p-2.5 rounded-xl border text-xs font-semibold ${
                      i === 6 ? 'bg-emerald-100 border-emerald-300 text-emerald-700' :
                      i > 0 ? 'bg-white border-indigo-100 text-slate-700' :
                      'bg-white border-slate-200 text-slate-600'
                    }`}>{step}</div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 text-xs text-emerald-600 font-bold text-center">
                The right candidate gets hired. 🎯
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ──────────────── RESUME TRANSFORMATION ──────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Before vs After</div>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight font-jakarta">
              Resume → Talent Blueprint
            </h2>
            <p className="text-slate-500">See what TalentLens reveals that traditional screening misses entirely.</p>
          </motion.div>

          <div className="relative">
            <ResumeTransformation />
          </div>
        </div>
      </section>

      {/* ──────────────── TALENT BLUEPRINT RADAR ──────────────── */}
      <section className="py-24 px-6 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Visual Competency Matrix</div>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight font-jakarta">
              Multi-Dimensional Candidate DNA
            </h2>
            <p className="text-slate-500">
              No more flat screening. Generate behavioral, adaptive, and logical indexes for every applicant — hover the chart to explore.
            </p>
          </motion.div>

          <div className="flex flex-col lg:flex-row items-center gap-12 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm flex flex-col items-center">
              <PremiumRadarChart metrics={radarMetrics} size={280} animated={true} />
              <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-3 h-3 rounded-full bg-indigo-500" /> Technical Skills
                </span>
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-3 h-3 rounded-full bg-blue-400" /> Cognitive Aptitude
                </span>
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-3 h-3 rounded-full bg-emerald-400" /> Behavioral Core
                </span>
              </div>
            </motion.div>

            <div className="flex-1 space-y-4">
              <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4">Metric Breakdown</div>
              {radarMetrics.map((m, i) => (
                <motion.div key={m.label}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group cursor-default">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">{m.label}</span>
                    <span className="text-sm font-extrabold text-indigo-600">{m.value}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-indigo-500 rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${m.value}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: i * 0.1 }} />
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1.5 group-hover:text-indigo-600 transition-colors">{m.desc}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── RECRUITER COPILOT ──────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5 space-y-6">
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
              AI Copilot Demo
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 font-jakarta leading-tight">
              Talk to Your<br />Candidate Pool
            </h2>
            <p className="text-slate-500 leading-relaxed">
              Use natural language to find, filter, and score applicants. The Copilot scans databases, parses test results, and recommends top candidates instantly.
            </p>

            <div className="space-y-3">
              {[
                { icon: MessageSquare, text: 'Natural language queries' },
                { icon: Brain, text: 'Real-time candidate analysis' },
                { icon: TrendingUp, text: 'Context-aware recommendations' },
              ].map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-indigo-600" />
                    </div>
                    {f.text}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7">
            <CopilotDemo />
          </motion.div>
        </div>
      </section>

      {/* ──────────────── CANDIDATE BATTLE ──────────────── */}
      <section className="py-24 px-6 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Side-by-Side Analysis</div>
            <h2 className="text-4xl font-extrabold text-slate-900 font-jakarta tracking-tight">
              Unbiased Candidate<br />Comparison
            </h2>
            <p className="text-slate-500">
              Select any two candidates and trigger head-to-head scoring across experience, assessments, and AI potential.
            </p>
          </motion.div>
          <CandidateBattle />
        </div>
      </section>

      {/* ──────────────── BENTO GRID TALENT DISCOVERY ──────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Talent Pools</div>
            <h2 className="text-4xl font-extrabold text-slate-900 font-jakarta tracking-tight">
              Pre-Segmented<br />Talent Discovery
            </h2>
            <p className="text-slate-500">
              Automated clusters surface top candidates without manual searches.
            </p>
          </motion.div>
          <BentoGrid />
        </div>
      </section>

      {/* ──────────────── HOW IT WORKS ──────────────── */}
      <section className="py-24 px-6 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Process</div>
            <h2 className="text-4xl font-extrabold text-slate-900 font-jakarta tracking-tight">
              How TalentLens Works
            </h2>
            <p className="text-slate-500">From raw resume to informed hiring decision in minutes.</p>
          </motion.div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Upload Resume', desc: 'Drop CVs in bulk. AI instantly parses semantic structure.', icon: FileText, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
              { step: '02', title: 'AI Analysis', desc: 'Groq LLM maps hidden capabilities and behavioral patterns.', icon: Brain, color: 'text-violet-600 bg-violet-50 border-violet-200' },
              { step: '03', title: 'Assessments', desc: 'Automate technical MCQ + VM coding challenges.', icon: Code2, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
              { step: '04', title: 'Smart Hiring', desc: 'View dashboards, rankings, and compare candidates.', icon: Trophy, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative group hover:border-indigo-300 hover:shadow-md transition-all">
                  <div className="absolute -top-3 left-6">
                    <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full font-jakarta">
                      {item.step}
                    </span>
                  </div>
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mt-4 mb-4 ${item.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900 font-jakarta mb-2">{item.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>

                  {/* Connector arrow for desktop */}
                  {idx < 3 && (
                    <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                      <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ──────────────── TESTIMONIALS ──────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-4xl font-extrabold text-slate-900 font-jakarta tracking-tight">
              Loved by Recruiting Leaders
            </h2>
            <p className="text-slate-500">Hear from teams that transformed their hiring with TalentLens.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { name: 'Jessica Mercer', role: 'Head of Talent, Ashby', quote: 'We replaced manual screening pipelines with TalentLens and saved 40+ hours per job post. Blind Mode is a game-changer.', avatar: 'JM', color: 'from-indigo-100 to-indigo-50' },
              { name: 'Robert Chen', role: 'VP Engineering, Vercel', quote: 'VM-sandboxed coding tests let us verify candidate skills instantly. Real skills, not memorized algorithms.', avatar: 'RC', color: 'from-cyan-100 to-cyan-50' },
              { name: 'Aria Sterling', role: 'Director of HR, Linear', quote: 'No more keyword matching. TalentLens discovers hidden potential our team would have skipped entirely.', avatar: 'AS', color: 'from-violet-100 to-violet-50' },
            ].map((t, idx) => (
              <motion.div key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed italic mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} border border-white shadow flex items-center justify-center font-bold text-xs text-indigo-700`}>
                    {t.avatar}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 font-jakarta">{t.name}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── FINAL CTA ──────────────── */}
      <section className="relative py-28 px-6 overflow-hidden bg-slate-950">
        {/* Neural background */}
        <NeuralBackground opacity={0.08} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-violet-600/10 rounded-full blur-3xl animate-float-alt" />
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-bold mb-6">
              <Sparkles className="h-3.5 w-3.5" /> Start Hiring Intelligently
            </div>
            <h2 className="text-5xl font-extrabold text-white font-jakarta tracking-tight leading-tight">
              Ready to Discover<br />
              <span className="animate-gradient-text">Talent Beyond Keywords?</span>
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto text-base leading-relaxed mt-6">
              Join thousands of modern recruiters mapping capabilities instead of reading raw resumes.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex justify-center gap-4 flex-wrap">
            {token ? (
              <button
                onClick={() => navigate(
                  user?.role === 'candidate' ? '/candidate/dashboard' :
                  user?.role === 'recruiter' ? '/recruiter/dashboard' : '/admin/dashboard'
                )}
                className="btn-primary py-4 px-8 text-sm font-bold magnetic-btn shadow-xl shadow-indigo-500/20">
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <>
                <button onClick={() => navigate('/register')}
                  className="btn-primary py-4 px-8 text-sm font-bold magnetic-btn shadow-xl shadow-indigo-500/20">
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </button>
                <button onClick={() => navigate('/login')}
                  className="py-4 px-8 text-sm font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all magnetic-btn">
                  Sign In
                </button>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* ──────────────── FOOTER ──────────────── */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 px-6 text-xs text-slate-500 font-semibold">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo iconSize="h-6 w-6" textSize="text-md" />
          <div className="flex items-center gap-6">
            <Link to="/register" className="hover:text-slate-300 transition-colors">Get Started</Link>
            <Link to="/login" className="hover:text-slate-300 transition-colors">Sign In</Link>
          </div>
          <div>© {new Date().getFullYear()} TalentLens AI. All rights reserved.</div>
        </div>
      </footer>

    </div>
  );
};

export default About;
