"use client";

import { motion, useReducedMotion } from "framer-motion";
import { UserRound, GraduationCap, Users, Smartphone } from "lucide-react";
import ApexParticleField from "./ApexParticleField";
import ApexCardLoaderLines from "./ApexCardLoaderLines";

const PHONES = [
  {
    role: "Parent",
    icon: UserRound,
    accent: "from-amber-500/30",
    rows: ["Ali marked present · 8:05 AM", "Fee challan #2291 due", "Monthly AI report ready"],
    offset: "lg:translate-y-10",
    delay: 0,
  },
  {
    role: "Teacher",
    icon: GraduationCap,
    accent: "from-emerald-500/30",
    rows: ["Class 7B attendance saved", "Assign AI homework · Math", "Generate paper · Physics"],
    offset: "lg:-translate-y-6",
    delay: 0.12,
  },
  {
    role: "Student",
    icon: Users,
    accent: "from-sky-500/30",
    rows: ["Homework: 3 due today", "AI quiz · Chemistry", "Result card updated"],
    offset: "lg:translate-y-10",
    delay: 0.24,
  },
];

function Phone({ data, reduce }) {
  const Icon = data.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateY: 14 }}
      whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ delay: data.delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`apex-phone ${data.offset}`}
    >
      <motion.div
        animate={reduce ? undefined : { y: [0, -14, 0] }}
        transition={{ duration: 6 + data.delay * 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative mx-auto w-[min(230px,88vw)] rounded-[2.2rem] border border-white/15 bg-slate-950/80 p-3 shadow-[0_40px_120px_rgba(8,47,73,0.5)] backdrop-blur-2xl"
      >
        <div className={`pointer-events-none absolute -top-10 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full bg-gradient-to-br ${data.accent} to-transparent blur-2xl`} />
        <div className="relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-gradient-to-b from-slate-900 to-black">
          <div className="mx-auto mt-2 h-1.5 w-16 rounded-full bg-white/15" />
          <div className="px-4 py-4">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-200 ring-1 ring-cyan-300/25">
                <Icon size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-cyan-200/70">APEX Connect</p>
                <p className="text-sm font-black text-white">{data.role}</p>
              </div>
              <span className="ml-auto h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            </div>
            <div className="space-y-2.5">
              {data.rows.map((row, ri) => (
                <motion.div
                  key={row}
                  initial={{ opacity: 0, x: 14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: data.delay + 0.3 + ri * 0.12 }}
                  className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2.5 text-[11px] font-semibold leading-4 text-slate-200"
                >
                  {row}
                </motion.div>
              ))}
            </div>
            <ApexCardLoaderLines widths={[82, 66, 90]} className="mt-4" loop />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ApexSceneSuperApp() {
  const reduce = useReducedMotion();

  return (
    <section
      id="scene-superapp"
      className="apex-scene relative scroll-mt-24 overflow-x-clip py-24 sm:py-28"
    >
      <ApexParticleField mode="drift" color="#22d3ee" accent="#c9a84c" density={0.85} />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-14 max-w-3xl text-center md:mb-20"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/5 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-100">
            <Smartphone className="h-4 w-4" /> Chapter 05 · APEX Connect
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-6xl">
            Three roles. One live super app.
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-400 md:text-lg">
            Parent, teacher, and student each float in their own device — connected to the same
            real-time school intelligence.
          </p>
        </motion.div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:items-center lg:gap-6">
          {PHONES.map((p) => (
            <Phone key={p.role} data={p} reduce={reduce} />
          ))}
        </div>
      </div>
    </section>
  );
}
