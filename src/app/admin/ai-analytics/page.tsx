"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import api from '@/utils/api';
import {
  BrainCircuit, TrendingUp, TrendingDown, AlertTriangle, Users, GraduationCap,
  BookOpen, Zap, Target, BarChart3, Loader2, Award, Activity
} from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, Legend
} from 'recharts';

interface AIInsight {
  id: string;
  type: 'performance' | 'risk' | 'behavior' | 'recommendation';
  title: string;
  description: string;
  studentCount: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  subject?: string;
  grade?: string;
}

export default function AIAnalytics() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => { fetchInsights(); }, [timeRange]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/ai-analytics?range=${timeRange}`);
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setInsights(res.data.data);
      } else { console.error("API error"); }
    } catch (err) { console.error("Network error:", err); }
    finally { setLoading(false); }
  };

  

  const radarData = [
    { subject: 'Math', A: 85, B: 78, fullMark: 100 },
    { subject: 'Physics', A: 72, B: 68, fullMark: 100 },
    { subject: 'Chemistry', A: 80, B: 75, fullMark: 100 },
    { subject: 'Biology', A: 76, B: 82, fullMark: 100 },
    { subject: 'CS', A: 92, B: 88, fullMark: 100 },
    { subject: 'English', A: 88, B: 84, fullMark: 100 },
    { subject: 'Urdu', A: 90, B: 86, fullMark: 100 },
  ];

  const gradeData = [
    { grade: 'Grade 6', avg: 78, aiTarget: 80 },
    { grade: 'Grade 7', avg: 74, aiTarget: 78 },
    { grade: 'Grade 8', avg: 71, aiTarget: 75 },
    { grade: 'Grade 9', avg: 76, aiTarget: 78 },
    { grade: 'Grade 10', avg: 82, aiTarget: 80 },
    { grade: 'Grade 11', avg: 85, aiTarget: 82 },
    { grade: 'Grade 12', avg: 88, aiTarget: 85 },
  ];

  const typeConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
    performance: { icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Performance' },
    risk: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', label: 'Risk Alert' },
    behavior: { icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', label: 'Behavior' },
    recommendation: { icon: Zap, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', label: 'Recommendation' },
  };

  const severityColors: Record<string, string> = {
    low: 'text-emerald-400',
    medium: 'text-amber-400',
    high: 'text-orange-400',
    critical: 'text-red-400',
  };

  return (
    <DashboardLayout role="admin" title="AI Analytics & Insights">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 bg-opacity-20">
            <BrainCircuit className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">AI-Powered Insights</h3>
            <p className="text-slate-400 text-sm">Machine learning analysis of school data</p>
          </div>
        </div>
        <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 3 Months</option>
          <option value="1y">Last Year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-4">Subject Performance Radar</h3>
          <p className="text-slate-400 text-sm mb-4">Current Average vs AI Target</p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Radar name="Current Avg" dataKey="A" stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" fillOpacity={0.2} />
                <Radar name="AI Target" dataKey="B" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.1} />
                <Legend wrapperStyle={{ paddingTop: '1rem' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-4">Grade-Level Comparison</h3>
          <p className="text-slate-400 text-sm mb-4">Average scores by grade</p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="grade" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[60, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} />
                <Legend wrapperStyle={{ paddingTop: '1rem' }} />
                <Bar dataKey="avg" name="Current Avg" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={30} />
                <Bar dataKey="aiTarget" name="AI Target" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Insights Generated', value: 47, icon: BrainCircuit, color: 'from-cyan-500 to-blue-500' },
          { label: 'Predictions Accuracy', value: '91.2%', icon: Target, color: 'from-emerald-500 to-teal-500' },
          { label: 'At-Risk Detected', value: 23, icon: AlertTriangle, color: 'from-red-500 to-rose-500' },
          { label: 'Recommendations', value: 18, icon: Zap, color: 'from-amber-500 to-orange-500' },
        ].map((stat, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }} className="glass-card p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-20`}><stat.icon className="w-6 h-6 text-white" /></div>
            <div><p className="text-slate-400 text-xs font-medium">{stat.label}</p><p className="text-2xl font-bold text-white">{stat.value}</p></div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <h3 className="text-lg font-bold text-white mb-6">AI Generated Insights</h3>
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-cyan-400 animate-spin" /></div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight) => {
              const config = typeConfig[insight.type];
              const Icon = config.icon;
              return (
                <motion.div key={insight.id} whileHover={{ x: 4 }} className={`p-5 rounded-xl border ${config.bg} flex gap-4 items-start group cursor-pointer hover:shadow-lg transition-all`}>
                  <div className={`p-3 rounded-xl ${config.bg} ${config.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-bold text-sm">{insight.title}</h4>
                      <span className={`text-xs font-bold uppercase ${severityColors[insight.severity]}`}>{insight.severity}</span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed mb-2">{insight.description}</p>
                    <div className="flex gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {insight.studentCount} students</span>
                      {insight.grade && <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" /> {insight.grade}</span>}
                      {insight.subject && <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {insight.subject}</span>}
                    </div>
                  </div>
                  <TrendingUp className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
