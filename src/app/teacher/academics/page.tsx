"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { BookOpen, Send, CheckCircle2, FileText, BrainCircuit } from 'lucide-react';
import { useState } from 'react';

export default function TeacherAcademics() {
  const [activeTab, setActiveTab] = useState<'homework' | 'diary' | 'quiz'>('homework');
  const [showNotification, setShowNotification] = useState(false);

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  return (
    <DashboardLayout role="teacher" title="Academics & Assignments">
      {/* Notification Toast */}
      {showNotification && (
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-24 right-8 z-50 glass-card p-4 border-l-4 border-l-emerald-500 flex items-center gap-3 shadow-2xl shadow-emerald-500/20"
        >
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          <div>
            <h4 className="text-white font-medium">Assigned Successfully</h4>
            <p className="text-slate-400 text-xs">Students and parents have been notified.</p>
          </div>
        </motion.div>
      )}

      <div className="flex gap-4 mb-8 border-b border-slate-700/50 pb-4">
        {[
          { id: 'homework', icon: BookOpen, label: 'Assign Homework' },
          { id: 'diary', icon: FileText, label: 'Class Diary' },
          { id: 'quiz', icon: BrainCircuit, label: 'Assign AI Quiz' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      <motion.div 
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-card p-8 max-w-3xl"
      >
        <h3 className="text-2xl font-bold text-white mb-6 capitalize">
          {activeTab === 'diary' ? 'Update Class Diary' : `New ${activeTab}`}
        </h3>

        <form onSubmit={handleAssign} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Select Class</label>
              <select className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Grade 10 - Section A</option>
                <option>Grade 10 - Section B</option>
                <option>Grade 12 - Pre-Eng</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Subject</label>
              <select className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Mathematics</option>
                <option>Physics</option>
                <option>Computer Science</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Title</label>
            <input 
              type="text" 
              placeholder={`Enter ${activeTab} title...`}
              required
              className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Details / Description</label>
            <textarea 
              rows={5}
              placeholder={`Type detailed ${activeTab} instructions here...`}
              required
              className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            ></textarea>
          </div>

          {activeTab !== 'diary' && (
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Due Date</label>
              <input 
                type="date" 
                className="w-full md:w-1/2 bg-slate-800/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="pt-4 border-t border-slate-700/50 flex justify-end">
            <button 
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-medium py-3 px-8 rounded-xl shadow-lg shadow-blue-500/25 transition-all active:scale-95 flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Assign & Notify
            </button>
          </div>
        </form>
      </motion.div>
    </DashboardLayout>
  );
}
