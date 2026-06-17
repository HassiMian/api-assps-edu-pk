"use client";

import { motion } from "framer-motion";
import {
  MonitorSmartphone,
  LayoutDashboard,
  Users,
  GraduationCap,
  UserRound,
  Bell,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const mockups = [
  {
    title: "APEX OS",
    label: "School Admin SaaS",
    icon: LayoutDashboard,
    size: "lg:col-span-2",
    items: ["Students", "Fees", "Exams", "Analytics"],
  },
  {
    title: "Parent App",
    label: "Real-time updates",
    icon: Users,
    size: "",
    items: ["Fee Status", "Attendance", "Homework"],
  },
  {
    title: "Teacher App",
    label: "Classroom workflow",
    icon: GraduationCap,
    size: "",
    items: ["Diary", "Papers", "Results"],
  },
  {
    title: "Student App",
    label: "Learning space",
    icon: UserRound,
    size: "lg:col-span-2",
    items: ["AI Quiz", "Homework", "Progress"],
  },
];

export default function ApexEcosystemMockups() {
  return (
    <section className="relative overflow-hidden bg-[#040711] py-20 text-white sm:py-24 lg:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.18),transparent_45%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-cyan-200 backdrop-blur">
            <MonitorSmartphone size={16} />
            Complete Connected Ecosystem
          </div>

          <h2 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl md:text-6xl">
            One system for every screen
          </h2>

          <p className="mt-6 text-base leading-8 text-slate-300 sm:text-lg">
            APEX connects the school admin panel, parents, teachers and students through one intelligent education network.
          </p>
        </div>

        <div className="relative mt-14 grid gap-5 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:gap-6">
          {mockups.map((mockup, index) => {
            const Icon = mockup.icon;

            return (
              <motion.div
                key={mockup.title}
                initial={{ opacity: 0, y: 45 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.12, duration: 0.7 }}
                viewport={{ once: true, amount: 0.2 }}
                className={`group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-xl transition hover:-translate-y-2 hover:border-cyan-300/35 ${mockup.size}`}
              >
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-cyan-300/10 blur-3xl" />

                <div className="relative mb-5 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200 ring-1 ring-cyan-300/20">
                    <Icon size={24} />
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                    Live
                  </span>
                </div>

                <h3 className="relative text-2xl font-semibold">{mockup.title}</h3>

                <p className="relative mt-1 text-sm text-cyan-200">{mockup.label}</p>

                <div className="relative mt-6 rounded-3xl border border-white/10 bg-[#07101f]/80 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="h-3 w-24 rounded-full bg-white/15" />
                    <Bell size={16} className="text-cyan-300" />
                  </div>

                  <div className="space-y-3">
                    {mockup.items.map((item, itemIndex) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, x: -15 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.15 + itemIndex * 0.1 }}
                        viewport={{ once: true, amount: 0.35 }}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3"
                      >
                        <span className="text-sm text-slate-200">{item}</span>
                        <CheckCircle2 size={16} className="text-cyan-300" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-14 flex justify-center">
          <a
            href="#ai-ecosystem"
            className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
          >
            Explore Full Ecosystem
            <ArrowRight size={17} className="transition group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}
