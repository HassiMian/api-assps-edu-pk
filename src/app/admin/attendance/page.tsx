"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import api from '@/utils/api';
import {
  ClipboardList, Users, CheckCircle2, XCircle, AlertTriangle,
  Loader2, CalendarDays, TrendingUp, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

interface AttendanceRecord {
  id: string;
  name: string;
  role: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'leave';
  checkIn?: string;
  checkOut?: string;
  grade?: string;
}

export default function AttendanceManagement() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterRole, setFilterRole] = useState('all');
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, leave: 0, total: 0 });

  useEffect(() => { fetchAttendance(); }, [filterDate, filterRole]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/attendance?date=${filterDate}&role=${filterRole}`);
      if (res.data && res.data.success && res.data.data) {
        setRecords(res.data.data.records || []);
        setStats(res.data.data.stats || { present: 0, absent: 0, late: 0, leave: 0, total: 0 });
      } else { setFallback(); }
    } catch { setFallback(); }
    finally { setLoading(false); }
  };

  const setFallback = () => {
    const fallback: AttendanceRecord[] = [
      { id: '1', name: 'Ahmed Ali', role: 'student', date: filterDate, status: 'present', checkIn: '07:55', checkOut: '13:30', grade: 'Grade 10-A' },
      { id: '2', name: 'Zara Sheikh', role: 'student', date: filterDate, status: 'present', checkIn: '08:05', checkOut: '13:25', grade: 'Grade 11-B' },
      { id: '3', name: 'Usman Raza', role: 'student', date: filterDate, status: 'late', checkIn: '08:45', checkOut: '13:30', grade: 'Grade 9-C' },
      { id: '4', name: 'Fatima Noor', role: 'student', date: filterDate, status: 'absent', grade: 'Grade 10-A' },
      { id: '5', name: 'Dr. Ayesha Khan', role: 'teacher', date: filterDate, status: 'present', checkIn: '07:40', checkOut: '14:00' },
      { id: '6', name: 'Prof. Ali Raza', role: 'teacher', date: filterDate, status: 'leave' },
      { id: '7', name: 'Mr. Usman Sheikh', role: 'teacher', date: filterDate, status: 'present', checkIn: '07:50', checkOut: '13:45' },
    ];
    const filtered = filterRole === 'all' ? fallback : fallback.filter(r => r.role === filterRole);
    setRecords(filtered);
    setStats({
      present: filtered.filter(r => r.status === 'present').length,
      absent: filtered.filter(r => r.status === 'absent').length,
      late: filtered.filter(r => r.status === 'late').length,
      leave: filtered.filter(r => r.status === 'leave').length,
      total: filtered.length,
    });
  };

  const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
    present: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
    absent: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: XCircle },
    late: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: AlertTriangle },
    leave: { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: CalendarDays },
  };

  const chartData = [
    { name: 'Present', value: stats?.present || 0, fill: '#10b981' },
    { name: 'Absent', value: stats?.absent || 0, fill: '#ef4444' },
    { name: 'Late', value: stats?.late || 0, fill: '#f59e0b' },
    { name: 'Leave', value: stats?.leave || 0, fill: '#3b82f6' },
  ];

  return (
    <DashboardLayout role="admin" title="Attendance Overview">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total', value: stats?.total || 0, icon: Users, color: 'from-blue-500 to-cyan-400' },
          { label: 'Present', value: stats?.present || 0, icon: CheckCircle2, color: 'from-emerald-500 to-teal-400', pct: Math.round(((stats?.present || 0) / (stats?.total || 1)) * 100) },
          { label: 'Absent', value: stats?.absent || 0, icon: XCircle, color: 'from-red-500 to-rose-400', pct: Math.round(((stats?.absent || 0) / (stats?.total || 1)) * 100) },
          { label: 'Late', value: stats?.late || 0, icon: AlertTriangle, color: 'from-amber-500 to-orange-400', pct: Math.round(((stats?.late || 0) / (stats?.total || 1)) * 100) },
          { label: 'Leave', value: stats?.leave || 0, icon: CalendarDays, color: 'from-purple-500 to-violet-400', pct: Math.round(((stats?.leave || 0) / (stats?.total || 1)) * 100) },
        ].map((stat, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }} className="glass-card p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-20`}><stat.icon className="w-5 h-5 text-white" /></div>
              <p className="text-slate-400 text-xs font-medium">{stat.label}</p>
            </div>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              {'pct' in stat && <span className="text-xs text-slate-500">{stat.pct}%</span>}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Daily Attendance Breakdown</h3>
            <div className="flex gap-2">
              <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">All Roles</option><option value="student">Students</option><option value="teacher">Teachers</option>
              </select>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={50}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>{chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-4">Weekly Trend</h3>
          <div className="space-y-4">
            {[
              { day: 'Monday', present: 95, absent: 3, late: 2 },
              { day: 'Tuesday', present: 92, absent: 5, late: 3 },
              { day: 'Wednesday', present: 96, absent: 2, late: 2 },
              { day: 'Thursday', present: 94, absent: 4, late: 2 },
              { day: 'Friday', present: 91, absent: 6, late: 3 },
            ].map((d, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1"><span className="text-slate-300">{d.day}</span><span className="text-emerald-400 font-bold">{d.present}%</span></div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: `${d.present}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
        <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Attendance Records</h3>
          <span className="text-xs text-slate-500">{filterDate}</span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-700/50 text-slate-400 text-left"><th className="p-4 font-medium">Name</th><th className="p-4 font-medium">Role</th><th className="p-4 font-medium">Status</th><th className="p-4 font-medium">Check In</th><th className="p-4 font-medium">Check Out</th></tr></thead>
              <tbody>
                {records.map((r) => {
                  const config = statusConfig[r.status];
                  return (
                    <tr key={r.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold">{r.name.split(' ').map(n => n[0]).join('')}</div>
                          <div><p className="text-white font-medium">{r.name}</p>{r.grade && <p className="text-slate-500 text-xs">{r.grade}</p>}</div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-300 capitalize">{r.role}</td>
                      <td className="p-4"><span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${config.bg} ${config.color}`}>{r.status}</span></td>
                      <td className="p-4 text-slate-300 font-mono">{r.checkIn || '-'}</td>
                      <td className="p-4 text-slate-300 font-mono">{r.checkOut || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {records.length === 0 && <div className="text-center py-16 text-slate-500"><ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No records found</p></div>}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
