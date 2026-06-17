"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Globe, FileText, Send, BadgeCheck, KeyRound, Network } from "lucide-react";
import ApexParticleField from "./ApexParticleField";

const STEPS = [
  { icon: Globe, label: "Visitor", sub: "Discovers the school", color: "text-cyan-200", dot: "#22d3ee" },
  { icon: FileText, label: "Admission Form", sub: "Online application", color: "text-blue-200", dot: "#60a5fa" },
  { icon: Send, label: "Request", sub: "Submitted to school", color: "text-indigo-200", dot: "#818cf8" },
  { icon: BadgeCheck, label: "Approval", sub: "Reviewed & accepted", color: "text-emerald-200", dot: "#34d399" },
  { icon: KeyRound, label: "Credentials", sub: "Login issued", color: "text-amber-200", dot: "#fbbf24" },
  { icon: Network, label: "Connected", sub: "Inside the ecosystem", color: "text-cyan-200", dot: "#22d3ee" },
];

export default function ApexSceneWeb() {
  const reduce = useReducedMotion();

  return (
    <section
      id="scene-web"
      className="apex-scene relative flex min-h-[100dvh] scroll-mt-24 items-center overflow-x-clip py-24"
    >
      <ApexParticleField mode="stream" color="#22d3ee" accent="#60a5fa" density={0.9} />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-12 max-w-3xl text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-100">
            Chapter 06 · APEX Web
          </div>
          <h2 className="bg-gradient-to-r from-cyan-200 via-white to-blue-300 bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-4xl md:text-6xl">
            From a visitor to a connected school.
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-300 md:text-lg">
            APEX Web turns your public website into an admissions engine — every applicant flows
            straight into the connected education ecosystem.
          </p>
        </motion.div>

        {/* browser mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mx-auto mb-12 max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
            <span className="ml-3 truncate rounded-md bg-white/[0.05] px-3 py-1 font-mono text-[11px] text-slate-400">
              https://www.your-school.edu.pk
            </span>
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="h-3 w-2/3 rounded-full bg-white/15" />
              <div className="mt-3 h-2.5 w-full rounded-full bg-white/8" />
              <div className="mt-2 h-2.5 w-5/6 rounded-full bg-white/8" />
              <div className="mt-5 inline-flex rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-2 text-xs font-black text-white">
                Apply for Admission
              </div>
            </div>
            <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/[0.04] p-4">
              <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-200/70">
                Admission form
              </div>
              {["Student name", "Class", "Guardian"].map((f) => (
                <div key={f} className="mt-3">
                  <div className="text-[10px] text-slate-500">{f}</div>
                  <div className="mt-1 h-6 rounded-md border border-white/10 bg-white/[0.03]" />
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* journey flow */}
        <div className="apex-web-flow relative flex flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-0">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="relative flex flex-1 items-center gap-3 sm:flex-col sm:items-center sm:text-center"
              >
                <div className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-slate-950/80 ${s.color}`}
                  style={{ boxShadow: `0 0 22px ${s.dot}33` }}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="sm:mt-3">
                  <div className="text-sm font-black text-white">{s.label}</div>
                  <div className="text-[11px] text-slate-400">{s.sub}</div>
                </div>
                {/* connector */}
                {i < STEPS.length - 1 && (
                  <span
                    className="apex-web-connector pointer-events-none absolute left-6 top-12 h-[calc(100%-1.5rem)] w-px bg-gradient-to-b from-cyan-300/40 to-transparent sm:left-auto sm:top-6 sm:h-px sm:w-full sm:translate-x-1/2 sm:bg-gradient-to-r"
                    aria-hidden
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
