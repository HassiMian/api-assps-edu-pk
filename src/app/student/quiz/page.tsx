"use client";

import DashboardLayout from '@/components/DashboardLayout';
import {PortalModuleHeading,PortalSupportNote} from '@/components/PortalModulePrimitives';
import {DataEmpty} from '@/components/PortalDashboardPrimitives';
import {GraduationCap,ShieldCheck,ArrowUpRight} from 'lucide-react';
import Link from 'next/link';

export default function StudentAIQuiz(){
  return <DashboardLayout role="student" title="Practice quiz">
    <PortalModuleHeading eyebrow="PRACTICE SPACE" title="Quiz studio" description="A calmer place for class-aligned practice, with questions drawn only from material the school has approved."/>
    <div className="mb-6"><PortalSupportNote>The student quiz service is waiting for an approved, class-linked Question Bank endpoint. It will not display invented questions or grant students teacher-only Paper Generator access.</PortalSupportNote></div>
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.15fr_.85fr]">
      <section className="cw-card flex min-h-[285px] flex-col"><div className="cw-eyebrow">PRACTICE AVAILABILITY</div><h2 className="cw-card-title mt-3">Your quiz library</h2><div className="mt-5 flex-1"><DataEmpty title="No approved quiz available yet" description="When the school connects questions for your actual class, chapter and topic, new practice activities will appear here."/></div></section>
      <section className="cw-card"><div className="cw-eyebrow">IN THE MEANTIME</div><h2 className="cw-card-title mt-3">Continue with school work</h2><p className="cw-card-description mt-3">Published online exams are separate from AI practice and may already be available for your assigned class.</p><Link href="/student/exams" className="cw-action mt-6"><span className="cw-action-icon"><GraduationCap size={19}/></span><span className="min-w-0 flex-1"><strong className="cw-action-label block">Published exams</strong><small className="cw-action-description block">View your real available papers</small></span><ArrowUpRight size={16} color="var(--cw-accent)"/></Link><div className="mt-5 flex items-start gap-3 rounded-[13px] border border-[#e5e0ef] bg-[#faf8fd] p-4"><ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#69539a]"/><p className="text-[12px] leading-6 text-[#625772]">Practice will respect your actual class and school access rules. It will not invent assessment marks or rank you against other students.</p></div></section>
    </div>
  </DashboardLayout>;
}
