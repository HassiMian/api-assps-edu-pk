"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  UserRound,
  GraduationCap,
  Users,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const roles = [
  {
    title: "School Admin",
    subtitle: "Complete control center",
    desc: "Admissions, fees, exams, staff, reports and analytics — everything managed from one powerful dashboard.",
    icon: ShieldCheck,
  },
  {
    title: "Teachers",
    subtitle: "Smart teaching workflow",
    desc: "Diary, homework, attendance, papers, quizzes and student progress tools built for daily classroom use.",
    icon: GraduationCap,
  },
  {
    title: "Parents",
    subtitle: "Real-time child updates",
    desc: "Fee status, homework, notices, attendance, result cards and school communication directly in the app.",
    icon: Users,
  },
  {
    title: "Students",
    subtitle: "Personal learning space",
    desc: "Homework, AI quiz, result progress, study material and learning updates in a clean student-friendly interface.",
    icon: UserRound,
  },
];

export default function ApexRoleExperience() {
  return (
    <section className="relative overflow-hidden bg-[#050814] py-28 text-white">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.22),transparent_38%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.16),transparent_42%)]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-cyan-100 backdrop-blur">
              <Sparkles size={16} />
              Designed for every role
            </div>

            <h2 className="text-4xl font-semibold tracking-tight md:text-6xl">
              One platform.
              <br />
              Different experiences.
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              APEX is not just an admin panel. It gives every user a focused,
              role-based experience — school owners, teachers, parents and
              students all connected through one live ecosystem.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <button className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100">
                Explore APEX OS
                <ArrowRight
                  size={17}
                  className="transition group-hover:translate-x-1"
                />
              </button>

              <button className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10">
                View Super App
              </button>
            </div>
          </motion.div>

          {/* Right Cards */}
          <div className="grid gap-5 sm:grid-cols-2">
            {roles.map((role, index) => {
              const Icon = role.icon;

              return (
                <motion.div
                  key={role.title}
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.12, duration: 0.65 }}
                  viewport={{ once: true }}
                  className={`group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-xl transition hover:-translate-y-2 hover:border-cyan-300/35 hover:bg-white/[0.11] ${
                    index === 1 ? "sm:translate-y-8" : ""
                  } ${index === 2 ? "sm:-translate-y-2" : ""}`}
                >
                  <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-cyan-300/10 blur-2xl transition group-hover:bg-cyan-300/20" />

                  <div className="relative mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200 ring-1 ring-cyan-300/20">
                    <Icon size={26} />
                  </div>

                  <h3 className="relative text-xl font-semibold">
                    {role.title}
                  </h3>

                  <p className="relative mt-1 text-sm font-medium text-cyan-200">
                    {role.subtitle}
                  </p>

                  <p className="relative mt-4 text-sm leading-6 text-slate-300">
                    {role.desc}
                  </p>

                  <div className="relative mt-6 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                  <div className="relative mt-4 text-xs font-medium uppercase tracking-[0.25em] text-slate-500">
                    APEX CONNECTED
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
