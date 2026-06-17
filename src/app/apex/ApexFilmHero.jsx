"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles, Cpu, Activity, Users, Wallet, GraduationCap } from "lucide-react";
import { MagneticButton, StaggerTagline } from "./ApexPremiumUI";
import ApexParticleField from "./ApexParticleField";
import ApexCoreEngine from "./ApexCoreEngine";

const ease = [0.22, 1, 0.36, 1];

const HEADLINE = ["APEX", "EDUCATION OS"];

// Live-data worlds as 3D orbital planets on core rings
const DATA_SATELLITES = [
  { icon: Activity, label: "Attendance", value: "96.8%", orbit: 0, angle: -0.55, color: "#22d3ee" },
  { icon: Wallet, label: "Fee collection", value: "78%", orbit: 1, angle: 0.35, color: "#f59e0b" },
  { icon: Sparkles, label: "AI papers", value: "342", orbit: 1, angle: 2.45, color: "#60a5fa" },
  { icon: Users, label: "Students synced", value: "1,184", orbit: 2, angle: 1.15, color: "#34d399" },
];

export default function ApexFilmHero() {
  const reduce = useReducedMotion();

  return (
    <section
      id="hero"
      className="apex-scene relative flex min-h-[100dvh] items-center overflow-x-clip px-4 pb-16 pt-[max(7rem,calc(5.5rem+env(safe-area-inset-top,0px)))] sm:px-6 sm:pb-20 sm:pt-32 md:px-8"
    >
      <ApexParticleField mode="drift" color="#22d3ee" accent="#c9a84c" density={0.7} />
      {!reduce && (
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "conic-gradient(from 200deg at 62% 42%, transparent, rgba(34,211,238,0.12), transparent, rgba(59,130,246,0.1), transparent)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
        />
      )}
      <div className="apex-scanline pointer-events-none absolute inset-0 opacity-50" aria-hidden />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12">
        {/* LEFT — cinematic reveal */}
        <div className="max-w-2xl text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-200/15 bg-cyan-200/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-100 sm:text-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
            </span>
            The operating system behind modern education
          </motion.div>

          <h1 className="text-4xl font-black leading-[0.95] tracking-tight text-white min-[430px]:text-5xl sm:text-6xl md:text-7xl">
            {HEADLINE.map((line, i) => (
              <motion.span
                key={line}
                initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.85, delay: 0.2 + i * 0.18, ease }}
                className={`block ${
                  i === 1
                    ? "bg-gradient-to-r from-amber-200 via-cyan-200 to-blue-300 bg-clip-text text-transparent"
                    : ""
                }`}
              >
                {line}
              </motion.span>
            ))}
          </h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <StaggerTagline className="mt-5 justify-center lg:justify-start" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.7, ease }}
            className="mx-auto mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg lg:mx-0"
          >
            One intelligent universe for schools, students, parents, teachers and AI —
            attendance, fees, exams, results and automation, alive in a single core.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.85, ease }}
            className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start"
          >
            <MagneticButton href="#scene-awakening" variant="secondary">
              Enter the experience
            </MagneticButton>
            <MagneticButton href="/apex/demo-request" variant="primary">
              Request SaaS Demo <ArrowRight className="h-5 w-5" />
            </MagneticButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.05 }}
            className="mt-8 flex flex-wrap justify-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-300 lg:justify-start"
          >
            {[
              [Cpu, "Core online"],
              [Sparkles, "AI active"],
              [GraduationCap, "Live school sync"],
            ].map(([Icon, label]) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 backdrop-blur"
              >
                <Icon className="h-3.5 w-3.5 text-cyan-300" /> {label}
              </span>
            ))}
          </motion.div>
        </div>

        {/* RIGHT — living command object (APEX Core + floating data worlds) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.5, ease }}
          className="relative mx-auto flex aspect-square w-full max-w-[min(340px,88vw)] items-center justify-center sm:max-w-[420px] lg:max-w-[480px]"
        >
          <ApexCoreEngine
            preset="hero"
            satellites={DATA_SATELLITES}
            className="aspect-square w-full"
          />
        </motion.div>
      </div>

      {/* scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-center"
      >
        <div className="mx-auto flex h-9 w-5 items-start justify-center rounded-full border border-white/15 p-1">
          <motion.span
            className="h-2 w-1 rounded-full bg-cyan-300"
            animate={reduce ? undefined : { y: [0, 10, 0], opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
