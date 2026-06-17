"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { STORY_REEL_VIDEOS } from "./apexMedia";
import ApexCardLoaderLines from "./ApexCardLoaderLines";

const CHAPTERS = [
  {
    id: "ai",
    act: "00 · AI Layer",
    title: "AI is not a feature. It is the operating layer.",
    body: "APEX brings AI into homework, diary writing, quiz assignment, paper generation, student monitoring, and parent reports.",
    loader: [96, 88, 92],
    value: "AI First",
    proof: "Daily school work becomes assisted, faster, and measurable.",
    provides: ["AI Homework", "AI Diary", "AI Quiz", "AI Paper Generator", "AI Parent Reports"],
  },
  {
    id: "entry",
    act: "01 · Entry",
    title: "School opens. Work starts instantly.",
    body: "Admissions, attendance, fee reminders, and parent messages begin in one place instead of scattered registers.",
    loader: [82, 61, 92],
    value: "Morning Control",
    proof: "Morning desk becomes one live queue.",
    provides: ["Admission pipeline", "Daily attendance", "Fee alerts", "Notice flow"],
  },
  {
    id: "teacher",
    act: "02 · Teachers",
    title: "Teachers run full class workflow",
    body: "Diary, homework, quizzes, and paper generation move from manual writing to guided digital flow.",
    loader: [90, 74, 86],
    value: "Teaching Engine",
    proof: "Teachers spend less time repeating work.",
    provides: ["AI diary", "Homework assign", "Quiz assign", "Paper generator"],
  },
  {
    id: "student",
    act: "03 · Students",
    title: "Students see clear learning path",
    body: "Assigned work, preparation, weak-area tracking, and revision rhythm stay linked to real classroom activity.",
    loader: [76, 88, 69],
    value: "Learning Clarity",
    proof: "Class work stays connected after school.",
    provides: ["AI quiz", "Homework prep", "Weak areas", "Result progress"],
  },
  {
    id: "parent",
    act: "04 · Parents",
    title: "Parents receive real-time updates",
    body: "Attendance, fee status, notices, and monthly progress are visible without chasing teachers on chat.",
    loader: [83, 71, 94],
    value: "Parent Trust",
    proof: "Parents stop guessing what happened today.",
    provides: ["Attendance alerts", "Fee status", "Teacher notes", "Monthly AI report"],
  },
  {
    id: "finance",
    act: "05 · Finance",
    title: "Fee operations stay under control",
    body: "Challans, collections, pending lists, and follow-ups stay visible for admin and accounts teams.",
    loader: [92, 66, 82],
    value: "Revenue Visibility",
    proof: "Every challan has a clear status.",
    provides: ["Fee profile", "Challan create", "Receipts", "Pending follow-up"],
  },
  {
    id: "owner",
    act: "06 · Owner",
    title: "Owner sees school health in one view",
    body: "Academic performance, attendance, fees, and workload align in one command center for daily decisions.",
    loader: [88, 72, 98],
    value: "Executive Insight",
    proof: "Decisions come from live school signals.",
    provides: ["School health", "Staff view", "Finance trend", "Academic analytics"],
  },
  {
    id: "apex",
    act: "07 · APEX",
    title: "One brand. One connected operating system.",
    body: "APEX links departments, roles, and reports through a realistic school-ready SaaS workflow.",
    loader: [95, 90, 96],
    value: "Connected OS",
    proof: "Every role works from one intelligence layer.",
    provides: ["APEX OS", "APEX Connect", "Parent app", "Teacher workspace"],
  },
];

function videoFor(id) {
  return STORY_REEL_VIDEOS.find((v) => v.id === id) || STORY_REEL_VIDEOS[0];
}

function ProductOverlay({ chapter }) {
  return (
    <div className="absolute right-4 top-16 z-10 hidden w-64 rounded-2xl border border-white/15 bg-slate-950/55 p-4 shadow-2xl backdrop-blur-xl sm:block">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200/80">APEX provides</span>
        <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.8)]" />
      </div>
      <div className="grid gap-2">
        {chapter.provides.map((item) => (
          <div key={item} className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2">
            <div className="text-xs font-bold text-white">{item}</div>
          </div>
        ))}
      </div>
      <ApexCardLoaderLines widths={chapter.loader} className="mt-4" loop />
    </div>
  );
}

function StickyReelPanel({ chapter, index, total }) {
  const reduce = useReducedMotion();
  const media = videoFor(chapter.id);
  const showFullLogo = index === 0 || index === total - 1;

  return (
    <motion.article
      key={chapter.id}
      initial={{ opacity: 0.45, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="apex-reel-card cinematic-card relative flex h-[68vh] min-h-[460px] w-full flex-col justify-end overflow-hidden rounded-[2rem] border border-white/15 shadow-[0_40px_100px_rgba(0,0,0,0.55)] lg:h-[74vh]"
    >
      {!reduce ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={media.mp4}
          poster={media.poster}
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
        />
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${media.poster})` }}
          aria-hidden
        />
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/55 to-[#020617]/25" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-900/20" />
      <div className="apex-ai-reel-field pointer-events-none absolute inset-0" aria-hidden />

      <div className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/45 px-3 py-1.5 backdrop-blur-md">
        <img src="/apex-logo.svg" alt="APEX Logo" className="h-4 w-auto object-contain" />
        <span className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100">{chapter.act}</span>
      </div>
      <ProductOverlay chapter={chapter} />

      <div className="relative z-10 p-7 sm:p-8">
        {showFullLogo && <img src="/apex-logo.svg" alt="APEX" className="mb-5 h-9 w-auto opacity-95" />}
        <h3 className="text-2xl font-black leading-tight text-white drop-shadow-lg sm:text-3xl">{chapter.title}</h3>
        <p className="mt-3 max-w-sm text-sm leading-7 text-slate-200/95 sm:text-base">{chapter.body}</p>
        {chapter.id === "ai" && (
          <div className="mt-5 grid max-w-sm grid-cols-2 gap-2">
            {chapter.provides.slice(0, 4).map((item) => (
              <div key={item} className="rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-[11px] font-black text-amber-100">
                {item}
              </div>
            ))}
          </div>
        )}
        <ApexCardLoaderLines widths={chapter.loader} className="mt-6 max-w-xs" loop />
        <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-300/90">
          {chapter.value} · Chapter {index + 1} / {total}
        </p>
      </div>
    </motion.article>
  );
}

export default function ApexStoryReel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = CHAPTERS[activeIndex];

  return (
    <section id="story" className="relative scroll-mt-28 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-10 max-w-3xl text-center md:mb-14"
        >
          <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-amber-200">
            Scroll story
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
            Enter APEX, then scroll the AI-powered school story
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-400 md:text-lg">
            AI Homework, AI Diary, AI Quiz, AI Paper Generator, student monitoring, and parent reports appear inside the real school workflow.
          </p>
        </motion.div>
      </div>

      <div className="mx-auto mt-6 grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:items-start">
        <div className="lg:sticky lg:top-24">
          <StickyReelPanel chapter={active} index={activeIndex} total={CHAPTERS.length} />
        </div>

        <div className="space-y-10 lg:space-y-16">
          {CHAPTERS.map((chapter, index) => (
            <motion.article
              key={chapter.id}
              className={`rounded-3xl border p-6 transition sm:p-8 ${
                activeIndex === index
                  ? "border-cyan-300/40 bg-cyan-400/[0.06] shadow-[0_20px_70px_rgba(8,47,73,0.25)]"
                  : "border-white/10 bg-white/[0.03]"
              }`}
              onViewportEnter={() => setActiveIndex(index)}
              viewport={{ amount: 0.55 }}
              initial={{ opacity: 0.5, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <div className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-200/80">{chapter.act}</div>
              <h3 className="mt-3 text-2xl font-black text-white">{chapter.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">{chapter.body}</p>
              <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-200/80">What changes</div>
                <p className="mt-2 text-sm font-semibold leading-6 text-white">{chapter.proof}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {chapter.provides.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-bold text-cyan-100"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <ApexCardLoaderLines widths={chapter.loader} className="mt-5 max-w-sm" loop />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
