"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import api from '@/utils/api';
import {
  Calendar, Plus, X, Edit2, Trash2, Loader2, CheckCircle,
  Clock, AlertCircle, Star, BookOpen, Bus, Trophy, Megaphone
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  event_type: string;
  color: string;
}

const EVENT_TYPES = [
  { value: 'exam',         label: 'Examination',   icon: BookOpen,   color: '#8b5cf6' },
  { value: 'holiday',      label: 'Holiday',        icon: Star,       color: '#f59e0b' },
  { value: 'sports',       label: 'Sports',         icon: Trophy,     color: '#10b981' },
  { value: 'meeting',      label: 'Meeting',        icon: Megaphone,  color: '#3b82f6' },
  { value: 'trip',         label: 'Trip/Tour',      icon: Bus,        color: '#06b6d4' },
  { value: 'general',      label: 'General',        icon: Calendar,   color: '#C8991A' },
];

function getTypeInfo(type: string) {
  return EVENT_TYPES.find(t => t.value === type) || EVENT_TYPES[EVENT_TYPES.length - 1];
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-PK', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}

function daysUntil(d: string) {
  const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
  if (diff < 0) return 'Past';
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return `In ${diff} days`;
}

const EMPTY_FORM = { title: '', description: '', event_date: '', event_type: 'general' };

export default function EventsPage() {
  const [events, setEvents]       = useState<Event[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState<Event | null>(null);
  const [form, setForm]           = useState({ ...EMPTY_FORM });
  const [saving, setSaving]       = useState(false);
  const [deleteId, setDeleteId]   = useState<string | null>(null);
  const [filter, setFilter]       = useState('all');

  useEffect(() => { fetchEvents(); }, []);

  async function fetchEvents() {
    try {
      setLoading(true);
      const res = await api.get('/events');
      if (res.data.success) setEvents(res.data.data);
      else setEvents(getSampleEvents());
    } catch { setEvents(getSampleEvents()); }
    finally { setLoading(false); }
  }

  function getSampleEvents(): Event[] {
    const y = new Date().getFullYear();
    const m = (new Date().getMonth() + 1).toString().padStart(2, '0');
    return [
      { id: '1', title: 'Mid-Term Examinations', description: 'Classes 6–12 mid-term exams begin', event_date: `${y}-${m}-20`, event_type: 'exam',    color: '#8b5cf6' },
      { id: '2', title: 'Annual Sports Day',      description: 'Inter-house sports competition',   event_date: `${y}-${m}-25`, event_type: 'sports',  color: '#10b981' },
      { id: '3', title: 'Parent-Teacher Meeting', description: 'Q1 report card distribution',      event_date: `${y}-${m}-28`, event_type: 'meeting', color: '#3b82f6' },
      { id: '4', title: 'Eid Holiday',            description: 'School closed for Eid',            event_date: `${y}-${m}-30`, event_type: 'holiday', color: '#f59e0b' },
    ];
  }

  const openAdd = () => { setEditing(null); setForm({ ...EMPTY_FORM }); setShowModal(true); };
  const openEdit = (e: Event) => {
    setEditing(e);
    setForm({ title: e.title, description: e.description || '', event_date: e.event_date, event_type: e.event_type });
    setShowModal(true);
  };

  async function handleSave() {
    if (!form.title || !form.event_date) return;
    setSaving(true);
    try {
      if (editing) {
        const res = await api.put(`/events/${editing.id}`, form);
        const updated = res.data.success ? res.data.data : { ...editing, ...form };
        setEvents(prev => prev.map(e => e.id === editing.id ? updated : e));
      } else {
        const res = await api.post('/events', form);
        const created = res.data.success ? res.data.data : { ...form, id: Date.now().toString(), color: getTypeInfo(form.event_type).color };
        setEvents(prev => [...prev, created].sort((a, b) => a.event_date.localeCompare(b.event_date)));
      }
      setShowModal(false);
    } catch {
      const fallback: Event = { ...form, id: Date.now().toString(), color: getTypeInfo(form.event_type).color };
      if (editing) setEvents(prev => prev.map(e => e.id === editing.id ? { ...e, ...form } : e));
      else setEvents(prev => [...prev, fallback].sort((a, b) => a.event_date.localeCompare(b.event_date)));
      setShowModal(false);
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try { await api.delete(`/events/${id}`); } catch { }
    setEvents(prev => prev.filter(e => e.id !== id));
    setDeleteId(null);
  }

  const filtered = filter === 'all' ? events : events.filter(e => e.event_type === filter);
  const upcoming = events.filter(e => new Date(e.event_date) >= new Date()).length;
  const today    = events.filter(e => e.event_date === new Date().toISOString().split('T')[0]).length;

  return (
    <DashboardLayout role="admin" title="Events & Calendar">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Events',  value: events.length,  icon: Calendar,     color: 'from-blue-500 to-cyan-400' },
          { label: 'Upcoming',      value: upcoming,        icon: Clock,        color: 'from-amber-500 to-orange-400' },
          { label: 'Today',         value: today,           icon: CheckCircle,  color: 'from-emerald-500 to-teal-400' },
          { label: 'Event Types',   value: EVENT_TYPES.length, icon: Star,      color: 'from-purple-500 to-violet-400' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="glass-card p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${s.color}`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">{s.label}</p>
              <p className="text-2xl font-bold text-white">{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${filter === 'all' ? 'border-amber-500/40 text-amber-400' : 'border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'}`}
            style={filter === 'all' ? { background: 'rgba(200,153,26,0.15)' } : {}}>
            All
          </button>
          {EVENT_TYPES.map(t => (
            <button key={t.value} onClick={() => setFilter(t.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${filter === t.value ? 'text-white border-current' : 'border-slate-700 text-slate-400 hover:text-slate-200'}`}
              style={filter === t.value ? { background: `${t.color}22`, borderColor: `${t.color}66`, color: t.color } : {}}>
              {t.label}
            </button>
          ))}
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg transition-all"
          style={{ background: 'linear-gradient(135deg, #C8991A, #e6b020)', boxShadow: '0 4px 20px rgba(200,153,26,0.35)' }}>
          <Plus className="w-4 h-4" /> Add Event
        </motion.button>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-amber-400 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((event, idx) => {
              const typeInfo = getTypeInfo(event.event_type);
              const badge    = daysUntil(event.event_date);
              const isPast   = badge === 'Past';
              const isToday  = badge === 'Today';
              return (
                <motion.div key={event.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: idx * 0.04 }}
                  className="glass-card p-5 group relative overflow-hidden"
                  style={{ borderLeftWidth: 3, borderLeftColor: typeInfo.color, opacity: isPast ? 0.6 : 1 }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg" style={{ background: `${typeInfo.color}22` }}>
                        <typeInfo.icon className="w-4 h-4" style={{ color: typeInfo.color }} />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: typeInfo.color }}>
                        {typeInfo.label}
                      </span>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isToday ? 'bg-emerald-500/20 text-emerald-400' : isPast ? 'bg-slate-700 text-slate-500' : 'bg-amber-500/15 text-amber-400'}`}>
                      {badge}
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-base mb-1 line-clamp-2">{event.title}</h3>
                  {event.description && <p className="text-slate-400 text-sm mb-3 line-clamp-2">{event.description}</p>}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(event.event_date)}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(event)} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-blue-400 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteId(event.id)} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-16 text-slate-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No events found</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }} className="glass-card w-full max-w-lg p-6 relative border-slate-600/50">
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold text-white mb-6">{editing ? 'Edit Event' : 'Add New Event'}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Event Title *</label>
                  <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Annual Sports Day"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-slate-500" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Date *</label>
                  <input type="date" value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Event Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {EVENT_TYPES.map(t => (
                      <button key={t.value} onClick={() => setForm({ ...form, event_type: t.value })}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all"
                        style={form.event_type === t.value
                          ? { background: `${t.color}22`, borderColor: `${t.color}66`, color: t.color }
                          : { borderColor: 'rgba(100,116,139,0.5)', color: '#94a3b8' }}>
                        <t.icon className="w-4 h-4 flex-shrink-0" />
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Description</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={2} placeholder="Optional details..."
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-slate-500 resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 font-medium hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving || !form.title || !form.event_date}
                  className="flex-1 py-3 rounded-xl text-white font-bold shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #C8991A, #e6b020)' }}>
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editing ? 'Update Event' : 'Add Event'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }} className="glass-card w-full max-w-sm p-6 border-red-500/30">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white text-center mb-2">Delete Event?</h3>
              <p className="text-slate-400 text-sm text-center mb-6">This event will be permanently removed.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors">Cancel</button>
                <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-colors">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
