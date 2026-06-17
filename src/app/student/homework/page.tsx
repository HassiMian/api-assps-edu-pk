"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { MessageSquare, Lightbulb, Send, BookOpen, User, Bot, Sparkles, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

type Message = { role: 'user' | 'bot'; content: string };
type Assignment = { id: number; title: string; subject: string; status: string };

const ASSIGNMENTS: Assignment[] = [];

export default function StudentHomework() {
  const [selectedTask, setSelectedTask] = useState<Assignment | null>(ASSIGNMENTS[0] || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');

    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'bot',
        content: 'Live homework guidance will respond here once a real assignment is selected and connected to the backend.'
      }]);
    }, 600);
  };

  return (
    <DashboardLayout role="student" title="AI Homework Guidance">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[calc(100vh-140px)]">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 glass-card overflow-hidden flex flex-col"
        >
          <div className="p-4 border-b border-slate-700/50 bg-slate-800/50">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" /> My Assignments
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {ASSIGNMENTS.length ? ASSIGNMENTS.map(hw => (
              <button
                key={hw.id}
                onClick={() => setSelectedTask(hw)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedTask?.id === hw.id
                    ? 'bg-blue-500/20 border-blue-500/50'
                    : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800'
                }`}
              >
                <h4 className="text-white font-medium text-sm">{hw.title}</h4>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-slate-400">{hw.subject}</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                    {hw.status}
                  </span>
                </div>
              </button>
            )) : (
              <div className="rounded-2xl border border-dashed border-slate-700/70 bg-slate-900/30 p-5 text-center">
                <p className="text-white font-semibold mb-1">No live homework found</p>
                <p className="text-slate-400 text-sm">Assignments will appear here once the backend provides them.</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3 glass-card flex flex-col overflow-hidden relative"
        >
          <div className="p-4 border-b border-slate-700/50 bg-slate-800/80 flex items-center justify-between z-10 relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">
                  {selectedTask ? `${selectedTask.title} Assistant` : 'Homework Assistant'}
                </h3>
                <p className="text-slate-400 text-xs">Step-by-step guidance mode</p>
              </div>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Live mode
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 z-10 relative">
            {messages.length ? messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 max-w-[80%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-cyan-600'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
                <div className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm'}`}>
                  <p className="leading-relaxed text-sm">{msg.content}</p>
                </div>
              </motion.div>
            )) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-md">
                  <MessageSquare className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                  <p className="text-white font-semibold mb-1">No homework conversation yet</p>
                  <p className="text-slate-400 text-sm">
                    Select a live assignment from the left panel to start a guided chat.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-800/80 border-t border-slate-700/50 z-10 relative">
            <form onSubmit={handleSend} className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask for a hint, explain your thought process..."
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button type="button" title="Hint" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors">
                  <Lightbulb className="w-5 h-5" />
                </button>
              </div>
              <button
                type="submit"
                disabled={!input.trim()}
                className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors shadow-lg shadow-cyan-500/20"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            <p className="text-center text-xs text-slate-500 mt-3 flex items-center justify-center gap-1">
              <AlertTriangle className="w-3 h-3" /> This screen only uses live assignment data when available.
            </p>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
