"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import {
  Users, GraduationCap, DollarSign, Activity, BrainCircuit,
  TrendingUp, AlertTriangle, Zap, ArrowUpRight, ArrowDownRight,
  School, Bus, Library, Shield, Calendar
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, AreaChart, Area, LineChart, Line, CartesianGrid
} from 'recharts';
import api from '@/utils/api';
import Link from 'next/link';
import SchoolHero from '@/components/SchoolHero';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
const GLOW_COLORS = ['shadow-blue-500/30', 'shadow-purple-500/30', 'shadow-emerald-500/30', 'shadow-amber-500/30'];

const moduleIconMap: Record<string, typeof Users> = {
  teachers: GraduationCap,
  employees: GraduationCap,
  students: Users,
  admissions: School,
  parents: Shield,
  attendance: Activity,
  fees: DollarSign,
  finance: DollarSign,
  events: Calendar,
  library: Library,
  transport: Bus,
  analytics: BrainCircuit,
  reports: BrainCircuit,
};

function numeric(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function safeArray<T = any>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

function resolveModuleIcon(name: unknown, path: unknown) {
  const key = `${String(name || '')} ${String(path || '')}`.toLowerCase();
  const match = Object.entries(moduleIconMap).find(([needle]) => key.includes(needle));
  return match?.[1] || Zap;
}

type UpcomingEvent = {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  color: string;
  source: 'calendar' | 'admin';
  estimated?: boolean;
};

const eidUlAdhaSchedule = [
  { date: '2026-05-27', description: 'Estimated Eid ul Adha holiday window' },
  { date: '2027-05-17', description: 'Estimated Eid ul Adha holiday window' },
  { date: '2028-05-06', description: 'Estimated Eid ul Adha holiday window' },
];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatAdminEventDate(date: string) {
  return new Date(date).toLocaleDateString('en-PK', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
}

function daysUntil(date: string) {
  const diff = Math.ceil((startOfDay(new Date(date)).getTime() - startOfDay(new Date()).getTime()) / 86400000);
  if (diff < 0) return 'Past';
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return `In ${diff} days`;
}

function getNthWeekdayOfMonth(year: number, monthIndex: number, weekday: number, nth: number) {
  const firstDay = new Date(year, monthIndex, 1);
  const offset = (7 + weekday - firstDay.getDay()) % 7;
  return new Date(year, monthIndex, 1 + offset + (nth - 1) * 7);
}

function nextAnnualDate(monthIndex: number, day: number, now: Date) {
  const candidate = new Date(now.getFullYear(), monthIndex, day);
  if (candidate < startOfDay(now)) candidate.setFullYear(candidate.getFullYear() + 1);
  return candidate;
}

function nextScheduledEvent(schedule: { date: string; description: string }[], now: Date) {
  const today = startOfDay(now).getTime();
  return schedule
    .map((item) => ({ ...item, time: startOfDay(new Date(`${item.date}T00:00:00`)).getTime() }))
    .find((item) => item.time >= today);
}

function getCalendarHighlights(now: Date): UpcomingEvent[] {
  const teachersDay = nextAnnualDate(9, 5, now);
  const allamaIqbalDay = nextAnnualDate(10, 9, now);
  const quaidDay = nextAnnualDate(11, 25, now);
  const mothersDayThisYear = getNthWeekdayOfMonth(now.getFullYear(), 4, 0, 2);
  const mothersDay = mothersDayThisYear >= startOfDay(now)
    ? mothersDayThisYear
    : getNthWeekdayOfMonth(now.getFullYear() + 1, 4, 0, 2);
  const eidUlAdhaEstimate = nextScheduledEvent(eidUlAdhaSchedule, now);

  return [
    eidUlAdhaEstimate ? {
      id: 'calendar-eid-ul-adha',
      title: 'Eid ul Adha',
      description: eidUlAdhaEstimate.description,
      event_date: new Date(`${eidUlAdhaEstimate.date}T00:00:00`).toISOString(),
      color: '#f59e0b',
      source: 'calendar',
      estimated: true,
    } : null,
    {
      id: 'calendar-teachers-day',
      title: "Teacher's Day",
      description: 'Teachers appreciation celebration',
      event_date: teachersDay.toISOString(),
      color: '#8b5cf6',
      source: 'calendar',
    },
    {
      id: 'calendar-allama-iqbal-day',
      title: 'Allama Iqbal Day',
      description: 'National remembrance day',
      event_date: allamaIqbalDay.toISOString(),
      color: '#06b6d4',
      source: 'calendar',
    },
    {
      id: 'calendar-quaid-day',
      title: 'Quaid-e-Azam Day',
      description: 'Founder of Pakistan remembrance',
      event_date: quaidDay.toISOString(),
      color: '#10b981',
      source: 'calendar',
    },
    {
      id: 'calendar-mothers-day',
      title: "Mother's Day",
      description: 'Special tribute and card activity',
      event_date: mothersDay.toISOString(),
      color: '#ec4899',
      source: 'calendar',
    },
  ].filter(Boolean) as UpcomingEvent[];
}

function mergeUpcomingEvents(now: Date, adminEvents: UpcomingEvent[]) {
  const today = startOfDay(now).getTime();
  const eid2026Actual = startOfDay(new Date('2026-05-27T00:00:00')).getTime();
  const merged = [...adminEvents, ...getCalendarHighlights(now)]
    .filter((event) => {
      const eventDate = startOfDay(new Date(event.event_date));
      const isOldEidEstimate = event.title.toLowerCase().includes('eid ul adha')
        && eventDate.getFullYear() === 2026
        && today > eid2026Actual;
      return !isOldEidEstimate && eventDate.getTime() >= today;
    })
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

  const seen = new Set<string>();
  return merged.filter((event) => {
    const key = `${event.title.toLowerCase()}|${startOfDay(new Date(event.event_date)).toISOString()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 5); // Limit to top 5 upcoming events for the vertical feed
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [error, setError] = useState("");
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [schoolName, setSchoolName] = useState('Al Siddique Scholars Public School');
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const publicParams = user?.school_code
      ? { school_code: user.school_code }
      : user?.school_id
        ? { school_id: user.school_id }
        : undefined;

    api.get('/settings/public', { params: publicParams })
      .then((res) => {
        const data = res.data?.data || {};
        if (data.school_name) setSchoolName(data.school_name);
        if (data.school_logo) setSchoolLogo(data.school_logo);
      })
      .catch(() => {});
  }, [user?.school_code, user?.school_id]);

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchDashboardData = useCallback(async () => {
    let settled = false;
    const safetyTimer = window.setTimeout(() => {
      if (settled) return;
      setLoadingTimedOut(true);
      setError("Live dashboard is taking too long. Showing safe fallback view.");
      setDashboardData((prev: any) => prev || {
        stats: {
          totalStudents: 0,
          totalTeachers: 0,
          monthlyRevenue: 0,
          attendanceRate: 0,
          present: 0,
          absent: 0,
          leave: 0,
          late: 0,
          attendanceTotal: 0,
        },
        quickModules: [],
        recentActivities: [],
        revenueData: [],
        gradeDistribution: [],
        performanceTrend: [],
        departmentStats: [],
      });
    }, 12000);

    try {
      const [statsRes, attendanceRes] = await Promise.all([
        api.get('/dashboard/stats'),
        fetch('/api/dashboard/attendance-summary', { credentials: 'include' }).catch(() => null),
      ]);
      if (statsRes.data.success) {
        const beData = statsRes.data.data;
        const attendanceJson = attendanceRes ? await attendanceRes.json().catch(() => null) : null;
        const attendanceData = attendanceJson?.success ? attendanceJson.data : null;
        const attendanceStats = {
          present: numeric(attendanceData?.present),
          absent: numeric(attendanceData?.absent),
          late: numeric(attendanceData?.late),
          leave: numeric(attendanceData?.leave),
          attendanceTotal: numeric(attendanceData?.attendanceTotal),
          attendanceRate: numeric(attendanceData?.attendanceRate ?? beData.stats?.attendanceRate),
        };
        
        
        

        setDashboardData({
          ...beData,
          stats: {
            totalStudents: numeric(beData.stats?.totalStudents),
            totalTeachers: numeric(beData.stats?.totalTeachers),
            monthlyRevenue: numeric(beData.stats?.monthlyRevenue),
            attendanceRate: attendanceStats.attendanceRate,
            present: attendanceStats.present,
            absent: attendanceStats.absent,
            leave: attendanceStats.leave,
            late: attendanceStats.late,
            attendanceTotal: attendanceStats.attendanceTotal,
          },
          quickModules: safeArray(beData.quickModules).map((mod: any) => ({
            ...mod,
            icon: resolveModuleIcon(mod?.name, mod?.path),
            count: numeric(mod?.count),
            path: mod?.path === '/admin/teachers' ? '/admin/employees' : mod?.path || '/admin',
            color: mod?.color || 'from-blue-500 to-cyan-500',
            glow: mod?.glow || 'shadow-blue-500/25',
          })),
          recentActivities: safeArray(beData.recentActivities).map((activity: any, index: number) => ({
            ...activity,
            id: activity?.id || `activity-${index}`,
            icon: typeof activity?.icon === 'function' ? activity.icon : Activity,
            bg: activity?.bg || 'bg-blue-500/10',
            color: activity?.color || 'text-blue-400',
            message: activity?.message || 'System activity recorded',
            time: activity?.time || 'Just now',
          })),
          revenueData: safeArray(beData.revenueData),
          gradeDistribution: safeArray(beData.gradeDistribution),
          performanceTrend: safeArray(beData.performanceTrend),
          departmentStats: safeArray(beData.departmentStats),
        });
      } else {
        setError("Dashboard data unavailable. Showing safe view.");
        // Set fallback immediately — the finally block will not set data if we don't do it here
        setDashboardData((prev: any) => prev || {
          stats: { totalStudents: 0, totalTeachers: 0, monthlyRevenue: 0, attendanceRate: 0, present: 0, absent: 0, leave: 0, late: 0, attendanceTotal: 0 },
          quickModules: [], recentActivities: [], revenueData: [], gradeDistribution: [], performanceTrend: [], departmentStats: [],
        });
      }
    } catch (err) {
      setError("Backend disconnected. Showing safe fallback view.");
      setDashboardData((prev: any) => prev || {
        stats: { totalStudents: 0, totalTeachers: 0, monthlyRevenue: 0, attendanceRate: 0, present: 0, absent: 0, leave: 0, late: 0, attendanceTotal: 0 },
        quickModules: [], recentActivities: [], revenueData: [], gradeDistribution: [], performanceTrend: [], departmentStats: [],
      });
    } finally {
      settled = true;
      window.clearTimeout(safetyTimer);
      // Nuclear fallback — guarantee spinner never hangs regardless of any code path above
      setDashboardData((prev: any) => prev || {
        stats: { totalStudents: 0, totalTeachers: 0, monthlyRevenue: 0, attendanceRate: 0, present: 0, absent: 0, leave: 0, late: 0, attendanceTotal: 0 },
        quickModules: [], recentActivities: [], revenueData: [], gradeDistribution: [], performanceTrend: [], departmentStats: [],
      });
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  async function fetchUpcomingEvents() {
    try {
      const res = await api.get('/events');
      if (res.data.success && Array.isArray(res.data.data)) {
        const normalized: UpcomingEvent[] = res.data.data.map((event: any) => ({
          id: String(event.id),
          title: event.title,
          description: event.description || '',
          event_date: event.event_date,
          color: event.color || '#C8991A',
          source: 'admin',
        }));
        setUpcomingEvents(normalized);
        return;
      }
    } catch {
      // keep recurring calendar highlights only
    }
    setUpcomingEvents([]);
  }

  
  // Keep spinner inside DashboardLayout so the auth guard and layout always render
  if (!dashboardData) {
    return (
      <DashboardLayout role="admin" title="Admin Control Center">
        <div className="flex h-full items-center justify-center text-white min-h-[60vh]">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500" />
            <p className="mt-3 text-sm text-slate-300">Loading admin dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  const data = dashboardData;
  const upcomingFeed = mergeUpcomingEvents(now, upcomingEvents);
  const stats = [
    { title: "Total Students", value: numeric(data.stats.totalStudents).toLocaleString(), change: "+5.2%", up: true, icon: Users, color: "from-blue-500 to-cyan-400", border: "border-blue-500/30" },
    { title: "Active Teachers", value: numeric(data.stats.totalTeachers).toString(), change: "+2.1%", up: true, icon: GraduationCap, color: "from-purple-500 to-violet-400", border: "border-purple-500/30" },
    { title: "Monthly Revenue", value: `Rs ${numeric(data.stats.monthlyRevenue).toLocaleString()}`, change: "+8.4%", up: true, icon: DollarSign, color: "from-emerald-500 to-teal-400", border: "border-emerald-500/30" },
    { title: "Attendance Rate", value: `${numeric(data.stats.attendanceRate)}%`, change: `${numeric(data.stats.present)} present • ${numeric(data.stats.absent)} absent • ${numeric(data.stats.leave)} leave • ${numeric(data.stats.late)} late`, up: true, icon: Activity, color: "from-amber-500 to-orange-400", border: "border-amber-500/30" },
  ];

  return (
    <DashboardLayout role="admin" title="Admin Control Center">
      <div className="mb-6">
        <SchoolHero schoolName={schoolName} schoolLogo={schoolLogo} compact={false} />
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </motion.div>
      )}
      {loadingTimedOut && (
        <div className="mb-6 rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-4 text-xs text-cyan-100">
          Emergency fallback is active so the page does not stay stuck on an infinite loader.
        </div>
      )}

      {/* 3D Immersive Stat Cards (Moved to top) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" style={{ perspective: '1000px' }}>
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30, rotateX: 15 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: idx * 0.1, type: 'spring', stiffness: 100 }}
            whileHover={{ y: -8, rotateX: -5, scale: 1.02 }}
            className={`relative overflow-hidden rounded-2xl border ${stat.border} bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl p-6 shadow-xl ${GLOW_COLORS[idx]} transition-all duration-300`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10 shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${stat.up ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </div>
              </div>
              <p className="text-slate-400 text-sm font-medium">{stat.title}</p>
              <h3 className="text-3xl font-bold text-white mt-1 tracking-tight">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Module Access */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8"
      >
        <h3 className="text-xl font-bold text-white mb-6">Quick Module Access</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {data.quickModules.map((mod: any, idx: number) => (
            <Link key={idx} href={mod.path}>
              <motion.div
                whileHover={{ y: -6, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`relative overflow-hidden rounded-2xl p-5 border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-md shadow-lg ${mod.glow} hover:shadow-xl transition-all duration-300`}
              >
                <mod.icon className={`w-8 h-8 mb-3 bg-gradient-to-br ${mod.color} bg-clip-text text-white`} style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.2))' }} />
                <p className="text-white font-bold text-lg">{mod.count}</p>
                <p className="text-slate-400 text-xs font-medium mt-1">{mod.name}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* 3-Panel Bottom View: Live Activity | Upcoming Events | AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        
        {/* Panel 1: Live Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Live Activity Feed</h3>
            <span className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span> Live
            </span>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {data.recentActivities.map((activity: any) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/40 hover:bg-slate-800/50 hover:border-slate-600/50 transition-all cursor-pointer group"
              >
                <div className={`p-3 rounded-xl ${activity.bg} ${activity.color} group-hover:scale-110 transition-transform`}>
                  <activity.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{activity.message}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Panel 2: Upcoming Events (Vertical) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Upcoming Events</h3>
            <span className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full">
              <Calendar className="w-3 h-3" /> Calendar
            </span>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {upcomingFeed.length > 0 ? (
              upcomingFeed.map((event, idx) => {
                const date = new Date(event.event_date);
                const badge = daysUntil(event.event_date);
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/40 hover:bg-slate-800/50 hover:border-slate-600/50 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: event.color }} />
                    <div className="shrink-0 text-center pl-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {date.toLocaleDateString('en-GB', { month: 'short' })}
                      </p>
                      <p className="text-xl font-black leading-none text-white mt-0.5">{date.getDate()}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-bold truncate">{event.title}</p>
                      <p className="text-slate-400 text-xs truncate mt-0.5">{event.description || badge}</p>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                No upcoming events.
              </div>
            )}
          </div>
        </motion.div>

        {/* Panel 3: AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6 relative overflow-hidden border-cyan-500/20"
        >
          <div className="flex items-center gap-2 mb-6">
            <BrainCircuit className="w-6 h-6 text-cyan-400" />
            <h3 className="text-xl font-bold text-white">AI Insights</h3>
          </div>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {[
              { label: 'At-Risk Students', value: 23, color: 'text-rose-400', bg: 'bg-rose-500/10', desc: 'Need immediate attention' },
              { label: 'Top Performers', value: 156, color: 'text-emerald-400', bg: 'bg-emerald-500/10', desc: 'Above 90% average' },
              { label: 'Fee Defaulters', value: 12, color: 'text-amber-400', bg: 'bg-amber-500/10', desc: 'Pending > 30 days' },
            ].map((insight, idx) => (
              <div key={idx} className={`p-4 rounded-xl ${insight.bg} border border-slate-700/40`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-300 text-sm font-medium">{insight.label}</span>
                  <span className={`text-2xl font-bold ${insight.color}`}>{insight.value}</span>
                </div>
                <p className="text-slate-500 text-xs">{insight.desc}</p>
              </div>
            ))}
          </div>
          <Link href="/admin/ai-analytics" className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-bold hover:shadow-lg hover:shadow-cyan-500/25 transition-all text-center block">
            View Full AI Report
          </Link>
        </motion.div>
      </div>

      {/* 4-Panel Advanced Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Panel 1: Revenue vs Expense - Column/Bar Chart */}
        <motion.div
          initial={{ opacity: 0, x: -40, rotateY: 10 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 80 }}
          whileHover={{ scale: 1.01 }}
          className="glass-card p-6 relative overflow-hidden"
          style={{ perspective: '1000px' }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">Financial Overview</h3>
              <p className="text-slate-400 text-sm">Revenue vs Expense (6 months)</p>
            </div>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-xs text-emerald-400"><div className="w-2 h-2 rounded-full bg-emerald-400"></div> Profit</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.revenueData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `Rs ${v / 1000}k`} />
                <Tooltip
                  cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', boxShadow: '0 0 20px rgba(59,130,246,0.15)' }}
                  formatter={(value: any) => [`Rs ${Number(value).toLocaleString()}`, '']}
                />
                <Legend wrapperStyle={{ paddingTop: '1rem' }} />
                <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40} />
                <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={40} />
                <Bar dataKey="profit" name="Profit" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Panel 2: Student Grade Distribution - Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: 40, rotateY: -10 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ delay: 0.7, type: 'spring', stiffness: 80 }}
          whileHover={{ scale: 1.01 }}
          className="glass-card p-6 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">Student Distribution</h3>
              <p className="text-slate-400 text-sm">By grade level across all sections</p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.gradeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {data.gradeDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', boxShadow: '0 0 20px rgba(139,92,246,0.15)' }}
                  formatter={(value: any, name: any) => [`${value} students`, name]}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '1rem' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Panel 3: Performance Trend - Area/Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.01 }}
          className="glass-card p-6 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">Academic Performance Trend</h3>
              <p className="text-slate-400 text-sm">Average scores vs AI targets</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.performanceTrend}>
                <defs>
                  <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[60, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', boxShadow: '0 0 20px rgba(16,185,129,0.15)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '1rem' }} />
                <Area type="monotone" dataKey="avgScore" name="Avg Score" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAvg)" />
                <Area type="monotone" dataKey="target" name="AI Target" stroke="#10b981" strokeWidth={2} strokeDasharray="6 4" fillOpacity={1} fill="url(#colorTarget)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Panel 4: Department Stats - Mixed Chart */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          whileHover={{ scale: 1.01 }}
          className="glass-card p-6 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">Department Analytics</h3>
              <p className="text-slate-400 text-sm">Students & Teachers per department</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.departmentStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', boxShadow: '0 0 20px rgba(245,158,11,0.15)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '1rem' }} />
                <Line type="monotone" dataKey="students" name="Students" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 5 }} activeDot={{ r: 7, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }} />
                <Line type="monotone" dataKey="teachers" name="Teachers" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 5 }} activeDot={{ r: 7, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

    </DashboardLayout>
  );
}
