"use client";
import DashboardLayout from '@/components/DashboardLayout';
import {PortalHero,MetricCard,ModuleAction,DataEmpty,DataError,DashboardSection} from '@/components/PortalDashboardPrimitives';
import {BookOpenText,BrainCircuit,CalendarCheck,ClipboardCheck,GraduationCap,Lightbulb,Star,TrendingUp,FileText} from 'lucide-react';
import {useAuth} from '@/context/AuthContext';
import {useApiData} from '@/hooks/useApiData';

type Breakdown={name:string;value:number};
type Notice={id?:number;title?:string;message?:string;created_at?:string;issued_by?:string};
type Dashboard={stats:{totalStudents?:number;presentCount?:number;attPct?:number};attendanceBreakdown:Breakdown[];recentNotices:Notice[]};
const EMPTY:Dashboard={stats:{},attendanceBreakdown:[],recentNotices:[]};
const actions=[
 {label:'Practice with a quiz',description:'Explore available questions',href:'/student/quiz',icon:BrainCircuit},
 {label:'Online exams',description:'View your assessment space',href:'/student/exams',icon:GraduationCap},
 {label:'My homework',description:'Check assigned learning work',href:'/student/homework',icon:BookOpenText},
 {label:'Skills & progress',description:'Follow your learning journey',href:'/student/skills',icon:Star},
];
export default function StudentDashboard(){
 const {user}=useAuth();const {data,loading,error,refetch}=useApiData<Dashboard>('/portal/dashboard',EMPTY);
 const records=Array.isArray(data?.attendanceBreakdown)?data.attendanceBreakdown:[];
 const attendanceRecords=records.reduce((sum,x)=>sum+Number(x.value||0),0);
 const notices=Array.isArray(data?.recentNotices)?data.recentNotices:[];
 const value=(n:unknown,condition=true)=>!loading&&!error&&condition&&Number.isFinite(Number(n))?String(n):'—';
 const firstName=String(user?.name||'Scholar').trim().split(/\s+/)[0];
 return <DashboardLayout role="student" title="Overview">
  <PortalHero eyebrow="YOUR LEARNING STUDIO" title={`Keep discovering, ${firstName}.`} description="A bright place for your homework, quizzes and school updates. Take the next step at your own pace." action={{label:'Open practice quiz',href:'/student/quiz'}}/>
  {error&&<div className="mt-5"><DataError message={error} onRetry={refetch}/></div>}
  <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
   <MetricCard label="My profiles" value={value(data?.stats?.totalStudents)} note="School-linked learning record" icon={GraduationCap}/>
   <MetricCard label="Present today" value={value(data?.stats?.presentCount,attendanceRecords>0)} note="From recorded attendance" icon={CalendarCheck}/>
   <MetricCard label="Attendance rate" value={!loading&&!error&&attendanceRecords>0?`${data?.stats?.attPct??'—'}%`:'—'} note="Only after attendance is marked" icon={TrendingUp}/>
   <MetricCard label="School notices" value={!loading&&!error?String(notices.length):'—'} note="Latest available announcements" icon={FileText}/>
  </div>
  <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_.9fr]">
   <DashboardSection eyebrow="YOUR NEXT STEP" title="Explore your learning" description="Everything you need for the school day, without unnecessary distractions."><div className="grid gap-3 sm:grid-cols-2">{actions.map(action=><ModuleAction key={action.href} {...action}/>)}</div></DashboardSection>
   <DashboardSection eyebrow="TODAY'S PICTURE" title="My attendance" description="Live information from your linked school record.">
    {loading?<div className="h-36 animate-pulse rounded-xl bg-[#F1F2ED]"/>:attendanceRecords>0?<div className="space-y-4">{records.filter(x=>Number(x.value)>0).map((row,i)=>{const percentage=Math.round(Number(row.value)/attendanceRecords*100);return <div key={`${row.name}-${i}`}><div className="flex justify-between text-[12px] font-semibold text-[#344239]"><span>{row.name}</span><span>{row.value} · {percentage}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#EFEDEB]"><div className="h-full rounded-full bg-[var(--cw-accent)]" style={{width:`${percentage}%`}}/></div></div>})}</div>:<DataEmpty title="Attendance not recorded yet" description="Once school attendance is entered, your real record will be displayed here."/>}
   </DashboardSection>
  </div>
  <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_.9fr]">
   <DashboardSection eyebrow="FROM SCHOOL" title="Announcements" description="Updates relevant to your school account.">{loading?<div className="h-28 animate-pulse rounded-xl bg-[#F1F2ED]"/>:notices.length?<div className="space-y-3">{notices.slice(0,4).map((item,i)=><article key={item.id??i} className="rounded-xl border border-[#E6E8E1] bg-[#FBFCFA] p-4"><h3 className="text-[13px] font-bold text-[#2D3B32]">{item.title||'School notice'}</h3>{item.message&&<p className="mt-2 text-[12px] leading-6 text-[#56665B]">{item.message}</p>}</article>)}</div>:<DataEmpty title="You're up to date" description="Any relevant announcements will appear here."/>}</DashboardSection>
   <DashboardSection eyebrow="KEEP GROWING" title="Learning insights" description="Only verified assessment information belongs here."><div className="cw-empty"><Lightbulb size={23} color="var(--cw-accent)"/><strong>Progress analytics are being connected</strong><p>Your real subject scores and achievement trends will appear when the assessments API provides them. No invented ranks or streaks.</p></div></DashboardSection>
  </div>
 </DashboardLayout>;
}
