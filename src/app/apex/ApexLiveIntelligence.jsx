"use client";

import { motion } from "framer-motion";
import {
  Users,
  Brain,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";

const stats = [
  {
    title: "Students",
    value: "12,450+",
    icon: Users,
  },
  {
    title: "AI Activities",
    value: "980K+",
    icon: Brain,
  },
  {
    title: "Fee Collection",
    value: "99.2%",
    icon: DollarSign,
  },
  {
    title: "Attendance",
    value: "96.8%",
    icon: CheckCircle2,
  },
];

export default function ApexLiveIntelligence() {
  return (
    <section className="relative overflow-hidden bg-[#040811] py-20 text-white sm:py-24 lg:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_45%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-cyan-200 backdrop-blur">
            Live Intelligence Engine
          </div>

          <h2 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Real-Time School Insights
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
            Every student, teacher, classroom and academic activity is transformed into actionable intelligence.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.18 }}
          transition={{ duration: 0.8 }}
          className="mx-auto mt-14 max-w-6xl rounded-[28px] border border-white/10 bg-white/[0.05] p-4 shadow-[0_30px_100px_rgba(8,47,73,0.25)] backdrop-blur-xl sm:mt-20 sm:rounded-[40px] sm:p-8"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {stats.map((item) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  whileHover={{ y: -8 }}
                  className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 sm:p-6"
                >
                  <div className="flex items-center justify-between">
                    <Icon className="text-cyan-300" />
                    <TrendingUp size={18} className="text-green-400" />
                  </div>

                  <h3 className="mt-6 text-2xl font-bold sm:text-3xl">{item.value}</h3>

                  <p className="mt-2 text-slate-400">{item.title}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
              <h3 className="mb-8 text-lg font-semibold sm:text-xl">Academic Growth Analytics</h3>

              <div className="flex h-[220px] items-end gap-2 sm:h-[260px] sm:gap-4">
                {[35, 50, 65, 55, 80, 95, 120].map((height, index) => (
                  <motion.div
                    key={index}
                    initial={{ height: 0 }}
                    whileInView={{ height }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{
                      duration: 1,
                      delay: index * 0.1,
                    }}
                    className="flex-1 rounded-t-2xl bg-gradient-to-t from-blue-600 to-cyan-400"
                  />
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
              <h3 className="mb-6 text-lg font-semibold sm:text-xl">AI Education Engine</h3>

              <div className="space-y-4 sm:space-y-5">
                {[
                  "AI Paper Generator",
                  "AI Quiz System",
                  "AI Homework",
                  "AI Monitoring",
                  "AI Reports",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                  >
                    <span className="text-sm text-slate-100 sm:text-base">{item}</span>

                    <div className="h-2 w-20 shrink-0 rounded-full bg-white/10 sm:w-24">
                      <motion.div
                        className="h-2 rounded-full bg-cyan-400"
                        initial={{ width: 0 }}
                        whileInView={{ width: "100%" }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 1.5 }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl bg-cyan-500/10 p-4">
                <div className="flex items-center gap-3">
                  <GraduationCap className="shrink-0 text-cyan-300" />
                  <span className="font-medium text-slate-100">AI assisting thousands of students daily</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
