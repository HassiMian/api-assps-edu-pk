"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard,
  MonitorSmartphone,
  Sparkles,
  MessageCircle,
  Bot,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { openSaasLogin, openSuperAppLogin } from "@/lib/portalUrls";

export default function ApexGatewayPage() {
  const openWhatsApp = () => {
    window.open("https://wa.me/923000000000", "_blank", "noopener,noreferrer");
  };

  const openAIChat = () => {
    window.location.href = "/apex/contact";
  };

  return (
    <main className="relative min-h-screen max-w-full overflow-x-hidden bg-[#040711] px-4 py-12 text-white sm:px-6 sm:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.18),transparent_45%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <a
            href="/apex"
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.07] shadow-2xl backdrop-blur-xl"
            aria-label="Open APEX homepage"
          >
            <Sparkles className="text-cyan-300" size={36} />
          </a>

          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-cyan-200">
            <ShieldCheck size={16} />
            APEX Education Gateway
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-6xl">
            Welcome to APEX Gateway
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            Choose APEX OS (school SaaS) or APEX Connect (super app). Each login opens on its own
            secure domain in a new tab.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-5 md:mt-14 md:grid-cols-2 lg:mt-16 lg:gap-7">
          <GatewayCard
            icon={LayoutDashboard}
            title="APEX OS"
            subtitle="School Management SaaS"
            desc="Admin dashboard for school owners, principals and management staff."
            button="Open APEX OS Login"
            onOpen={openSaasLogin}
          />

          <GatewayCard
            icon={MonitorSmartphone}
            title="APEX Connect"
            subtitle="Parent, Teacher & Student Super App"
            desc="Connected experience for teachers, parents and students."
            button="Open APEX Connect Login"
            onOpen={openSuperAppLogin}
          />
        </div>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
          <a
            href="/apex/pricing"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
          >
            Subscribe Now
            <ArrowRight size={17} />
          </a>

          <a
            href="/apex/demo-request"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Book Demo
          </a>
        </div>
      </div>

      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 sm:bottom-6 sm:right-6">
        <button
          onClick={openAIChat}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-400 text-slate-950 shadow-2xl transition hover:scale-105 sm:h-14 sm:w-14"
          title="AI Customer Support"
          type="button"
        >
          <Bot size={25} />
        </button>

        <button
          onClick={openWhatsApp}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-950 shadow-2xl transition hover:scale-105 sm:h-14 sm:w-14"
          title="WhatsApp Support"
          type="button"
        >
          <MessageCircle size={25} />
        </button>
      </div>
    </main>
  );
}

function GatewayCard({ icon: Icon, title, subtitle, desc, button, onOpen }) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, y: 35 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative w-full overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.07] p-5 text-left shadow-2xl backdrop-blur-xl transition hover:-translate-y-2 hover:border-cyan-300/40 hover:bg-white/[0.1] sm:rounded-[2rem] sm:p-8"
    >
      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-cyan-300/10 blur-3xl transition group-hover:bg-cyan-300/20" />

      <div className="relative mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200 ring-1 ring-cyan-300/20">
        <Icon size={31} />
      </div>

      <h2 className="relative text-2xl font-semibold sm:text-3xl">{title}</h2>

      <p className="relative mt-2 text-cyan-200">{subtitle}</p>

      <p className="relative mt-5 leading-7 text-slate-300">{desc}</p>

      <div className="relative mt-8 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition group-hover:bg-cyan-100 sm:w-auto">
        {button}
        <ArrowRight size={17} className="transition group-hover:translate-x-1" />
      </div>
    </motion.button>
  );
}
