"use client";

import DashboardLayout from '@/components/DashboardLayout';
import {PortalModuleHeading,PortalSubheading,PortalSupportNote} from '@/components/PortalModulePrimitives';
import {
  BookOpen, Users, GraduationCap, Search, RefreshCw, UserRoundCheck,
  Layers3, ChevronRight, School, BookMarked, Hash,
} from 'lucide-react';
import {useCallback,useEffect,useMemo,useState} from 'react';
import api from '@/utils/api';

type Student={id:number|string;name?:string;class?:string;section?:string;roll_number?:string|number;gr_number?:string};
type Employee={id:number|string;user_id?:number|string;name?:string;designation?:string;role?:string};
type Assignment={id?:number|string;teacher_user_id?:number|string;class_name?:string;section?:string;subject?:string;is_active?:boolean};
type ClassGroup={key:string;name:string;sections:string[];students:Student[];assignments:Assignment[];teachers:Array<{name:string;subject:string;section:string}>};

const normalize=(value:unknown)=>String(value??'').trim();
export default function AdminClasses(){
 const [students,setStudents]=useState<Student[]>([]);
 const [employees,setEmployees]=useState<Employee[]>([]);
 const [assignments,setAssignments]=useState<Assignment[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [search,setSearch]=useState('');
 const [selectedKey,setSelectedKey]=useState('');

 const load=useCallback(async()=>{
   setLoading(true);setError('');
   const [s,e,a]=await Promise.allSettled([
     api.get('/students?active=true'), api.get('/employees?active=true'), api.get('/portal/teacher-assignments'),
   ]);
   const failures:string[]=[];
   if(s.status==='fulfilled'&&s.value.data?.success&&Array.isArray(s.value.data?.data))setStudents(s.value.data.data);else{setStudents([]);failures.push('student roster')}
   if(e.status==='fulfilled'&&e.value.data?.success&&Array.isArray(e.value.data?.data))setEmployees(e.value.data.data);else{setEmployees([]);failures.push('employee directory')}
   if(a.status==='fulfilled'&&a.value.data?.success&&Array.isArray(a.value.data?.data))setAssignments(a.value.data.data);else{setAssignments([]);failures.push('teacher assignments')}
   if(failures.length)setError(`Could not verify ${failures.join(', ')}. Missing information is hidden instead of replaced with sample data.`);
   setLoading(false);
 },[]);
 useEffect(()=>{load()},[load]);

 const teacherNameByUser=useMemo(()=>{const map=new Map<string,string>();employees.forEach(row=>{if(row.user_id)map.set(String(row.user_id),normalize(row.name)||'Teacher')});return map},[employees]);
 const groups=useMemo<ClassGroup[]>(()=>{
   const map=new Map<string,{name:string;sections:Set<string>;students:Student[]}>();
   students.forEach(student=>{const name=normalize(student.class);if(!name)return;const key=name.toLowerCase();if(!map.has(key))map.set(key,{name,sections:new Set(),students:[]});const row=map.get(key)!;row.students.push(student);const section=normalize(student.section);if(section)row.sections.add(section)});
   assignments.forEach(row=>{const name=normalize(row.class_name);if(!name||row.is_active===false)return;const key=name.toLowerCase();if(!map.has(key))map.set(key,{name,sections:new Set(),students:[]});const section=normalize(row.section);if(section)map.get(key)!.sections.add(section)});
   return [...map.entries()].map(([key,row])=>{
     const scoped=assignments.filter(a=>a.is_active!==false&&normalize(a.class_name).toLowerCase()===key);
     const teachers=scoped.map(a=>({name:teacherNameByUser.get(String(a.teacher_user_id||''))||'Linked teacher',subject:normalize(a.subject)||'Subject not specified',section:normalize(a.section)}));
     return {key,name:row.name,sections:[...row.sections].sort(),students:row.students.sort((x,y)=>Number(x.roll_number||9999)-Number(y.roll_number||9999)),assignments:scoped,teachers};
   }).sort((x,y)=>x.name.localeCompare(y.name,undefined,{numeric:true}));
 },[students,assignments,teacherNameByUser]);
 useEffect(()=>{if(!selectedKey&&groups.length)setSelectedKey(groups[0].key);if(selectedKey&&!groups.some(g=>g.key===selectedKey))setSelectedKey(groups[0]?.key||'')},[groups,selectedKey]);
 const filtered=useMemo(()=>{const q=search.trim().toLowerCase();if(!q)return groups;return groups.filter(g=>g.name.toLowerCase().includes(q)||g.sections.some(s=>s.toLowerCase().includes(q))||g.teachers.some(t=>`${t.name} ${t.subject}`.toLowerCase().includes(q)))},[groups,search]);
 const selected=groups.find(g=>g.key===selectedKey)||filtered[0]||null;
 const totalSections=groups.reduce((sum,g)=>sum+Math.max(1,g.sections.length),0);
 const assignedTeacherIds=new Set(assignments.filter(a=>a.is_active!==false&&a.teacher_user_id).map(a=>String(a.teacher_user_id)));

 return <DashboardLayout role="admin" title="Classes">
   <PortalModuleHeading eyebrow="ACADEMIC STRUCTURE" title="Classes, students and teachers" description="A live relational view of the school: choose any class to see its real student roster, sections and teacher/subject assignments. No duplicate directory is maintained inside Connect."
     actions={<button type="button" onClick={load} className="cw-module-secondary"><RefreshCw size={15}/> Refresh live data</button>}/>
   {error&&<div role="alert" className="cw-error mb-5">{error}</div>}
   <div className="mb-5"><PortalSupportNote>Students and staff below come from the same school records used by the SaaS. Class-teacher links come from APEX assignment rules, so changes remain consistent across attendance, Paper Studio and assessment access.</PortalSupportNote></div>

   <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Academic directory summary">
     {[
       {label:'LIVE CLASSES',value:loading?'…':groups.length,icon:School},
       {label:'SECTIONS',value:loading?'…':totalSections,icon:Layers3},
       {label:'ACTIVE STUDENTS',value:loading?'…':students.length,icon:GraduationCap},
       {label:'ASSIGNED TEACHERS',value:loading?'…':assignedTeacherIds.size,icon:UserRoundCheck},
     ].map(item=><article key={item.label} className="cw-metric"><div className="flex items-start justify-between gap-2"><span className="cw-metric-label">{item.label}</span><span className="cw-action-icon"><item.icon size={18}/></span></div><div className="cw-metric-value mt-3 tabular-nums">{item.value}</div><p className="cw-metric-note mt-1">Live school record</p></article>)}
   </section>

   <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[.74fr_1.26fr]">
     <section className="cw-card min-w-0">
       <PortalSubheading eyebrow="CLASS DIRECTORY" title="School classes" description="Search by class, section, teacher or subject."/>
       <label className="relative block"><span className="sr-only">Search classes</span><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#728597]"/><input className="cw-field w-full pl-9" type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search class, section, teacher…"/></label>
       <div className="mt-4 space-y-2 max-h-[650px] overflow-y-auto pr-1">
         {loading?[1,2,3,4].map(x=><div key={x} className="h-20 animate-pulse rounded-xl bg-[#f0f3f5]"/>):filtered.length?filtered.map(group=>{
           const active=selected?.key===group.key;return <button key={group.key} type="button" onClick={()=>setSelectedKey(group.key)} className={`w-full rounded-[14px] border p-4 text-left transition ${active?'border-[#9fb4c5] bg-[#f2f6f9] shadow-[inset_3px_0_0_#0b2c4d]':'border-[#e4e9ed] bg-white hover:border-[#cbd7df]'}`}>
             <div className="flex items-center gap-3"><span className={`grid h-10 w-10 place-items-center rounded-xl font-serif text-[16px] ${active?'bg-[#0b2c4d] text-white':'bg-[#edf2f5] text-[#33546b]'}`}>{group.name.slice(0,2)}</span><div className="min-w-0 flex-1"><strong className="block text-[12px] text-[#203d52]">Class {group.name}</strong><small className="mt-1 block truncate text-[10px] text-[#6b7f8e]">{group.students.length} students · {group.teachers.length} teacher assignments</small></div><ChevronRight size={16} className="text-[#9aa8b2]"/></div>
             <div className="mt-3 flex flex-wrap gap-1.5">{group.sections.length?group.sections.map(section=><span key={section} className="rounded-full border border-[#dde5ea] bg-white px-2 py-1 text-[9px] font-bold text-[#5a7282]">Section {section}</span>):<span className="text-[9px] text-[#8b9aa5]">No separate section</span>}</div>
           </button>
         }):<div className="py-12 text-center text-[12px] text-[#778995]">No live class matches this search.</div>}
       </div>
     </section>

     <section className="cw-card min-w-0">
       {!selected?<div className="cw-empty"><BookOpen size={24}/><strong>No class selected</strong><p>Select a live class to inspect its roster and teaching team.</p></div>:<>
         <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e6ebee] pb-5"><div><p className="cw-eyebrow">SELECTED CLASS</p><h2 className="mt-2 font-serif text-[25px] font-semibold tracking-[-.04em] text-[#173b53]">Class {selected.name}</h2><p className="mt-1 text-[11px] text-[#6a7e8d]">{selected.sections.length?`Sections ${selected.sections.join(', ')}`:'Single class group'} · {selected.students.length} students</p></div><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eaf0f4] text-[#163d59]"><BookMarked size={22}/></span></div>
         <div className="mt-5 grid grid-cols-1 gap-5 2xl:grid-cols-[1.1fr_.9fr]">
           <div className="min-w-0"><PortalSubheading eyebrow="STUDENT ROSTER" title={`${selected.students.length} active students`} description="Names and roll numbers from the live student register."/>
             <div className="overflow-x-auto rounded-[14px] border border-[#e3e9ed]"><table className="cw-data-table"><thead><tr><th>Roll</th><th>Student</th><th>Section</th><th>GR</th></tr></thead><tbody>{selected.students.length?selected.students.map(student=><tr key={student.id}><td><span className="inline-flex items-center gap-1 font-bold text-[#536d7f]"><Hash size={12}/>{student.roll_number||'—'}</span></td><td className="font-semibold text-[#253f52]">{student.name||'Unnamed student'}</td><td>{student.section||'—'}</td><td className="text-[#697e8c]">{student.gr_number||'—'}</td></tr>):<tr><td colSpan={4} className="text-center text-[#81909a]">No active students linked to this class.</td></tr>}</tbody></table></div>
           </div>
           <div><PortalSubheading eyebrow="TEACHING TEAM" title="Assigned teachers" description="Subjects and sections authorized for this class."/>
             <div className="space-y-2">{selected.teachers.length?selected.teachers.map((teacher,index)=><article key={`${teacher.name}-${teacher.subject}-${index}`} className="rounded-[13px] border border-[#e2e8ec] bg-[#fbfcfd] p-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e9f1f1] text-[#277b78]"><Users size={17}/></span><div className="min-w-0"><strong className="block truncate text-[12px] text-[#29465a]">{teacher.name}</strong><small className="mt-1 block text-[10px] text-[#687f8e]">{teacher.subject}{teacher.section?` · Section ${teacher.section}`:''}</small></div></div></article>):<div className="rounded-[14px] border border-dashed border-[#e2d8c8] bg-[#fffaf2] p-5 text-[11px] leading-5 text-[#8a6a3c]">No teacher assignment has been linked to this class yet.</div>}</div>
           </div>
         </div>
       </>}
     </section>
   </div>
 </DashboardLayout>;
}
