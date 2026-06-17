"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import api from '@/utils/api';
import {
  Megaphone, Plus, X, Edit2, Trash2, Send, Users, GraduationCap, Shield,
  Loader2, Pin, Bell, CalendarDays, Languages, FileText, AtSign
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Audience = 'all' | 'teachers' | 'students' | 'parents';
type Priority = 'low' | 'normal' | 'high' | 'urgent';
type NoticeLanguage = 'english' | 'urdu' | 'bilingual';

interface Announcement {
  id: string;
  title: string;
  content: string;
  contentEnglish: string;
  contentUrdu: string;
  templateKey: string;
  language: NoticeLanguage;
  targetAudience: Audience;
  teacherIds: string[];
  mentionedTeacherIds: string[];
  priority: Priority;
  isPinned: boolean;
  createdAt: string;
  expiresAt: string;
  author: string;
  readCount: number;
  totalRecipients: number;
}

interface TeacherOption {
  id: string;
  name: string;
  designation: string;
  department: string;
}

interface NoticeTemplate {
  key: string;
  label: string;
  audience: Audience;
  priority: Priority;
  title: string;
  english: string;
  urdu: string;
}

const noticeTemplates: NoticeTemplate[] = [
  {
    key: 'general',
    label: 'General Notice',
    audience: 'all',
    priority: 'normal',
    title: 'Important Notice',
    english: 'Dear parents, students, and teachers,\n\nPlease note the following school announcement. Further details will be shared by the administration.',
    urdu: 'محترم والدین، طلبہ اور اساتذہ،\n\nبراہ کرم اسکول کی اس اہم اطلاع کو نوٹ فرمائیں۔ مزید تفصیلات انتظامیہ کی طرف سے شیئر کی جائیں گی۔',
  },
  {
    key: 'teacher_meeting',
    label: 'Teacher Meeting',
    audience: 'teachers',
    priority: 'high',
    title: 'Teacher Meeting Notice',
    english: 'Dear teachers,\n\nA staff meeting has been scheduled. Please review your class records and be present on time.',
    urdu: 'محترم اساتذہ،\n\nاسٹاف میٹنگ مقرر کی گئی ہے۔ براہ کرم اپنے کلاس ریکارڈ کا جائزہ لیں اور وقت پر تشریف لائیں۔',
  },
  {
    key: 'fee_reminder',
    label: 'Fee Reminder',
    audience: 'parents',
    priority: 'high',
    title: 'Fee Submission Reminder',
    english: 'Dear parents,\n\nThis is a reminder to submit the pending school fee before the due date to avoid any late surcharge.',
    urdu: 'محترم والدین،\n\nیہ یاد دہانی ہے کہ لیٹ سرچارج سے بچنے کے لیے مقررہ تاریخ سے پہلے واجب الادا فیس جمع کروا دیں۔',
  },
  {
    key: 'exam_result',
    label: 'Exam / Result',
    audience: 'students',
    priority: 'normal',
    title: 'Exam and Result Notice',
    english: 'Dear students,\n\nExam/result related updates are available. Please follow the instructions shared by your class teacher.',
    urdu: 'محترم طلبہ،\n\nامتحان/نتائج سے متعلق اپ ڈیٹس دستیاب ہیں۔ براہ کرم اپنے کلاس ٹیچر کی ہدایات پر عمل کریں۔',
  },
  {
    key: 'holiday',
    label: 'Holiday Notice',
    audience: 'all',
    priority: 'normal',
    title: 'School Holiday Notice',
    english: 'Dear parents, students, and teachers,\n\nThe school will remain closed as per the announced schedule. Regular classes will resume afterward.',
    urdu: 'محترم والدین، طلبہ اور اساتذہ،\n\nاعلان کردہ شیڈول کے مطابق اسکول بند رہے گا۔ اس کے بعد معمول کی کلاسز دوبارہ شروع ہوں گی۔',
  },
  {
    key: 'custom',
    label: 'Custom Editable Notice',
    audience: 'all',
    priority: 'normal',
    title: '',
    english: '',
    urdu: '',
  },
];

const defaultForm: Partial<Announcement> = {
  targetAudience: 'all',
  priority: 'normal',
  isPinned: false,
  templateKey: 'custom',
  language: 'bilingual',
  contentEnglish: '',
  contentUrdu: '',
  teacherIds: [],
  mentionedTeacherIds: [],
};

function readText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function readNumber(value: unknown, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function readBoolean(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

function readArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return value ? [value] : [];
    }
  }
  return [];
}

function toDateInput(value: unknown) {
  const text = readText(value);
  if (!text) return '';
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text.slice(0, 10);
  return date.toISOString().split('T')[0];
}

function buildNoticeContent(language: NoticeLanguage, english = '', urdu = '') {
  if (language === 'english') return english.trim();
  if (language === 'urdu') return urdu.trim();
  return [english.trim(), urdu.trim()].filter(Boolean).join('\n\n');
}

function audienceFromRecipients(recipients: string[]): Audience {
  if (recipients.includes('all')) return 'all';
  if (recipients.length > 1) return 'all';
  if (recipients[0] === 'teachers' || recipients[0] === 'students' || recipients[0] === 'parents') return recipients[0];
  return 'all';
}

function recipientsFromAudience(audience: Audience) {
  return audience === 'all' ? ['parents', 'students', 'teachers'] : [audience];
}

function mapNotice(row: Record<string, unknown>): Announcement {
  const recipients = readArray(row.recipient_type ?? row.recipientType);
  const language = readText(row.language, 'bilingual') as NoticeLanguage;
  const contentEnglish = readText(row.content_english ?? row.contentEnglish);
  const contentUrdu = readText(row.content_urdu ?? row.contentUrdu);

  return {
    id: String(row.id ?? ''),
    title: readText(row.title),
    content: readText(row.content) || buildNoticeContent(language, contentEnglish, contentUrdu),
    contentEnglish,
    contentUrdu,
    templateKey: readText(row.template_key ?? row.templateKey, 'custom'),
    language,
    targetAudience: audienceFromRecipients(recipients),
    teacherIds: readArray(row.teacher_ids ?? row.teacherIds),
    mentionedTeacherIds: readArray(row.mentioned_teacher_ids ?? row.mentionedTeacherIds),
    priority: readText(row.priority, 'normal') as Priority,
    isPinned: readBoolean(row.is_pinned ?? row.isPinned),
    createdAt: toDateInput(row.created_at ?? row.createdAt),
    expiresAt: toDateInput(row.expires_at ?? row.expiresAt),
    author: readText(row.issued_by ?? row.author, 'Administration'),
    readCount: readNumber(row.read_count ?? row.readCount),
    totalRecipients: readNumber(row.total_recipients ?? row.totalRecipients),
  };
}

function mapTeacher(row: Record<string, unknown>): TeacherOption {
  return {
    id: String(row.id ?? ''),
    name: readText(row.name, 'Unnamed Teacher'),
    designation: readText(row.designation ?? row.role),
    department: readText(row.department),
  };
}

export default function AnnouncementsManagement() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState<Partial<Announcement>>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchAnnouncements();
    fetchTeachers();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/notices');
      if (res.data.success) {
        const rows = Array.isArray(res.data.data) ? res.data.data : [];
        setAnnouncements(rows.map((row: Record<string, unknown>) => mapNotice(row)));
      } else {
        setError(res.data.message || 'Notices API returned an error.');
      }
    } catch (err) {
      console.error('Notices load error:', err);
      setError('Notices could not load from the SaaS backend.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/employees?active=true');
      if (!res.data.success || !Array.isArray(res.data.data)) return;
      const options = res.data.data
        .map((row: Record<string, unknown>) => mapTeacher(row))
        .filter((teacher: TeacherOption) => {
          const roleText = `${teacher.designation} ${teacher.department}`.toLowerCase();
          return roleText.includes('teacher') || roleText.includes('teaching') || roleText.includes('instructor');
        });
      setTeachers(options);
    } catch (err) {
      console.error('Teacher mention list error:', err);
      setTeachers([]);
    }
  };

  const applyTemplate = (templateKey: string) => {
    const template = noticeTemplates.find(item => item.key === templateKey) || noticeTemplates[noticeTemplates.length - 1];
    setFormData(prev => ({
      ...prev,
      templateKey: template.key,
      title: template.title || prev.title || '',
      targetAudience: template.audience,
      priority: template.priority,
      contentEnglish: template.english,
      contentUrdu: template.urdu,
      content: buildNoticeContent((prev.language || 'bilingual') as NoticeLanguage, template.english, template.urdu),
    }));
  };

  const toggleTeacher = (field: 'teacherIds' | 'mentionedTeacherIds', id: string) => {
    setFormData(prev => {
      const selected = new Set(prev[field] || []);
      if (selected.has(id)) selected.delete(id);
      else selected.add(id);
      return { ...prev, [field]: Array.from(selected) };
    });
  };

  const handleSave = async () => {
    const language = (formData.language || 'bilingual') as NoticeLanguage;
    const content = buildNoticeContent(language, formData.contentEnglish || '', formData.contentUrdu || '');
    if (!formData.title || !content) {
      setError('Title aur notice content zaroori hai.');
      return;
    }

    const payload = {
      title: formData.title,
      content,
      content_english: formData.contentEnglish || '',
      content_urdu: formData.contentUrdu || '',
      template_key: formData.templateKey || 'custom',
      language,
      issued_by: formData.author || 'Administration',
      recipient_type: recipientsFromAudience((formData.targetAudience || 'all') as Audience),
      teacher_ids: formData.teacherIds || [],
      mentioned_teacher_ids: formData.mentionedTeacherIds || [],
      priority: formData.priority || 'normal',
      is_pinned: Boolean(formData.isPinned),
      expires_at: formData.expiresAt || null,
    };

    try {
      setSaving(true);
      setError(null);
      if (editing) {
        const res = await api.put(`/admin/notices/${editing.id}`, payload);
        if (!res.data.success) throw new Error(res.data.message || 'Notice update failed.');
      } else {
        const res = await api.post('/admin/notices', payload);
        if (!res.data.success) throw new Error(res.data.message || 'Notice publish failed.');
      }
      await fetchAnnouncements();
      setShowModal(false);
      setEditing(null);
      setFormData(defaultForm);
    } catch (err) {
      console.error('Notice save error:', err);
      setError('Notice save nahi hua. Backend/database connection check karain.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setError(null);
      const res = await api.delete(`/admin/notices/${id}`);
      if (!res.data.success) throw new Error(res.data.message || 'Notice delete failed.');
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Notice delete error:', err);
      setError('Notice delete nahi hua. Backend ne delete confirm nahi kiya.');
    }
    setDeleteId(null);
  };

  const openCreateModal = () => {
    setEditing(null);
    setFormData(defaultForm);
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (announcement: Announcement) => {
    setEditing(announcement);
    setFormData(announcement);
    setError(null);
    setShowModal(true);
  };

  const priorityColors: Record<Priority, string> = {
    low: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    normal: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    high: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    urgent: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  const audienceIcons: Record<Audience, LucideIcon> = {
    all: Users,
    teachers: GraduationCap,
    students: Users,
    parents: Shield,
  };

  const teacherNameById = new Map(teachers.map(teacher => [teacher.id, teacher.name]));
  const sortedAnnouncements = [...announcements].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const currentLanguage = (formData.language || 'bilingual') as NoticeLanguage;
  const previewContent = buildNoticeContent(currentLanguage, formData.contentEnglish || '', formData.contentUrdu || '');

  return (
    <DashboardLayout role="admin" title="Notices">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: announcements.length, icon: Megaphone, color: 'from-blue-500 to-cyan-400' },
          { label: 'Templates', value: noticeTemplates.length - 1, icon: FileText, color: 'from-amber-500 to-yellow-400' },
          { label: 'Pinned', value: announcements.filter(a => a.isPinned).length, icon: Pin, color: 'from-purple-500 to-violet-400' },
          { label: 'Urgent', value: announcements.filter(a => a.priority === 'urgent').length, icon: Bell, color: 'from-red-500 to-rose-400' },
        ].map((stat, idx) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }} className="glass-card p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-20`}><stat.icon className="w-6 h-6 text-white" /></div>
            <div><p className="text-slate-400 text-xs font-medium">{stat.label}</p><p className="text-2xl font-bold text-white">{stat.value}</p></div>
          </motion.div>
        ))}
      </div>

      {error && <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end mb-6">
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={openCreateModal} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"><Plus className="w-4 h-4" /> Issue Notice</motion.button>
      </motion.div>

      {loading && <div className="text-center py-16 text-slate-500"><Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin" /><p>Loading notices...</p></div>}

      <div className="space-y-4">
        <AnimatePresence>
          {sortedAnnouncements.map((ann) => {
            const AudienceIcon = audienceIcons[ann.targetAudience] || Users;
            const mentionedNames = ann.mentionedTeacherIds.map(id => teacherNameById.get(id)).filter(Boolean);
            return (
              <motion.div key={ann.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} whileHover={{ scale: 1.005 }} className={`glass-card p-5 relative overflow-hidden group ${ann.isPinned ? 'border-amber-500/20' : ''}`}>
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className={`p-3 rounded-xl ${priorityColors[ann.priority]} h-fit`}>
                    <AudienceIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="text-white font-bold text-base">{ann.title}</h4>
                      {ann.isPinned && <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1"><Pin className="w-3 h-3" /> Pinned</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${priorityColors[ann.priority]}`}>{ann.priority}</span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-slate-700/50 text-slate-300 border border-slate-600/30">{ann.targetAudience}</span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">{ann.language}</span>
                    </div>
                    <p className="text-slate-300 text-sm mb-3 leading-relaxed whitespace-pre-line">{ann.content}</p>
                    {mentionedNames.length > 0 && <p className="mb-3 text-xs text-amber-300 flex items-center gap-1"><AtSign className="w-3 h-3" /> Mentioned: {mentionedNames.join(', ')}</p>}
                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {ann.createdAt}</span>
                      <span className="flex items-center gap-1"><Send className="w-3 h-3" /> {ann.readCount}/{ann.totalRecipients} read</span>
                      <span>By {ann.author}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(ann)} className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-blue-400 transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteId(ann.id)} className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {sortedAnnouncements.length === 0 && !loading && <div className="text-center py-16 text-slate-500"><Megaphone className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No notices found</p></div>}

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card w-full max-w-4xl p-6 relative border-slate-600/50 max-h-[90vh] overflow-y-auto">
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              <h3 className="text-xl font-bold text-white mb-6">{editing ? 'Edit Notice' : 'Issue Notice'}</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Template</label>
                    <select value={formData.templateKey || 'custom'} onChange={(e) => applyTemplate(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {noticeTemplates.map(template => <option key={template.key} value={template.key}>{template.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Language</label>
                    <select value={formData.language || 'bilingual'} onChange={(e) => setFormData({ ...formData, language: e.target.value as NoticeLanguage })} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="bilingual">English + Urdu</option>
                      <option value="english">English Only</option>
                      <option value="urdu">Urdu Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Title</label>
                    <input type="text" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm text-slate-400 mb-1"><Languages className="w-4 h-4" /> English Content</label>
                    <textarea rows={7} value={formData.contentEnglish || ''} onChange={(e) => setFormData({ ...formData, contentEnglish: e.target.value })} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none whitespace-pre-wrap" />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm text-slate-400 mb-1"><Languages className="w-4 h-4" /> Urdu Content</label>
                    <textarea dir="rtl" rows={7} value={formData.contentUrdu || ''} onChange={(e) => setFormData({ ...formData, contentUrdu: e.target.value })} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-8 text-right" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Target Audience</label>
                    <select value={formData.targetAudience || 'all'} onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as Audience })} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="all">All</option>
                      <option value="teachers">Teachers</option>
                      <option value="students">Students</option>
                      <option value="parents">Parents</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Priority</label>
                    <select value={formData.priority || 'normal'} onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Expires At</label>
                    <input type="date" value={formData.expiresAt || ''} onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                {teachers.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-slate-700 bg-slate-900/30 p-4">
                      <p className="text-sm font-semibold text-white mb-3">Send to selected teachers</p>
                      <div className="max-h-44 overflow-y-auto space-y-2">
                        {teachers.map(teacher => (
                          <label key={`send-${teacher.id}`} className="flex items-center gap-2 text-sm text-slate-300">
                            <input type="checkbox" checked={(formData.teacherIds || []).includes(teacher.id)} onChange={() => toggleTeacher('teacherIds', teacher.id)} className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500" />
                            <span>{teacher.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-700 bg-slate-900/30 p-4">
                      <p className="text-sm font-semibold text-white mb-3">Mention teachers in notice</p>
                      <div className="max-h-44 overflow-y-auto space-y-2">
                        {teachers.map(teacher => (
                          <label key={`mention-${teacher.id}`} className="flex items-center gap-2 text-sm text-slate-300">
                            <input type="checkbox" checked={(formData.mentionedTeacherIds || []).includes(teacher.id)} onChange={() => toggleTeacher('mentionedTeacherIds', teacher.id)} className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500" />
                            <span>{teacher.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.isPinned || false} onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })} className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500" />
                  <label className="text-sm text-slate-300">Pin this notice</label>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-950/40 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Preview</p>
                  <h4 className="text-white font-bold mb-2">{formData.title || 'Notice title'}</h4>
                  <p className="text-slate-300 text-sm leading-7 whitespace-pre-line">{previewContent || 'Template content will appear here.'}</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 font-medium hover:bg-slate-800 transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2">{saving && <Loader2 className="w-4 h-4 animate-spin" />}{editing ? 'Update Notice' : 'Publish Notice'}</button>
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
              <h3 className="text-lg font-bold text-white text-center mb-2">Delete Notice?</h3>
              <p className="text-slate-400 text-sm text-center mb-6">This will remove the notice from all portals.</p>
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
