"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { BrainCircuit, TrendingUp, AlertTriangle, Target, Lightbulb, Users } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useApiData } from '@/hooks/useApiData';
import { SkeletonCard } from '@/components/LoadingSkeleton';

const EMPTY = {
  skillData: [],
  growthData: [],
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

export default function ParentAIInsights() {
  const { data: skillData, loading: loadingSkill } = useApiData('/parent/ai-insights/skills', EMPTY.skillData);
  const { data: growthData, loading: loadingGrowth } = useApiData('/parent/ai-insights/growth', EMPTY.growthData);

  return (
    <DashboardLayout role="parent" title="AI Child Insights">
      <div className="glass-card p-6 mb-8 border-l-4 border-l-cyan-500">
        <div className="flex items-center gap-3 mb-2">
          <BrainCircuit className="w-6 h-6 text-cyan-400" />
          <h2 className="text-2xl font-semibold text-white">Live Progress Report</h2>
        </div>
        <p className="text-slate-400">Real child performance analytics will appear here when backend data is available.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Performance vs Class Average</h3>
          <div className="h-80">
            {loadingSkill ? <div className="h-full flex items-center justify-center"><SkeletonCard /></div> : skillData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skillData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" />
                  <PolarRadiusAxis stroke="#475569" />
                  <Radar name="Current" dataKey="current" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Radar name="Average" dataKey="average" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
                  <Legend />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart title="No skill comparison yet" description="Performance comparison will appear once the analytics backend provides live data." />
            )}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Grade Growth Trajectory</h3>
          <div className="h-80">
            {loadingGrowth ? <div className="h-full flex items-center justify-center"><SkeletonCard /></div> : growthData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthData}>
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" domain={[0, 100]} />
                  <Tooltip cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }} />
                  <Legend />
                  <Bar dataKey="current" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="average" fill="#64748b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart title="No growth data yet" description="Growth trajectory charts will appear when backend analytics are ready." />
            )}
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-3">
          <Target className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">Live Guidance</h3>
        </div>
        <div className="rounded-2xl border border-dashed border-slate-700/70 bg-slate-900/30 p-6 text-center">
          <Lightbulb className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-white font-semibold mb-1">No AI guidance yet</p>
          <p className="text-slate-400 text-sm">Complete more learning activity to generate live parent recommendations.</p>
        </div>
      </div>

      <div className="glass-card p-6 mt-6 border-l-4 border-l-red-500">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Attention Required</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              This area is reserved for live intervention notices and will update only when the backend has real data.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
