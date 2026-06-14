import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../utils/api';
import { Clock, AlertCircle, CheckCircle, Send } from 'lucide-react';

const LiveAssessment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [testActive, setTestActive] = useState(false);

  // Fetch assessment configuration details
  const { data, isLoading } = useQuery({
    queryKey: ['assessmentDetails', id],
    queryFn: async () => {
      const res = await api.get(`/assessments/${id}`);
      return res.data;
    }
  });

  const assessment = data?.assessment;
  const questions = assessment?.questions || [];

  // Submit test mutation
  const submitMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post('/assessments/submit', payload);
      return res.data;
    },
    onSuccess: (resData) => {
      setTestActive(false);
      alert(`Test completed! Your score: ${resData.submission?.score}%`);
      navigate('/candidate/assessments');
    }
  });

  // Ticking timer effect
  useEffect(() => {
    if (assessment && !testActive) {
      setTimeLeft(assessment.duration * 60);
      setTestActive(true);
    }
  }, [assessment]);

  useEffect(() => {
    if (!testActive || timeLeft <= 0) {
      if (timeLeft === 0 && testActive) {
        handleAutoSubmit();
      }
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, testActive]);

  const handleSelectOption = (qId, optionIdx) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [qId]: optionIdx
    });
  };

  const handleAutoSubmit = () => {
    const answers = Object.keys(selectedAnswers).map(qId => ({
      questionId: qId,
      selectedOption: selectedAnswers[qId]
    }));
    submitMutation.mutate({
      assessmentId: id,
      mcqAnswers: answers,
      timeTaken: assessment.duration * 60 - timeLeft
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to submit the assessment?')) {
      handleAutoSubmit();
    }
  };

  if (isLoading) {
    return <div className="text-center py-12 text-slate-500 text-xs">Loading live test configuration...</div>;
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentQuestion = questions[currentIdx];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Timer Bar */}
      <div className="glass-panel border border-darkBorder rounded-xl p-4 flex justify-between items-center sticky top-16 z-10">
        <div>
          <h3 className="text-xs font-bold text-slate-800">{assessment?.title}</h3>
          <p className="text-[10px] text-textMuted mt-0.5">{questions.length} questions</p>
        </div>
        <div className="flex items-center space-x-2 bg-rose-950/20 text-rose-400 px-3.5 py-1.5 rounded-lg border border-rose-500/20 text-xs font-bold font-mono">
          <Clock size={14} />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Main Question Display */}
      {currentQuestion && (
        <div className="glass-panel border border-darkBorder rounded-xl p-6 space-y-6">
          <div className="flex justify-between items-center text-[10px] text-textMuted font-bold pb-2 border-b border-darkBorder/40">
            <span>Question {currentIdx + 1} of {questions.length}</span>
            <span className="capitalize">{currentQuestion.difficulty}</span>
          </div>

          <p className="text-sm font-semibold text-slate-805 leading-relaxed">{currentQuestion.text}</p>

          <div className="space-y-2">
            {currentQuestion.options.map((opt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(currentQuestion._id, idx)}
                className={`w-full text-left px-4 py-3 rounded-lg text-xs transition-all border ${
                  selectedAnswers[currentQuestion._id] === idx
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-semibold'
                    : 'bg-white border-darkBorder text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Nav Actions */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
          disabled={currentIdx === 0}
          className="btn-secondary text-xs"
        >
          Previous
        </button>

        {currentIdx < questions.length - 1 ? (
          <button
            onClick={() => setCurrentIdx(currentIdx + 1)}
            className="btn-primary text-xs"
          >
            Next Question
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
            className="btn-accent text-xs flex items-center space-x-1.5"
          >
            <Send size={12} />
            <span>{submitMutation.isPending ? 'Submitting...' : 'Finish & Submit'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default LiveAssessment;
