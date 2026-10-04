"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSchoolBranding } from '@/hooks/useSchoolBranding';
import PremiumLogo from '@/components/PremiumLogo';
import {
  LayoutDashboard, ClipboardCheck, BookOpenText, GraduationCap, FileText,
  CalendarDays, Menu, X, LogOut, ArrowUpRight, ChevronRight, Sparkles,
  PanelLeftClose, PanelLeftOpen, Globe2, Bell,
} from 'lucide-react';

const links = [
  { label: 'Overview', href: '/teacher', icon: LayoutDashboard },
  { label: 'Attendance', href: '/teacher/attendance', icon: ClipboardCheck },
  { label: 'Marks & results', href: '/teacher/assessments', icon: GraduationCap },
  { label: 'Online exams', href: '/teacher/assessments/online-exams', icon: Globe2 },
  { label: 'Lesson studio', href: '/teacher/academics', icon: BookOpenText },
  { label: 'My classes', href: '/teacher/classes', icon: CalendarDays },
  { label: 'Paper studio', href: '/teacher/paper-generator', icon: FileText },
];

export default function TeacherWorkspaceShell({ children, title }: {children: React.ReactNode; title: string}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { schoolName, schoolLogo } = useSchoolBranding();
  const [drawer, setDrawer] = useState(false);
  const [compact, setCompact] = useState(false);
  const goLogout = () => { logout(); router.replace('/login?next=%2Fteacher&logout=1'); };

  const nav = (
    <>
      <div className="tws-brand">
        <div className="tws-brand-mark"><PremiumLogo src={schoolLogo || '/ilm-logo.svg'} size={43} /></div>
        {!compact && <div className="tws-brand-copy"><strong>AL SIDDIQUE</strong><span>SCHOLARS PUBLIC SCHOOL</span><small>APEX · FACULTY SPACE</small></div>}
      </div>
      <div className="tws-nav-label">{compact ? '—' : 'WORKSPACE'}</div>
      <nav className="tws-links" aria-label="Teacher portal navigation">
        {links.map(({label,href,icon:Icon})=>{
          const active=pathname===href || (href!=='/teacher' && pathname.startsWith(`${href}/`) && !links.some(other=>other.href!==href && other.href.startsWith(`${href}/`) && pathname.startsWith(other.href)));
          return <Link key={href} href={href} title={compact ? label : undefined} aria-current={active?'page':undefined} onClick={()=>setDrawer(false)} className={`tws-nav-link ${active?'tws-nav-active':''}`}><Icon size={19} strokeWidth={1.9}/>{!compact&&<span>{label}</span>}{active&&!compact&&<span className="tws-nav-dot"/>}</Link>;
        })}
      </nav>
      <div className="tws-sidebar-bottom">
        {!compact && <div className="tws-side-note"><span className="tws-note-glyph"><Sparkles size={17}/></span><strong>Teach with clarity.</strong><small>Your classes, papers and insights in one place.</small><Link href="/teacher/classes">View my classes <ArrowUpRight size={13}/></Link></div>}
        <div className="tws-profile"><span className="tws-avatar">{String(user?.name||'T').charAt(0).toUpperCase()}</span>{!compact&&<div><strong>{user?.name||'Teacher account'}</strong><small>Faculty member</small></div>}</div>
        <button onClick={goLogout} className="tws-signout" type="button"><LogOut size={17}/>{!compact&&'Sign out'}</button>
        <button className="tws-compact-toggle" onClick={()=>setCompact(v=>!v)} type="button" aria-label={compact?'Expand sidebar':'Collapse sidebar'}>{compact?<PanelLeftOpen size={17}/>:<PanelLeftClose size={17}/>}</button>
      </div>
    </>
  );
  if (!user) return null;
  return <div className="tws-shell">
    {drawer && <button className="tws-drawer-scrim" type="button" aria-label="Close menu" onClick={()=>setDrawer(false)}/>}
    <aside className={`tws-sidebar ${compact?'tws-sidebar-compact':''} ${drawer?'tws-sidebar-open':''}`}>{nav}</aside>
    <div className="tws-workspace">
      <header className="tws-topbar">
        <div className="tws-topbar-left"><button type="button" className="tws-menu-button" onClick={()=>setDrawer(v=>!v)} aria-label="Toggle teacher navigation">{drawer?<X size={20}/>:<Menu size={20}/>}</button><div className="tws-breadcrumb">Faculty space <ChevronRight size={14}/> <strong>{title}</strong></div></div>
        <div className="tws-topbar-right"><span className="tws-school-pill"><span className="tws-live-dot"/> {schoolName}</span><Link className="tws-header-notices" href="/teacher" title="Teacher workspace"><Bell size={18}/></Link><span className="tws-top-avatar">{String(user.name||'T').charAt(0).toUpperCase()}</span></div>
      </header>
      <main className="tws-main" id="teacher-main"><div className="tws-main-inner">{children}</div></main>
    </div>
  </div>;
}
