import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../utils/api';
import { Clock, Play, Send, Terminal, AlertCircle } from 'lucide-react';

const CodeChallenge = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [testActive, setTestActive] = useState(false);
  const [runLogs, setRunLogs] = useState([]);

  // Fetch assessment details
  const { data, isLoading } = useQuery({
    queryKey: ['assessmentDetails', id],
    queryFn: async () => {
      const res = await api.get(`/assessments/${id}`);
      return res.data;
    }
  });

  const assessment = data?.assessment;
  const problem = assessment?.codingProblems?.[0]; // Get the first coding problem

  const submitMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post('/assessments/submit', payload);
      return res.data;
    },
    onSuccess: (resData) => {
      setTestActive(false);
      const codingAns = resData.submission?.codingAnswers?.[0] || {};
      alert(`Submission Completed! Test cases passed: ${codingAns.testCasesPassed}/${codingAns.totalTestCases}. Final Score: ${resData.submission?.score}%`);
      navigate('/candidate/assessments');
    }
  });

  // Load template code on start
  useEffect(() => {
    if (problem) {
      const jsTemplate = problem.templates.find(t => t.language === 'javascript');
      setCode(jsTemplate ? jsTemplate.code : '// Write your solution here');
    }
  }, [problem]);

  useEffect(() => {
    if (assessment && !testActive) {
      setTimeLeft(assessment.duration * 60);
      setTestActive(true);
    }
  }, [assessment]);

  useEffect(() => {
    if (!testActive || timeLeft <= 0) return;
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, testActive]);

  const handleRunCode = async () => {
    setRunLogs([{ type: 'info', msg: 'Executing test cases...' }]);
    try {
      // Simulate/Dry-run using the submission endpoint with temporary flag, or just submit
      const res = await api.post('/assessments/submit', {
        assessmentId: id,
        codingAnswers: [{
          problemId: problem._id,
          code,
          language: 'javascript'
        }],
        timeTaken: assessment.duration * 60 - timeLeft
      });

      if (res.data.success) {
        const results = res.data.submission?.codingAnswers?.[0]?.runResults || [];
        const mappedLogs = results.map(r => ({
          type: r.passed ? 'success' : 'error',
          msg: `Input: ${r.expectedOutput} -> ${r.passed ? 'PASSED' : `FAILED (Expected: ${r.expectedOutput}, Got: ${r.actualOutput})`}`
        }));
        setRunLogs(mappedLogs);
      }
    } catch (err) {
      setRunLogs([{ type: 'error', msg: err.response?.data?.error || 'Execution timeout or syntax error.' }]);
    }
  };

  const handleSubmitFinal = () => {
    if (window.confirm('Are you ready to submit your code for scoring?')) {
      submitMutation.mutate({
        assessmentId: id,
        codingAnswers: [{
          problemId: problem._id,
          code,
          language: 'javascript'
        }],
        timeTaken: assessment.duration * 60 - timeLeft
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-12 text-slate-500 text-xs">Loading live code runner...</div>;
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-100px)]">
      {/* Problem Description Column */}
      <div className="glass-panel border border-darkBorder rounded-xl p-5 flex flex-col justify-between overflow-y-auto space-y-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-darkBorder/40">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{problem?.title}</h3>
            <div className="flex items-center space-x-2 text-rose-400 font-mono text-xs font-bold">
              <Clock size={12} />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
            {problem?.description}
          </div>
        </div>

        <div className="bg-slate-900/40 border border-darkBorder/60 rounded-lg p-3 space-y-2 mt-4">
          <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-bold uppercase">
            <Terminal size={12} />
            <span>Output Console</span>
          </div>
          <div className="space-y-1 font-mono text-[10px]">
            {runLogs.length === 0 ? (
              <span className="text-slate-600">No output logs generated. Click "Run Code".</span>
            ) : (
              runLogs.map((log, idx) => (
                <p
                  key={idx}
                  className={
                    log.type === 'success'
                      ? 'text-emerald-400'
                      : log.type === 'error'
                        ? 'text-rose-400'
                        : 'text-indigo-400'
                  }
                >
                  {log.msg}
                </p>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Code Editor Column */}
      <div className="flex flex-col space-y-4">
        <div className="flex-1 glass-panel border border-darkBorder rounded-xl overflow-hidden flex flex-col">
          <div className="bg-slate-950 px-4 py-2 border-b border-darkBorder flex justify-between items-center text-[10px] text-indigo-400 font-bold">
            <span>JavaScript Solution</span>
            <span className="text-slate-500">vm-sandbox-v1</span>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 bg-slate-950 font-mono text-xs text-gray-200 p-4 w-full focus:outline-none resize-none leading-relaxed"
            spellCheck="false"
          />
        </div>

        <div className="flex justify-between items-center text-xs">
          <button
            onClick={handleRunCode}
            className="btn-secondary px-4 py-2 flex items-center space-x-1.5"
          >
            <Play size={12} />
            <span>Run Test Cases</span>
          </button>
          <button
            onClick={handleSubmitFinal}
            disabled={submitMutation.isPending}
            className="btn-accent px-5 py-2.5 flex items-center space-x-1.5 text-white"
          >
            <Send size={12} />
            <span>{submitMutation.isPending ? 'Submitting...' : 'Submit Code'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeChallenge;
