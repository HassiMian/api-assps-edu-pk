"use client";

import DashboardLayout from '@/components/DashboardLayout';
import {PortalModuleHeading,PortalSubheading,PortalSupportNote} from '@/components/PortalModulePrimitives';
import {DataEmpty,DataError} from '@/components/PortalDashboardPrimitives';
import {useApiData} from '@/hooks/useApiData';
import {CalendarCheck,RefreshCw,Users,ClipboardCheck,FileText} from 'lucide-react';
import {useEffect,useState} from 'react';
import api from '@/utils/api';

type Breakdown={name:string;value:number};
type Snapshot={stats?:{totalStudents?:number;presentCount?:number;absentCount?:number;leaveCount?:number;attPct?:number};attendanceBreakdown?:Breakdown[]};
type ExamNotification={id:number;title?:string;message?:string;time?:string;type?:string;metadata?:{pct?:number;grade?:string}};
const EMPTY:Snapshot={stats:{},attendanceBreakdown:[]};

export default function ParentReports(){
  const {data:dashboard,loading,error,refetch}=useApiData<Snapshot>('/portal/dashboard',EMPTY);
  const stats=dashboard?.stats||{};
  const breakdown=Array.isArray(dashboard?.attendanceBreakdown)?dashboard.attendanceBreakdown:[];
  const recordedCount=breakdown.reduce((total,row)=>total+Math.max(0,Number(row.value)||0),0);
  const hasAttendance=!loading&&!error&&recordedCount>0;
  const [examResults,setExamResults]=useState<ExamNotification[]>([]);
  const [loadingExams,setLoadingExams]=useState(true);
  const [noticeError,setNoticeError]=useState('');
  const [noticeTick,setNoticeTick]=useState(0);
  useEffect(()=>{
    let mounted=true;
    setLoadingExams(true);setNoticeError('');
    api.get('/notify/inbox')
      .then(res=>{
        if(!mounted)return;
        if(!res.data?.success||!Array.isArray(res.data?.data))throw new Error('The result inbox was unavailable.');
        setExamResults(res.data.data.filter((item:ExamNotification)=>item.type==='exam_result').slice(0,8));
      })
      .catch((err:any)=>{if(mounted)setNoticeError(err?.response?.data?.message||err?.message||'School exam notices could not be loaded.');})
      .finally(()=>{if(mounted)setLoadingExams(false)});
    return()=>{mounted=false};
  },[noticeTick]);
  const schoolCount=!loading&&!error&&Number.isFinite(Number(stats.totalStudents))?String(stats.totalStudents):'—';
  const attPercent=hasAttendance&&Number.isFinite(Number(stats.attPct))?`${stats.attPct}%`:'—';
  return <DashboardLayout role="parent" title="School reports">
    <PortalModuleHeading eyebrow="FAMILY LEARNING RECORD" title="Reports and updates" description="Your children's linked school information in a thoughtful, readable format. Only verified progress and saved attendance are displayed."
      actions={<button type="button" onClick={()=>{refetch();setNoticeTick(t=>t+1)}} className="cw-module-secondary"><RefreshCw size={15}/> Refresh reports</button>}/>
    <div className="mb-6"><PortalSupportNote>Automated academic predictions are not shown without sufficient approved assessment evidence. Missing attendance must never appear as a fabricated 0% result.</PortalSupportNote></div>
    {error&&<div className="mb-5"><DataError message={error} onRetry={refetch}/></div>}
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {[
        {label:'LINKED CHILDREN',value:schoolCount,icon:Users,note:'Your linked school accounts'},
        {label:'ATTENDANCE RATE',value:attPercent,icon:CalendarCheck,note:hasAttendance?'From saved records':'Awaiting marked attendance'},
        {label:'MARKED ENTRIES',value:hasAttendance?recordedCount:'—',icon:ClipboardCheck,note:'Verified recorded entries only'},
      ].map(item=><article key={item.label} className="cw-metric"><div className="flex justify-between items-start gap-2"><span className="cw-metric-label">{item.label}</span><span className="cw-action-icon"><item.icon size={18}/></span></div><div className="cw-metric-value mt-2 tabular-nums">{loading?'…':item.value}</div><p className="cw-metric-note mt-1">{item.note}</p></article>)}
    </div>
    <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[.85fr_1.15fr]">
      <section className="cw-card"><PortalSubheading eyebrow="ACTUAL ATTENDANCE" title="School attendance" description="Only dates and statuses that have been marked by the school count here."/>
        {loading?<div className="h-36 animate-pulse rounded-xl bg-[#f1f5f1]"/>:error?<DataEmpty title="Unable to show attendance" description="Please retry after the live school data is available."/>:!hasAttendance?<DataEmpty title="Attendance not available yet" description="Once the school saves attendance, your child's real recorded breakdown appears here."/>:
        <div className="space-y-4">{breakdown.filter(row=>Number(row.value)>0).map((row,i)=>{
          const pct=Math.round(Math.max(0,Number(row.value)||0)/recordedCount*100);
          return <div key={`${row.name}-${i}`}><div className="flex items-center justify-between gap-3 text-[12px] font-semibold text-[#3b5c52]"><span>{row.name}</span><span className="tabular-nums">{row.value} · {pct}%</span></div><div className="mt-2 h-2 rounded-full overflow-hidden bg-[#e4f0ec]"><div className="h-full rounded-full bg-[var(--cw-accent)]" style={{width:`${pct}%`}}/></div></div>;
        })}</div>}
      </section>
      <section className="cw-card"><PortalSubheading eyebrow="SCHOOL VERIFIED" title="Online examination notices" description="Results shared by the school for the children attached to your family record."/>
        {loadingExams?<div className="space-y-3" role="status" aria-label="Loading exam results"><div className="h-20 animate-pulse rounded-xl bg-[#f1f4f1]"/><div className="h-20 animate-pulse rounded-xl bg-[#f1f4f1]"/></div>:
        noticeError?<DataError message={noticeError} onRetry={()=>setNoticeTick(t=>t+1)}/>:
        !examResults.length?<DataEmpty title="No examination notices yet" description="Approved online results will appear once the school issues them for your linked children."/>:
        <div className="space-y-3">{examResults.map(item=><article key={item.id} className="rounded-[13px] border border-[#dce8e3] bg-[#fbfdfb] p-4"><div className="flex flex-wrap items-start gap-3 justify-between"><div className="min-w-0"><h3 className="text-[13px] font-bold text-[#2d4a43]">{item.title||'Exam result notice'}</h3>{item.message&&<p className="mt-2 text-[12px] leading-6 text-[#516c62]">{item.message}</p>}</div>{item.metadata?.grade&&<span className="rounded-full border border-[#d7e8e1] bg-[#e8f5f0] px-3 py-1.5 text-[11px] font-bold text-[#26736c]">{item.metadata.grade}{Number.isFinite(Number(item.metadata.pct))?` · ${item.metadata.pct}%`:''}</span>}</div>{item.time&&<p className="mt-3 text-[10px] text-[#60786e]">{item.time}</p>}</article>)}</div>}
      </section>
    </div>
    <div className="mt-6 rounded-[15px] border border-[#dce8e3] bg-[#f6fbf9] p-4"><div className="flex items-start gap-3"><FileText size={19} className="mt-0.5 shrink-0 text-[#28766e]"/><p className="text-[12px] leading-6 text-[#4c6c61]">For detailed academic decisions or discrepancies in records, please contact the school. This report page does not invent grades, future performance, or recommendations.</p></div></div>
  </DashboardLayout>;
}
