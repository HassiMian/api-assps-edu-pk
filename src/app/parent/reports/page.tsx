"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { FileText, Download, Target, Calendar, CheckSquare, XSquare, Briefcase, GraduationCap, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '@/utils/api';
import { useApiData } from '@/hooks/useApiData';

type ExamNotification = {
  id: number;
  title: string;
  message: string;
  time?: string;
  metadata?: { pct?: number; grade?: string };
};

export default function ParentReports() {
  const { data: dashboard } = useApiData<any>('/portal/dashboard', { stats: {}, attendanceTrend: [] });
  const stats = dashboard?.stats || {};
  const [examResults, setExamResults] = useState<ExamNotification[]>([]);
  const [loadingExams, setLoadingExams] = useState(true);

  useEffect(() => {
    api.get('/notify/inbox')
      .then((res) => {
        const rows = (res.data?.data || []).filter((n: { type?: string }) => n.type === 'exam_result');
        setExamResults(rows.slice(0, 8));
      })
      .catch(() => setExamResults([]))
      .finally(() => setLoadingExams(false));
  }, []);

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
              <p className="text-blue-200">Live data only · no fabricated predictions</p>
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
              A monthly AI narrative is not shown until validated assessment, homework, and attendance history are available for the linked child records. Current live scope contains <strong className="text-cyan-300">{Number(stats.totalStudents || 0)}</strong> linked student record(s).
            </p>
            
            <h4 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-amber-400" /> Recommendations
            </h4>
            <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4 text-sm text-slate-300">
              No automated recommendation is displayed until it can be supported by live assessment evidence.
            </div>
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
                <span className="text-3xl font-bold text-white">{Number(stats.attPct || 0)}%</span>
                <span className="block text-xs text-slate-400 mt-1">Today</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <CheckSquare className="w-4 h-4" /> Present today
              </div>
              <span className="text-white font-bold">{Number(stats.presentCount || 0)}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-2 text-red-400 font-medium">
                <XSquare className="w-4 h-4" /> Absent today
              </div>
              <span className="text-white font-bold">{Number(stats.absentCount || 0)}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-400 font-medium">
                <Calendar className="w-4 h-4" /> Leave today
              </div>
              <span className="text-white font-bold">{Number(stats.leaveCount || 0)}</span>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card p-6 mb-8"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-cyan-400" /> Online exam results
        </h3>
        {loadingExams && (
          <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading results…
          </div>
        )}
        {!loadingExams && examResults.length === 0 && (
          <p className="text-sm text-slate-400 py-2">No online exam results yet. You will be notified when your child completes a published exam.</p>
        )}
        {!loadingExams && examResults.length > 0 && (
          <div className="space-y-3">
            {examResults.map((item) => (
              <div key={item.id} className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-300">{item.message}</p>
                  </div>
                  {item.metadata?.grade && (
                    <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-bold text-cyan-300">
                      {item.metadata.grade} · {item.metadata.pct}%
                    </span>
                  )}
                </div>
                {item.time && <p className="mt-2 text-xs text-slate-500">{item.time}</p>}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
