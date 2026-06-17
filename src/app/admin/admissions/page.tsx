"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import api from '@/utils/api';
import {
  UserPlus, Search, CheckCircle2, XCircle, Clock, Loader2,
  RefreshCw, Phone, Calendar, GraduationCap, ChevronDown
} from 'lucide-react';

interface AdmissionApplication {
  id: number;
  student_name: string;
  father_name: string;
  mother_name: string;
  class_applying: string;
  date_of_birth: string | null;
  gender: string;
  parent_phone: string;
  whatsapp_number: string;
  address: string;
  previous_school: string;
  remarks: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
  approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function AdmissionsPage() {
  const [applications, setApplications] = useState<AdmissionApplication[]>([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState<string>('pending');
  const [search, setSearch]             = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast]               = useState<{ msg: string; ok: boolean } | null>(null);
  const [expandedId, setExpandedId]     = useState<number | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchApplications = useCallback(async (status = filter) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/admissions${status !== 'all' ? `?status=${status}` : ''}`);
      if (res.data.success) setApplications(res.data.data);
      else setApplications([]);
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchApplications(); }, []);

  const handleFilterChange = (f: string) => {
    setFilter(f);
    fetchApplications(f);
  };

  const approveAndEnroll = async (id: number) => {
    setActionLoading(`${id}_approve`);
    try {
      const res = await api.post(`/admin/admissions/${id}/approve`);
      showToast(res.data.message || `Student enrolled - GR: ${res.data.student?.gr_number || 'assigned'}`, true);
      fetchApplications();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Approval failed', false);
    } finally {
      setActionLoading(null);
    }
  };

  const rejectApplication = async (id: number) => {
    setActionLoading(`${id}_reject`);
    try {
      await api.put(`/admin/admissions/${id}/status`, { status: 'rejected' });
      showToast('Application rejected.', true);
      fetchApplications();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Rejection failed', false);
    } finally {
      setActionLoading(null);
    }
  };

  const restoreApplication = async (id: number) => {
    setActionLoading(`${id}_restore`);
    try {
      await api.put(`/admin/admissions/${id}/status`, { status: 'pending' });
      fetchApplications();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Restore failed', false);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = applications.filter(a =>
    a.student_name.toLowerCase().includes(search.toLowerCase()) ||
    a.parent_phone.includes(search) ||
    a.class_applying.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    pending:  applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  return (
    <DashboardLayout role="admin" title="Website Admissions">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Pending Review', value: counts.pending,  icon: Clock,        color: 'from-amber-500 to-yellow-400' },
          { label: 'Approved',       value: counts.approved, icon: CheckCircle2, color: 'from-emerald-500 to-teal-400' },
          { label: 'Rejected',       value: counts.rejected, icon: XCircle,      color: 'from-red-500 to-rose-400' },
        ].map((stat, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
            className="glass-card p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-20`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
        <div className="flex gap-2">
          {(['pending', 'approved', 'rejected', 'all'] as const).map(f => (
            <button key={f} onClick={() => handleFilterChange(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
                filter === f
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}>
              {f}
            </button>
          ))}
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search by name, phone, class..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500" />
          </div>
          <button onClick={() => fetchApplications()} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm hover:bg-slate-800 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`mb-4 px-5 py-3 rounded-xl text-sm font-semibold ${toast.ok ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No {filter !== 'all' ? filter : ''} applications found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {filtered.map((app) => {
              const isExpanded = expandedId === app.id;
              const isActing = actionLoading?.startsWith(String(app.id));
              return (
                <div key={app.id}>
                  {/* Main row */}
                  <div className="flex items-center gap-4 p-4 hover:bg-slate-800/30 transition-colors">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {app.student_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold truncate">{app.student_name}</p>
                      <p className="text-slate-500 text-xs">{app.father_name || '—'} • {app.class_applying}</p>
                    </div>

                    {/* Phone */}
                    <div className="hidden md:flex items-center gap-1 text-slate-400 text-xs">
                      <Phone className="w-3 h-3" /> {app.parent_phone}
                    </div>

                    {/* Date */}
                    <div className="hidden lg:flex items-center gap-1 text-slate-500 text-xs">
                      <Calendar className="w-3 h-3" />
                      {new Date(app.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>

                    {/* Status badge */}
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${STATUS_STYLES[app.status]}`}>
                      {app.status}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {app.status === 'pending' && (
                        <>
                          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            disabled={!!isActing} onClick={() => approveAndEnroll(app.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/20 transition-colors disabled:opacity-50">
                            {actionLoading === `${app.id}_approve` ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                            Approve & Enroll
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            disabled={!!isActing} onClick={() => rejectApplication(app.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold hover:bg-red-500/20 transition-colors disabled:opacity-50">
                            {actionLoading === `${app.id}_reject` ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                            Reject
                          </motion.button>
                        </>
                      )}
                      {app.status === 'rejected' && (
                        <button disabled={!!isActing} onClick={() => restoreApplication(app.id)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold hover:bg-amber-500/20 transition-colors disabled:opacity-50">
                          {actionLoading === `${app.id}_restore` ? '...' : 'Restore'}
                        </button>
                      )}
                      {app.status === 'approved' && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <GraduationCap className="w-3 h-3" /> Enrolled
                        </span>
                      )}
                      {/* Expand toggle */}
                      <button onClick={() => setExpandedId(isExpanded ? null : app.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-500 hover:text-slate-300 transition-colors">
                        <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-slate-800/20 border-t border-slate-800/50">
                        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {[
                            { label: 'Mother Name',     value: app.mother_name || '—' },
                            { label: 'Gender',           value: app.gender || '—' },
                            { label: 'Date of Birth',    value: app.date_of_birth ? new Date(app.date_of_birth).toLocaleDateString('en-GB') : '—' },
                            { label: 'WhatsApp',         value: app.whatsapp_number || '—' },
                            { label: 'Previous School',  value: app.previous_school || '—' },
                            { label: 'Address',          value: app.address || '—' },
                            { label: 'Remarks',          value: app.remarks || '—' },
                          ].map(({ label, value }) => (
                            <div key={label}>
                              <p className="text-slate-500 text-xs mb-0.5">{label}</p>
                              <p className="text-slate-300 font-medium">{value}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
