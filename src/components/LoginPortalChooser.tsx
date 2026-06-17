"use client";

import { LayoutDashboard, MonitorSmartphone, ArrowRight, ShieldCheck } from "lucide-react";
import { openSaasLogin, openSuperAppLogin, APEX_GATEWAY_URL } from "@/lib/portalUrls";

function PortalCard({
  icon: Icon,
  title,
  subtitle,
  description,
  buttonLabel,
  onOpen,
}: {
  icon: typeof LayoutDashboard;
  title: string;
  subtitle: string;
  description: string;
  buttonLabel: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative w-full overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.07] p-6 text-left shadow-2xl backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-300/40 sm:p-8"
    >
      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-cyan-300/10 blur-3xl transition group-hover:bg-cyan-300/20" />
      <div className="relative mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200 ring-1 ring-cyan-300/20">
        <Icon size={28} />
      </div>
      <h2 className="relative text-2xl font-bold text-white">{title}</h2>
      <p className="relative mt-1 text-sm font-semibold text-cyan-200">{subtitle}</p>
      <p className="relative mt-4 text-sm leading-relaxed text-slate-400">{description}</p>
      <span className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-950 transition group-hover:bg-cyan-100">
        {buttonLabel}
        <ArrowRight className="h-4 w-4" />
      </span>
    </button>
  );
}

/** Pick SaaS vs Super App — each opens on its own domain in a new tab. */
export default function LoginPortalChooser() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#040711] px-4 py-12 text-white sm:px-6 sm:py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.18),transparent_45%)]" />
      <div className="relative mx-auto max-w-3xl">
        <div className="text-center">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-cyan-200">
            <ShieldCheck className="h-4 w-4" />
            APEX Secure Gateway
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Choose your portal</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
            School management (APEX OS) and the community app (APEX Connect) run on separate
            secure URLs. Your choice opens in a new browser tab.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <PortalCard
            icon={LayoutDashboard}
            title="APEX OS"
            subtitle="School Management SaaS"
            description="For school owners, principals, and office staff — fees, exams, attendance, and admin dashboard."
            buttonLabel="Open APEX OS Login"
            onOpen={openSaasLogin}
          />
          <PortalCard
            icon={MonitorSmartphone}
            title="APEX Connect"
            subtitle="Super App"
            description="For teachers, parents, and students — homework, diary, attendance, and parent engagement."
            buttonLabel="Open APEX Connect Login"
            onOpen={openSuperAppLogin}
          />
        </div>

        <p className="mt-8 text-center text-xs text-slate-500">
          <a href={APEX_GATEWAY_URL} className="text-cyan-300/80 hover:text-cyan-200">
            Back to APEX Gateway
          </a>
        </p>
      </div>
    </main>
  );
}
