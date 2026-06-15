import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../../utils/api';
import { MessageSquare, Send, Bot, User, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

const Copilot = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', content: 'Hello! I am your Recruiter AI Copilot, connected to actual candidate profiles and assessment scores. Ask me to compare candidates, show underrated talent, or recommend shortlists.' }
  ]);
  const [input, setInput] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const chatEndRef = useRef(null);

  // Scroll to bottom of message container
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post('/ai/copilot', payload);
      return res.data;
    },
    onSuccess: (resData) => {
      const fullReply = resData.reply;
      if (!fullReply) return;

      const words = fullReply.split(' ');
      let currentWordIndex = 0;

      // Add a streaming bot message placeholder
      setMessages((prev) => [...prev, { sender: 'bot', content: '', isStreaming: true }]);

      const interval = setInterval(() => {
        setMessages((prev) => {
          const next = [...prev];
          const lastMsg = next[next.length - 1];
          if (lastMsg && lastMsg.isStreaming) {
            const currentContent = lastMsg.content;
            const nextWord = words[currentWordIndex];
            lastMsg.content = currentContent ? `${currentContent} ${nextWord}` : nextWord;
          }
          return next;
        });

        currentWordIndex++;
        if (currentWordIndex >= words.length) {
          clearInterval(interval);
          setMessages((prev) => {
            const next = [...prev];
            const lastMsg = next[next.length - 1];
            if (lastMsg) {
              lastMsg.isStreaming = false;
            }
            return next;
          });
        }
      }, 30); // Stream a word every 30ms for a typing effect
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.error || 'Failed to get Copilot response.');
      setTimeout(() => setErrorMsg(''), 3000);
      setMessages((prev) => [...prev, { sender: 'bot', content: 'Apologies, I encountered an issue querying the candidate database. Please try again.' }]);
    }
  });

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage = { sender: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');

    // Call API with history format expected by backend
    chatMutation.mutate({
      messages: updatedMessages.map(m => ({
        sender: m.sender,
        content: m.content
      }))
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleSuggestClick = (prompt) => {
    if (chatMutation.isPending) return;
    setInput(prompt);
  };

  const suggestionPrompts = [
    'Why is the top candidate ranked first?',
    'Show underrated candidates',
    'Find strongest React developers',
    'Who has highest growth potential?'
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] space-y-4 max-w-4xl mx-auto pt-16 px-4">
      {/* Toast notifications */}
      {successMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs rounded-xl p-4 shadow-lg flex items-center space-x-2 animate-in fade-in slide-in-from-top-4 duration-250">
          <CheckCircle size={16} />
          <span className="font-bold">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="fixed top-20 right-6 z-50 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl p-4 shadow-lg flex items-center space-x-2 animate-in fade-in slide-in-from-top-4 duration-250">
          <AlertCircle size={16} />
          <span className="font-bold">{errorMsg}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center space-x-2 font-jakarta">
          <Bot size={24} className="text-brandPrimary" />
          <span>Recruiter AI Copilot</span>
        </h1>
        <p className="text-xs text-textMuted mt-1 font-semibold">
          Ask questions about ratings, shortlists, and candidate comparisons. Connected to live candidate data.
        </p>
      </div>

      {/* Main chat box */}
      <div className="flex-1 bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm">
        {/* Messages list */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[calc(100vh-320px)]">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex items-start space-x-3 max-w-[85%] ${m.sender === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
                m.sender === 'user' ? 'bg-indigo-50 border border-indigo-150 text-brandPrimary' : 'bg-slate-950 border border-slate-900 text-indigo-400'
              }`}>
                {m.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className={`p-3.5 rounded-2xl text-xs leading-relaxed font-semibold ${
                m.sender === 'user'
                  ? 'bg-brandPrimary/10 text-slate-800 rounded-tr-none border border-brandPrimary/5'
                  : 'bg-slate-50 text-slate-800 rounded-tl-none border border-[#E5E7EB]'
              }`}>
                {m.content}
              </div>
            </div>
          ))}

          {/* Chat Loader (Skeleton style) */}
          {chatMutation.isPending && (
            <div className="flex items-start space-x-3 max-w-[80%] animate-pulse">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0" />
              <div className="p-3.5 rounded-2xl bg-slate-100 rounded-tl-none h-12 w-64 border border-slate-200" />
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input panel with suggestions */}
        <div className="p-4 border-t border-[#E5E7EB] space-y-3 bg-slate-50/50">
          {/* Suggestion Chips */}
          <div className="flex flex-wrap gap-2 pb-1">
            {suggestionPrompts.map((prompt, idx) => (
              <div
                key={idx}
                onClick={() => handleSuggestClick(prompt)}
                className={`px-3 py-1.5 bg-white border border-[#E5E7EB] hover:border-brandPrimary/35 hover:bg-slate-50 rounded-full text-[10px] font-bold text-slate-600 hover:text-slate-900 transition-all flex items-center space-x-1 cursor-pointer ${
                  chatMutation.isPending ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <Sparkles size={10} className="text-brandPrimary" />
                <span>{prompt}</span>
              </div>
            ))}
          </div>

          {/* Send Input Area (No HTML Form Element) */}
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about candidates, resumes, and ratings..."
              className="custom-input pl-4 pr-12 text-xs py-3.5"
              disabled={chatMutation.isPending}
            />
            <div
              onClick={handleSend}
              className={`absolute right-2 p-2.5 bg-brandPrimary hover:bg-brandDark text-white rounded-xl transition-all cursor-pointer shadow-sm ${
                chatMutation.isPending ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <Send size={13} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Copilot;
