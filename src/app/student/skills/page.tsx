"use client";

import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { Award, BrainCircuit, ShieldCheck } from 'lucide-react';

export default function StudentSkills() {
  return (
    <DashboardLayout role="student" title="Skill Mastery Dashboard">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="glass-card p-8 border-l-4 border-l-cyan-500">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-300">
              <BrainCircuit className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">Live skill analytics are not connected yet</h2>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                APEX will not invent scores, badges, weak topics, XP, or trends. This screen will populate only after validated quiz, homework, and assessment evidence is available for your account.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="glass-card p-6">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
            <h3 className="mt-3 font-semibold text-white">No fabricated performance data</h3>
            <p className="mt-2 text-sm text-slate-400">Only live, student-scoped backend evidence will be used.</p>
          </div>
          <div className="glass-card p-6">
            <Award className="h-6 w-6 text-amber-400" />
            <h3 className="mt-3 font-semibold text-white">Achievements pending</h3>
            <p className="mt-2 text-sm text-slate-400">Badges will appear when achievement rules and activity tracking are live.</p>
          </div>
        </div>

        <Link href="/student/ai-insights" className="inline-flex rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-200 hover:bg-cyan-500/15">
          Open AI Insights status
        </Link>
      </div>
    </DashboardLayout>
  );
}
