"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { BrainCircuit, TrendingUp, AlertTriangle, Target, Lightbulb, Zap } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useApiData } from '@/hooks/useApiData';
import { SkeletonCard } from '@/components/LoadingSkeleton';

const EMPTY = {
  skillData: [],
  weeklyFocusData: [],
  insights: [],
};

function EmptyChart({ title, description }: { title: string; description: string }) {
  return (
    <div className="h-full rounded-2xl border border-dashed border-slate-700/70 bg-slate-900/30 flex items-center justify-center text-center px-6">
      <div>
        <p className="text-white font-semibold mb-1">{title}</p>
        <p className="text-slate-400 text-sm">{description}</p>
      </div>
    </div>
  );
}

export default function StudentAIInsights() {
  const { data: skillData, loading: loadingSkill } = useApiData('/student/ai-insights/skills', EMPTY.skillData);
  const { data: weeklyFocusData, loading: loadingFocus } = useApiData('/student/ai-insights/weekly-focus', EMPTY.weeklyFocusData);
  const insights = (skillData as any)?.insights || EMPTY.insights;

  return (
    <DashboardLayout role="student" title="AI Learning Insights">
      <div className="glass-card p-6 mb-8 border-l-4 border-l-cyan-500">
        <div className="flex items-center gap-3 mb-2">
          <BrainCircuit className="w-6 h-6 text-cyan-400" />
          <h2 className="text-2xl font-semibold text-white">Personalized AI Analysis</h2>
        </div>
        <p className="text-slate-400">Live student intelligence will appear here when backend analytics are available.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Skill Balance Radar</h3>
          <div className="h-80">
            {loadingSkill ? <div className="h-full flex items-center justify-center"><SkeletonCard /></div> : skillData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skillData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" />
                  <PolarRadiusAxis stroke="#475569" />
                  <Radar name="Current" dataKey="current" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Radar name="Target" dataKey="target" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                  <Legend />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart title="No skill analytics yet" description="Subject-wise skill data will appear here once the backend starts sending analytics." />
            )}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Weekly Focus Breakdown</h3>
          <div className="h-80">
            {loadingFocus ? <div className="h-full flex items-center justify-center"><SkeletonCard /></div> : weeklyFocusData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyFocusData}>
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }} />
                  <Legend />
                  <Bar dataKey="study" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="revision" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="quiz" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart title="No weekly focus data yet" description="Your study pattern report will populate here from live activity." />
            )}
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-3">
          <Target className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">Live Insights</h3>
        </div>
        {insights.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insights.map((item: any, idx: number) => (
              <div key={idx} className="glass-card p-6 border border-slate-700/60">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${item.bg} ${item.color}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <h4 className={`font-semibold ${item.color}`}>{item.title}</h4>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-700/70 bg-slate-900/30 p-6 text-center">
            <Lightbulb className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p className="text-white font-semibold mb-1">No AI insights yet</p>
            <p className="text-slate-400 text-sm">Complete more quizzes, homework and learning activity to generate live recommendations.</p>
          </div>
        )}
      </div>

      <div className="glass-card p-6 mt-6 border-l-4 border-l-red-500">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Attention Required</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              This section will display real live interventions when the analytics engine has enough data.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
