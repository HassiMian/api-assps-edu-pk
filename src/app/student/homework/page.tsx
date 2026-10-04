"use client";

import DashboardLayout from '@/components/DashboardLayout';
import {PortalModuleHeading,PortalSupportNote} from '@/components/PortalModulePrimitives';
import {DataEmpty} from '@/components/PortalDashboardPrimitives';
import {BookOpenText,FileQuestion,GraduationCap,ArrowUpRight,ShieldCheck} from 'lucide-react';
import Link from 'next/link';

/** Homework feed stays unavailable until the school exposes a real scoped endpoint.
 * No simulated conversation, fabricated assignment or delayed bot response. */
export default function StudentHomework(){
  return <DashboardLayout role="student" title="My homework">
    <PortalModuleHeading eyebrow="YOUR STUDY SPACE" title="Homework workspace" description="Your school-assigned learning tasks and guided support, with clarity about what has actually been connected."/>
    <div className="mb-6"><PortalSupportNote>The live assignment feed has not yet been connected to APEX Connect. No homework is invented, and the page does not simulate a successful AI conversation.</PortalSupportNote></div>
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.12fr_.88fr]">
      <section className="cw-card min-h-[290px]"><div className="flex items-start justify-between gap-3"><div><p className="cw-eyebrow">ASSIGNED WORK</p><h2 className="cw-card-title mt-2">My assignments</h2><p className="cw-card-description mt-2">This panel will show homework only after a teacher publishes it against your school-linked class.</p></div><span className="cw-action-icon"><BookOpenText size={20}/></span></div><div className="mt-6"><DataEmpty title="Homework feed is not connected yet" description="Ask your teacher for the current diary or written homework until the school's assignment endpoint becomes available."/></div></section>
      <section className="cw-card"><p className="cw-eyebrow">STUDY SUPPORT</p><h2 className="cw-card-title mt-2">Get ready to learn</h2><div className="mt-5 space-y-3"><div className="flex gap-3 rounded-xl border border-[#e8e2f0] bg-[#fcfaff] p-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] bg-[#f0eafa] text-[#69539a]"><FileQuestion size={19}/></span><div><strong className="block text-[12px] text-[#3d3450]">Assignment-specific guidance</strong><p className="mt-1 text-[11px] leading-5 text-[#62566f]">Once integrated, explanations can be linked to real teacher-approved tasks rather than arbitrary automated messages.</p></div></div><div className="flex gap-3 rounded-xl border border-[#e8e2f0] bg-[#fcfaff] p-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] bg-[#f0eafa] text-[#69539a]"><ShieldCheck size={19}/></span><div><strong className="block text-[12px] text-[#3d3450]">Your school record stays protected</strong><p className="mt-1 text-[11px] leading-5 text-[#62566f]">Only work assigned to your authenticated class should become available here.</p></div></div></div><Link href="/student/exams" className="cw-action mt-5"><span className="cw-action-icon"><GraduationCap size={19}/></span><span className="flex-1 min-w-0"><strong className="cw-action-label block">Available school exams</strong><small className="cw-action-description block">Open genuine published assessments</small></span><ArrowUpRight size={16} color="var(--cw-accent)"/></Link></section>
    </div>
  </DashboardLayout>;
}
