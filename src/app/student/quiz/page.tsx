"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { BrainCircuit, Database, ShieldCheck } from 'lucide-react';

export default function StudentAIQuiz() {
  return (
    <DashboardLayout role="student" title="AI Quiz">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="glass-card p-8 border-l-4 border-l-purple-500">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-purple-500/10 p-3 text-purple-300">
              <BrainCircuit className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">Quiz engine is waiting for the approved question bank</h2>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Student quizzes are intentionally disabled until class-scoped, approved questions are available. APEX will not grant students Paper Generator privileges or generate unverified exam content through an admin/teacher endpoint.
              </p>
            </div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="glass-card p-6">
            <Database className="h-6 w-6 text-cyan-400" />
            <h3 className="mt-3 font-semibold text-white">Required source</h3>
            <p className="mt-2 text-sm text-slate-400">Approved question bank mapped to the student&apos;s live class, subject, chapter, and topic.</p>
          </div>
          <div className="glass-card p-6">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
            <h3 className="mt-3 font-semibold text-white">Server-enforced scope</h3>
            <p className="mt-2 text-sm text-slate-400">The future quiz endpoint will derive class identity server-side rather than trusting a class selected by the browser.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
