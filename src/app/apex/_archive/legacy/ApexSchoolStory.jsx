"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ClipboardList,
  CreditCard,
  FileSpreadsheet,
  Layers3,
  MessageCircle,
  Sparkles,
} from "lucide-react";

const problems = [
  { icon: ClipboardList, title: "Paper registers", detail: "Attendance and homework trapped in notebooks." },
  { icon: CreditCard, title: "Fee challans", detail: "Manual tracking, late follow-ups, no live parent view." },
  { icon: FileSpreadsheet, title: "Scattered records", detail: "Students, exams, and reports in disconnected files." },
  { icon: MessageCircle, title: "WhatsApp chaos", detail: "Parents and teachers rely on endless chat threads." },
  { icon: Layers3, title: "Slow decisions", detail: "Owners wait days for clarity on school health." },
];

const transformSteps = [
  "APEX Core activates",
  "Departments connect in real time",
  "Teachers, parents, and students align",
  "Owners see live intelligence",
];

const ease = [0.22, 1, 0.36, 1];

function Reveal({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.75, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function ApexSchoolStory() {
  const reduce = useReducedMotion();

  return (
    <>
      <section id="story" className="relative scroll-mt-28 px-4 py-20 sm:px-6 md:py-28">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/5 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-amber-200">
              <AlertTriangle className="h-4 w-4" /> Act I — The problem
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
              From manual school management to intelligent APEX
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-400 md:text-lg">
              Every day starts with registers, challans, attendance sheets, and scattered records — while decisions
              stay slow.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {problems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.title}>
                  <motion.article
                    whileHover={reduce ? undefined : { y: -6, scale: 1.01 }}
                    className="cinematic-card group h-full rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-6"
                  >
                    <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl border border-amber-300/20 bg-amber-300/10">
                      <Icon className="h-5 w-5 text-amber-200" />
                    </div>
                    <h3 className="text-lg font-black text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-400">{item.detail}</p>
                  </motion.article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section id="transformation" className="relative scroll-mt-28 px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/5 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-100">
              <Sparkles className="h-4 w-4" /> Act II — Transformation
            </div>
            <h2 className="text-3xl font-black text-white sm:text-4xl md:text-5xl">
              APEX Core connects every department
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-400 md:text-lg">
              Scroll down to watch the network expand — students, teachers, parents, fees, attendance, exams, and AI
              reports through one operating core.
            </p>
          </Reveal>

          <Reveal className="mt-12">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {transformSteps.map((step, i) => (
                <div
                  key={step}
                  className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-4 text-center backdrop-blur-xl"
                >
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300/70">
                    Step {i + 1}
                  </div>
                  <div className="mt-2 text-sm font-bold text-white">{step}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
