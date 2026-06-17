"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { BookOpen, Search, BookMarked, Users, Clock } from 'lucide-react';
import { useState } from 'react';

const books = [
  { id: 1, title: 'Mathematics Class 10',     author: 'Punjab Textbook Board', category: 'Textbook', copies: 45, available: 32, issued: 13 },
  { id: 2, title: 'Physics (English Medium)', author: 'Punjab Textbook Board', category: 'Textbook', copies: 38, available: 20, issued: 18 },
  { id: 3, title: 'Chemistry Part 1',         author: 'Punjab Textbook Board', category: 'Textbook', copies: 40, available: 28, issued: 12 },
  { id: 4, title: 'English Grammar & Comp.',  author: 'Oxford University Press', category: 'Reference', copies: 25, available: 19, issued: 6 },
  { id: 5, title: 'Urdu Literature Anthology',author: 'National Book Foundation', category: 'Literature', copies: 30, available: 22, issued: 8 },
  { id: 6, title: 'Pakistan Studies',         author: 'NCBA', category: 'Textbook', copies: 50, available: 38, issued: 12 },
  { id: 7, title: 'Islamiyat Elective',       author: 'Punjab Textbook Board', category: 'Textbook', copies: 42, available: 30, issued: 12 },
  { id: 8, title: 'Computer Science',         author: 'NISTE', category: 'Textbook', copies: 28, available: 16, issued: 12 },
];

export default function AdminLibrary() {
  const [search, setSearch] = useState('');

  const filtered = books.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase()) ||
    b.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalBooks   = books.reduce((s, b) => s + b.copies, 0);
  const totalIssued  = books.reduce((s, b) => s + b.issued, 0);
  const totalAvail   = books.reduce((s, b) => s + b.available, 0);

  return (
    <DashboardLayout role="admin" title="Library Management">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Books',     value: totalBooks,  icon: BookOpen,   color: 'from-amber-500 to-orange-400' },
          { label: 'Issued',          value: totalIssued, icon: Users,      color: 'from-red-500 to-rose-400' },
          { label: 'Available',       value: totalAvail,  icon: BookMarked, color: 'from-emerald-500 to-teal-400' },
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
          <input type="text" placeholder="Search books…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500" />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50 text-slate-400 text-left">
                <th className="p-4 font-medium">#</th>
                <th className="p-4 font-medium">Title</th>
                <th className="p-4 font-medium">Author</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Total Copies</th>
                <th className="p-4 font-medium">Availability</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((book, idx) => (
                <motion.tr key={book.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-slate-500">{idx + 1}</td>
                  <td className="p-4 text-white font-semibold">{book.title}</td>
                  <td className="p-4 text-slate-400 text-xs">{book.author}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20">{book.category}</span>
                  </td>
                  <td className="p-4 text-slate-300">{book.copies}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden max-w-[80px]">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                          style={{ width: `${Math.round((book.available / book.copies) * 100)}%` }} />
                      </div>
                      <span className="text-xs text-slate-300">{book.available} <span className="text-slate-500">/ {book.copies}</span></span>
                      {book.issued > 0 && (
                        <span className="flex items-center gap-1 text-xs text-rose-400">
                          <Clock className="w-3 h-3" />{book.issued} issued
                        </span>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No books found</p>
            </div>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
