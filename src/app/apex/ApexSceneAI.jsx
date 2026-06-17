"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  PenLine,
  BookOpen,
  ListChecks,
  Activity,
  Database,
  FileStack,
  Sparkles,
} from "lucide-react";
import ApexParticleField from "./ApexParticleField";

const AI_WORLDS = [
  { icon: PenLine, name: "AI Homework", flow: ["Teacher creates", "Student prepares", "Parent sees"] },
  { icon: BookOpen, name: "AI Diary", flow: ["Topic", "Class note", "Parent update"] },
  { icon: ListChecks, name: "AI Quiz", flow: ["Assign", "Attempt", "Insight"] },
  { icon: Activity, name: "AI Monitoring", flow: ["Track", "Detect", "Improve"] },
  { icon: Database, name: "AI Question Bank", flow: ["Bank", "Filter", "Reuse"] },
  { icon: FileStack, name: "AI Paper Generator", flow: ["Syllabus", "Blueprint", "Print-ready"] },
];

export default function ApexSceneAI() {
  const reduce = useReducedMotion();

  return (
    <section
      id="scene-ai"
      className="apex-scene relative scroll-mt-24 overflow-x-clip py-24 sm:py-32"
    >
      <ApexParticleField mode="knowledge" color="#fcd34d" accent="#c9a84c" density={1.3} />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-14 max-w-3xl text-center md:mb-20"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-amber-100">
            <Sparkles className="h-4 w-4" /> Chapter 04 · APEX AI Engine
          </div>
          <h2 className="bg-gradient-to-r from-amber-200 via-white to-cyan-200 bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-4xl md:text-6xl">
            The AI layer awakens
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-300 md:text-lg">
            Knowledge particles organize into intelligence. AI lives inside the real work schools
            do every single day — not as decoration, but as the operating layer.
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {AI_WORLDS.map((w, i) => {
            const Icon = w.icon;
            return (
              <motion.article
                key={w.name}
                initial={{ opacity: 0, y: 34, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.07, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="apex-ai-world group relative overflow-hidden rounded-[1.75rem] border border-amber-300/15 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-xl"
              >
                <motion.div
                  animate={reduce ? undefined : { rotate: 360 }}
                  transition={{ duration: 30 + i * 4, repeat: Infinity, ease: "linear" }}
                  className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[conic-gradient(from_0deg,transparent,rgba(201,168,76,0.3),transparent)] blur-xl"
                />
                <div className="relative z-10">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-300/10 text-amber-200 ring-1 ring-amber-300/30">
                      <Icon size={22} />
                    </div>
                    <span className="text-xs font-black text-amber-200/70">AI · 0{i + 1}</span>
                  </div>
                  <h3 className="text-xl font-black text-white">{w.name}</h3>
                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    {w.flow.map((step, si) => (
                      <span key={step} className="flex items-center gap-2">
                        <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-bold text-cyan-100">
                          {step}
                        </span>
                        {si < w.flow.length - 1 && <span className="text-amber-300/60">→</span>}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
