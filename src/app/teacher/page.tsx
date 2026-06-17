"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { Users, CalendarDays, BrainCircuit, AlertCircle, BookOpen, Clock, Activity, CheckCircle2, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { useApiData } from '@/hooks/useApiData';
import { useRouter } from 'next/navigation';
import { SkeletonCard } from '@/components/LoadingSkeleton';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#8b5cf6'];

const EMPTY: any = {
  stats: { totalStudents: 0, presentCount: 0, absentCount: 0, attPct: 0, totalStaff: 0 },
  attendanceTrend: [],
  classDistribution: [],
  genderData: [],
  recentNotices: [],
};

export default function TeacherDashboard() {
  const { user } = useAuth();
  const router   = useRouter();
  const { data, loading } = useApiData('/portal/dashboard', EMPTY);

  const stats    = data?.stats    || EMPTY.stats;
  const trend    = data?.attendanceTrend    || EMPTY.attendanceTrend;
  const classDist = data?.classDistribution || EMPTY.classDistribution;
  const gender   = data?.genderData         || EMPTY.genderData;
  const notices  = data?.recentNotices      || [];

  const statCards = [
    { label: 'Total Students', value: stats.totalStudents, icon: Users,        color: 'blue',   border: 'border-blue-500' },
    { label: 'Present Today',  value: stats.presentCount,  icon: CheckCircle2, color: 'emerald',border: 'border-emerald-500' },
    { label: 'Absent Today',   value: stats.absentCount,   icon: AlertCircle,  color: 'red',    border: 'border-red-500' },
    { label: 'Attendance %',   value: `${stats.attPct}%`,  icon: TrendingUp,   color: 'purple', border: 'border-purple-500' },
  ];

  if (!user) return null;

  return (
    <DashboardLayout role="teacher" title="Teacher Dashboard">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
        {statCards.map((c, i) => (
          <div key={i} className={`glass-card p-5 border-t-4 ${c.border} hover:-translate-y-1 transition-transform`}>
            {loading ? <SkeletonCard /> : (
              <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl`} style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
              <c.icon className={`w-6 h-6 ${c.color === 'blue' ? 'text-blue-400' : c.color === 'emerald' ? 'text-emerald-400' : c.color === 'red' ? 'text-red-400' : 'text-purple-400'}`} />
            </div>
                <div>
                  <p className="text-slate-400 text-xs">{c.label}</p>
                  <h3 className="text-2xl font-bold text-white">{c.value}</h3>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-white mb-4">Weekly Attendance Trend</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend}>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                <Legend />
                <Bar dataKey="present" fill="#10b981" radius={[4,4,0,0]} name="Present" />
                <Bar dataKey="absent"  fill="#ef4444" radius={[4,4,0,0]} name="Absent"  />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-4">Class Distribution</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={classDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {classDist.map((_: any, idx: number) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Gender + Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-4">Gender Breakdown</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={gender} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  <Cell fill="#3b82f6" />
                  <Cell fill="#ec4899" />
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" /> Recent Notices
          </h3>
          <div className="space-y-3">
            {notices.length ? notices.slice(0,4).map((n: any, i: number) => (
              <div key={i} className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <p className="text-white text-sm font-semibold">{n.title}</p>
                <p className="text-slate-400 text-xs mt-1">{n.issued_by} · {new Date(n.created_at).toLocaleDateString('en-GB')}</p>
              </div>
            )) : (
              <p className="text-slate-500 text-sm">No recent notices.</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Mark Attendance', icon: Users,        color: 'from-emerald-500 to-teal-400',   path: '/teacher/attendance' },
          { label: 'Generate Paper',  icon: BrainCircuit, color: 'from-blue-500 to-cyan-400',      path: '/teacher/paper-generator' },
          { label: 'Marks Entry',     icon: BookOpen,     color: 'from-purple-500 to-violet-400',  path: '/teacher/assessments' },
          { label: 'My Schedule',     icon: Clock,        color: 'from-amber-500 to-orange-400',   path: '/teacher/classes' },
        ].map((a, i) => (
          <button key={i} onClick={() => router.push(a.path)}
            className="glass-card p-5 flex flex-col items-center gap-3 hover:-translate-y-1 transition-transform active:scale-95">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${a.color}`}>
              <a.icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-white text-sm font-medium">{a.label}</span>
          </button>
        ))}
      </div>
    </DashboardLayout>
  );
}
