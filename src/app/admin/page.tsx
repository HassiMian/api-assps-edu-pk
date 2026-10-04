"use client";
import DashboardLayout from '@/components/DashboardLayout';
import {PortalHero,MetricCard,ModuleAction,DataEmpty,DataError,DashboardSection} from '@/components/PortalDashboardPrimitives';
import {
  Activity,BookOpen,Bus,CalendarDays,ClipboardCheck,CreditCard,FileText,
  GraduationCap,Library,Megaphone,RefreshCw,School,Settings2,ShieldCheck,
  UserRoundPlus,Users,ChartNoAxesCombined,
} from 'lucide-react';
import {useAuth} from '@/context/AuthContext';
import api from '@/utils/api';
import {useCallback,useEffect,useState} from 'react';

type AdminSnapshot={
 stats?:{totalStudents?:number;totalTeachers?:number;monthlyRevenue?:number;attendanceRate?:number};
 today_total?:number;today_present?:number;today_absent?:number;today_late?:number;today_leave?:number;today_pct?:number;
 total_employees?:number;admissions_this_month?:number;fee_pending_count?:number;
 weekly_attendance?:Array<{day:string;present:number;total:number;percent:number}>;
 fee_status?:{collected?:number;pending?:number;overdue?:number};
};
const modules=[
 {label:'Students',description:'Records & enrolment',href:'/admin/students',icon:GraduationCap},
 {label:'Employees',description:'Staff & class assignments',href:'/admin/employees',icon:Users},
 {label:'Admissions',description:'New student enquiries',href:'/admin/admissions',icon:UserRoundPlus},
 {label:'Attendance',description:'Daily school register',href:'/admin/attendance',icon:ClipboardCheck},
 {label:'Finance',description:'School fee operations',href:'/admin/finance',icon:CreditCard},
 {label:'Classes',description:'Manage academic groups',href:'/admin/classes',icon:School},
 {label:'Events',description:'School calendar',href:'/admin/events',icon:CalendarDays},
 {label:'Notices',description:'Communications',href:'/admin/announcements',icon:Megaphone},
 {label:'Reports',description:'School insights',href:'/admin/ai-analytics',icon:ChartNoAxesCombined},
 {label:'Users & access',description:'Portal identities',href:'/admin/users',icon:ShieldCheck},
 {label:'Library',description:'School resources',href:'/admin/library',icon:Library},
 {label:'Transport',description:'Travel operations',href:'/admin/transport',icon:Bus},
];
const safeNum=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)?v:Number.isFinite(Number(v))&&v!==undefined&&v!==null?Number(v):null;
export default function AdminDashboard(){
 const {user}=useAuth();
 const [snapshot,setSnapshot]=useState<AdminSnapshot|null>(null);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const reload=useCallback(async()=>{setLoading(true);setError('');try{const res=await api.get('/dashboard/stats',{timeout:15000});if(!res.data?.success)throw Error('School dashboard could not be loaded.');setSnapshot({...res.data,...(res.data.data||{}),stats:res.data.data?.stats||{}});}catch(e:any){setError(e?.response?.data?.message||e?.message||'Unable to load live school data.');setSnapshot(null);}finally{setLoading(false)}},[]);
 useEffect(()=>{reload()},[reload]);
 const metric=(n:unknown,suffix='')=>loading||error?'—':safeNum(n)===null?'—':`${safeNum(n)?.toLocaleString('en-PK')}${suffix}`;
 const stats=snapshot?.stats||{};
 const weekly=Array.isArray(snapshot?.weekly_attendance)?snapshot.weekly_attendance:[];
 const recorded=(snapshot?.today_total??0)>0;
 const name=String(user?.name||'Administrator').trim().split(/\s+/)[0];
 return <DashboardLayout role="admin" title="School overview">
  <PortalHero eyebrow="APEX SCHOOL OPERATIONS" title={`Your school at a glance, ${name}.`} description="A clear, trustworthy control centre for student records, faculty, attendance and daily school operations—without decorative data or unnecessary noise." action={{label:'Manage students',href:'/admin/students'}}/>
  {error&&<div className="mt-5"><DataError message={error} onRetry={reload}/></div>}
  <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
   <MetricCard label="Active students" value={metric(stats.totalStudents)} note="From live school records" icon={GraduationCap}/>
   <MetricCard label="Active employees" value={metric(snapshot?.total_employees??stats.totalTeachers)} note="Current staff register" icon={Users}/>
   <MetricCard label="Today's attendance" value={recorded?metric(snapshot?.today_pct,'%'):'—'} note={recorded ? "Percentage of marked students" : "Awaiting today’s attendance"} icon={Activity}/>
   <MetricCard label="Admissions this month" value={metric(snapshot?.admissions_this_month)} note="This month's records" icon={UserRoundPlus}/>
  </div>
  <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_.9fr]">
   <DashboardSection eyebrow="SCHOOL AT WORK" title="Essential operations" description="Direct access to each live school module; no decorative statistics."><div className="grid gap-3 sm:grid-cols-2">{modules.slice(0,8).map(mod=><ModuleAction key={mod.href} {...mod}/>)}</div></DashboardSection>
   <DashboardSection eyebrow="TODAY'S REGISTER" title="Attendance status" description="The overview reflects saved attendance only—not assumed presence.">
    {loading?<div className="h-32 rounded-xl bg-[#F2F3F0] animate-pulse"/>:recorded?<div className="space-y-3">{[
      {label:'Present',value:snapshot?.today_present??0},{label:'Absent',value:snapshot?.today_absent??0},
      {label:'Late',value:snapshot?.today_late??0},{label:'Leave',value:snapshot?.today_leave??0},
    ].map(row=><div key={row.label} className="flex items-center justify-between rounded-xl border border-[#E7E9E3] bg-[#FBFCF9] px-4 py-3 text-[12px]"><span className="font-semibold text-[#526455]">{row.label}</span><strong className="tabular-nums text-[#253B2B]">{row.value}</strong></div>)}</div>:<DataEmpty title="Awaiting attendance" description="No saved marks for today yet. Open the register when the school is ready."/>}
    <a href="/admin/attendance" className="cw-secondary-button mt-4 w-full">Open attendance <ClipboardCheck size={15}/></a>
   </DashboardSection>
  </div>
  <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_.9fr]">
   <DashboardSection eyebrow="REAL-WORLD TRENDS" title="Attendance over the week" description="Daily totals come directly from persisted attendance records.">
    {loading?<div className="h-32 rounded-xl bg-[#F2F3F0] animate-pulse"/>:weekly.some(d=>Number(d.total)>0)?<div className="mt-5 flex h-40 items-end gap-4 border-b border-[#E4E9E2] pb-2">{weekly.map((d,i)=>{const percentage=Number(d.total)?Math.round(Number(d.present)/Number(d.total)*100):0;return <div className="flex h-full flex-1 flex-col items-center justify-end gap-2" key={`${d.day}-${i}`}><span className="text-[10px] font-bold tabular-nums text-[#637D69]">{Number(d.total)>0?`${percentage}%`:'—'}</span><div className="w-1/2 max-w-9 rounded-t-md bg-[var(--cw-accent)]" style={{height:`${Number(d.total)>0?Math.max(4,percentage):2}%`}}/><span className="text-[10px] text-[#64756A]">{d.day}</span></div>})}</div>:<DataEmpty title="No attendance trend yet" description="A real chart will appear once daily records have been entered."/>}
   </DashboardSection>
   <DashboardSection eyebrow="ADDITIONAL TOOLS" title="Plan the bigger picture" description="Utilities for administration and school-wide decisions."><div className="space-y-3">{modules.slice(8).map(mod=><ModuleAction key={mod.href} {...mod}/>)}</div></DashboardSection>
  </div>
 </DashboardLayout>;
}
