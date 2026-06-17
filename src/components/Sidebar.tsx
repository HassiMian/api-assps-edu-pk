"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { memo, useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, Users, BookOpen, GraduationCap, Settings, CreditCard,
  FileText, BrainCircuit, MessageSquare, LogOut, Calendar, CheckSquare,
  Megaphone, BarChart3, Shield, ClipboardList, ArrowLeftRight, UserPlus,
  Bus, Library, School, X, ChevronLeft, ChevronRight, Briefcase
} from 'lucide-react';

import { useSchoolBranding } from '@/hooks/useSchoolBranding';
import PremiumLogo from '@/components/PremiumLogo';

const menus = {
  admin: [
    { name: 'Dashboard',     icon: LayoutDashboard, path: '/admin', color: '#FF9F0A' },
    { name: 'Employees',     icon: Briefcase,       path: '/admin/employees', color: '#30D158' },
    { name: 'Students',      icon: Users,            path: '/admin/students', color: '#0A84FF' },
    { name: 'Admissions',    icon: UserPlus,         path: '/admin/admissions', color: '#BF5AF2' },
    { name: 'Parents',       icon: Shield,           path: '/admin/parents', color: '#FF375F' },
    { name: 'Attendance',    icon: ClipboardList,    path: '/admin/attendance', color: '#0A84FF' },
    { name: 'Classes',       icon: School,           path: '/admin/classes', color: '#30D158' },
    { name: 'Events',       icon: Calendar,         path: '/admin/events', color: '#FF9F0A' },
    { name: 'Library',       icon: Library,          path: '/admin/library', color: '#A78BFA' },
    { name: 'Transport',     icon: Bus,              path: '/admin/transport', color: '#0A84FF' },
    { name: 'Notices',       icon: Megaphone,        path: '/admin/announcements', color: '#FF375F' },
    { name: 'Reports',       icon: BarChart3,        path: '/admin/ai-analytics', color: '#22d3ee' },
    { name: 'Fees',          icon: CreditCard,      path: '/admin/finance', color: '#FF375F' },
    { name: 'Setup',         icon: Settings,         path: '/admin/saas', color: '#8E8E93' },
  ],
  teacher: [
    { name: 'Dashboard',      icon: LayoutDashboard, path: '/teacher', color: '#FF9F0A' },
    { name: 'Attendance',     icon: CheckSquare,     path: '/teacher/attendance', color: '#0A84FF' },
    { name: 'Marks',          icon: ClipboardList,   path: '/teacher/assessments', color: '#30D158' },
    { name: 'Lessons',        icon: BookOpen,        path: '/teacher/academics', color: '#BF5AF2' },
    { name: 'Classes',        icon: Calendar,        path: '/teacher/classes', color: '#30D158' },
    { name: 'Papers',         icon: FileText,        path: '/teacher/paper-generator', color: '#A78BFA' },
  ],
  student: [
    { name: 'Dashboard',  icon: LayoutDashboard, path: '/student', color: '#FF9F0A' },
    { name: 'Quiz',       icon: BrainCircuit,   path: '/student/quiz', color: '#22d3ee' },
    { name: 'Homework',   icon: MessageSquare,  path: '/student/homework', color: '#30D158' },
    { name: 'Results',    icon: BarChart3,      path: '/student/ai-insights', color: '#BF5AF2' },
    { name: 'Skills',     icon: GraduationCap, path: '/student/skills', color: '#FF375F' },
  ],
  parent: [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/parent', color: '#FF9F0A' },
    { name: 'Results',   icon: BarChart3,      path: '/parent/ai-insights', color: '#BF5AF2' },
    { name: 'Fees',      icon: CreditCard,      path: '/parent/finance', color: '#FF375F' },
    { name: 'Updates',   icon: FileText,        path: '/parent/reports', color: '#30D158' },
  ],
};

function Sidebar({ role }: { role: keyof typeof menus }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const menuItems = menus[role] || menus.student;
  const { schoolLogo, schoolName, schoolCode } = useSchoolBranding();
  
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('superapp_sidebar_collapsed');
      if (stored !== null) setCollapsed(stored === 'true');
    }

    const check = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setCollapsed(false); // don't collapse on mobile, handled by dashboard overlay
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || isMobile) return;
    window.localStorage.setItem('superapp_sidebar_collapsed', String(collapsed));
  }, [collapsed, isMobile]);

  const effectiveCollapsed = !isMobile && collapsed && !isHovered;
  const inactiveIcon = 'rgba(224,229,238,0.94)';
  const inactiveText = 'rgba(224,229,238,0.92)';

  const goToLogin = (nextRole?: string | null) => {
    const params = new URLSearchParams();
    const scopedSchool = schoolCode || (user?.school_id ? String(user.school_id) : '');
    if (scopedSchool) {
      if (/^\d+$/.test(scopedSchool)) params.set('school_id', scopedSchool);
      else params.set('school_code', scopedSchool);
    }
    if (nextRole) params.set('role', nextRole);
    logout();
    router.push(`/login${params.toString() ? `?${params.toString()}` : ''}`);
    setShowSwitchModal(false);
  };

  const handleSwitch = () => {
    setShowSwitchModal(true);
  };

  const renderLeaf = (item: { path: string; name: string; color: string; icon: React.ComponentType<{ size?: number; color?: string }> }) => {
    const isActive = pathname === item.path;
    return (
      <Link href={item.path} key={item.path} style={{
        display: 'flex', alignItems: 'center',
        gap: effectiveCollapsed ? 0 : 8,
        padding: effectiveCollapsed ? '8px' : '7px 9px',
        borderRadius: 9, textDecoration: 'none',
        transition: 'transform 0.24s cubic-bezier(0.34,1.2,0.64,1), background 0.24s ease, box-shadow 0.24s ease',
        position: 'relative', cursor: 'pointer',
        justifyContent: effectiveCollapsed ? 'center' : 'flex-start',
        background: isActive ? `linear-gradient(135deg, ${item.color}24 0%, rgba(15,23,42,0.26) 100%)` : 'transparent',
        borderLeft: isActive ? `3px solid ${item.color}` : '3px solid transparent',
        marginLeft: -3,
        color: isActive ? item.color : 'rgba(192,200,216,0.75)',
        boxShadow: isActive ? `0 8px 18px ${item.color}10` : 'none',
      }}>
        <div style={{
          width: effectiveCollapsed ? 38 : 32, height: effectiveCollapsed ? 38 : 32, borderRadius: 10, flexShrink: 0,
          background: isActive ? `${item.color}26` : 'rgba(255,255,255,0.045)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
          boxShadow: isActive ? `0 0 12px ${item.color}24` : 'none',
        }}>
          <item.icon size={effectiveCollapsed ? 19 : 16} color={isActive ? item.color : inactiveIcon} />
        </div>
        {!effectiveCollapsed && (
          <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 600, whiteSpace: 'nowrap', color: isActive ? item.color : inactiveText }}>
            {item.name}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      className={`h-screen flex flex-col z-[40] transition-all duration-300 ease-in-out ${isMobile ? 'w-64 rounded-r-3xl' : effectiveCollapsed ? 'w-[68px] rounded-r-2xl' : 'w-64 rounded-r-2xl'}`}
      style={{
        position: isMobile ? 'absolute' : 'relative',
        top: 0, left: 0,
        background: 'linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(10,28,49,0.98) 100%)',
        borderRight: '1px solid rgba(148,163,184,0.18)',
        boxShadow: '10px 0 28px rgba(0,0,0,0.30), -1px 0 0 rgba(200,153,26,0.12) inset',
        overflow: 'hidden',
      }}
    >
      {/* Brand Header */}
      <div style={{
        padding: effectiveCollapsed ? '18px 10px' : '18px 16px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: '1px solid rgba(148,163,184,0.12)',
        justifyContent: effectiveCollapsed ? 'center' : 'flex-start',
        flexShrink: 0,
      }}>
        <PremiumLogo
          src={schoolLogo || '/ilm-logo.svg'}
          size={effectiveCollapsed ? 48 : 40}
          className="flex-shrink-0"
        />
        {!effectiveCollapsed && (
          <div style={{ minWidth: 0 }}>
            <h1 style={{ 
              fontSize: 15, fontWeight: 800, margin: 0, letterSpacing: '-0.3px', lineHeight: 1.2,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              background: 'linear-gradient(90deg, #fff 0%, #C8991A 50%, #fff 100%)', backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              animation: 'shimmer 4s linear infinite', filter: 'drop-shadow(0 0 8px rgba(200,153,26,0.3))'
            }}>
              {schoolName}
            </h1>
            <style>{`@keyframes shimmer { to { background-position: 200% center; } }`}</style>
            <div style={{ fontSize: 9, color: 'rgba(200,153,26,0.7)', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              Smart School Portal
            </div>
            <div style={{ fontSize: 10, color: 'rgba(192,200,216,0.5)', marginTop: 3 }}>
              School operations at a glance
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav
        ref={navRef}
        style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: effectiveCollapsed ? '12px 8px' : '12px 16px', display: 'flex', flexDirection: 'column', gap: 2, scrollbarWidth: 'thin', scrollbarColor: 'rgba(200,153,26,0.25) transparent' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {menuItems.map(renderLeaf)}
        </div>
      </nav>

      {/* User & Actions */}
      <div style={{
        padding: effectiveCollapsed ? '12px 8px' : '12px 14px',
        borderTop: '1px solid rgba(148,163,184,0.12)',
        display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0,
      }}>
        {!effectiveCollapsed && (
          <div style={{
            padding: '10px 12px', background: 'rgba(11,44,77,0.92)',
            border: '1px solid rgba(148,163,184,0.16)', borderRadius: 18,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg, #0A84FF, #22d3ee)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: 14, flexShrink: 0,
            }}>
              {user?.name?.[0] || 'A'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#fff', fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name?.toLowerCase().includes('demo') ? 'Admin User' : (user?.name || 'User')}
              </div>
              <div style={{ color: 'rgba(200,153,26,0.7)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                {role}
              </div>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => { logout(); router.push('/login') }}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: 'rgba(255,55,95,0.1)', color: '#FF375F',
              border: '1px solid rgba(255,55,95,0.2)', borderRadius: 12,
              padding: effectiveCollapsed ? '10px 0' : '9px 12px',
              fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <LogOut size={14} /> {!effectiveCollapsed && 'Logout'}
          </button>
          {!isMobile && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '9px 11px', borderRadius: 12, background: 'rgba(11,44,77,0.92)',
                border: '1px solid rgba(148,163,184,0.16)', color: 'rgba(192,200,216,0.6)',
                cursor: 'pointer', transition: 'all 0.2s', fontSize: 13,
              }}
            >
              {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            </button>
          )}
          {!effectiveCollapsed && (
            <button
              onClick={handleSwitch}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyItems: 'center', gap: 6,
                background: 'rgba(10,132,255,0.1)', color: '#0A84FF',
                border: '1px solid rgba(10,132,255,0.2)', borderRadius: 12,
                padding: '9px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}
            >
              <ArrowLeftRight size={14} /> Switch
            </button>
          )}
        </div>
      </div>

      {showSwitchModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={() => setShowSwitchModal(false)}>
          <div className="w-full max-w-md rounded-3xl border border-slate-700/60 bg-[#0b2747] shadow-2xl p-5 sm:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-amber-400 font-semibold">Switch Center</p>
                <h3 className="text-white text-xl font-semibold mt-1">Choose another portal</h3>
                <p className="text-slate-400 text-sm mt-1">You will be sent back to the secure login screen.</p>
              </div>
              <button onClick={() => setShowSwitchModal(false)} className="w-9 h-9 rounded-xl bg-slate-800/70 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {(['admin', 'teacher', 'student', 'parent'] as const).map((nextRole) => (
                <button key={nextRole} onClick={() => goToLogin(nextRole)} className="rounded-2xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 px-4 py-4 text-left transition-colors">
                  <p className="text-white font-semibold capitalize">{nextRole} Portal</p>
                  <p className="text-slate-400 text-xs mt-1">Re-authenticate for this role</p>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={() => goToLogin(null)} className="rounded-2xl border border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/15 text-amber-300 px-4 py-3 font-medium transition-colors">
                Change School
              </button>
              <button onClick={() => setShowSwitchModal(false)} className="rounded-2xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-200 px-4 py-3 font-medium transition-colors">
                Stay Here
              </button>
            </div>
            <p className="text-slate-500 text-xs mt-4">
              {schoolName} {schoolCode ? `(${schoolCode})` : ''} - No alternate account is hardcoded here, so the login screen will handle portal access securely.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}

export default memo(Sidebar);
