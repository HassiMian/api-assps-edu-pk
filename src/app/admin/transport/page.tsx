"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { Bus, MapPin, Users, CheckCircle2, AlertTriangle, Search } from 'lucide-react';
import { useState } from 'react';

const routes = [
  { id: 1, name: 'Route 1 — Rayya Khas',    driver: 'Muhammad Arif',  vehicle: 'Suzuki Bolan — AJK-001', students: 28, status: 'active',  stops: ['Main Gate', 'Sharif Chowk', 'Rayya Khas'] },
  { id: 2, name: 'Route 2 — Narowal City',   driver: 'Tariq Mahmood',  vehicle: 'Hiace — LHR-445',        students: 32, status: 'active',  stops: ['Main Gate', 'Clock Tower', 'Narowal City'] },
  { id: 3, name: 'Route 3 — Zafarwal Road',  driver: 'Imran Haider',   vehicle: 'Coaster — GRW-221',      students: 25, status: 'delayed', stops: ['Main Gate', 'Zafarwal Chowk', 'Faizpur'] },
  { id: 4, name: 'Route 4 — Shakargarh',     driver: 'Allah Ditta',    vehicle: 'Hiace — LHR-882',        students: 30, status: 'active',  stops: ['Main Gate', 'Shakargarh', 'Chowk Mela Ram'] },
  { id: 5, name: 'Route 5 — Jassar Town',    driver: 'Ghulam Rasool',  vehicle: 'Suzuki Bolan — RWP-112', students: 18, status: 'active',  stops: ['Main Gate', 'Jassar', 'Civil Hospital'] },
];

const statusStyle: Record<string, string> = {
  active:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  delayed: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  off:     'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

export default function AdminTransport() {
  const [search, setSearch] = useState('');

  const filtered = routes.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.driver.toLowerCase().includes(search.toLowerCase())
  );

  const totalStudents = routes.reduce((s, r) => s + r.students, 0);
  const delayed       = routes.filter(r => r.status === 'delayed').length;

  return (
    <DashboardLayout role="admin" title="Transport Management">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Routes',     value: routes.length,  icon: Bus,           color: 'from-cyan-500 to-sky-400' },
          { label: 'Students on Bus',  value: totalStudents,  icon: Users,         color: 'from-blue-500 to-cyan-400' },
          { label: 'Delayed Routes',   value: delayed,        icon: AlertTriangle, color: delayed > 0 ? 'from-amber-500 to-orange-400' : 'from-emerald-500 to-teal-400' },
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

      <div className="relative w-72 mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Search routes or drivers…" value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((route, i) => (
          <motion.div key={route.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass-card p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-white font-bold">{route.name}</h3>
                <p className="text-slate-400 text-xs mt-0.5">{route.vehicle}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${statusStyle[route.status]}`}>
                {route.status === 'active' ? <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Active</span> : <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Delayed</span>}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
              <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {route.students} students</span>
              <span className="flex items-center gap-1"><Bus className="w-4 h-4" /> {route.driver}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {route.stops.map((stop, si) => (
                <span key={si} className="flex items-center gap-1 text-xs text-slate-400">
                  {si > 0 && <span className="text-slate-600">→</span>}
                  <MapPin className="w-3 h-3 text-blue-400" />{stop}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <Bus className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No routes found</p>
        </div>
      )}
    </DashboardLayout>
  );
}
