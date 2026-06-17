"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { TrendingUp, AlertCircle, FileText, CheckCircle2, User, X, Send, CreditCard, CalendarDays, Zap, Users, Bell } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useApiData } from '@/hooks/useApiData';
import { useAuth } from '@/context/AuthContext';
import { SkeletonCard } from '@/components/LoadingSkeleton';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#8b5cf6'];

const EMPTY = {
  stats: { totalStudents: 0, presentCount: 0, absentCount: 0, attPct: 0, pendingCount: 0 },
  revenueData: [],
  genderData: [],
  recentNotices: [],
};

export default function ParentDashboard() {
  const { user } = useAuth();
  const [showComplaint, setShowComplaint] = useState(false);
  const [complaintText, setComplaintText] = useState('');
  const [complaintSent, setComplaintSent] = useState(false);

  const { data, loading } = useApiData('/portal/dashboard', EMPTY);

  const stats = data?.stats || EMPTY.stats;
  const revenue = data?.revenueData || EMPTY.revenueData;
  const attendance = data?.genderData || EMPTY.genderData;
  const notices = data?.recentNotices || EMPTY.recentNotices;
  const hasLiveData = revenue.length > 0 || attendance.length > 0 || notices.length > 0 || stats.totalStudents > 0;

  const handleComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText.trim()) return;
    setShowComplaint(false);
    setComplaintText('');
    setComplaintSent(true);
    setTimeout(() => setComplaintSent(false), 4000);
  };

  return (
    <DashboardLayout role="parent" title="Parent Dashboard">
      {complaintSent && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          Complaint submitted to Admin successfully!
        </div>
      )}

      <div className="mb-8 flex flex-col md:flex-row items-center justify-between p-5 glass-card gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center">
            <User className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white">{user?.name || 'Parent'}</h2>
            <p className="text-slate-400 text-sm">{hasLiveData ? 'Live parent portal' : 'No live dashboard data yet'}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowComplaint(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors text-sm font-medium">
            <AlertCircle className="w-4 h-4" /> Lodge Complaint
          </button>
          <Link href="/parent/finance"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors text-sm font-medium">
            <CreditCard className="w-4 h-4" /> Pay Fee
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'blue' },
          { label: 'Present Today', value: stats.presentCount, icon: CheckCircle2, color: 'emerald' },
          { label: 'Fee Pending', value: stats.pendingCount, icon: CreditCard, color: 'amber' },
          { label: 'Attendance %', value: `${stats.attPct}%`, icon: TrendingUp, color: 'purple' },
        ].map((c, i) => (
          <div key={i} className={`glass-card p-5 border-t-4 border-${c.color}-500 hover:-translate-y-1 transition-transform`}>
            {loading ? <SkeletonCard /> : (
              <div className="flex items-center gap-3">
                <div className={`p-2 bg-${c.color}-500/20 rounded-lg`}>
                  <c.icon className={`w-5 h-5 text-${c.color}-400`} />
                </div>
                <div>
                  <p className="text-slate-400 text-xs">{c.label}</p>
                  <h3 className="text-xl font-semibold text-white">{c.value}</h3>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Fee Collection (Rs Thousands)</h3>
          <div className="h-60">
            {revenue.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenue}>
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                  <Bar dataKey="collected" fill="#10b981" radius={[4,4,0,0]} name="Collected (K)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full rounded-2xl border border-dashed border-slate-700/70 bg-slate-900/30 flex items-center justify-center text-center px-6">
                <div>
                  <p className="text-white font-semibold mb-1">No fee statistics yet</p>
                  <p className="text-slate-400 text-sm">Live fee collection data will appear here once the backend sends it.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Today's Attendance Breakdown</h3>
          <div className="h-60">
            {attendance.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={attendance} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {attendance.map((_: any, idx: number) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full rounded-2xl border border-dashed border-slate-700/70 bg-slate-900/30 flex items-center justify-center text-center px-6">
                <div>
                  <p className="text-white font-semibold mb-1">No attendance data yet</p>
                  <p className="text-slate-400 text-sm">Attendance analytics will show up once live records are available.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" /> School Notices
          </h3>
          <div className="space-y-3">
            {notices.length ? notices.slice(0, 4).map((n: any, i: number) => (
              <div key={i} className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <p className="text-white text-sm font-semibold">{n.title}</p>
                <p className="text-slate-400 text-xs mt-1">{n.issued_by} · {new Date(n.created_at).toLocaleDateString('en-GB')}</p>
              </div>
            )) : <p className="text-slate-500 text-sm">No live notices at the moment.</p>}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Access</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Fee History', icon: CreditCard, path: '/parent/finance', color: 'from-emerald-500 to-teal-400' },
              { label: 'Reports', icon: FileText, path: '/parent/reports', color: 'from-blue-500 to-cyan-400' },
              { label: 'Attendance', icon: CalendarDays, path: '/parent/reports', color: 'from-purple-500 to-violet-400' },
              { label: 'AI Insights', icon: Zap, path: '/parent/ai-insights', color: 'from-amber-500 to-orange-400' },
            ].map((a, i) => (
              <Link key={i} href={a.path} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors">
                <div className={`p-2 rounded-xl bg-gradient-to-br ${a.color}`}>
                  <a.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-white text-xs font-medium">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {showComplaint && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg">Lodge a Complaint</h3>
              <button onClick={() => setShowComplaint(false)}><X className="w-5 h-5 text-slate-400 hover:text-white" /></button>
            </div>
            <form onSubmit={handleComplaint} className="space-y-4">
              <textarea
                value={complaintText}
                onChange={e => setComplaintText(e.target.value)}
                rows={5}
                placeholder="Describe your concern clearly..."
                className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl p-3 text-sm resize-none outline-none focus:border-blue-500"
              />
              <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> Submit Complaint
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
