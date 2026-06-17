"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Users,
  GraduationCap,
  FileText,
  CreditCard,
  Bus,
  CalendarDays,
  BarChart3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const modules = [
  { title: "Students", icon: Users, angle: 0 },
  { title: "Teachers", icon: GraduationCap, angle: 45 },
  { title: "AI Paper Generator", icon: Brain, angle: 90 },
  { title: "Exams & Results", icon: BarChart3, angle: 135 },
  { title: "Fee Management", icon: CreditCard, angle: 180 },
  { title: "Transport", icon: Bus, angle: 225 },
  { title: "Daily Diary", icon: CalendarDays, angle: 270 },
  { title: "Documents", icon: FileText, angle: 315 },
];

export default function CleanApexModuleGalaxy() {
  const radius = 250;

  return (
    <section id="module-galaxy" className="relative scroll-mt-32 overflow-hidden bg-[#050814] py-28 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.22),transparent_45%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.04),transparent)]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-20 max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-blue-100 backdrop-blur">
            <Sparkles size={16} />
            One Intelligent Education Core
          </div>

          <h2 className="text-4xl font-semibold tracking-tight md:text-6xl">
            APEX Core connects every school module
          </h2>

          <p className="mt-5 text-base leading-7 text-slate-300 md:text-lg">
            Students, teachers, fees, exams, transport, diary and AI tools work
            together through one powerful education operating system.
          </p>
        </div>

        <div className="relative mx-auto hidden h-[720px] max-w-[980px] lg:block">
          <motion.div
            className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-300/10"
            animate={{ rotate: 360 }}
            transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
          />

          <motion.div
            className="absolute left-1/2 top-1/2 h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/10"
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          />

          <svg className="absolute inset-0 h-full w-full">
            <defs>
              <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
                <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
              </linearGradient>
            </defs>

            {modules.map((module, index) => {
              const rad = (module.angle * Math.PI) / 180;
              const x = 490 + Math.cos(rad) * radius;
              const y = 360 + Math.sin(rad) * radius;

              return (
                <motion.line
                  key={module.title}
                  x1="490"
                  y1="360"
                  x2={x}
                  y2={y}
                  stroke="url(#lineGlow)"
                  strokeWidth="1.3"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: index * 0.12, duration: 1.2 }}
                />
              );
            })}
          </svg>

          <motion.div
            className="absolute left-1/2 top-1/2 z-20 flex h-52 w-52 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-white/15 bg-white/10 text-center shadow-[0_0_80px_rgba(59,130,246,0.45)] backdrop-blur-2xl"
            animate={{
              scale: [1, 1.04, 1],
              boxShadow: [
                "0 0 70px rgba(59,130,246,0.35)",
                "0 0 110px rgba(56,189,248,0.55)",
                "0 0 70px rgba(59,130,246,0.35)",
              ],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <ShieldCheck className="mb-3 h-11 w-11 text-cyan-300" />
            <h3 className="text-3xl font-bold tracking-wide">APEX</h3>
            <p className="mt-1 text-sm text-slate-300">Education Core</p>
            <div className="mt-4 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-1 text-xs text-cyan-100">
              Live Data Sync
            </div>
          </motion.div>

          {modules.map((module, index) => {
            const Icon = module.icon;
            const rad = (module.angle * Math.PI) / 180;
            const x = Math.cos(rad) * radius;
            const y = Math.sin(rad) * radius;

            return (
              <motion.div
                key={module.title}
                className="absolute left-1/2 top-1/2 z-30"
                style={{
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                }}
                initial={{ opacity: 0, scale: 0.7 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.55 }}
              >
                <motion.div
                  className="group flex h-28 w-44 flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.08] p-4 text-center shadow-2xl backdrop-blur-xl transition hover:border-cyan-300/40 hover:bg-white/[0.13]"
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 4 + index * 0.25,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200 ring-1 ring-cyan-300/20">
                    <Icon size={22} />
                  </div>
                  <p className="text-sm font-medium text-slate-100">
                    {module.title}
                  </p>
                </motion.div>
              </motion.div>
            );
          })}

          {modules.map((module, index) => {
            const rad = (module.angle * Math.PI) / 180;
            const x = Math.cos(rad) * radius;
            const y = Math.sin(rad) * radius;

            return (
              <motion.div
                key={`dot-${module.title}`}
                className="absolute left-1/2 top-1/2 z-40 h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.9)]"
                animate={{
                  x: [0, x],
                  y: [0, y],
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.2, 0.5],
                }}
                transition={{
                  duration: 2.6,
                  repeat: Infinity,
                  delay: index * 0.28,
                  ease: "easeInOut",
                }}
              />
            );
          })}
        </div>

        <div className="relative grid gap-4 lg:hidden">
          <motion.div
            className="mx-auto flex h-52 w-52 flex-col items-center justify-center rounded-full border border-white/15 bg-white/10 text-center shadow-[0_0_80px_rgba(59,130,246,0.45)] backdrop-blur-2xl"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <ShieldCheck className="mb-3 h-11 w-11 text-cyan-300" />
            <h3 className="text-3xl font-bold tracking-wide">APEX</h3>
            <p className="mt-1 text-sm text-slate-300">Education Core</p>
          </motion.div>

          <div className="grid gap-3 sm:grid-cols-2">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <div
                  key={module.title}
                  className="rounded-3xl border border-white/10 bg-white/[0.08] p-4 text-center shadow-2xl backdrop-blur-xl"
                >
                  <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200 ring-1 ring-cyan-300/20">
                    <Icon size={22} />
                  </div>
                  <p className="text-sm font-medium text-slate-100">
                    {module.title}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
