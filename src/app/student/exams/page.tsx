"use client";

import DashboardLayout from '@/components/DashboardLayout';
import {PortalModuleHeading,PortalSubheading,PortalSupportNote} from '@/components/PortalModulePrimitives';
import {DataEmpty,DataError} from '@/components/PortalDashboardPrimitives';
import {fetchAvailableOnlineExams} from '@/lib/onlineExamService';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {ArrowUpRight,BookOpenText,Clock3,GraduationCap,RefreshCw} from 'lucide-react';

type ExamRow={id:number;title:string;subject?:string;class?:string;duration?:number;total_marks?:number;status?:string};
export default function StudentExamsPage(){
  const [exams,setExams]=useState<ExamRow[]>([]);
  const [classFilter,setClassFilter]=useState<string|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [reloadTick,setReloadTick]=useState(0);
  useEffect(()=>{
    let active=true;setLoading(true);setError('');
    fetchAvailableOnlineExams()
      .then(({exams:rows,meta})=>{
        if(!active)return;
        if(!Array.isArray(rows))throw new Error('Published exam records are unavailable.');
        setExams(rows.filter((row:ExamRow)=>Number.isInteger(Number(row.id))&&Number(row.id)>0));
        setClassFilter(meta?.classFilter||null);
      })
      .catch((err:any)=>{if(active){setError(err?.response?.data?.message||err?.message||'Could not load the published exams.');setExams([])}})
      .finally(()=>{if(active)setLoading(false)});
    return()=>{active=false};
  },[reloadTick]);
  return <DashboardLayout role="student" title="Online exams">
    <PortalModuleHeading eyebrow="LEARNING & ASSESSMENTS" title="Published examinations" description="Find assessments released for your own class by the school. Exam access remains controlled by the server."
      actions={<button type="button" onClick={()=>setReloadTick(t=>t+1)} className="cw-module-secondary"><RefreshCw size={15}/> Refresh exams</button>}/>
    {classFilter&&<div className="mb-5"><PortalSupportNote>Showing published examinations scoped to {classFilter}, including any school-wide papers that your account is allowed to access.</PortalSupportNote></div>}
    {error&&<div className="mb-5"><DataError message={error} onRetry={()=>setReloadTick(t=>t+1)}/></div>}
    <section className="cw-card"><PortalSubheading eyebrow="YOUR EXAM SPACE" title="Available papers" description="Select a published paper when you are ready. Always read its actual timing and submission instructions before starting."/>
      {loading?<div role="status" aria-label="Loading published examinations" className="grid gap-3 sm:grid-cols-2">{[1,2,3,4].map(x=><div key={x} className="h-[157px] animate-pulse rounded-[15px] bg-[#f2f0f7]"/>)}</div>:
      error?<div className="cw-empty"><BookOpenText size={24} color="var(--cw-accent)"/><strong>Exam list is temporarily unavailable</strong><p>Please retry later. Server errors are not interpreted as zero published papers.</p></div>:
      !exams.length?<DataEmpty title="No published exams at the moment" description="New class-scoped assessments will appear here when a teacher publishes them."/>:
      <div className="grid gap-3 sm:grid-cols-2">{exams.map(exam=>{
        const duration=Number(exam.duration);
        const marks=Number(exam.total_marks);
        return <Link key={exam.id} href={`/student/online-test/${exam.id}`} className="group flex flex-col justify-between rounded-[16px] border border-[#e4e0ee] bg-gradient-to-br from-white to-[#faf8fd] p-5 text-[#342f42] no-underline transition hover:-translate-y-0.5 hover:border-[#bcb0d8] hover:shadow-[0_12px_26px_#382d5210] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#6c55a0]">
          <div><div className="flex items-start justify-between gap-3"><span className="grid h-10 w-10 place-items-center rounded-[11px] bg-[#f0eafa] text-[#6b5297]"><BookOpenText size={19}/></span><span className="rounded-full border border-[#ded4ed] bg-[#f2ecfb] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide text-[#66508c]">Published</span></div><h3 className="mt-4 font-serif text-[19px] font-semibold tracking-[-.025em] text-[#332d41] group-hover:text-[#644d92]">{exam.title||'School examination'}</h3><p className="mt-1 text-[12px] text-[#625a70]">{[exam.subject,exam.class].filter(Boolean).join(' · ')||'Class-scoped examination'}</p></div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#ece6f3] pt-4"><div className="flex flex-wrap gap-3 text-[11px] font-semibold text-[#62576d]"><span className="inline-flex items-center gap-1"><Clock3 size={14}/>{Number.isFinite(duration)&&duration>0?`${duration} minutes`:'See exam instructions'}</span><span className="inline-flex items-center gap-1"><GraduationCap size={14}/>{Number.isFinite(marks)&&marks>0?`${marks} marks`:'Marks in paper'}</span></div><span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#695098]">Open paper <ArrowUpRight size={15}/></span></div>
        </Link>;
      })}</div>}
    </section>
  </DashboardLayout>;
}
