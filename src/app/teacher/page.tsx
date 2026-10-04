"use client";

import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import {
  ArrowRight, ArrowUpRight, BookOpenText, CalendarCheck, CalendarDays,
  CheckCheck, ClipboardCheck, FileText, GraduationCap, AlertCircle,
  Sparkles, Users, TrendingUp, Bell, RefreshCw, Layers3, Clock3,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useApiData } from '@/hooks/useApiData';
import { useMemo } from 'react';

interface TeacherClass {class_name:string;section?:string;subjects?:string[]}
interface DashboardData {
 stats?: {totalStudents?:number;presentCount?:number;absentCount?:number;attPct?:number;unmarkedCount?:number};
 attendanceTrend?: Array<{name:string;present:number;absent:number}>;
 recentNotices?: Array<{id?:number;title?:string;message?:string;created_at?:string;issued_by?:string}>;
}
const EMPTY: DashboardData={stats:{},attendanceTrend:[],recentNotices:[]};
const CLASSES_EMPTY:{classes:TeacherClass[];assignment_required:boolean}={classes:[],assignment_required:false};

const actions=[
 {label:'Take attendance',sub:'Record today’s register',href:'/teacher/attendance',icon:ClipboardCheck,bg:'#e7f1e9',color:'#347b58'},
 {label:'My classes',sub:'Assignments & timetable',href:'/teacher/classes',icon:CalendarDays,bg:'#fff0e2',color:'#bd7543'},
 {label:'Paper studio',sub:'Create an assessment',href:'/teacher/paper-generator',icon:FileText,bg:'#f0eafd',color:'#8165b5'},
 {label:'Marks & results',sub:'Review class progress',href:'/teacher/assessments',icon:GraduationCap,bg:'#e5f0f0',color:'#467c82'},
];

function shortDate(value?:string){if(!value)return '';const d=new Date(value);return Number.isNaN(d.getTime())?'':d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});}

export default function TeacherDashboard(){
 const {user}=useAuth();
 const {data,loading,error,refetch}=useApiData<DashboardData>('/portal/dashboard',EMPTY);
 const {data:teacherOptions,loading:assignmentLoading,error:assignmentError,refetch:refetchAssignments}=useApiData('/portal/teaching-options',CLASSES_EMPTY);
 const classes=Array.isArray(teacherOptions?.classes)?teacherOptions.classes:[];
 const noAssignments=!assignmentLoading&&!assignmentError&&classes.length===0;
 const showStats=!loading&&!error&&!assignmentError&&classes.length>0;
 const stats=data?.stats||{};
 const trend=Array.isArray(data?.attendanceTrend)?data.attendanceTrend:[];
 const notices=Array.isArray(data?.recentNotices)?data.recentNotices:[];
 const name=String(user?.name||'Teacher').trim().split(/\s+/)[0]||'Teacher';
 const today=useMemo(()=>new Date().toLocaleDateString('en-PK',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Karachi'}),[]);
 const metricCards=[
   {label:'MY STUDENTS',value:showStats?String(stats.totalStudents??'—'):'—',note:noAssignments?'Assignment pending':'Across assigned classes',icon:Users,bg:'#e7f1e9',fg:'#327954'},
   {label:'PRESENT TODAY',value:showStats?String(stats.presentCount??'—'):'—',note:noAssignments?'Assignment pending':'Recorded today',icon:CheckCheck,bg:'#e7f3ec',fg:'#38966a'},
   {label:'ABSENT TODAY',value:showStats?String(stats.absentCount??'—'):'—',note:noAssignments?'Assignment pending':'Recorded today',icon:AlertCircle,bg:'#fff0e6',fg:'#c47c54'},
   {label:'ATTENDANCE',value:showStats&&Number.isFinite(Number(stats.attPct))?`${stats.attPct}%`:'—',note:noAssignments?'Assignment pending':'Today’s recorded rate',icon:TrendingUp,bg:'#f0eafd',fg:'#8665b5'},
 ];
 if(!user)return null;
 return <DashboardLayout role="teacher" title="Overview">
   <section className="relative overflow-hidden rounded-[23px] border border-[#e9e8df] bg-gradient-to-[116deg] from-[#fffefa] via-[#f4f7ef] to-[#edf3e9] px-6 py-8 sm:px-9 sm:py-9">
     <div className="pointer-events-none absolute -right-16 -top-28 h-80 w-80 rounded-full border-[32px] border-[#d9e8d2]/45"/>
     <div className="pointer-events-none absolute right-20 bottom-[-90px] h-56 w-56 rounded-full bg-[#e5e7cb]/45 blur-3xl"/>
     <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
       <div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.23em] text-[#628b72]"><span className="h-2 w-2 rounded-full bg-[#70b08b]"/> YOUR FACULTY WORKSPACE</div>
         <h1 className="mt-4 font-serif text-[31px] font-semibold tracking-[-.055em] text-[#263a30] sm:text-[40px]">Good to see you, {name}<span className="text-[#88aa87]">.</span></h1>
         <p className="mt-2 max-w-lg text-[13px] leading-6 text-[#818981]">A calmer place to plan your day, guide your classes, and keep every important task within reach.</p>
         <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#dfe8da] bg-white/70 px-3.5 py-2 text-[11px] font-semibold text-[#597461]"><CalendarDays size={14}/>{today}</div>
       </div>
       <Link href="/teacher/classes" className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#285c48] px-5 py-3.5 text-[12px] font-bold text-white no-underline shadow-[0_8px_24px_#20513d20] transition hover:bg-[#1b4535]">Explore my classes <ArrowUpRight size={16}/></Link>
     </div>
   </section>

   {(error||assignmentError)&&<div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[15px] border border-[#ead2bb] bg-[#fff8ef] p-4 text-[12px] text-[#975e38]" role="alert"><span>Some live school data could not be loaded. Figures are hidden rather than showing incorrect zeros.</span><button onClick={()=>{refetch();refetchAssignments();}} className="inline-flex items-center gap-2 font-bold"><RefreshCw size={14}/> Retry</button></div>}

   <section className="mt-7 grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4" aria-label="Teacher summary">
     {metricCards.map((item,i)=><div key={item.label} className="tws-panel relative overflow-hidden p-4 sm:p-5 min-h-[140px]"><div className="flex items-center justify-between gap-2"><span className="text-[10px] font-extrabold tracking-[.12em] text-[#959e94]">{item.label}</span><span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px]" style={{background:item.bg,color:item.fg}}><item.icon size={18}/></span></div><div className="mt-2 font-serif text-[30px] font-semibold tracking-[-.055em] text-[#303c32] sm:text-[36px]">{loading||assignmentLoading?'…':item.value}</div><div className="mt-1 text-[11px] text-[#586B5C]">{item.note}</div>{i===0&&<span className="absolute bottom-0 left-5 right-5 h-[2px] rounded-full bg-gradient-to-r from-[#7cad8b] to-transparent"/>}</div>)}
   </section>

   {noAssignments&&<section className="mt-6 flex flex-col gap-5 rounded-[20px] border border-[#eadfc7] bg-gradient-to-r from-[#fffaf0] to-[#fffdf9] p-5 sm:flex-row sm:items-center sm:p-6" role="status"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#f4e9cd] text-[#9e7537]"><Layers3 size={23}/></span><div className="flex-1"><h2 className="font-serif text-[19px] font-semibold text-[#493f30]">Your classes haven’t been linked yet</h2><p className="mt-1 max-w-2xl text-[12px] leading-6 text-[#8c8272]">Your teacher login is working. To see the correct students, attendance and timetable, the school administrator needs to link your real class, section and subject assignments. No demonstration data has been inserted.</p></div><Link href="/teacher/classes" className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl border border-[#ddcda9] bg-white px-4 py-2.5 text-[11px] font-bold text-[#806439] no-underline sm:self-center">Check assignments <ArrowRight size={14}/></Link></section>}

   <section className="mt-8 grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_.85fr]">
     <div className="tws-panel p-5 sm:p-7"><div className="flex items-start justify-between gap-3"><div><div className="tws-panel-kicker">YOUR TEACHING SPACE</div><h2 className="mt-2 font-serif text-[23px] font-semibold tracking-[-.04em] text-[#313d33]">My classes</h2><p className="mt-1 text-[12px] text-[#586B5C]">Only assignments linked to your actual teacher account.</p></div><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef3ed] text-[#588368]"><BookOpenText size={19}/></span></div>
       {assignmentLoading?<div className="mt-8 animate-pulse space-y-3"><div className="h-14 rounded-xl bg-[#f2f3ef]"/><div className="h-14 rounded-xl bg-[#f2f3ef]"/></div>:classes.length?<div className="mt-5 space-y-2">{classes.slice(0,5).map((row,i)=><Link key={`${row.class_name}-${row.section}-${i}`} href="/teacher/classes" className="flex items-center gap-3 rounded-xl border border-[#eaede7] p-3.5 text-[#343d35] no-underline transition hover:border-[#b7d4be] hover:bg-[#fbfdfb]"><span className="grid h-10 w-10 place-items-center rounded-[11px] bg-[#e7f0e6] font-serif text-[17px] text-[#3e7451]">{row.class_name.slice(0,2)}</span><div className="flex-1"><strong className="block text-[12px]">Class {row.class_name}{row.section?` · ${row.section}`:''}</strong><small className="mt-1 block text-[10px] text-[#586B5C]">{row.subjects?.length?row.subjects.join(' · '):'Subject assignment available in class view'}</small></div><ArrowUpRight size={16} className="text-[#acb6a9]"/></Link>)}{classes.length>5&&<p className="pt-2 text-[11px] text-[#79877c]">+ {classes.length-5} more assigned class groups</p>}</div>:<div className="mt-5 flex min-h-[180px] flex-col items-center justify-center rounded-[15px] border border-dashed border-[#dbe2d8] bg-[#fafbf8] p-6 text-center"><span className="tws-empty-illustration"><BookOpenText size={22}/></span><strong className="mt-3 text-[13px] text-[#4b5c4e]">Awaiting class assignment</strong><p className="mt-2 max-w-[280px] text-[11px] leading-5 text-[#586B5C]">Your actual teaching groups will appear here once linked by the school administration.</p></div>}
       <Link href="/teacher/classes" className="mt-5 inline-flex items-center gap-2 text-[12px] font-bold text-[#347451] no-underline">View class workspace <ArrowRight size={15}/></Link>
     </div>
     <div className="tws-panel p-5 sm:p-7"><div className="tws-panel-kicker">TAKE THE NEXT STEP</div><h2 className="mt-2 font-serif text-[23px] font-semibold tracking-[-.04em] text-[#313d33]">Quick actions</h2><p className="mt-1 text-[12px] text-[#586B5C]">Practical shortcuts for your teaching day.</p><div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">{actions.map(({label,sub,href,icon:Icon,bg,color})=><Link href={href} key={href} className="tws-action-link"><span className="tws-action-icon" style={{background:bg,color}}><Icon size={19}/></span><span className="min-w-0"><strong>{label}</strong><small>{sub}</small></span><ArrowUpRight size={14} className="tws-action-arrow shrink-0"/></Link>)}</div><div className="mt-6 rounded-[14px] bg-[#f3f4ee] px-4 py-3.5 text-[11px] leading-5 text-[#748277]"><Sparkles size={14} className="mr-1 inline-block text-[#649078]"/> Designed around real academic workflows, not placeholder data.</div></div>
   </section>

   <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_.85fr]">
     <div className="tws-panel p-5 sm:p-7"><div className="flex items-start justify-between"><div><div className="tws-panel-kicker">LIVE ACADEMIC INSIGHT</div><h2 className="mt-2 font-serif text-[21px] text-[#333f35]">Recent attendance</h2></div><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#eef1e8] text-[#5c8066]"><TrendingUp size={18}/></span></div>
       {trend.length&&classes.length?<div className="mt-7 flex h-36 items-end justify-around gap-2 border-b border-[#e9eee6] pb-2">{trend.map((row,i)=>{const total=Number(row.present||0)+Number(row.absent||0);const pct=total?Math.round(Number(row.present||0)/total*100):0;return <div key={`${row.name}-${i}`} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><span className="text-[9px] font-bold text-[#6b8c70]">{pct}%</span><div className="w-1/2 max-w-10 rounded-t-md bg-[#91bea0]" style={{height:`${Math.max(4,pct)}%`}}/><span className="text-[10px] text-[#586B5C]">{row.name}</span></div>})}</div>:<div className="mt-5 flex min-h-36 flex-col items-center justify-center rounded-[15px] border border-dashed border-[#e0e5dc] bg-[#fbfcfa] text-center"><CalendarCheck size={23} className="text-[#8aa78f]"/><p className="mt-3 text-[12px] font-semibold text-[#667b69]">Attendance insights will appear here</p><p className="mt-1 max-w-[290px] text-[11px] leading-5 text-[#586B5C]">Available after classes are assigned and attendance records are saved.</p></div>}
     </div>
     <div className="tws-panel p-5 sm:p-7"><div className="flex items-start justify-between"><div><div className="tws-panel-kicker">IN THE LOOP</div><h2 className="mt-2 font-serif text-[21px] text-[#333f35]">School updates</h2></div><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#fff0de] text-[#c38a52]"><Bell size={18}/></span></div><div className="mt-5 space-y-3">{notices.length?notices.slice(0,3).map((notice,i)=><article key={notice.id??i} className="border-b border-[#eef0ea] pb-3 last:border-none"><h3 className="text-[12px] font-bold text-[#3d493d]">{notice.title||'School notice'}</h3>{notice.message&&<p className="mt-1 text-[11px] leading-5 text-[#899389]">{notice.message}</p>}<small className="mt-2 block text-[10px] text-[#586B5C]">{shortDate(notice.created_at)}</small></article>):<div className="flex min-h-36 flex-col items-center justify-center rounded-[15px] border border-dashed border-[#e0e5dc] bg-[#fbfcfa] text-center"><Bell size={22} className="text-[#d3b388]"/><p className="mt-3 text-[12px] font-semibold text-[#667b69]">You're all caught up</p><p className="mt-1 text-[11px] text-[#586B5C]">New school announcements will be shown here.</p></div>}</div></div>
   </section>
 </DashboardLayout>;
}
