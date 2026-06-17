"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { FileText, Download, Target, Calendar, CheckSquare, XSquare, Briefcase } from 'lucide-react';

export default function ParentReports() {
  return (
    <DashboardLayout role="parent" title="AI Reports & Tracking">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 glass-card p-8 bg-gradient-to-br from-slate-800/80 to-blue-900/40 relative overflow-hidden"
        >
          <div className="flex justify-between items-start relative z-10">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Monthly AI Intelligence Report</h3>
              <p className="text-blue-200">Generated on May 1st, 2026</p>
            </div>
            <button className="bg-white/5 text-white/40 p-3 rounded-xl border border-white/10 flex items-center gap-2 cursor-not-allowed opacity-50" title="Coming soon">
              <Download className="w-5 h-5" /> Export PDF
            </button>
          </div>

          <div className="mt-8 relative z-10 bg-slate-900/40 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-emerald-400" /> Academic Trajectory
            </h4>
            <p className="text-slate-300 leading-relaxed mb-6">
              Ahmed has maintained a strong academic profile this month. His analytical skills in Mathematics have improved by <strong className="text-emerald-400">12%</strong> compared to the previous cycle. 
              The AI Learning Zone data indicates high engagement with interactive quizzes. However, his completion time for Physics homework suggests a slight conceptual gap in recent topics.
            </p>
            
            <h4 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-amber-400" /> Recommendations
            </h4>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li>Encourage spending an extra 15 mins/day on the AI Homework Assistant for Physics.</li>
              <li>Review the "Thermodynamics" AI Quiz results together.</li>
            </ul>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" /> Attendance Tracking
          </h3>
          
          <div className="flex items-center justify-center mb-8 relative">
            <div className="w-32 h-32 rounded-full border-[12px] border-emerald-500/20 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-[12px] border-emerald-500 border-l-transparent border-b-transparent transform rotate-45"></div>
              <div className="text-center">
                <span className="text-3xl font-bold text-white">94%</span>
                <span className="block text-xs text-slate-400 mt-1">Present</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <CheckSquare className="w-4 h-4" /> Days Present
              </div>
              <span className="text-white font-bold">22</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-2 text-red-400 font-medium">
                <XSquare className="w-4 h-4" /> Days Absent
              </div>
              <span className="text-white font-bold">1</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-400 font-medium">
                <Calendar className="w-4 h-4" /> Leaves
              </div>
              <span className="text-white font-bold">1</span>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
