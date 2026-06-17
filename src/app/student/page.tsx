"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { BrainCircuit, Star, Trophy, BookOpen, Flame, TrendingUp, Zap, Users } from 'lucide-react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useApiData } from '@/hooks/useApiData';
import { useAuth } from '@/context/AuthContext';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'];

const EMPTY = {
  stats: { totalStudents: 0, presentCount: 0, attPct: 0 },
  classDistribution: [],
  genderData: [],
  recentNotices: [],
};

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="h-full rounded-2xl border border-dashed border-slate-700/70 bg-slate-900/30 flex items-center justify-center text-center px-6">
      <div>
        <p className="text-white font-semibold mb-1">{title}</p>
        <p className="text-slate-400 text-sm">{description}</p>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data } = useApiData('/portal/dashboard', EMPTY);

  const stats = data?.stats || EMPTY.stats;
  const subjects = data?.classDistribution || EMPTY.classDistribution;
  const attendance = data?.genderData || EMPTY.genderData;
  const notices = data?.recentNotices || EMPTY.recentNotices;
  const hasLiveData = subjects.length > 0 || attendance.length > 0 || notices.length > 0 || stats.totalStudents > 0;

  const statCards = [
    { label: 'Students', value: stats.totalStudents, icon: Users, color: 'blue' },
    { label: 'Present Today', value: stats.presentCount, icon: BrainCircuit, color: 'emerald' },
    { label: 'Attendance', value: `${stats.attPct}%`, icon: TrendingUp, color: 'amber' },
    { label: 'Learning Rank', value: hasLiveData ? '#5' : '—', icon: Star, color: 'purple' },
  ];

  return (
    <DashboardLayout role="student" title="My Learning Zone">
      <div className="relative overflow-hidden rounded-3xl p-8 mb-8 border border-slate-700/60 bg-[#0b2747]">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-cyan-500/80" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-3xl font-semibold text-white mb-2">Hello, {user?.name || 'Scholar'}!</h2>
            <p className="text-blue-100 mb-6 max-w-xl">
              {hasLiveData
                ? 'Your AI learning assistant is ready. Keep your learning streak going!'
                : 'Live student data is not available yet. This area will populate automatically once backend records are present.'}
            </p>
            <div className="flex gap-4">
              <Link href="/student/quiz" className="bg-white text-blue-700 hover:bg-blue-50 font-semibold py-2.5 px-6 rounded-xl transition-colors shadow-lg">
                Start AI Quiz
              </Link>
              <Link href="/student/homework" className="bg-blue-700/40 hover:bg-blue-700/60 text-white font-semibold py-2.5 px-6 rounded-xl border border-white/20 transition-colors">
                My Homework
              </Link>
            </div>
          </div>
          <div className="flex gap-4 md:gap-6 text-center flex-wrap justify-center">
            {statCards.map((s, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20 min-w-[120px]">
                <div className={`w-10 h-10 mx-auto rounded-xl bg-${s.color}-500/20 flex items-center justify-center mb-2`}>
                  <s.icon className={`w-5 h-5 text-${s.color}-200`} />
                </div>
                <div className="text-white font-semibold text-xl">{s.value}</div>
                <div className="text-blue-200 text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Streak', value: hasLiveData ? '7 days' : '—', icon: Flame, color: 'amber' },
          { label: 'Top Subject', value: hasLiveData ? 'Live data pending' : 'No data yet', icon: Trophy, color: 'emerald' },
          { label: 'Quizzes Done', value: hasLiveData ? '12' : '0', icon: BrainCircuit, color: 'blue' },
          { label: 'AI Insights', value: hasLiveData ? 'Available' : 'Pending', icon: Zap, color: 'purple' },
        ].map((c, i) => (
          <div key={i} className={`glass-card p-5 border-t-4 border-${c.color}-500 hover:-translate-y-1 transition-transform`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 bg-${c.color}-500/20 rounded-lg`}>
                <c.icon className={`w-5 h-5 text-${c.color}-400`} />
              </div>
              <div>
                <p className="text-slate-400 text-xs">{c.label}</p>
                <h3 className="text-xl font-semibold text-white">{c.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Class Scores by Subject</h3>
          <div className="h-60">
            {subjects.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjects}>
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {subjects.map((_: any, idx: number) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                title="No subject scores yet"
                description="Live class performance will appear here once the backend provides student analytics."
              />
            )}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Today's Attendance Breakdown</h3>
          <div className="h-60">
            {attendance.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={attendance} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {attendance.map((_: any, idx: number) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                title="No attendance data yet"
                description="Attendance analytics will appear here when live records are available."
              />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">School Notices</h3>
          <div className="space-y-3">
            {notices.length ? notices.slice(0, 4).map((n: any, i: number) => (
              <div key={i} className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
                <p className="text-white text-sm font-medium">{n.title}</p>
                <p className="text-slate-400 text-xs mt-1">{n.issued_by} · {new Date(n.created_at).toLocaleDateString('en-GB')}</p>
              </div>
            )) : <p className="text-slate-500 text-sm">No live notices yet.</p>}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'AI Quiz', icon: BrainCircuit, path: '/student/quiz', color: 'from-blue-500 to-cyan-400' },
              { label: 'Homework', icon: BookOpen, path: '/student/homework', color: 'from-purple-500 to-violet-400' },
              { label: 'Skills', icon: Zap, path: '/student/skills', color: 'from-emerald-500 to-teal-400' },
              { label: 'AI Insights', icon: TrendingUp, path: '/student/ai-insights', color: 'from-amber-500 to-orange-400' },
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
    </DashboardLayout>
  );
}
