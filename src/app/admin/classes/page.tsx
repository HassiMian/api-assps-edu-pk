"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { BookOpen, Users, GraduationCap, Search, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import api from '@/utils/api';

type LiveClass = {
  name: string;
  sections: string[];
  students: number;
  teachers: string[];
};

export default function AdminClasses() {
  const [search, setSearch] = useState('');
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const [studentRes, staffRes, assignmentRes] = await Promise.all([
          api.get('/students?active=true'),
          api.get('/employees?active=true'),
          api.get('/portal/teacher-assignments').catch(() => ({ data: { data: [] } })),
        ]);
        if (cancelled) return;
        const students = Array.isArray(studentRes.data?.data) ? studentRes.data.data : [];
        const staff = Array.isArray(staffRes.data?.data) ? staffRes.data.data : [];
        const assignments = Array.isArray(assignmentRes.data?.data) ? assignmentRes.data.data : [];
        const teacherNameByUser = new Map<number, string>();
        staff.forEach((employee: any) => {
          if (employee.user_id) teacherNameByUser.set(Number(employee.user_id), String(employee.name || 'Teacher'));
        });

        const grouped = new Map<string, { sections: Set<string>; students: number }>();
        students.forEach((student: any) => {
          const className = String(student.class || '').trim();
          if (!className) return;
          if (!grouped.has(className)) grouped.set(className, { sections: new Set(), students: 0 });
          const row = grouped.get(className)!;
          row.students += 1;
          const section = String(student.section || '').trim();
          if (section) row.sections.add(section);
        });

        const live = [...grouped.entries()].map(([name, data]) => {
          const teachers = [...new Set(assignments
            .filter((a: any) => a.is_active !== false && String(a.class_name || '').trim().toLowerCase() === name.toLowerCase())
            .map((a: any) => teacherNameByUser.get(Number(a.teacher_user_id)))
            .filter(Boolean))] as string[];
          return { name, sections: [...data.sections].sort(), students: data.students, teachers };
        });
        live.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
        setClasses(live);
      } catch {
        if (!cancelled) {
          setClasses([]);
          setError('Live class roster could not be loaded. No sample classes are being shown.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return classes;
    return classes.filter(c => c.name.toLowerCase().includes(q) || c.teachers.some(t => t.toLowerCase().includes(q)));
  }, [classes, search]);

  const totalStudents = classes.reduce((sum, c) => sum + c.students, 0);
  const totalSections = classes.reduce((sum, c) => sum + Math.max(1, c.sections.length), 0);

  return (
    <DashboardLayout role="admin" title="Class Management">
      {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Classes', value: classes.length, icon: BookOpen, color: 'from-blue-500 to-cyan-400' },
          { label: 'Total Sections', value: totalSections, icon: GraduationCap, color: 'from-purple-500 to-violet-400' },
          { label: 'Total Students', value: totalStudents, icon: Users, color: 'from-emerald-500 to-teal-400' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-card p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}><stat.icon className="w-6 h-6 text-white" /></div>
            <div><p className="text-slate-400 text-xs font-medium">{stat.label}</p><p className="text-2xl font-bold text-white">{stat.value}</p></div>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-4 mb-6 items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search live classes…" value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500" />
        </div>
        {loading && <span className="flex items-center gap-2 text-sm text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /> Loading live roster</span>}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-700/50 text-slate-400 text-left"><th className="p-4 font-medium">#</th><th className="p-4 font-medium">Class Name</th><th className="p-4 font-medium">Sections</th><th className="p-4 font-medium">Students</th><th className="p-4 font-medium">Assigned Teachers</th></tr></thead>
            <tbody>
              {filtered.map((cls, idx) => (
                <tr key={cls.name} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-slate-500">{idx + 1}</td>
                  <td className="p-4 text-white font-semibold">{cls.name}</td>
                  <td className="p-4"><div className="flex gap-1 flex-wrap">{cls.sections.length ? cls.sections.map(section => <span key={section} className="px-2 py-0.5 rounded-full text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">{section}</span>) : <span className="text-slate-500">No section</span>}</div></td>
                  <td className="p-4 text-slate-300">{cls.students}</td>
                  <td className="p-4 text-slate-300">{cls.teachers.length ? cls.teachers.join(', ') : <span className="text-amber-400">Unassigned</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && <div className="text-center py-16 text-slate-500"><BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No live classes found</p></div>}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
