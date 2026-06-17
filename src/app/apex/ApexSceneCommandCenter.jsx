"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Activity, Wallet, Trophy, CalendarDays, Bell, Radar } from "lucide-react";
import ApexParticleField from "./ApexParticleField";

function PulseWave({ reduce }) {
  return (
    <svg viewBox="0 0 240 60" className="mt-3 h-14 w-full" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="apexPulse" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#22d3ee" stopOpacity="1" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <motion.path
        d="M0,30 L40,30 L52,12 L64,48 L78,20 L92,38 L110,30 L150,30 L162,14 L174,46 L188,24 L202,34 L240,30"
        fill="none"
        stroke="url(#apexPulse)"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
      />
      {!reduce && (
        <motion.circle
          r="3"
          fill="#c9a84c"
          animate={{ cx: [0, 240], cy: [30, 30, 12, 48, 30] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </svg>
  );
}

function AnimatedNumber({ to, suffix = "" }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      {to}
      {suffix}
    </motion.span>
  );
}

export default function ApexSceneCommandCenter() {
  const reduce = useReducedMotion();

  const notifications = [
    "🔔 Fee challan #2291 paid · Class 7B",
    "📋 Attendance locked · 96.8% present",
    "🏆 Result cards published · Term 2",
    "📅 Parent-teacher meeting · Friday",
  ];

  return (
    <section
      id="scene-command"
      className="apex-scene relative scroll-mt-24 overflow-x-clip py-24 sm:py-28"
    >
      <ApexParticleField mode="drift" color="#38bdf8" accent="#c9a84c" density={0.7} />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-14 max-w-3xl text-center md:mb-16"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/5 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-100">
            <Radar className="h-4 w-4" /> Chapter 07 · Live Command Center
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-6xl">
            The digital school, visualized live
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-400 md:text-lg">
            Attendance pulse, fee flow, results, events, and notifications — one real-time
            command center for the whole school.
          </p>
        </motion.div>

        <div className="grid gap-4 lg:grid-cols-12">
          {/* Attendance pulse */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl lg:col-span-7"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-200">
                <Activity size={18} />
                <span className="text-sm font-black uppercase tracking-wider">Attendance Pulse</span>
              </div>
              <span className="text-2xl font-black text-white">
                <AnimatedNumber to="96.8" suffix="%" />
              </span>
            </div>
            <PulseWave reduce={reduce} />
            <div className="mt-3 grid grid-cols-4 gap-2 text-center">
              {[["Present", "1,184"], ["Absent", "39"], ["Late", "12"], ["Leave", "8"]].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-white/10 bg-slate-950/50 py-2">
                  <div className="text-sm font-black text-white">{v}</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400">{k}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Fee flow */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl lg:col-span-5"
          >
            <div className="flex items-center gap-2 text-amber-200">
              <Wallet size={18} />
              <span className="text-sm font-black uppercase tracking-wider">Fee Flow</span>
            </div>
            <div className="mt-4 space-y-3">
              {[["Collected", 78, "#10b981"], ["Pending", 18, "#f59e0b"], ["Overdue", 4, "#ef4444"]].map(
                ([label, pct, col]) => (
                  <div key={label}>
                    <div className="mb-1 flex justify-between text-xs font-bold text-slate-300">
                      <span>{label}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: col }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </motion.div>

          {/* Results ring */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.12 }}
            className="flex flex-col items-center justify-center rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-6 text-center backdrop-blur-xl lg:col-span-4"
          >
            <div className="mb-3 flex items-center gap-2 text-violet-200">
              <Trophy size={18} />
              <span className="text-sm font-black uppercase tracking-wider">Results</span>
            </div>
            <div className="relative flex h-28 w-28 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                <motion.circle
                  cx="50" cy="50" r="42" fill="none" stroke="#8b5cf6" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={264}
                  initial={{ strokeDashoffset: 264 }}
                  whileInView={{ strokeDashoffset: 264 * (1 - 0.91) }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.4, ease: "easeInOut" }}
                />
              </svg>
              <span className="absolute text-2xl font-black text-white">91%</span>
            </div>
            <p className="mt-3 text-xs text-slate-400">Average pass rate · Term 2</p>
          </motion.div>

          {/* Events */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.16 }}
            className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl lg:col-span-4"
          >
            <div className="mb-4 flex items-center gap-2 text-emerald-200">
              <CalendarDays size={18} />
              <span className="text-sm font-black uppercase tracking-wider">Upcoming Events</span>
            </div>
            <div className="space-y-2.5">
              {[["Fri", "Parent-Teacher Meeting"], ["Mon", "Sports Day Trials"], ["15", "Term 3 begins"]].map(
                ([day, ev]) => (
                  <div key={ev} className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/10 text-[11px] font-black text-emerald-200">
                      {day}
                    </span>
                    <span className="text-xs font-semibold text-slate-200">{ev}</span>
                  </div>
                )
              )}
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl lg:col-span-4"
          >
            <div className="mb-4 flex items-center gap-2 text-cyan-200">
              <Bell size={18} />
              <span className="text-sm font-black uppercase tracking-wider">Live Notifications</span>
            </div>
            <div className="space-y-2.5">
              {notifications.map((n, i) => (
                <motion.div
                  key={n}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.25 + i * 0.1 }}
                  className="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-[11px] font-semibold text-slate-200"
                >
                  {n}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
