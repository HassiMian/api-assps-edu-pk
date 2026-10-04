"use client";

import { motion } from "framer-motion";
import ApexCardLoaderLines from "./ApexCardLoaderLines";

const AI_FEATURES = [
  {
    title: "AI Homework",
    detail: "Teachers generate structured class homework, students get preparation support.",
    flow: ["Teacher creates", "Student prepares", "Parent sees"],
  },
  {
    title: "AI Diary",
    detail: "Daily diary notes become faster, clearer, and consistent across classes.",
    flow: ["Topic", "Class note", "Parent update"],
  },
  {
    title: "AI Quiz Assign",
    detail: "Smart quizzes can be assigned from class work and checked as learning signals.",
    flow: ["Assign", "Attempt", "Insight"],
  },
  {
    title: "AI Paper Generator",
    detail: "Board-style papers, marks balance, question mix, and print-ready structure.",
    flow: ["Syllabus", "Blueprint", "Paper"],
  },
  {
    title: "AI Student Monitoring",
    detail: "Weak areas, preparation gaps, and learning rhythm become visible.",
    flow: ["Track", "Detect", "Improve"],
  },
  {
    title: "AI Parent Reports",
    detail: "Monthly progress combines attendance, fee, academics, and teacher feedback.",
    flow: ["Collect", "Summarize", "Share"],
  },
];

export default function ApexAIHighlights() {
  return (
    <section id="ai-highlights" className="relative overflow-hidden px-4 py-20 text-white sm:px-6 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(201,168,76,0.18),transparent_35%),radial-gradient(circle_at_80%_50%,rgba(34,211,238,0.16),transparent_38%)]" />
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mx-auto max-w-3xl text-center"
        >
          <div className="mb-4 inline-flex rounded-full border border-amber-300/20 bg-amber-300/5 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-amber-200">
            APEX AI Engine
          </div>
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl md:text-6xl">
            AI inside the work schools actually do
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-300 md:text-lg">
            APEX does not show AI as decoration. It places AI where homework, diary, quiz, paper, monitoring, and parent reporting happen every day.
          </p>
        </motion.div>

        <div className="relative mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {AI_FEATURES.map((feature, index) => (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.05 }}
              className="cinematic-card group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl"
            >
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.1),transparent_42%,rgba(201,168,76,0.08))]" />
              <div className="apex-ai-card-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden />
              <div className="relative z-10">
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100">
                    AI Workflow
                  </span>
                  <span className="text-xs font-black text-amber-200">0{index + 1}</span>
                </div>
                <h3 className="text-xl font-black text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{feature.detail}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {feature.flow.map((item) => (
                    <span key={item} className="rounded-full border border-white/10 bg-slate-950/55 px-3 py-1 text-[11px] font-bold text-slate-200">
                      {item}
                    </span>
                  ))}
                </div>
                <ApexCardLoaderLines widths={[90 - index * 2, 72 + index * 3, 84]} className="mt-5" loop />
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
