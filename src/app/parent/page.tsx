"use client";
import DashboardLayout from '@/components/DashboardLayout';
import {PortalHero,MetricCard,ModuleAction,DataEmpty,DataError,DashboardSection} from '@/components/PortalDashboardPrimitives';
import {Bell,CalendarCheck,ChartNoAxesCombined,CreditCard,FileText,GraduationCap,Users,ShieldCheck} from 'lucide-react';
import {useAuth} from '@/context/AuthContext';
import {useApiData} from '@/hooks/useApiData';

type Breakdown={name:string;value:number};
type Notice={id?:number;title?:string;message?:string;created_at?:string;issued_by?:string};
type ParentDashboardData={stats:{totalStudents?:number;presentCount?:number;pendingCount?:number;attPct?:number};attendanceBreakdown:Breakdown[];recentNotices:Notice[]};
const EMPTY:ParentDashboardData={stats:{},attendanceBreakdown:[],recentNotices:[]};
const actions=[
 {label:'Fees & payments',description:'View household fee records',href:'/parent/finance',icon:CreditCard},
 {label:'Child progress',description:'School-linked academic insights',href:'/parent/ai-insights',icon:ChartNoAxesCombined},
 {label:'School reports',description:'Check available updates',href:'/parent/reports',icon:FileText},
];
export default function ParentDashboard(){
 const {user}=useAuth();const {data,loading,error,refetch}=useApiData<ParentDashboardData>('/portal/dashboard',EMPTY);
 const stats=data?.stats||{};const notices=Array.isArray(data?.recentNotices)?data.recentNotices:[];
 const attendance=Array.isArray(data?.attendanceBreakdown)?data.attendanceBreakdown:[];const attCount=attendance.reduce((s,x)=>s+Number(x.value||0),0);
 const value=(n:unknown,available=true)=>!loading&&!error&&available&&Number.isFinite(Number(n))?String(n):'—';
 const firstName=String(user?.name||'Parent').trim().split(/\s+/)[0];
 return <DashboardLayout role="parent" title="Overview">
  <PortalHero eyebrow="YOUR FAMILY CONNECTION" title={`Welcome, ${firstName}.`} description="A thoughtful view of your children's learning, attendance, fees and school communications—all linked to your own family record." action={{label:'View child progress',href:'/parent/ai-insights'}}/>
  {error&&<div className="mt-5"><DataError message={error} onRetry={refetch}/></div>}
  <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
   <MetricCard label="Linked children" value={value(stats.totalStudents)} note="Your linked school profiles" icon={Users}/>
   <MetricCard label="Present today" value={value(stats.presentCount,attCount>0)} note="When today's roll is saved" icon={CalendarCheck}/>
   <MetricCard label="Pending fees" value={value(stats.pendingCount)} note="Household fee records only" icon={CreditCard}/>
   <MetricCard label="Attendance" value={!loading&&!error&&attCount>0?`${stats.attPct??'—'}%`:'—'} note="From marked records" icon={ChartNoAxesCombined}/>
  </div>
  <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_.9fr]">
   <DashboardSection eyebrow="FAMILY SHORTCUTS" title="Everything in one place" description="Essential school information without unnecessary financial or school-wide charts."><div className="space-y-3">{actions.map(action=><ModuleAction {...action} key={action.href}/>)}</div><p className="mt-5 rounded-xl border border-[#DCEAE5] bg-[#F6FBF9] px-4 py-3 text-[12px] leading-6 text-[#466B63]"><ShieldCheck size={16} className="mr-2 inline-block"/>Your household information is protected by your linked parent account.</p></DashboardSection>
   <DashboardSection eyebrow="TODAY AT SCHOOL" title="Attendance overview" description="Attendance is shown only for records belonging to your family.">{loading?<div className="h-36 animate-pulse rounded-xl bg-[#F1F2ED]"/>:attCount>0?<div className="space-y-4">{attendance.filter(x=>Number(x.value)>0).map((row,i)=>{const percentage=Math.round(Number(row.value)/attCount*100);return <div key={`${row.name}-${i}`}><div className="flex justify-between text-[12px] font-semibold text-[#344239]"><span>{row.name}</span><span>{row.value} · {percentage}%</span></div><div className="mt-2 h-2 rounded-full overflow-hidden bg-[#E5EFEC]"><div className="h-full rounded-full bg-[var(--cw-accent)]" style={{width:`${percentage}%`}}/></div></div>})}</div>:<DataEmpty title="No attendance recorded yet" description="You'll see real attendance figures after the school's register has been saved."/>}</DashboardSection>
  </div>
  <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_.9fr]">
   <DashboardSection eyebrow="STAY INFORMED" title="School notices" description="Relevant announcements from the school.">{loading?<div className="h-28 animate-pulse rounded-xl bg-[#F1F2ED]"/>:notices.length?<div className="space-y-3">{notices.slice(0,4).map((n,i)=><article key={n.id??i} className="rounded-xl border border-[#E6E8E1] bg-[#FBFCFA] p-4"><strong className="block text-[13px] text-[#2D3B32]">{n.title||'School update'}</strong>{n.message&&<p className="mt-1 text-[12px] leading-6 text-[#55665A]">{n.message}</p>}</article>)}</div>:<DataEmpty title="No new announcements" description="Any relevant school notices will appear here."/>}</DashboardSection>
   <DashboardSection eyebrow="CONTACT WITH CARE" title="Questions for school?" description="A dependable support experience should never claim a message was sent when no backend record exists."><div className="cw-empty"><Bell size={24} color="var(--cw-accent)"/><strong>School communication</strong><p>For a concern requiring a formal response, contact the school administration directly. An in-app complaint form will be enabled only after its secure submission and receipt API are implemented.</p></div></DashboardSection>
  </div>
 </DashboardLayout>;
}
