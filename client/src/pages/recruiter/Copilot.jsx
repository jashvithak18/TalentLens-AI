import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../../utils/api';
import { MessageSquare, Send, Bot, User, Sparkles } from 'lucide-react';

const Copilot = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', content: 'Hello! I am your Recruiter AI Copilot, connected to actual candidate profiles and assessment scores. Ask me to compare candidates, show underrated talent, or recommend shortlists.' }
  ]);
  const [input, setInput] = useState('');

  const chatMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post('/ai/copilot', payload);
      return res.data;
    },
    onSuccess: (resData) => {
      setMessages((prev) => [...prev, { sender: 'bot', content: resData.reply }]);
    },
    onError: () => {
      setMessages((prev) => [...prev, { sender: 'bot', content: 'Apologies, I encountered an issue querying the database. Please try again.' }]);
    }
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

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

  const handleSuggestClick = (prompt) => {
    setInput(prompt);
  };

  const suggestionPrompts = [
    'Why is Alex Rivera ranked first?',
    'Show underrated candidates.',
    'Find strongest MERN developers.',
    'Show candidates with high growth potential.'
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] space-y-4 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
          <Bot size={26} className="text-indigo-400" />
          <span>Recruiter AI Copilot</span>
        </h1>
        <p className="text-xs text-textMuted mt-1">Ask questions about ratings, shortlists, and candidate comparisons</p>
      </div>

      {/* Main chat box */}
      <div className="flex-1 glass-panel border border-darkBorder rounded-2xl overflow-hidden flex flex-col justify-between">
        {/* Messages */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex items-start space-x-3 max-w-[80%] ${m.sender === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                m.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-900 border border-slate-800 text-indigo-400'
              }`}>
                {m.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-indigo-600/10 text-indigo-200 rounded-tr-none border border-indigo-500/10'
                  : 'bg-slate-900/60 text-gray-200 rounded-tl-none border border-darkBorder'
              }`}>
                {m.content}
              </div>
            </div>
          ))}

          {chatMutation.isPending && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400">
                <Bot size={14} />
              </div>
              <div className="flex space-x-1 py-2 px-3 bg-slate-900/60 border border-darkBorder rounded-2xl rounded-tl-none">
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-75" />
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-150" />
              </div>
            </div>
          )}
        </div>

        {/* Input panel with suggestions */}
        <div className="p-4 border-t border-darkBorder space-y-3 bg-slate-950/20">
          {/* Prompt suggestions */}
          <div className="flex flex-wrap gap-2 pb-1.5">
            {suggestionPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestClick(prompt)}
                className="px-3 py-1 bg-slate-900 hover:bg-slate-850 border border-darkBorder rounded-full text-[10px] text-textMuted hover:text-white transition-all flex items-center space-x-1"
              >
                <Sparkles size={10} className="text-indigo-400" />
                <span>{prompt}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSend} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about candidates, resumes, and ratings..."
              className="custom-input pl-4 pr-12 text-xs py-3.5"
            />
            <button
              type="submit"
              disabled={chatMutation.isPending}
              className="absolute right-2 top-2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Copilot;
