"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Brain,
  FileText,
  ClipboardCheck,
  BookOpenCheck,
  ScanText,
  BarChart3,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const aiFeatures = [
  {
    title: "AI Paper Generator",
    desc: "Chapter-wise, marks-wise and category-wise paper creation.",
    icon: FileText,
  },
  {
    title: "AI Book Import",
    desc: "PDF, scanned books and notes converted into question bank data.",
    icon: ScanText,
  },
  {
    title: "AI Homework",
    desc: "Smart homework preparation for teachers and students.",
    icon: BookOpenCheck,
  },
  {
    title: "AI Quiz System",
    desc: "Auto-generated quizzes with instant learning feedback.",
    icon: ClipboardCheck,
  },
  {
    title: "AI Monitoring",
    desc: "Student learning activity and performance observation.",
    icon: Brain,
  },
  {
    title: "AI Parent Reports",
    desc: "Monthly progress summaries for parents and school admins.",
    icon: BarChart3,
  },
];

export default function ApexAIAutomationEngine() {
  return (
    <section className="relative overflow-hidden bg-[#030712] py-28 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_45%)]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-[0.95fr_1.05fr]">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 45 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-cyan-200 backdrop-blur">
              <Sparkles size={16} />
              AI Automation Layer
            </div>

            <h2 className="text-4xl font-semibold tracking-tight md:text-6xl">
              AI that works inside real school operations
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-300">
              APEX uses AI to reduce manual work, improve academic planning and
              help schools generate papers, quizzes, homework and parent reports
              through one connected workflow.
            </p>

            <button className="group mt-9 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100">
              Explore AI Tools
              <ArrowRight
                size={17}
                className="transition group-hover:translate-x-1"
              />
            </button>
          </motion.div>

          {/* Right AI Grid */}
          <div className="grid gap-5 sm:grid-cols-2">
            {aiFeatures.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 backdrop-blur-xl transition hover:-translate-y-2 hover:border-cyan-300/35 hover:bg-white/[0.11]"
                >
                  <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-cyan-300/10 blur-3xl transition group-hover:bg-cyan-300/20" />

                  <div className="relative mb-5 flex h-13 w-13 items-center justify-center rounded-2xl bg-cyan-300/10 p-3 text-cyan-200 ring-1 ring-cyan-300/20">
                    <Icon size={25} />
                  </div>

                  <h3 className="relative text-xl font-semibold">
                    {feature.title}
                  </h3>

                  <p className="relative mt-3 text-sm leading-6 text-slate-300">
                    {feature.desc}
                  </p>

                  <motion.div
                    className="relative mt-6 h-1 rounded-full bg-cyan-400"
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    transition={{ delay: index * 0.12, duration: 1 }}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
