"use client";
import DashboardLayout from '@/components/DashboardLayout';
import {PortalHero,MetricCard,ModuleAction,DataEmpty,DataError,DashboardSection} from '@/components/PortalDashboardPrimitives';
import {
  Activity,BookOpen,Bus,CalendarDays,ClipboardCheck,CreditCard,FileText,
  GraduationCap,Library,Megaphone,RefreshCw,School,Settings2,ShieldCheck,
  UserRoundPlus,Users,ChartNoAxesCombined,UserRoundCheck,BookMarked,ChevronRight,
} from 'lucide-react';
import {useAuth} from '@/context/AuthContext';
import api from '@/utils/api';
import {useCallback,useEffect,useMemo,useState} from 'react';

type DirectoryStudent={id:number|string;name?:string;class?:string;section?:string;roll_number?:string|number};
type DirectoryEmployee={id:number|string;name?:string;designation?:string;role?:string;user_id?:number|string};
type DirectoryAssignment={id?:number|string;teacher_user_id?:number|string;class_name?:string;section?:string;subject?:string;is_active?:boolean};
type PaperReadiness={architectureVersion?:string;ready?:boolean;blockers?:string[];gates?:Record<string,boolean>;publisherEvidence?:{valid?:boolean;scope?:{grade?:number;subject?:string};approvedQuestionCount?:number;issues?:string[]};curriculumTechnicalEvidence?:{technicalValid?:boolean;approvalComplete?:boolean;gates?:Record<string,boolean>;metrics?:{englishChapters?:number;urduChapters?:number;englishExerciseSourceRefs?:number;urduExerciseSourceRefs?:number;englishTopicIndexEntries?:number;openAcademicIssues?:number;approvedQuestions?:number};blockers?:string[]};rendererEvidence?:{valid?:boolean;buildId?:string}};
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
 const [directoryError,setDirectoryError]=useState('');
 const [students,setStudents]=useState<DirectoryStudent[]>([]);
 const [employees,setEmployees]=useState<DirectoryEmployee[]>([]);
 const [assignments,setAssignments]=useState<DirectoryAssignment[]>([]);
 const [paperReadiness,setPaperReadiness]=useState<PaperReadiness|null>(null);
 const [paperReadinessError,setPaperReadinessError]=useState('');
 const reload=useCallback(async()=>{setLoading(true);setError('');setDirectoryError('');setPaperReadinessError('');
  const [dash,studentRes,employeeRes,assignmentRes,readinessRes]=await Promise.allSettled([
   api.get('/dashboard/stats',{timeout:15000}),api.get('/students?active=true'),api.get('/employees?active=true'),api.get('/portal/teacher-assignments'),api.get('/portal/paper-studio/canonical-readiness',{timeout:15000})
  ]);
  if(dash.status==='fulfilled'&&dash.value.data?.success)setSnapshot({...dash.value.data,...(dash.value.data.data||{}),stats:dash.value.data.data?.stats||{}});else{setSnapshot(null);setError(dash.status==='rejected'?dash.reason?.response?.data?.message||dash.reason?.message||'Unable to load live school data.':'School dashboard could not be loaded.');}
  const problems:string[]=[];
  if(studentRes.status==='fulfilled'&&studentRes.value.data?.success&&Array.isArray(studentRes.value.data?.data))setStudents(studentRes.value.data.data);else{setStudents([]);problems.push('students')}
  if(employeeRes.status==='fulfilled'&&employeeRes.value.data?.success&&Array.isArray(employeeRes.value.data?.data))setEmployees(employeeRes.value.data.data);else{setEmployees([]);problems.push('teachers')}
  if(assignmentRes.status==='fulfilled'&&assignmentRes.value.data?.success&&Array.isArray(assignmentRes.value.data?.data))setAssignments(assignmentRes.value.data.data);else{setAssignments([]);problems.push('classes')}
  if(readinessRes.status==='fulfilled'&&readinessRes.value.data?.success)setPaperReadiness(readinessRes.value.data.data||null);else{setPaperReadiness(null);setPaperReadinessError(readinessRes.status==='rejected'?readinessRes.reason?.response?.data?.message||readinessRes.reason?.message||'Paper platform readiness could not be verified.':'Paper platform readiness could not be verified.')}
  if(problems.length)setDirectoryError(`Live ${problems.join(', ')} directory data could not be verified.`);
  setLoading(false)
 },[]);
 useEffect(()=>{reload()},[reload]);
 const metric=(n:unknown,suffix='')=>loading||error?'—':safeNum(n)===null?'—':`${safeNum(n)?.toLocaleString('en-PK')}${suffix}`;
 const stats=snapshot?.stats||{};
 const weekly=Array.isArray(snapshot?.weekly_attendance)?snapshot.weekly_attendance:[];
 const recorded=(snapshot?.today_total??0)>0;
 const teachers=useMemo(()=>employees.filter(e=>String(e.role||'').toLowerCase()==='teacher'||String(e.designation||'').toLowerCase().includes('teacher')), [employees]);
 const classGroups=useMemo(()=>{const map=new Map<string,{name:string;section:string;students:number;subjects:Set<string>;teachers:Set<string>}>();const ensure=(name:string,section='')=>{const key=`${name.toLowerCase()}::${section.toLowerCase()}`;if(!map.has(key))map.set(key,{name,section,students:0,subjects:new Set(),teachers:new Set()});return map.get(key)!};students.forEach(st=>{const cls=String(st.class||'').trim();if(cls)ensure(cls,String(st.section||'').trim()).students++});assignments.filter(a=>a.is_active!==false).forEach(a=>{const cls=String(a.class_name||'').trim();if(!cls)return;const item=ensure(cls,String(a.section||'').trim());if(a.subject)item.subjects.add(String(a.subject));const emp=employees.find(e=>String(e.user_id||'')===String(a.teacher_user_id||''));if(emp?.name)item.teachers.add(String(emp.name))});return [...map.values()].sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true})).slice(0,8)},[students,assignments,employees]);
 const name=String(user?.name||'Administrator').trim().split(/\s+/)[0];
 const readinessGates=paperReadiness?.gates||{};
 const readinessRows=[
  ['Canonical registry',readinessGates.canonicalRegistryPresent],
  ['Tenant RLS',readinessGates.tenantRlsApproved],
  ['Backup / restore',readinessGates.backupRestoreDrillApproved],
  ['Renderer evidence',readinessGates.canonicalRendererParityApproved],
  ['Curriculum publisher',readinessGates.curriculumPublisherProductionApproved],
  ['Canonical writes',readinessGates.canonicalRegistryWriteEnabled],
 ] as const;
 return <DashboardLayout role="admin" title="School overview">
  <PortalHero eyebrow="APEX SCHOOL OPERATIONS" title={`Your school at a glance, ${name}.`} description="A clear, trustworthy control centre for student records, faculty, attendance and daily school operations—without decorative data or unnecessary noise." action={{label:'Manage students',href:'/admin/students'}}/>
  {error&&<div className="mt-5"><DataError message={error} onRetry={reload}/></div>}
  <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
   <MetricCard label="Active students" value={metric(stats.totalStudents)} note="From live school records" icon={GraduationCap}/>
   <MetricCard label="Active employees" value={metric(snapshot?.total_employees??stats.totalTeachers)} note="Current staff register" icon={Users}/>
   <MetricCard label="Today's attendance" value={recorded?metric(snapshot?.today_pct,'%'):'—'} note={recorded ? "Percentage of marked students" : "Awaiting today’s attendance"} icon={Activity}/>
   <MetricCard label="Admissions this month" value={metric(snapshot?.admissions_this_month)} note="This month's records" icon={UserRoundPlus}/>
  </div>
  <DashboardSection eyebrow="ACADEMIC DIRECTORY" title="Live school structure" description="Real students, teachers and classes from the school data source — not demo cards.">
   {directoryError&&<div className="cw-error mb-4" role="alert">{directoryError}</div>}
   <div className="grid gap-4 xl:grid-cols-3">
    <div className="cw-card p-0 overflow-hidden"><div className="border-b border-[#e4e8ec] p-4"><div className="flex items-center justify-between"><div><p className="cw-eyebrow">STUDENTS</p><h3 className="mt-1 font-serif text-lg text-[#17324a]">Active learners</h3></div><a href="/admin/students" className="cw-module-secondary">View all <ChevronRight size={14}/></a></div></div><div className="divide-y divide-[#edf0f2]">{students.slice(0,6).map(st=><div key={st.id} className="flex items-center gap-3 p-3.5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#eef3f7] text-[#0b2c4d]"><GraduationCap size={16}/></span><div className="min-w-0 flex-1"><strong className="block truncate text-[12px] text-[#223d51]">{st.name||'Unnamed student'}</strong><small className="text-[10px] text-[#70828f]">Class {st.class||'—'}{st.section?` · ${st.section}`:''}{st.roll_number?` · Roll ${st.roll_number}`:''}</small></div></div>)}{!students.length&&!loading&&<div className="p-5 text-[11px] text-[#758590]">No verified active students returned.</div>}</div></div>
    <div className="cw-card p-0 overflow-hidden"><div className="border-b border-[#e4e8ec] p-4"><div className="flex items-center justify-between"><div><p className="cw-eyebrow">TEACHERS</p><h3 className="mt-1 font-serif text-lg text-[#17324a]">Faculty</h3></div><a href="/admin/teachers" className="cw-module-secondary">View all <ChevronRight size={14}/></a></div></div><div className="divide-y divide-[#edf0f2]">{teachers.slice(0,6).map(t=><div key={t.id} className="flex items-center gap-3 p-3.5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#edf3f3] text-[#167b7b]"><UserRoundCheck size={16}/></span><div className="min-w-0 flex-1"><strong className="block truncate text-[12px] text-[#223d51]">{t.name||'Unnamed teacher'}</strong><small className="text-[10px] text-[#70828f]">{t.designation||'Teacher'}</small></div></div>)}{!teachers.length&&!loading&&<div className="p-5 text-[11px] text-[#758590]">No verified teacher records returned.</div>}</div></div>
    <div className="cw-card p-0 overflow-hidden"><div className="border-b border-[#e4e8ec] p-4"><div className="flex items-center justify-between"><div><p className="cw-eyebrow">CLASSES</p><h3 className="mt-1 font-serif text-lg text-[#17324a]">Academic groups</h3></div><a href="/admin/classes" className="cw-module-secondary">Explore <ChevronRight size={14}/></a></div></div><div className="divide-y divide-[#edf0f2]">{classGroups.slice(0,6).map(c=><div key={`${c.name}-${c.section}`} className="flex items-center gap-3 p-3.5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f1f3f6] text-[#48657a]"><BookMarked size={16}/></span><div className="min-w-0 flex-1"><strong className="block truncate text-[12px] text-[#223d51]">Class {c.name}{c.section?` · ${c.section}`:''}</strong><small className="text-[10px] text-[#70828f]">{c.students} students · {c.subjects.size} subjects</small></div></div>)}{!classGroups.length&&!loading&&<div className="p-5 text-[11px] text-[#758590]">No verified class groups returned.</div>}</div></div>
   </div>
  </DashboardSection>
  <DashboardSection eyebrow="PAPER PLATFORM" title="Canonical readiness" description="Operational release gates for the shared SaaS to Connect paper pipeline. Teachers never receive these storage details.">
   {paperReadinessError?<DataError message={paperReadinessError} onRetry={reload}/>:paperReadiness?<div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#DDE5EA] bg-[#F8FAFB] p-4"><div className="flex items-center gap-3"><span className={`grid h-10 w-10 place-items-center rounded-xl ${paperReadiness.ready?'bg-[#E3F2EC] text-[#216B55]':'bg-[#EEF2F5] text-[#0B2C4D]'}`}><ShieldCheck size={18}/></span><div><strong className="block text-[12px] text-[#193A50]">{paperReadiness.ready?'Canonical cutover ready':'Fail-closed until evidence is complete'}</strong><small className="mt-1 block text-[10px] text-[#6C7E8A]">{paperReadiness.publisherEvidence?.scope?.subject?`Canary: Grade ${paperReadiness.publisherEvidence.scope.grade} ${paperReadiness.publisherEvidence.scope.subject}`:'Publisher canary not approved'} ? Renderer {paperReadiness.rendererEvidence?.valid?'verified':'pending'}</small></div></div><span className="rounded-full border border-[#D1DBE2] bg-white px-3 py-1 text-[9px] font-extrabold tracking-[.08em] text-[#536C7D]">{paperReadiness.architectureVersion||'READINESS'}</span></div>
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{readinessRows.map(([label,ok])=><div key={label} className="flex items-center justify-between rounded-xl border border-[#E3E8EC] bg-white px-3 py-2.5"><span className="text-[10px] font-semibold text-[#526A7A]">{label}</span><strong className={`text-[9px] ${ok?'text-[#26715B]':'text-[#9B6632]'}`}>{ok?'VERIFIED':'BLOCKED'}</strong></div>)}</div>
    {paperReadiness.curriculumTechnicalEvidence&&<div className="rounded-xl border border-[#E1E8EC] bg-[#FBFCFD] p-3"><div className="flex items-center justify-between gap-3"><strong className="text-[10px] text-[#294A5E]">Curriculum evidence</strong><span className={`text-[9px] font-bold ${paperReadiness.curriculumTechnicalEvidence.technicalValid?'text-[#26715B]':'text-[#9B6632]'}`}>{paperReadiness.curriculumTechnicalEvidence.technicalValid?'TECHNICALLY VERIFIED':'BLOCKED'}</span></div><div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4"><div><span className="text-[8px] text-[#7A8C97]">Chapters</span><strong className="block text-[11px] text-[#294A5E]">{paperReadiness.curriculumTechnicalEvidence.metrics?.englishChapters??0} EN ? {paperReadiness.curriculumTechnicalEvidence.metrics?.urduChapters??0} UR</strong></div><div><span className="text-[8px] text-[#7A8C97]">Exercise refs</span><strong className="block text-[11px] text-[#294A5E]">{paperReadiness.curriculumTechnicalEvidence.metrics?.englishExerciseSourceRefs??0} EN ? {paperReadiness.curriculumTechnicalEvidence.metrics?.urduExerciseSourceRefs??0} UR</strong></div><div><span className="text-[8px] text-[#7A8C97]">Open academic issues</span><strong className="block text-[11px] text-[#294A5E]">{paperReadiness.curriculumTechnicalEvidence.metrics?.openAcademicIssues??0}</strong></div><div><span className="text-[8px] text-[#7A8C97]">Approved questions</span><strong className="block text-[11px] text-[#294A5E]">{paperReadiness.curriculumTechnicalEvidence.metrics?.approvedQuestions??0}</strong></div></div>{paperReadiness.curriculumTechnicalEvidence.technicalValid&&!paperReadiness.curriculumTechnicalEvidence.approvalComplete&&<p className="mt-3 border-t border-[#E1E8EC] pt-2 text-[9px] leading-5 text-[#7B674F]">Technical evidence is green. Independent academic approval and production publisher authorization are still required before canonical writes can unlock.</p>}</div>}
    {!paperReadiness.ready&&<div className="rounded-xl border border-[#E7DDD3] bg-[#FCF8F3] p-3"><strong className="block text-[10px] text-[#725333]">Current blockers</strong><div className="mt-2 flex flex-wrap gap-2">{(paperReadiness.blockers||[]).map(b=><span key={b} className="rounded-full border border-[#E7D7C7] bg-white px-2.5 py-1 text-[8px] font-bold text-[#76583B]">{b.replaceAll('_',' ')}</span>)}</div></div>}
   </div>:<div className="h-32 rounded-xl bg-[#F2F4F6] animate-pulse"/>}
  </DashboardSection>
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
