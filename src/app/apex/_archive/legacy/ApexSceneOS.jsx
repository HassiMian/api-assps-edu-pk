"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ClipboardCheck,
  Users,
  CalendarCheck,
  CreditCard,
  FileCheck,
  Trophy,
  UserCog,
  Wallet,
} from "lucide-react";
import ApexParticleField from "./ApexParticleField";

const WORLDS = [
  { icon: ClipboardCheck, name: "Admissions", desc: "Inquiry → enrollment pipeline", tone: "from-blue-500/25" },
  { icon: Users, name: "Students", desc: "Profiles, classes, promotions", tone: "from-cyan-500/25" },
  { icon: CalendarCheck, name: "Attendance", desc: "Daily live attendance pulse", tone: "from-emerald-500/25" },
  { icon: CreditCard, name: "Fees", desc: "Challans, collection, pending", tone: "from-amber-500/25" },
  { icon: FileCheck, name: "Exams", desc: "Datesheets, marks, grading", tone: "from-violet-500/25" },
  { icon: Trophy, name: "Results", desc: "Result cards, analytics", tone: "from-rose-500/25" },
  { icon: UserCog, name: "HR", desc: "Staff, roles, departments", tone: "from-sky-500/25" },
  { icon: Wallet, name: "Payroll", desc: "Salaries, slips, payouts", tone: "from-teal-500/25" },
];

export default function ApexSceneOS() {
  const reduce = useReducedMotion();

  return (
    <section
      id="scene-os"
      className="apex-scene relative scroll-mt-24 overflow-hidden bg-[#030712] py-24 sm:py-28"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.18),transparent_50%)]" />
      <ApexParticleField mode="drift" color="#3b82f6" accent="#22d3ee" density={0.8} />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-14 max-w-3xl text-center md:mb-20"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-300/5 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-blue-100">
            Scene 04 · APEX OS
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-6xl">
            Every operation becomes a floating world
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-400 md:text-lg">
            Admissions, students, attendance, fees, exams, results, HR, and payroll —
            each a self-contained world orbiting the APEX Core.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4">
          {WORLDS.map((w, i) => {
            const Icon = w.icon;
            const floatDur = 6 + (i % 4);
            return (
              <motion.div
                key={w.name}
                initial={{ opacity: 0, y: 36, rotateX: 12 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="apex-world-card group"
              >
                <motion.div
                  animate={reduce ? undefined : { y: [0, i % 2 === 0 ? -10 : 10, 0] }}
                  transition={{ duration: floatDur, repeat: Infinity, ease: "easeInOut" }}
                  className="relative h-full overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition group-hover:border-cyan-300/40"
                >
                  <div className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${w.tone} to-transparent blur-2xl`} />
                  <div className="relative z-10">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950/70 text-cyan-200 ring-1 ring-cyan-300/25 transition group-hover:ring-amber-300/50">
                      <Icon size={22} />
                    </div>
                    <h3 className="text-base font-black text-white sm:text-lg">{w.name}</h3>
                    <p className="mt-1.5 text-xs leading-5 text-slate-400">{w.desc}</p>
                    <div className="mt-4 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/80">Live module</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
