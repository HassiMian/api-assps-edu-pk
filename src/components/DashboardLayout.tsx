"use client";

import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import PremiumLogo from '@/components/PremiumLogo';
import { useSchoolBranding } from '@/hooks/useSchoolBranding';

export default function DashboardLayout({
  children,
  role,
  title
}: {
  children: React.ReactNode;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  title: string;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const { schoolName, schoolLogo, loading: brandingLoading } = useSchoolBranding();
  const portalBrand = role === 'admin' ? 'Apex OS' : 'Apex Connect';

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobile) {
      document.body.classList.remove("apex-drawer-open");
      return;
    }
    if (mobileOpen) document.body.classList.add("apex-drawer-open");
    else document.body.classList.remove("apex-drawer-open");
    return () => document.body.classList.remove("apex-drawer-open");
  }, [isMobile, mobileOpen]);

  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
  }, []);

  useEffect(() => {
    if (!loading && !brandingLoading) {
      setLoadingProgress(100);
      return;
    }
    setLoadingProgress(0);
    const start = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const eased = Math.min(100, Math.round(100 - Math.pow(1 - Math.min(elapsed / 1800, 1), 2.2) * 100));
      setLoadingProgress((prev) => Math.max(prev, eased));
      if (elapsed >= 1800) window.clearInterval(timer);
    }, 24);
    return () => window.clearInterval(timer);
  }, [loading, brandingLoading]);

  useLayoutEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    const key = `apex_connect_scroll_${pathname}`;
    const saved = sessionStorage.getItem(key);
    const target = saved != null ? parseInt(saved, 10) : 0;
    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (mainRef.current) mainRef.current.scrollTop = Number.isFinite(target) ? target : 0;
      });
    });
    return () => {
      sessionStorage.setItem(key, String(main.scrollTop));
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [pathname]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || brandingLoading) {
    return (
      <div className="min-h-screen bg-[#050d1a] flex items-center justify-center px-6 relative overflow-hidden">
        <div className="relative w-full max-w-2xl rounded-[34px] border border-white/10 bg-white/6 backdrop-blur-2xl p-8 sm:p-10 shadow-[0_30px_120px_rgba(0,0,0,0.55)] overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400" />
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              {schoolLogo ? (
                <PremiumLogo src={schoolLogo} size={72} />
              ) : (
                <div className="grid h-20 w-20 place-items-center rounded-full border border-amber-400/30 bg-slate-800/80 text-xl font-black text-white shadow-xl">
                  {schoolName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'S'}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.38em] text-emerald-300 font-semibold">APEX secure session</div>
              <div className="mt-2 text-xl sm:text-2xl font-black tracking-tight text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                {schoolName}
              </div>
            </div>
          </div>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
            We are checking your session, restoring your layout, and moving you into the correct dashboard without interruption.
          </p>
          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">
              <span>Loading</span>
              <span>{loadingProgress}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-white/10 shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-200 transition-[width] duration-150 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-slate-500">
            <span>{portalBrand}</span>
            <span>Secure loading flow</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 flex relative">
      {/* Mobile sidebar overlay backdrop */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[25]"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed top-0 left-0 h-full z-[30]' : 'relative'}
        ${isMobile && !mobileOpen ? '-translate-x-full' : 'translate-x-0'}
        transition-transform duration-300 ease-in-out
      `}>
        <Sidebar role={role} />
      </div>

      {/* Main content */}
      <div className={`flex-1 flex flex-col min-h-screen ml-0`}>
        {/* Mobile topbar strip with hamburger */}
        {isMobile && (
          <div className="h-16 glass-panel border-x-0 border-t-0 flex items-center gap-3 px-3 sm:px-4 bg-slate-900/60 sticky top-0 z-20">
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center bg-slate-800/60 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {schoolLogo ? (
                <PremiumLogo src={schoolLogo} size={36} className="shrink-0" />
              ) : (
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-amber-400/20 bg-slate-800/80 text-xs font-black text-white">
                  {schoolName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'A'}
                </div>
              )}
              <div className="min-w-0">
                <h2 className="truncate text-sm font-black tracking-tight text-white">{title}</h2>
                <p className="truncate text-[11px] font-medium text-slate-400">{schoolName}</p>
              </div>
            </div>
          </div>
        )}

        {/* Desktop topbar */}
        {!isMobile && <Topbar title={title} />}

        <main ref={mainRef} className="flex-1 overflow-y-auto relative" style={{ padding: isMobile ? '16px 12px' : '32px' }}>
          <div className="max-w-none space-y-8 relative z-10 w-full transition-all duration-300">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
