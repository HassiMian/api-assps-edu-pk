"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import api from '@/utils/api';
import {
  GraduationCap, Search, Plus, X, Edit2, Trash2, Mail, Phone,
  BookOpen, AlertTriangle, CheckCircle2, Loader2, Filter, Download
} from 'lucide-react';

interface Teacher {
  id: string;
  user_id?: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  designation: string;
  status: 'active' | 'inactive' | 'on_leave';
  joinDate: string;
  salary: number;
  classes: string[];
}

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState<Partial<Teacher>>({});
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [newTeacherLogin, setNewTeacherLogin] = useState<{loginId: string; temporaryPassword: string} | null>(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const normalizeTeacher = (employee: any, assignments: any[] = []): Teacher => ({
    id: String(employee.id),
    user_id: employee.user_id ? Number(employee.user_id) : undefined,
    name: String(employee.name || ''),
    email: String(employee.email || ''),
    phone: String(employee.phone || ''),
    subject: String(employee.subject || ''),
    designation: String(employee.designation || 'Teacher'),
    status: employee.is_active === false ? 'inactive' : 'active',
    joinDate: String(employee.join_date || employee.created_at || '').slice(0, 10),
    salary: Number(employee.salary || 0),
    classes: assignments
      .filter((a: any) => Number(a.teacher_user_id) === Number(employee.user_id) && a.is_active !== false)
      .map((a: any) => `Class ${a.class_name}${a.section ? `-${a.section}` : ''}${a.subject ? ` · ${a.subject}` : ''}`),
  });

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError('');
      const [staffRes, assignmentRes] = await Promise.all([
        api.get('/employees?active=true'),
        api.get('/portal/teacher-assignments').catch(() => ({ data: { data: [] } })),
      ]);
      const staff = Array.isArray(staffRes.data?.data) ? staffRes.data.data : [];
      const assignments = Array.isArray(assignmentRes.data?.data) ? assignmentRes.data.data : [];
      const teacherRows = staff.filter((employee: any) =>
        String(employee.portal_role || '').toLowerCase() === 'teacher' ||
        String(employee.designation || '').toLowerCase().includes('teacher') ||
        assignments.some((a: any) => Number(a.teacher_user_id) === Number(employee.user_id))
      );
      setTeachers(teacherRows.map((row: any) => normalizeTeacher(row, assignments)));
    } catch {
      setTeachers([]);
      setError('Live teacher records could not be loaded. No sample data is being shown.');
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
                          t.email.toLowerCase().includes(search.toLowerCase()) ||
                          t.subject.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === 'all' || t.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleSave = async () => {
    if (!formData.name || !formData.email) return;
    try {
      setSaving(true);
      if (editingTeacher) {
        const res = await api.put(`/employees/${editingTeacher.id}`, { ...formData, is_active: formData.status !== 'inactive', portal_role: 'teacher', portal_active: true });
        if (res.data.success) {
          setTeachers(prev => prev.map(t => t.id === editingTeacher.id ? { ...t, ...formData } as Teacher : t));
        }
      } else {
        const res = await api.post('/employees', { ...formData, designation: formData.designation || 'Teacher', is_active: true, portal_role: 'teacher', portal_active: true });
        if (res.data.success) {
          setTeachers(prev => [...prev, normalizeTeacher(res.data.data)]);
          const identity = res.data?.portal_identity;
          if (identity?.created && identity?.temporaryPassword) {
            setNewTeacherLogin({ loginId: identity.loginId, temporaryPassword: identity.temporaryPassword });
          }
        } else {
          throw new Error(res.data?.message || 'Teacher could not be created');
        }
      }
      setShowModal(false);
      setEditingTeacher(null);
      setFormData({});
    } catch {
      setError('Teacher changes were not saved. Please retry after checking the live backend.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/employees/${id}`);
      setTeachers(prev => prev.filter(t => t.id !== id));
    } catch {
      setError('Teacher could not be deleted from the live backend.');
    }
    setDeleteId(null);
  };

  const openEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData(teacher);
    setShowModal(true);
  };

  const openAdd = () => {
    setEditingTeacher(null);
    setFormData({ status: 'active', classes: [] });
    setShowModal(true);
  };

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    inactive: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    on_leave: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  return (
    <DashboardLayout role="admin" title="Teacher Management">
      {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
      {newTeacherLogin && <div className="mb-4 rounded-xl border border-amber-500/30 bg-slate-900 px-4 py-3 text-sm text-white space-y-2">
        <p className="font-semibold text-amber-300">One-time teacher login handoff</p>
        <p>Login ID: {newTeacherLogin.loginId}</p>
        <p className="break-all">Temporary password: {newTeacherLogin.temporaryPassword}</p>
        <p className="text-xs text-slate-400">Deliver privately to the correct teacher. The teacher must change this password on first login.</p>
        <button type="button" onClick={() => setNewTeacherLogin(null)} className="rounded-lg border border-slate-600 px-3 py-2">Credential handed over — clear display</button>
      </div>}
      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Teachers', value: teachers.length, icon: GraduationCap, color: 'from-blue-500 to-cyan-400' },
          { label: 'Active', value: teachers.filter(t => t.status === 'active').length, icon: CheckCircle2, color: 'from-emerald-500 to-teal-400' },
          { label: 'On Leave', value: teachers.filter(t => t.status === 'on_leave').length, icon: AlertTriangle, color: 'from-amber-500 to-orange-400' },
          { label: 'Departments', value: new Set(teachers.map(t => t.subject)).size, icon: BookOpen, color: 'from-purple-500 to-violet-400' },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="glass-card p-5 flex items-center gap-4"
          >
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
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between"
      >
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search teachers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="on_leave">On Leave</option>
          </select>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-500 text-sm cursor-not-allowed opacity-50" title="Coming soon">
            <Download className="w-4 h-4" /> Export
          </button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Teacher
          </motion.button>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50 text-slate-400 text-left">
                  <th className="p-4 font-medium">Teacher</th>
                  <th className="p-4 font-medium">Subject</th>
                  <th className="p-4 font-medium">Designation</th>
                  <th className="p-4 font-medium">Classes</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Salary</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredTeachers.map((teacher) => (
                    <motion.tr
                      key={teacher.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
                            {teacher.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-white font-medium">{teacher.name}</p>
                            <p className="text-slate-500 text-xs">{teacher.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-300">{teacher.subject}</td>
                      <td className="p-4 text-slate-300">{teacher.designation}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {teacher.classes.map((c, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 rounded-md bg-slate-700/50 text-slate-300">{c}</span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColors[teacher.status] || statusColors.inactive}`}>
                          {teacher.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-slate-300">Rs. {teacher.salary.toLocaleString()}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(teacher)} className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-blue-400 transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteId(teacher.id)} className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            {filteredTeachers.length === 0 && (
              <div className="text-center py-16 text-slate-500">
                <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No teachers found</p>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card w-full max-w-2xl p-6 relative border-slate-600/50"
            >
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold text-white mb-6">
                {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Subject</label>
                  <input
                    type="text"
                    value={formData.subject || ''}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Designation</label>
                  <select
                    value={formData.designation || ''}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select</option>
                    <option value="HOD">HOD</option>
                    <option value="Senior Teacher">Senior Teacher</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Assistant Teacher">Assistant Teacher</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Status</label>
                  <select
                    value={formData.status || 'active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on_leave">On Leave</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Salary (Rs.)</label>
                  <input
                    type="number"
                    value={formData.salary || ''}
                    onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 font-medium hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingTeacher ? 'Update Teacher' : 'Create Teacher'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-sm p-6 relative border-red-500/30"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white text-center mb-2">Delete Teacher?</h3>
              <p className="text-slate-400 text-sm text-center mb-6">This action cannot be undone. The teacher record will be permanently removed.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-medium hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-colors">
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
