"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import api from '@/utils/api';
import {
  Shield, Search, Plus, X, Edit2, Trash2, Mail, Phone, Users,
  AlertTriangle, CheckCircle2, Loader2, Download, CreditCard, MessageSquare
} from 'lucide-react';

interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  children: string[];
  occupation: string;
  address: string;
  status: 'active' | 'inactive';
  joinDate: string;
  totalPaid: number;
  totalDue: number;
  complaints: number;
}

export default function ParentManagement() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingParent, setEditingParent] = useState<Parent | null>(null);
  const [formData, setFormData] = useState<Partial<Parent>>({});
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { fetchParents(); }, []);

  const fetchParents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/parents');
      if (res.data.success) setParents(res.data.data);
      else console.error("API error");
    } catch (err) { console.error("Network error:", err); }
    finally { setLoading(false); }
  };

  

  const filteredParents = parents.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    p.children.some(c => c.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSave = async () => {
    if (!formData.name || !formData.email) return;
    try {
      setSaving(true);
      if (editingParent) {
        const res = await api.put(`/admin/parents/${editingParent.id}`, formData);
        if (res.data.success) setParents(prev => prev.map(p => p.id === editingParent.id ? { ...p, ...formData } as Parent : p));
      } else {
        const res = await api.post('/admin/parents', formData);
        if (res.data.success) setParents(prev => [...prev, res.data.data]);
        else {
          const newParent = { ...formData, id: Date.now().toString(), joinDate: new Date().toISOString().split('T')[0], status: 'active' as const, totalPaid: 0, totalDue: 0, complaints: 0 } as Parent;
          setParents(prev => [...prev, newParent]);
        }
      }
      setShowModal(false); setEditingParent(null); setFormData({});
    } catch {
      if (editingParent) setParents(prev => prev.map(p => p.id === editingParent.id ? { ...p, ...formData } as Parent : p));
      else {
        const newParent = { ...formData, id: Date.now().toString(), joinDate: new Date().toISOString().split('T')[0], status: 'active' as const, totalPaid: 0, totalDue: 0, complaints: 0 } as Parent;
        setParents(prev => [...prev, newParent]);
      }
      setShowModal(false); setEditingParent(null); setFormData({});
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try { await api.delete(`/admin/parents/${id}`); setParents(prev => prev.filter(p => p.id !== id)); }
    catch { setParents(prev => prev.filter(p => p.id !== id)); }
    setDeleteId(null);
  };

  const openEdit = (parent: Parent) => { setEditingParent(parent); setFormData(parent); setShowModal(true); };
  const openAdd = () => { setEditingParent(null); setFormData({ status: 'active', children: [], totalPaid: 0, totalDue: 0, complaints: 0 }); setShowModal(true); };

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    inactive: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  return (
    <DashboardLayout role="admin" title="Parent Management">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Parents', value: parents.length, icon: Shield, color: 'from-blue-500 to-cyan-400' },
          { label: 'Active', value: parents.filter(p => p.status === 'active').length, icon: CheckCircle2, color: 'from-emerald-500 to-teal-400' },
          { label: 'Fee Dues', value: parents.filter(p => p.totalDue > 0).length, icon: CreditCard, color: 'from-amber-500 to-orange-400' },
          { label: 'Open Complaints', value: parents.reduce((a, p) => a + p.complaints, 0), icon: MessageSquare, color: 'from-red-500 to-rose-400' },
        ].map((stat, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }} className="glass-card p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-20`}><stat.icon className="w-6 h-6 text-white" /></div>
            <div><p className="text-slate-400 text-xs font-medium">{stat.label}</p><p className="text-2xl font-bold text-white">{stat.value}</p></div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
        <div className="relative flex-1 md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search parents..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500" />
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-500 text-sm cursor-not-allowed opacity-50" title="Coming soon"><Download className="w-4 h-4" /> Export</button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"><Plus className="w-4 h-4" /> Add Parent</motion.button>
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
                  <th className="p-4 font-medium">Parent</th>
                  <th className="p-4 font-medium">Children</th>
                  <th className="p-4 font-medium">Occupation</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Total Paid</th>
                  <th className="p-4 font-medium">Due</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredParents.map((parent) => (
                    <motion.tr key={parent.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-sm">{parent.name.split(' ').map(n => n[0]).join('')}</div>
                          <div><p className="text-white font-medium">{parent.name}</p><p className="text-slate-500 text-xs">{parent.email} • {parent.phone}</p></div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {parent.children.map((c, i) => (<span key={i} className="text-xs px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20">{c}</span>))}
                        </div>
                      </td>
                      <td className="p-4 text-slate-300">{parent.occupation}</td>
                      <td className="p-4"><span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColors[parent.status]}`}>{parent.status}</span></td>
                      <td className="p-4 text-emerald-400 font-medium">Rs. {parent.totalPaid.toLocaleString()}</td>
                      <td className="p-4"><span className={parent.totalDue > 0 ? 'text-red-400 font-medium' : 'text-slate-500'}>{parent.totalDue > 0 ? `Rs. ${parent.totalDue.toLocaleString()}` : '-'}</span></td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(parent)} className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-blue-400 transition-colors"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteId(parent.id)} className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            {filteredParents.length === 0 && <div className="text-center py-16 text-slate-500"><Shield className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No parents found</p></div>}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="glass-card w-full max-w-2xl p-6 relative border-slate-600/50 max-h-[90vh] overflow-y-auto">
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              <h3 className="text-xl font-bold text-white mb-6">{editingParent ? 'Edit Parent' : 'Add New Parent'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm text-slate-400 mb-1">Full Name</label><input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm text-slate-400 mb-1">Email</label><input type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm text-slate-400 mb-1">Phone</label><input type="text" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm text-slate-400 mb-1">Occupation</label><input type="text" value={formData.occupation || ''} onChange={(e) => setFormData({ ...formData, occupation: e.target.value })} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div className="md:col-span-2"><label className="block text-sm text-slate-400 mb-1">Address</label><input type="text" value={formData.address || ''} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm text-slate-400 mb-1">Children (comma separated)</label><input type="text" value={(formData.children || []).join(', ')} onChange={(e) => setFormData({ ...formData, children: e.target.value.split(',').map(s => s.trim()) })} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm text-slate-400 mb-1">Status</label>
                  <select value={formData.status || 'active'} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="active">Active</option><option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 font-medium hover:bg-slate-800 transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2">{saving && <Loader2 className="w-4 h-4 animate-spin" />}{editingParent ? 'Update Parent' : 'Create Parent'}</button>
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
              <h3 className="text-lg font-bold text-white text-center mb-2">Delete Parent?</h3>
              <p className="text-slate-400 text-sm text-center mb-6">This action cannot be undone. The parent record will be permanently removed.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-medium hover:bg-slate-800 transition-colors">Cancel</button>
                <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-colors">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
