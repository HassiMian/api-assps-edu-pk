"use client";

import DashboardLayout from '@/components/DashboardLayout';
import api from '@/utils/api';
import { useApiData } from '@/hooks/useApiData';
import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock, Link2, BookOpen, MessageSquareQuote, RefreshCw, PlusCircle, Users, CheckCircle2 } from 'lucide-react';

const EMPTY = { data: [] as any[] };

type ClassOption = {
  class_name: string;
  section: string;
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatShortDate(dateStr?: string) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function TeacherTimetable() {
  const { data: classOptions } = useApiData<any>('/portal/teaching-options', EMPTY);
  const { data: onlineClasses, refetch: refetchOnlineClasses } = useApiData<any>('/portal/online-classes', EMPTY);
  const { data: timetableData, refetch: refetchTimetable } = useApiData<any>('/portal/timetable', { timetable: [], byDay: {} });

  const options: ClassOption[] = classOptions?.classes || [];
  const timetableByDay: Record<string, any[]> = timetableData?.byDay || {};
  const onlineClassList: any[] = Array.isArray(onlineClasses?.data) ? onlineClasses.data : [];

  const [form, setForm] = useState({
    class_name: '',
    section: 'A',
    subject: '',
    title: '',
    class_date: new Date().toISOString().slice(0, 10),
    start_time: '',
    end_time: '',
    meeting_link: '',
    description: '',
    timezone: 'Asia/Karachi',
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>(DAYS[new Date().getDay() === 0 ? 0 : Math.min(new Date().getDay() - 1, DAYS.length - 1)] || 'Monday');

  useEffect(() => {
    if (!form.class_name && options.length) {
      setForm(prev => ({ ...prev, class_name: options[0]?.class_name || '', section: options[0]?.section || 'A' }));
    }
  }, [options, form.class_name]);

  const summary = useMemo(() => {
    const totalTimetable = Object.values(timetableByDay).reduce((sum: number, arr: any[]) => sum + (arr?.length || 0), 0);
    return {
      totalOnlineClasses: onlineClassList.length,
      totalPeriods: totalTimetable,
      upcoming: onlineClassList.filter((item) => new Date(`${item.class_date}T${item.start_time || '00:00'}`).getTime() >= Date.now()).length,
      classesCovered: Object.keys(timetableByDay).filter(day => (timetableByDay[day] || []).length > 0).length,
    };
  }, [onlineClassList, timetableByDay]);

  const selectedDayItems = timetableByDay[selectedDay] || [];
  const sortedSelectedDayItems = [...selectedDayItems].sort((a: any, b: any) => String(a.start_time || '').localeCompare(String(b.start_time || '')));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setSubmitting(true);
    try {
      await api.post('/portal/online-classes', form);
      setFeedback({ type: 'success', text: 'Online class scheduled and notifications were stored in the backend.' });
      await Promise.all([refetchOnlineClasses(), refetchTimetable()]);
      setForm(prev => ({
        ...prev,
        title: '',
        start_time: '',
        end_time: '',
        meeting_link: '',
        description: '',
      }));
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.response?.data?.message || 'Failed to schedule online class.' });
    } finally {
      setSubmitting(false);
    }
  };

  const classList = options.length ? options : [{ class_name: '', section: '' }];

  return (
    <DashboardLayout role="teacher" title="Online Classes">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Scheduled Classes', value: summary.totalOnlineClasses, icon: CalendarDays },
          { label: 'Weekly Periods', value: summary.totalPeriods, icon: Clock },
          { label: 'Upcoming Sessions', value: summary.upcoming, icon: CheckCircle2 },
          { label: 'Active Days', value: summary.classesCovered, icon: Users },
        ].map((card) => (
          <div key={card.label} className="glass-card p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 border border-white/10">
                <card.icon className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <p className="text-slate-400 text-xs">{card.label}</p>
                <h3 className="text-2xl font-semibold text-white">{card.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {feedback && (
        <div className={`glass-card p-4 mb-6 border-l-4 ${feedback.type === 'success' ? 'border-l-emerald-500' : feedback.type === 'error' ? 'border-l-red-500' : 'border-l-cyan-500'}`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <MessageSquareQuote className="w-5 h-5 text-cyan-400" />}
            <p className="text-white text-sm">{feedback.text}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2 glass-card p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-amber-400 font-semibold">Scheduler</p>
              <h3 className="text-2xl font-semibold text-white mt-1">Add Online Class</h3>
              <p className="text-slate-400 text-sm mt-1">Schedule a live session and notify the selected class instantly.</p>
            </div>
            <button
              type="button"
              onClick={() => { refetchOnlineClasses(); refetchTimetable(); }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Class / Section</label>
                <select
                  value={`${form.class_name}||${form.section}`}
                  onChange={(e) => {
                    const [class_name, section] = e.target.value.split('||');
                    setForm(prev => ({ ...prev, class_name, section }));
                  }}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {classList.map((opt: ClassOption, idx: number) => (
                    <option key={`${opt.class_name}-${opt.section}-${idx}`} value={`${opt.class_name}||${opt.section}`}>
                      {opt.class_name ? `Class ${opt.class_name} - Section ${opt.section}` : 'Select from student list'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Subject</label>
                <input
                  value={form.subject}
                  onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="e.g. Mathematics"
                  className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Quadratic Equations Revision"
                required
                className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Date</label>
                <input
                  type="date"
                  value={form.class_date}
                  onChange={(e) => setForm(prev => ({ ...prev, class_date: e.target.value }))}
                  required
                  className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Start Time</label>
                <input
                  type="time"
                  value={form.start_time}
                  onChange={(e) => setForm(prev => ({ ...prev, start_time: e.target.value }))}
                  required
                  className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">End Time</label>
                <input
                  type="time"
                  value={form.end_time}
                  onChange={(e) => setForm(prev => ({ ...prev, end_time: e.target.value }))}
                  required
                  className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Timezone</label>
                <input
                  value={form.timezone}
                  onChange={(e) => setForm(prev => ({ ...prev, timezone: e.target.value }))}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Meeting Link</label>
              <input
                value={form.meeting_link}
                onChange={(e) => setForm(prev => ({ ...prev, meeting_link: e.target.value }))}
                placeholder="https://meet.google.com/..."
                required
                className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                placeholder="Optional notes for students and parents"
                className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-700/50 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold px-6 py-3 shadow-lg shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-60"
              >
                {submitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <PlusCircle className="w-5 h-5" />}
                Schedule Class
              </button>
            </div>
          </form>
        </div>

        <div className="xl:col-span-3 space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-400 font-semibold">Upcoming</p>
                <h3 className="text-xl font-semibold text-white mt-1">Scheduled Online Classes</h3>
              </div>
              <span className="text-xs text-slate-400">{onlineClassList.length} records</span>
            </div>

            {onlineClassList.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center text-slate-400">
                No online classes scheduled yet.
              </div>
            ) : (
              <div className="space-y-3">
                {onlineClassList.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-700 bg-slate-900/40 p-4">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-amber-400 font-semibold">
                          <BookOpen className="w-4 h-4" />
                          {item.class_name}{item.section ? `-${item.section}` : ''}
                        </div>
                        <h4 className="text-white font-semibold mt-2">{item.title}</h4>
                        <p className="text-slate-400 text-sm mt-1">{item.subject}</p>
                      </div>
                      <div className="text-sm text-slate-300 md:text-right">
                        <p>{formatShortDate(item.class_date)}</p>
                        <p className="text-slate-500 mt-1">{item.start_time} - {item.end_time}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
                      <a href={item.meeting_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200">
                        <Link2 className="w-4 h-4" />
                        Meeting Link
                      </a>
                      {item.description && <span className="text-slate-500">• {item.description}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-400 font-semibold">Timetable</p>
                <h3 className="text-xl font-semibold text-white mt-1">Weekly Schedule</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {DAYS.map(day => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${selectedDay === day ? 'bg-blue-600 text-white' : 'bg-slate-800/70 text-slate-400 hover:text-white'}`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {sortedSelectedDayItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center text-slate-400">
                No periods scheduled for {selectedDay}.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedSelectedDayItems.map((p: any) => (
                  <div key={p.id} className="rounded-2xl border border-slate-700 bg-slate-900/40 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-white font-semibold">{p.subject}</h4>
                        <p className="text-slate-400 text-sm mt-1">{p.class_name}</p>
                      </div>
                      <span className="text-xs text-slate-300 bg-white/5 border border-white/10 px-2 py-1 rounded-full">{p.room || 'Online'}</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                      <Clock className="w-4 h-4" />
                      {p.start_time} - {p.end_time}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
