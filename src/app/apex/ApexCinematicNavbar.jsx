"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import ApexBrandLockup from "./ApexBrandLockup";
import useApexChapterNav from "./useApexChapterNav";

const navLinks = [
  { label: "Core", href: "#scene-awakening", id: "scene-awakening" },
  { label: "APEX OS", href: "#scene-os", id: "scene-os" },
  { label: "AI", href: "#scene-ai", id: "scene-ai" },
  { label: "Galaxy", href: "#scene-galaxy", id: "scene-galaxy" },
  { label: "Plans", href: "#pricing", id: "pricing" },
  { label: "Login", href: "/gateway", id: null },
];

export default function ApexCinematicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { active } = useApexChapterNav();

  useEffect(() => {
    document.body.classList.toggle("apex-drawer-open", mobileOpen);
    const onKey = (e) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("apex-drawer-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7 }}
      className="fixed left-0 right-0 top-0 z-50 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:pt-4"
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-2 rounded-2xl border border-white/10 bg-slate-950/85 px-3 py-2.5 shadow-[0_16px_48px_rgba(2,6,23,0.55)] backdrop-blur-xl sm:px-5 sm:py-3">
        <ApexBrandLockup onClick={() => setMobileOpen(false)} />

        <div className="hidden items-center gap-5 text-sm font-bold text-slate-300 lg:flex">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="apex-nav-link"
              data-active={item.id && active === item.id ? "true" : "false"}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/apex/demo-request"
            className="apex-btn-demo hidden rounded-full bg-white px-4 py-2 text-xs font-black text-slate-950 sm:inline-flex sm:text-sm"
          >
            Request Demo
          </a>
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-cyan-100 lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <div
        className="apex-mobile-menu-overlay lg:hidden"
        data-open={mobileOpen ? "true" : "false"}
        style={{ opacity: mobileOpen ? 1 : 0, pointerEvents: mobileOpen ? "auto" : "none" }}
        onClick={() => setMobileOpen(false)}
        aria-hidden
      />
      <aside
        className="apex-mobile-drawer flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 backdrop-blur-xl lg:hidden"
        data-open={mobileOpen ? "true" : "false"}
        style={{
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? "auto" : "none",
          transform: mobileOpen ? "translateX(0)" : "translateX(calc(100% + 1rem))",
        }}
        aria-hidden={!mobileOpen}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <ApexBrandLockup compact onClick={() => setMobileOpen(false)} />
          <button type="button" onClick={() => setMobileOpen(false)} className="rounded-full border border-white/10 p-2">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="custom-scrollbar flex-1 overflow-y-auto p-3">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="flex min-h-11 items-center justify-between rounded-xl px-3 py-2.5 text-sm font-bold text-slate-200 hover:bg-white/5"
            >
              {item.label}
              <ArrowRight className="h-4 w-4 text-cyan-300/60" />
            </a>
          ))}
        </div>
        <div className="grid gap-2 border-t border-white/10 p-3">
          <a href="/apex/demo-request" className="apex-btn-demo rounded-full bg-white py-3 text-center text-sm font-black text-slate-950">
            Request SaaS Demo
          </a>
          <a href="/gateway" className="rounded-full border border-white/10 py-3 text-center text-sm font-bold text-white">
            Login Gateway
          </a>
        </div>
      </aside>
    </motion.header>
  );
}
