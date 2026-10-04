"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSchoolBranding } from '@/hooks/useSchoolBranding';
import PremiumLogo from '@/components/PremiumLogo';
import {
  LayoutDashboard, ClipboardCheck, BookOpenText, GraduationCap, FileText,
  CalendarDays, Menu, X, LogOut, ArrowUpRight, ChevronRight, Sparkles,
  PanelLeftClose, PanelLeftOpen, Globe2, Users, CreditCard, ShieldCheck,
  UserRoundPlus, Activity, Library, Bus, ChartNoAxesCombined, Settings2,
  NotebookPen, BrainCircuit, BookCheck, BadgeCheck, BookOpen, Megaphone,
} from 'lucide-react';

type Role = 'admin' | 'teacher' | 'student' | 'parent';
const navigation = {
  teacher: [
    { label: 'Overview', href: '/teacher', icon: LayoutDashboard },
    { label: 'Attendance', href: '/teacher/attendance', icon: ClipboardCheck },
    { label: 'Marks & results', href: '/teacher/assessments', icon: GraduationCap },
    { label: 'Online exams', href: '/teacher/assessments/online-exams', icon: Globe2 },
    { label: 'Lesson studio', href: '/teacher/academics', icon: BookOpenText },
    { label: 'My classes', href: '/teacher/classes', icon: CalendarDays },
    { label: 'Paper studio', href: '/teacher/paper-generator', icon: FileText },
  ],
  student: [
    { label: 'Overview', href: '/student', icon: LayoutDashboard },
    { label: 'Online exams', href: '/student/exams', icon: BookCheck },
    { label: 'AI quiz', href: '/student/quiz', icon: BrainCircuit },
    { label: 'Homework', href: '/student/homework', icon: NotebookPen },
    { label: 'My progress', href: '/student/ai-insights', icon: ChartNoAxesCombined },
    { label: 'Skills', href: '/student/skills', icon: BadgeCheck },
  ],
  parent: [
    { label: 'Overview', href: '/parent', icon: LayoutDashboard },
    { label: 'Results & growth', href: '/parent/ai-insights', icon: ChartNoAxesCombined },
    { label: 'Fee overview', href: '/parent/finance', icon: CreditCard },
    { label: 'School updates', href: '/parent/reports', icon: Megaphone },
  ],
  admin: [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Employees', href: '/admin/employees', icon: Users },
    { label: 'Students', href: '/admin/students', icon: GraduationCap },
    { label: 'Admissions', href: '/admin/admissions', icon: UserRoundPlus },
    { label: 'Parents', href: '/admin/parents', icon: ShieldCheck },
    { label: 'Attendance', href: '/admin/attendance', icon: Activity },
    { label: 'Classes', href: '/admin/classes', icon: BookOpen },
    { label: 'Events', href: '/admin/events', icon: CalendarDays },
    { label: 'Library', href: '/admin/library', icon: Library },
    { label: 'Transport', href: '/admin/transport', icon: Bus },
    { label: 'Notices', href: '/admin/announcements', icon: Megaphone },
    { label: 'Reports', href: '/admin/ai-analytics', icon: ChartNoAxesCombined },
    { label: 'Fees', href: '/admin/finance', icon: CreditCard },
    { label: 'Users & access', href: '/admin/users', icon: ShieldCheck },
    { label: 'Setup', href: '/admin/saas', icon: Settings2 },
  ],
} satisfies Record<Role, Array<{label:string;href:string;icon:typeof LayoutDashboard}>>;

const roleCopy = {
  teacher: {eyebrow:'FACULTY SPACE', breadcrumb:'Faculty space',name:'Teacher', note:'Teach with clarity.', description:'Your classes, papers and insights in one place.', action:'View my classes', href:'/teacher/classes'},
  student: {eyebrow:'LEARNING SPACE', breadcrumb:'Learning space',name:'Student', note:'Every day is progress.',description:'Your learning, homework and practice together.',action:'Explore quizzes',href:'/student/quiz'},
  parent: {eyebrow:'FAMILY SPACE', breadcrumb:'Family space',name:'Parent', note:'Closer to their growth.',description:'School updates and progress at a glance.',action:'View school updates',href:'/parent/reports'},
  admin: {eyebrow:'OPERATIONS SPACE', breadcrumb:'School operations',name:'Administrator',note:'Run the school clearly.',description:'People, academics and finance in one secure view.',action:'Manage students',href:'/admin/students'},
} satisfies Record<Role,{eyebrow:string;breadcrumb:string;name:string;note:string;description:string;action:string;href:string}>;

export default function ConnectWorkspaceShell({ children, title, role }:{children:React.ReactNode;title:string;role:Role}) {
  const pathname=usePathname();
  const router=useRouter();
  const {user,logout}=useAuth();
  const {schoolName,schoolLogo}=useSchoolBranding();
  const [drawer,setDrawer]=useState(false);
  const [compact,setCompact]=useState(false);
  const [mobile,setMobile]=useState(false);
  useEffect(()=>{const update=()=>setMobile(window.innerWidth<1024);update();window.addEventListener('resize',update);return()=>window.removeEventListener('resize',update)},[]);
  const effectiveCompact=compact&&!mobile;
  const contentRef=useRef<HTMLElement|null>(null);
  const links=navigation[role];
  const copy=roleCopy[role];
  useEffect(()=>setDrawer(false),[pathname]);
  useLayoutEffect(()=>{
    const target=contentRef.current;
    if(!target)return;
    const storageKey=`apex_v3_scroll_${role}_${pathname}`;
    const saved=Number(window.sessionStorage.getItem(storageKey)||0);
    target.scrollTop=Number.isFinite(saved)?saved:0;
    return()=>window.sessionStorage.setItem(storageKey,String(target.scrollTop));
  },[pathname,role]);

  useEffect(()=>{if(!drawer)return;const close=(e:KeyboardEvent)=>{if(e.key==='Escape')setDrawer(false)};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[drawer]);
  const goLogout=()=>{logout();router.replace(`/login?next=%2F${role}&logout=1`)};
  if(!user)return null;
  const nav=(<>
    <div className="tws-brand"><div className="tws-brand-mark"><PremiumLogo src={schoolLogo||'/ilm-logo.svg'} size={43}/></div>{!effectiveCompact&&<div className="tws-brand-copy"><strong title={schoolName}>{schoolName}</strong><span>APEX CONNECT</span><small>{copy.eyebrow}</small></div>}</div>
    <div className="tws-nav-label">{effectiveCompact?'—':'WORKSPACE'}</div>
    <nav className="tws-links" aria-label={`${copy.name} portal navigation`}>
      {links.map(({label,href,icon:Icon})=>{
        const active=pathname===href||(href!==`/${role}`&&pathname.startsWith(`${href}/`)&&!links.some(other=>other.href!==href&&other.href.startsWith(`${href}/`)&&pathname.startsWith(other.href)));
        return <Link key={href} href={href} title={effectiveCompact?label:undefined} aria-current={active?'page':undefined} onClick={()=>setDrawer(false)} className={`tws-nav-link ${active?'tws-nav-active':''}`}><Icon size={19} strokeWidth={1.9}/>{!effectiveCompact&&<span>{label}</span>}{active&&!effectiveCompact&&<span className="tws-nav-dot"/>}</Link>;
      })}
    </nav>
    <div className="tws-sidebar-bottom">
      {!effectiveCompact&&<div className="tws-side-note"><span className="tws-note-glyph"><Sparkles size={17}/></span><strong>{copy.note}</strong><small>{copy.description}</small><Link href={copy.href}>{copy.action} <ArrowUpRight size={13}/></Link></div>}
      <div className="tws-profile"><span className="tws-avatar">{String(user.name||role[0]).charAt(0).toUpperCase()}</span>{!effectiveCompact&&<div><strong>{user.name||`${copy.name} account`}</strong><small>{copy.name} workspace</small></div>}</div>
      <button type="button" className="tws-signout" onClick={goLogout}><LogOut size={17}/>{!effectiveCompact&&'Sign out'}</button>
      <button type="button" className="tws-compact-toggle" onClick={()=>setCompact(v=>!v)} aria-label={effectiveCompact?'Expand sidebar':'Collapse sidebar'}>{effectiveCompact?<PanelLeftOpen size={17}/>:<PanelLeftClose size={17}/>}</button>
    </div>
  </>);
  return <div className={`tws-shell cw-shell cw-role-${role}`}>
    {drawer&&<button className="tws-drawer-scrim" type="button" aria-label="Close navigation" onClick={()=>setDrawer(false)}/>}
    <aside className={`tws-sidebar ${effectiveCompact?'tws-sidebar-compact':''} ${drawer?'tws-sidebar-open':''}`}>{nav}</aside>
    <div className="tws-workspace">
      <header className="tws-topbar"><div className="tws-topbar-left"><button type="button" className="tws-menu-button" onClick={()=>setDrawer(v=>!v)} aria-label="Toggle navigation" aria-expanded={drawer}>{drawer?<X size={20}/>:<Menu size={20}/>}</button><div className="tws-breadcrumb">{copy.breadcrumb} <ChevronRight size={14}/> <strong>{title}</strong></div></div>
        <div className="tws-topbar-right"><span className="tws-school-pill"><span className="tws-live-dot"/> {schoolName}</span><Link className="tws-header-notices" href={`/${role}`} aria-label={`Go to ${copy.name} overview`} title="Return to overview"><LayoutDashboard size={18}/></Link><span className="tws-top-avatar" aria-hidden="true">{String(user.name||role[0]).charAt(0).toUpperCase()}</span></div></header>
      <main ref={contentRef} className="tws-main" id={`${role}-main`}><div className="tws-main-inner">{children}</div></main>
    </div>
  </div>;
}
