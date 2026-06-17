"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import api from '@/utils/api';
import {
  Users, Search, Plus, X, Edit2, Trash2, Mail, Phone, BookOpen,
  AlertTriangle, CheckCircle2, Loader2, Download, GraduationCap, Shield, UploadCloud
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  rollNumber: string;
  grade: string;
  section: string;
  parentName: string;
  parentPhone: string;
  status: 'active' | 'inactive' | 'suspended';
  admissionDate: string;
  feeStatus: 'paid' | 'pending' | 'overdue';
  attendance: number;
  father_cnic?: string;
  b_form?: string;
  family_code?: string;
}

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterGrade, setFilterGrade] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<Partial<Student>>({});
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Bulk Import State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/students');
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        const mapped = res.data.data.map((s: any) => ({
          ...s,
          rollNumber: s.gr_number || s.roll_number || '-',
          grade: s.class || s.grade || '-',
          parentName: s.father_name || s.father || s.parentName || '-',
          parentPhone: s.parent_phone || s.phone || s.parentPhone || '-',
        }));
        setStudents(mapped);
      } else { console.error("API error"); }
    } catch (err) { console.error("Network error:", err); }
    finally { setLoading(false); }
  };

  

  const filteredStudents = students.filter(s => {
    const term = search.toLowerCase();
    const matchesSearch = s.name.toLowerCase().includes(term) ||
                          s.rollNumber.toLowerCase().includes(term) ||
                          (s.email || '').toLowerCase().includes(term) ||
                          (s.father_cnic || '').toLowerCase().includes(term) ||
                          (s.b_form || '').toLowerCase().includes(term) ||
                          (s.family_code || '').toLowerCase().includes(term) ||
                          (s.parentPhone || '').toLowerCase().includes(term);
    const matchesGrade = filterGrade === 'all' || s.grade === filterGrade;
    return matchesSearch && matchesGrade;
  });

  const handleSave = async () => {
    if (!formData.name || !formData.email) return;
    try {
      setSaving(true);
      if (editingStudent) {
        const res = await api.put(`/admin/students/${editingStudent.id}`, formData);
        if (res.data.success) {
          setStudents(prev => prev.map(s => s.id === editingStudent.id ? { ...s, ...formData } as Student : s));
        }
      } else {
        const res = await api.post('/admin/students', formData);
        if (res.data.success) setStudents(prev => [...prev, res.data.data]);
        else {
          const newStudent = { ...formData, id: Date.now().toString(), admissionDate: new Date().toISOString().split('T')[0], status: 'active' as const, attendance: 100, feeStatus: 'pending' as const } as Student;
          setStudents(prev => [...prev, newStudent]);
        }
      }
      setShowModal(false); setEditingStudent(null); setFormData({});
    } catch {
      if (editingStudent) setStudents(prev => prev.map(s => s.id === editingStudent.id ? { ...s, ...formData } as Student : s));
      else {
        const newStudent = { ...formData, id: Date.now().toString(), admissionDate: new Date().toISOString().split('T')[0], status: 'active' as const, attendance: 100, feeStatus: 'pending' as const } as Student;
        setStudents(prev => [...prev, newStudent]);
      }
      setShowModal(false); setEditingStudent(null); setFormData({});
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try { await api.delete(`/admin/students/${id}`); setStudents(prev => prev.filter(s => s.id !== id)); }
    catch { setStudents(prev => prev.filter(s => s.id !== id)); }
    setDeleteId(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportStatus('Reading file...');
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      if (lines.length < 2) { setImportStatus('Invalid or empty CSV file.'); return; }
      
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const newStudents = lines.slice(1).filter(l => l.trim()).map(line => {
        // Handle basic comma separation (ignores commas inside quotes for simplicity in this MVP)
        const values = line.split(',');
        const s: any = { name: 'Unknown' };
        headers.forEach((h, i) => {
          const val = values[i]?.trim();
          if (!val) return;
          if (h.includes('name')) s.name = val;
          else if (h.includes('roll') || h.includes('gr')) s.roll_number = val;
          else if (h.includes('class') || h.includes('grade')) s.class = val;
          else if (h.includes('section')) s.section = val;
          else if (h.includes('cnic')) s.father_cnic = val;
          else if (h.includes('phone') || h.includes('mobile')) s.parent_phone = val;
          else if (h.includes('family')) s.family_code = val;
          else if (h.includes('b_form') || h.includes('bform')) s.b_form = val;
          else if (h.includes('parent') || h.includes('father')) s.parentName = val;
        });
        return s;
      });

      try {
        setImportStatus(`Uploading ${newStudents.length} students...`);
        setSaving(true);
        const res = await api.post('/admin/students/bulk', { students: newStudents });
        if (res.data.success) {
          setImportStatus(`Successfully imported! Fetching latest data...`);
          await fetchStudents();
          setTimeout(() => setShowImportModal(false), 1500);
        } else {
          setImportStatus(`Import failed: ${res.data.message}`);
        }
      } catch (err: any) { 
        setImportStatus(`Error: ${err?.response?.data?.message || 'Server error'}`);
      } finally { 
        setSaving(false); 
      }
    };
    reader.readAsText(file);
  };

  const openEdit = (student: Student) => { setEditingStudent(student); setFormData(student); setShowModal(true); };
  const openAdd = () => { setEditingStudent(null); setFormData({ status: 'active', feeStatus: 'pending', attendance: 100 }); setShowModal(true); };

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    inactive: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    suspended: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  const feeColors: Record<string, string> = {
    paid: 'text-emerald-400',
    pending: 'text-amber-400',
    overdue: 'text-red-400',
  };

  const grades = [...new Set(students.map(s => s.grade))];

  return (
    <DashboardLayout role="admin" title="Student Management">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Students', value: students.length, icon: Users, color: 'from-blue-500 to-cyan-400' },
          { label: 'Active', value: students.filter(s => s.status === 'active').length, icon: CheckCircle2, color: 'from-emerald-500 to-teal-400' },
          { label: 'Fee Overdue', value: students.filter(s => s.feeStatus === 'overdue').length, icon: AlertTriangle, color: 'from-red-500 to-rose-400' },
          { label: 'Avg Attendance', value: `${Math.round(students.reduce((a, s) => a + s.attendance, 0) / (students.length || 1))}%`, icon: GraduationCap, color: 'from-purple-500 to-violet-400' },
        ].map((stat, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }} className="glass-card p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-20`}><stat.icon className="w-6 h-6 text-white" /></div>
            <div><p className="text-slate-400 text-xs font-medium">{stat.label}</p><p className="text-2xl font-bold text-white">{stat.value}</p></div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search by Name, Roll No, CNIC, B-Form, Phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500" />
          </div>
          <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)} className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All Grades</option>
            {grades.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setShowImportModal(true); setImportStatus(null); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-bold hover:bg-blue-500/20 transition-colors">
            <UploadCloud className="w-4 h-4" /> Bulk Import
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-500 text-sm cursor-not-allowed opacity-50" title="Coming soon"><Download className="w-4 h-4" /> Export</button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"><Plus className="w-4 h-4" /> Add Student</motion.button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50 text-slate-400 text-left">
                  <th className="p-4 font-medium">Student</th>
                  <th className="p-4 font-medium">Roll #</th>
                  <th className="p-4 font-medium">Grade/Section</th>
                  <th className="p-4 font-medium">Parent</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Attendance</th>
                  <th className="p-4 font-medium">Fee</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredStudents.map((student) => (
                    <motion.tr key={student.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">{student.name.split(' ').map(n => n[0]).join('')}</div>
                          <div><p className="text-white font-medium">{student.name}</p><p className="text-slate-500 text-xs">{student.email}</p></div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-300 font-mono text-xs">{student.rollNumber}</td>
                      <td className="p-4 text-slate-300">{student.grade} • {student.section}</td>
                      <td className="p-4">
                        <p className="text-slate-300 text-sm">{student.parentName}</p>
                        <p className="text-slate-500 text-xs">{student.parentPhone}</p>
                      </td>
                      <td className="p-4"><span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColors[student.status]}`}>{student.status}</span></td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" style={{ width: `${student.attendance}%` }}></div>
                          </div>
                          <span className="text-xs text-slate-400">{student.attendance}%</span>
                        </div>
                      </td>
                      <td className="p-4"><span className={`text-xs font-bold uppercase ${feeColors[student.feeStatus]}`}>{student.feeStatus}</span></td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(student)} className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-blue-400 transition-colors"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteId(student.id)} className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            {filteredStudents.length === 0 && <div className="text-center py-16 text-slate-500"><Users className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No students found</p></div>}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="glass-card w-full max-w-2xl p-6 relative border-slate-600/50 max-h-[90vh] overflow-y-auto">
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              <h3 className="text-xl font-bold text-white mb-6">{editingStudent ? 'Edit Student' : 'Add New Student'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm text-slate-400 mb-1">Full Name</label><input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm text-slate-400 mb-1">Email</label><input type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm text-slate-400 mb-1">Phone</label><input type="text" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm text-slate-400 mb-1">Roll Number</label><input type="text" value={formData.rollNumber || ''} onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm text-slate-400 mb-1">Grade</label><input type="text" value={formData.grade || ''} onChange={(e) => setFormData({ ...formData, grade: e.target.value })} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm text-slate-400 mb-1">Section</label><input type="text" value={formData.section || ''} onChange={(e) => setFormData({ ...formData, section: e.target.value })} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm text-slate-400 mb-1">Parent Name</label><input type="text" value={formData.parentName || ''} onChange={(e) => setFormData({ ...formData, parentName: e.target.value })} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm text-slate-400 mb-1">Parent Phone</label><input type="text" value={formData.parentPhone || ''} onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm text-slate-400 mb-1">Status</label>
                  <select value={formData.status || 'active'} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="active">Active</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option>
                  </select>
                </div>
                <div><label className="block text-sm text-slate-400 mb-1">Fee Status</label>
                  <select value={formData.feeStatus || 'pending'} onChange={(e) => setFormData({ ...formData, feeStatus: e.target.value as any })} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="paid">Paid</option><option value="pending">Pending</option><option value="overdue">Overdue</option>
                  </select>
                </div>
                {/* Advanced Fields */}
                <div className="col-span-1 md:col-span-2 mt-2 pt-4 border-t border-slate-700/50">
                  <h4 className="text-sm font-semibold text-white mb-3">Advanced Information (Family Hierarchy)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><label className="block text-sm text-slate-400 mb-1">Father CNIC</label><input type="text" placeholder="e.g. 12345-6789012-3" value={formData.father_cnic || ''} onChange={(e) => setFormData({ ...formData, father_cnic: e.target.value })} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div><label className="block text-sm text-slate-400 mb-1">Student B-Form</label><input type="text" placeholder="e.g. 12345-6789012-3" value={formData.b_form || ''} onChange={(e) => setFormData({ ...formData, b_form: e.target.value })} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div><label className="block text-sm text-slate-400 mb-1">Family Code (Auto Disocunts)</label><input type="text" placeholder="e.g. FAM-1234" value={formData.family_code || ''} onChange={(e) => setFormData({ ...formData, family_code: e.target.value })} className="w-full bg-slate-800/50 border border-emerald-500/30 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-emerald-400 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 font-medium hover:bg-slate-800 transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2">{saving && <Loader2 className="w-4 h-4 animate-spin" />}{editingStudent ? 'Update Student' : 'Create Student'}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card w-full max-w-sm p-6 relative border-red-500/30">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4"><Trash2 className="w-6 h-6 text-red-400" /></div>
              <h3 className="text-lg font-bold text-white text-center mb-2">Delete Student?</h3>
              <p className="text-slate-400 text-sm text-center mb-6">This action cannot be undone. The student record will be permanently removed.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-medium hover:bg-slate-800 transition-colors">Cancel</button>
                <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-colors">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk Import Modal */}
      <AnimatePresence>
        {showImportModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card w-full max-w-md p-6 relative border-slate-600/50">
              <button onClick={() => setShowImportModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              <h3 className="text-xl font-bold text-white mb-2">Bulk Import Students</h3>
              <p className="text-sm text-slate-400 mb-6">Upload a CSV file containing student data. Ensure headers include: Name, Class, Roll, Phone, Father CNIC, Family Code, B_Form.</p>
              
              <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center bg-slate-800/30 hover:bg-slate-800/50 transition-colors relative">
                <input type="file" accept=".csv" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={saving} />
                <UploadCloud className={`w-10 h-10 mx-auto mb-3 ${saving ? 'text-blue-400 animate-bounce' : 'text-slate-400'}`} />
                <p className="text-white font-medium mb-1">{saving ? 'Processing...' : 'Click or drag CSV here'}</p>
                <p className="text-slate-500 text-xs">Only .csv files are supported</p>
              </div>

              {importStatus && (
                <div className={`mt-4 p-3 rounded-lg text-sm text-center font-medium ${importStatus.includes('Error') || importStatus.includes('failed') || importStatus.includes('Invalid') ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                  {importStatus}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
