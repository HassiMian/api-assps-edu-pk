"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { BookOpen, Users, GraduationCap, Search } from 'lucide-react';
import { useState } from 'react';

const classesData = [
  { id: 1, name: 'Nursery', sections: ['Blue', 'Red', 'Green'], students: 72, teacher: 'Mrs. Nadia Arif' },
  { id: 2, name: 'KG',      sections: ['Blue', 'Red', 'Green'], students: 68, teacher: 'Mrs. Sana Malik' },
  { id: 3, name: 'Class 1', sections: ['A', 'B'],               students: 85, teacher: 'Mr. Tariq Mehmood' },
  { id: 4, name: 'Class 2', sections: ['A', 'B'],               students: 90, teacher: 'Mrs. Farah Naz' },
  { id: 5, name: 'Class 3', sections: ['A', 'B'],               students: 88, teacher: 'Mr. Imran Khan' },
  { id: 6, name: 'Class 4', sections: ['A', 'B'],               students: 92, teacher: 'Mrs. Amna Baig' },
  { id: 7, name: 'Class 5', sections: ['A', 'B'],               students: 95, teacher: 'Mr. Asif Raza' },
  { id: 8, name: 'Class 6', sections: ['A', 'B'],               students: 98, teacher: 'Mrs. Hina Javed' },
  { id: 9, name: 'Class 7', sections: ['A', 'B'],               students: 94, teacher: 'Mr. Bilal Ahmad' },
  { id: 10, name: 'Class 8', sections: ['A', 'B'],              students: 89, teacher: 'Mrs. Rukhsana' },
  { id: 11, name: 'Class 9', sections: ['A', 'B'],              students: 96, teacher: 'Mr. Usman Ghani' },
  { id: 12, name: 'Class 10', sections: ['A', 'B'],             students: 78, teacher: 'Dr. Ayesha Khan' },
];

export default function AdminClasses() {
  const [search, setSearch] = useState('');

  const filtered = classesData.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.teacher.toLowerCase().includes(search.toLowerCase())
  );

  const totalStudents = classesData.reduce((s, c) => s + c.students, 0);
  const totalSections = classesData.reduce((s, c) => s + c.sections.length, 0);

  return (
    <DashboardLayout role="admin" title="Class Management">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Classes',   value: classesData.length, icon: BookOpen,      color: 'from-blue-500 to-cyan-400' },
          { label: 'Total Sections',  value: totalSections,      icon: GraduationCap, color: 'from-purple-500 to-violet-400' },
          { label: 'Total Students',  value: totalStudents,      icon: Users,         color: 'from-emerald-500 to-teal-400' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="glass-card p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-4 mb-6 items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search classes…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500" />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50 text-slate-400 text-left">
                <th className="p-4 font-medium">#</th>
                <th className="p-4 font-medium">Class Name</th>
                <th className="p-4 font-medium">Sections</th>
                <th className="p-4 font-medium">Students</th>
                <th className="p-4 font-medium">Class Teacher</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cls, idx) => (
                <motion.tr key={cls.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-slate-500">{idx + 1}</td>
                  <td className="p-4 text-white font-semibold">{cls.name}</td>
                  <td className="p-4">
                    <div className="flex gap-1 flex-wrap">
                      {cls.sections.map(s => (
                        <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" style={{ width: `${Math.min(100, cls.students)}%` }} />
                      </div>
                      <span className="text-slate-300 text-xs">{cls.students}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-300">{cls.teacher}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No classes found</p>
            </div>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
