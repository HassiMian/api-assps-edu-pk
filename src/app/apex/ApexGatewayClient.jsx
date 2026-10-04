"use client";


import React, { useEffect, useState } from "react";

import { motion } from "framer-motion";
import {
  ApexHoverStyles,
  ApexLiveStoryConsole,
  AnimatedApexCore,
  AnimatedCoreLines,
} from "./ApexExperienceLayer";
import CleanApexModuleGalaxy from "./CleanApexModuleGalaxy";
import ApexLiveIntelligence from "./ApexLiveIntelligence";
import ApexEcosystemMockups from "./ApexEcosystemMockups";
import ApexRoleExperience from "./ApexRoleExperience";
import ApexAIAutomationEngine from "./ApexAIAutomationEngine";
import ApexPricingPlans from "./ApexPricingPlans";
import { ApexBusinessPortalSections } from "./ApexPortalPages";

import {

  ArrowRight,

  Sparkles,

  Brain,

  BarChart3,

  Users,

  CreditCard,

  ClipboardCheck,

  BookOpen,

  HelpCircle,

  Layers3,

  ShieldCheck,

  AlertTriangle,

  MessageCircle,

  FileText,

  School,

  UserCog,

  GraduationCap,

  Smartphone,

  Building2,

  Lock,

  Cloud,

  Languages,

  Printer,

  Zap,

  CheckCircle2,
  Menu,
  X,

} from "lucide-react";


const fadeUp = {

  hidden: { opacity: 0, y: 28 },

  visible: { opacity: 1, y: 0 },

};

const storyScenes = [
  {
    id: "manual",
    step: "01",
    title: "Manual Chaos",
    description: "Registers, WhatsApp, manual papers and delayed reports.",
    modules: ["Registers", "WhatsApp", "Manual Papers", "Late Reports"],
    icon: Layers3,
  },
  {
    id: "teacher",
    step: "02",
    title: "Teacher AI",
    description: "AI Homework, AI Diary, AI Quiz and paper generation.",
    modules: ["AI Homework", "AI Diary", "AI Quiz", "Papers"],
    icon: School,
  },
  {
    id: "student",
    step: "03",
    title: "Student AI",
    description: "AI Quiz, monitoring, practice and weak-area guidance.",
    modules: ["AI Quiz", "Monitoring", "Practice", "Weak Areas"],
    icon: GraduationCap,
  },
  {
    id: "parent",
    step: "04",
    title: "Parent Reports",
    description: "Monthly reports, progress, attendance and fee alerts.",
    modules: ["Monthly Reports", "Progress", "Attendance", "Fee Alerts"],
    icon: Smartphone,
  },
  {
    id: "exam",
    step: "05",
    title: "Exam Studio",
    description: "AI Generator, Manual Builder, Question Bank and Print PDF.",
    modules: ["AI Generator", "Manual Builder", "Question Bank", "Print PDF"],
    icon: Printer,
  },
  {
    id: "owner",
    step: "06",
    title: "Owner Intelligence",
    description: "Fees, academics, reports and complete school health.",
    modules: ["Fees", "Academics", "Reports", "School Health"],
    icon: BarChart3,
  },
];

function LegacyStoryLiveConsole({ activeSceneIndex = 0 }) {
  const scene = storyScenes[activeSceneIndex] || storyScenes[0];
  const Icon = scene.icon;

  return (
    <div className="sticky top-32 hidden lg:block">
      <motion.div
        key={scene.id}
        initial={{ opacity: 0, y: 24, scale: 0.96, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_40px_120px_rgba(8,47,73,0.35)] backdrop-blur-2xl"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_15%,rgba(34,211,238,0.18),transparent_34%),radial-gradient(circle_at_15%_85%,rgba(37,99,235,0.16),transparent_38%)]" />

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/10 bg-[conic-gradient(from_120deg,transparent,rgba(34,211,238,0.14),transparent,rgba(37,99,235,0.14),transparent)]"
        />

        <div className="relative z-10">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.24em] text-cyan-100/60">
                Live Story Console
              </div>
              <h3 className="mt-2 text-3xl font-black text-white">
                {scene.title}
              </h3>
            </div>

            <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-black text-cyan-100">
              Scene {scene.step}
            </div>
          </div>

          <div className="relative mb-6 grid min-h-[220px] place-items-center rounded-[1.5rem] border border-white/10 bg-slate-950/45">
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.45, 0.8, 0.45] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute h-44 w-44 rounded-full bg-cyan-300/10 blur-2xl"
            />

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative grid h-32 w-40 place-items-center rounded-[1.5rem] border border-cyan-300/20 bg-white/[0.08] shadow-[0_0_70px_rgba(34,211,238,0.18)] backdrop-blur-2xl"
            >
              <Icon className="h-12 w-12 text-cyan-100" />
            </motion.div>
          </div>

          <p className="mb-5 text-sm font-semibold leading-7 text-slate-400">
            {scene.description}
          </p>

          <div className="grid grid-cols-2 gap-3">
            {scene.modules.map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.35 }}
                className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3"
              >
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100/50">
                  0{index + 1}
                </div>
                <div className="mt-1 text-sm font-black text-white">
                  {item}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 space-y-2">
            {storyScenes.map((item, index) => (
              <div key={item.id} className="flex items-center gap-3">
                <div
                  className={`h-2 w-2 rounded-full ${
                    index === activeSceneIndex
                      ? "bg-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.9)]"
                      : "bg-white/20"
                  }`}
                />
                <div
                  className={`text-xs font-bold ${
                    index === activeSceneIndex ? "text-cyan-100" : "text-slate-500"
                  }`}
                >
                  {item.step} / {item.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function LegacyAnimatedApexCore() {
  return (
    <div className="relative grid h-56 w-56 place-items-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[-48px] rounded-full border border-cyan-300/10 bg-[conic-gradient(from_120deg,transparent,rgba(34,211,238,0.18),transparent,rgba(37,99,235,0.16),transparent)]"
      />

      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 42, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[-24px] rounded-full border border-blue-400/10"
      />

      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          boxShadow: [
            "0 0 70px rgba(34,211,238,0.20)",
            "0 0 115px rgba(34,211,238,0.34)",
            "0 0 70px rgba(34,211,238,0.20)",
          ],
        }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 grid h-44 w-44 place-items-center rounded-[2rem] border border-cyan-300/25 bg-gradient-to-br from-blue-500/35 via-cyan-300/18 to-white/[0.07] text-center backdrop-blur-2xl"
      >
        <div>
          <Brain className="mx-auto mb-3 h-11 w-11 text-cyan-100" />
          <div className="text-xs font-black uppercase tracking-[0.28em] text-cyan-100/70">
            APEX
          </div>
          <div className="mt-1 text-3xl font-black text-white">Core</div>
          <p className="mt-2 px-4 text-xs font-semibold leading-5 text-cyan-50/70">
            One intelligence layer.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function LegacyAnimatedCoreLines() {
  const paths = [
    "M600 360 C520 260, 360 190, 220 140",
    "M600 360 C680 260, 840 190, 980 140",
    "M600 360 C470 360, 310 360, 160 360",
    "M600 360 C730 360, 890 360, 1040 360",
    "M600 360 C500 470, 350 570, 220 620",
    "M600 360 C700 470, 850 570, 980 620",
  ];

  return (
    <svg
      className="pointer-events-none absolute inset-0 hidden h-full w-full opacity-70 lg:block"
      viewBox="0 0 1200 720"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="coreLine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(34,211,238,0.02)" />
          <stop offset="50%" stopColor="rgba(34,211,238,0.45)" />
          <stop offset="100%" stopColor="rgba(37,99,235,0.02)" />
        </linearGradient>
      </defs>

      {paths.map((path, index) => (
        <motion.path
          key={path}
          d={path}
          fill="none"
          stroke="url(#coreLine)"
          strokeWidth="1.3"
          strokeDasharray="8 12"
          animate={{ strokeDashoffset: [0, -80] }}
          transition={{
            duration: 5 + index,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </svg>
  );
}

const balancedFlowModules = [
  { title: "Academics", icon: BookOpen },
  { title: "Exams", icon: ClipboardCheck },
  { title: "AI Paper Generator", icon: FileText },
  { title: "Question Bank", icon: HelpCircle },
  { title: "APEX Core", icon: Brain, core: true },
  { title: "Fees", icon: CreditCard },
  { title: "Parents", icon: Users },
  { title: "Students", icon: GraduationCap },
  { title: "Teachers", icon: School },
  { title: "Analytics", icon: BarChart3 },
  { title: "Reports", icon: FileText },
  { title: "Admin Control", icon: ShieldCheck },
];

function FlowCard({ title, icon: Icon }) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.015 }}
      transition={{ duration: 0.25 }}
      className="group relative flex min-h-[135px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.055] p-5 text-center shadow-xl shadow-blue-950/20 backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.10),transparent_38%)] opacity-0 transition group-hover:opacity-100" />

      <motion.div
        animate={{ x: ["-130%", "130%"] }}
        transition={{
          duration: 4.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-y-0 left-0 w-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/8 to-transparent"
      />

      <div className="relative z-10">
        <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-xl border border-cyan-300/15 bg-cyan-300/[0.08]">
          <Icon className="h-5 w-5 text-cyan-200" />
        </div>
        <div className="text-sm font-black text-white">{title}</div>
      </div>
    </motion.div>
  );
}

function ApexCoreCard() {
  return (
    <motion.div
      animate={{
        scale: [1, 1.035, 1],
        boxShadow: [
          "0 0 65px rgba(34,211,238,0.18)",
          "0 0 95px rgba(34,211,238,0.30)",
          "0 0 65px rgba(34,211,238,0.18)",
        ],
      }}
      transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      className="relative flex min-h-[135px] flex-col items-center justify-center overflow-hidden rounded-[1.75rem] border border-cyan-300/25 bg-gradient-to-br from-blue-500/35 via-cyan-300/18 to-white/[0.07] p-5 text-center backdrop-blur-2xl"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[-40px] rounded-full border border-cyan-300/10 bg-[conic-gradient(from_120deg,transparent,rgba(34,211,238,0.16),transparent,rgba(37,99,235,0.16),transparent)]"
      />

      <div className="relative z-10">
        <Brain className="mx-auto mb-3 h-9 w-9 text-cyan-100" />
        <div className="text-xs font-black uppercase tracking-[0.24em] text-cyan-100/70">
          APEX
        </div>
        <div className="mt-1 text-3xl font-black text-white">Core</div>
        <p className="mt-2 text-xs font-semibold text-cyan-50/70">
          One intelligence layer.
        </p>
      </div>
    </motion.div>
  );
}

function BalancedIntelligentFlow() {
  return (
    <section id="platform" className="relative scroll-mt-32 px-4 py-24 md:px-8">
      <GlowOrb className="left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 bg-blue-600/12" />

      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Intelligent Flow"
          title="APEX Connects Every Department Into One Intelligent Flow"
          subtitle="Every school department connects back to one operating core, so data, reports, exams, fees, and communication stay synchronized."
        />

        <div className="relative mt-16 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-blue-950/30 backdrop-blur-2xl md:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.14),transparent_38%)]" />
          <div className="absolute inset-0 opacity-[0.12] bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:70px_70px]" />

          <div className="relative z-10 grid gap-4 md:grid-cols-3">
            {balancedFlowModules.map((item) =>
              item.core ? (
                <ApexCoreCard key={item.title} />
              ) : (
                <FlowCard key={item.title} {...item} />
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}


const modules = [

  { title: "AI Homework", value: "Teacher Ready", icon: Brain },

  { title: "AI Diary", value: "Daily Work", icon: FileText },

  { title: "AI Quiz Assign", value: "Smart Practice", icon: ClipboardCheck },

  { title: "AI Paper Generator", value: "Print Ready", icon: Printer },

  { title: "Student Monitoring", value: "AI Insights", icon: GraduationCap },

  { title: "Parent AI Reports", value: "Monthly Summary", icon: Smartphone },

];


const chips = [

  "AI Homework",

  "AI Diary",

  "AI Quiz Assign",

  "AI Paper Generator",

  "Manual Paper Generator",

  "AI Student Monitoring",

  "Monthly Parent Reports",

];


const problems = [

  {

    title: "Teachers spend hours on homework, diary, and quizzes",

    fix: "AI Homework, AI Diary, and AI Quiz Assign",

    icon: School,

  },

  {

    title: "Paper generation is slow, manual, and pattern-breaking",

    fix: "AI + Manual Paper Generator with print-ready layouts",

    icon: FileText,

  },

  {

    title: "Students prepare without smart guidance or monitoring",

    fix: "AI Quiz, AI Monitoring, and AI Homework Preparation",

    icon: GraduationCap,

  },

  {

    title: "Parents receive late or incomplete progress updates",

    fix: "Monthly AI Reports with attendance, fee, and academic insights",

    icon: Smartphone,

  },

  {

    title: "Owners cannot see real-time school health",

    fix: "AI School Intelligence and monthly performance summaries",

    icon: BarChart3,

  },

  {

    title: "Admin work is scattered across registers and WhatsApp",

    fix: "One AI-powered operating system for every department",

    icon: Layers3,

  },

];


const flowModules = [

  "Academics",

  "AI Homework",

  "AI Diary",

  "AI Quiz Engine",

  "AI Paper Generator",

  "Manual Paper Generator",

  "Student AI Monitoring",

  "Parent AI Reports",

  "Fees",

  "Analytics",

];


const paperFeatures = [

  "Board pattern support",

  "Urdu and English formatting",

  "Question bank integration",

  "Past-paper based generation",

  "Print-ready layouts",

  "Smart marks distribution",

];


const roles = [

  {

    title: "Owner Dashboard",

    icon: Building2,

    features: ["AI school intelligence", "Monthly performance reports", "Live fee & academic overview"],

  },

  {

    title: "Admin Dashboard",

    icon: UserCog,

    features: ["AI assisted operations", "Admissions & records", "Role-based controls"],

  },

  {

    title: "Teacher Dashboard",

    icon: School,

    features: ["AI Homework", "AI Diary", "AI Quiz Assign"],

  },

  {

    title: "Student Portal",

    icon: GraduationCap,

    features: ["AI Quiz", "AI Monitoring", "AI Homework Preparation"],

  },

  {

    title: "Parent App",

    icon: Smartphone,

    features: ["Monthly AI reports", "Progress insights", "Attendance & fee alerts"],

  },

  {

    title: "Exam Office",

    icon: FileText,

    features: ["AI Paper Generator", "Manual Paper Generator", "Question bank control"],

  },

];


const benefits = [

  { title: "AI Homework", detail: "Teachers generate structured homework faster.", icon: Brain },

  { title: "AI Diary", detail: "Daily diary writing becomes smarter and faster.", icon: FileText },

  { title: "AI Quiz Assign", detail: "Assign smart quizzes to students instantly.", icon: ClipboardCheck },

  { title: "AI + Manual Papers", detail: "Generate or manually build print-ready papers.", icon: Printer },

  { title: "AI Student Monitoring", detail: "Track learning progress and weak areas.", icon: GraduationCap },

  { title: "AI Parent Reports", detail: "Monthly reports with clear progress insights.", icon: Smartphone },

  { title: "AI School Intelligence", detail: "Owners see live academic and fee health.", icon: BarChart3 },

  { title: "Secure Role Access", detail: "Every role gets controlled permissions.", icon: ShieldCheck },

];


function GlowOrb({ className }) {

  return <div className={`pointer-events-none absolute rounded-full blur-3xl ${className}`} />;

}


function CinematicBackground() {

  return (

    <div className="pointer-events-none absolute inset-0 overflow-hidden">

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.026)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.026)_1px,transparent_1px)] bg-[size:76px_76px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />

      <motion.div

        animate={{ backgroundPosition: ["0px 0px", "160px 160px"] }}

        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}

        className="absolute inset-0 opacity-40 bg-[linear-gradient(rgba(34,211,238,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.08)_1px,transparent_1px)] bg-[size:120px_120px] [transform:perspective(900px)_rotateX(62deg)_translateY(18%)] [transform-origin:center_bottom]"

      />


      <motion.div

        animate={{ rotate: 360 }}

        transition={{ duration: 38, repeat: Infinity, ease: "linear" }}

        className="absolute left-1/2 top-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/10"

      />

      <motion.div

        animate={{ rotate: -360 }}

        transition={{ duration: 52, repeat: Infinity, ease: "linear" }}

        className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-400/10"

      />

      <motion.div

        animate={{ rotate: 360, scale: [1, 1.08, 1] }}

        transition={{ rotate: { duration: 46, repeat: Infinity, ease: "linear" }, scale: { duration: 8, repeat: Infinity, ease: "easeInOut" } }}

        className="absolute right-[7%] top-[18%] h-[380px] w-[380px] rounded-full border border-cyan-200/10 bg-[conic-gradient(from_180deg,transparent,rgba(34,211,238,0.18),transparent,rgba(37,99,235,0.18),transparent)] blur-[0.2px]"

      />


      <motion.div

        animate={{ x: ["-18%", "8%", "-18%"], y: ["0%", "-8%", "0%"], opacity: [0.22, 0.42, 0.22] }}

        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}

        className="absolute left-[-18%] top-[18%] h-[520px] w-[720px] rotate-12 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.28),transparent_68%)] blur-3xl"

      />

      <motion.div

        animate={{ x: ["12%", "-8%", "12%"], y: ["0%", "10%", "0%"], opacity: [0.18, 0.36, 0.18] }}

        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}

        className="absolute right-[-20%] top-[12%] h-[620px] w-[760px] -rotate-12 bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.20),transparent_68%)] blur-3xl"

      />


      {Array.from({ length: 26 }).map((_, index) => (

        <motion.span

          key={index}

          animate={{

            y: [0, -70 - (index % 5) * 12, 0],

            x: [0, (index % 2 === 0 ? 24 : -24), 0],

            opacity: [0.08, 0.42, 0.08],

            scale: [0.8, 1.25, 0.8],

          }}

          transition={{ duration: 7 + (index % 7), repeat: Infinity, delay: index * 0.18, ease: "easeInOut" }}

          className="absolute h-1 w-1 rounded-full bg-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.75)]"

          style={{ left: `${8 + ((index * 37) % 88)}%`, top: `${12 + ((index * 23) % 72)}%` }}

        />

      ))}

    </div>

  );

}


function HolographicOrbit() {

  const orbitItems = ["AI", "Quiz", "Diary", "Papers", "Reports", "Monitor"];


  return (

    <div className="pointer-events-none absolute inset-0 hidden lg:block">

      <motion.div

        animate={{ rotate: 360 }}

        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}

        className="absolute right-[8%] top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full border border-cyan-300/10"

      >

        {orbitItems.map((item, index) => {

          const angle = (index / orbitItems.length) * Math.PI * 2;

          const x = Math.cos(angle) * 250;

          const y = Math.sin(angle) * 250;

          return (

            <motion.div

              key={item}

              animate={{ rotate: -360 }}

              transition={{ duration: 28, repeat: Infinity, ease: "linear" }}

              className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl border border-white/10 bg-white/[0.055] text-[10px] font-black uppercase tracking-[0.12em] text-cyan-100 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl"

              style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}

            >

              {item}

            </motion.div>

          );

        })}

      </motion.div>

    </div>

  );

}


function CinematicSectionShell({ children, className = "" }) {

  return (

    <div className={`relative overflow-hidden ${className}`}>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(37,99,235,0.12),transparent_30%),radial-gradient(circle_at_80%_40%,rgba(34,211,238,0.09),transparent_34%)]" />

      <motion.div

        animate={{ x: ["-20%", "20%", "-20%"] }}

        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}

        className="pointer-events-none absolute left-0 top-0 h-px w-[70%] bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent"

      />

      {children}

    </div>

  );

}


function CinematicDivider({ label }) {

  return (

    <div className="relative px-4 py-2 md:px-8">

      <div className="mx-auto flex max-w-7xl items-center gap-4">

        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-300/25 to-cyan-300/5" />

        <div className="rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100/60 backdrop-blur-xl">

          {label}

        </div>

        <div className="h-px flex-1 bg-gradient-to-r from-cyan-300/5 via-cyan-300/25 to-transparent" />

      </div>

    </div>

  );

}


function SectionBackdrop({ children }) {

  return (

    <div className="relative overflow-hidden">

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(37,99,235,0.10),transparent_28%),radial-gradient(circle_at_82%_35%,rgba(34,211,238,0.08),transparent_34%)]" />

      <motion.div

        animate={{ x: ["-20%", "20%", "-20%"] }}

        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}

        className="pointer-events-none absolute left-0 top-0 h-px w-[70%] bg-gradient-to-r from-transparent via-cyan-300/35 to-transparent"

      />

      {children}

    </div>

  );

}


function SectionHeader({ eyebrow, title, subtitle, center = true }) {

  return (

    <motion.div

      variants={fadeUp}

      initial="hidden"

      whileInView="visible"

      viewport={{ once: true, amount: 0.25 }}

      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}

      className={`${center ? "mx-auto text-center" : ""} max-w-4xl`}

    >

      {eyebrow && <div className="text-sm font-black uppercase tracking-[0.26em] text-cyan-100/60">{eyebrow}</div>}

      <h2 className="mt-4 text-3xl font-black leading-tight tracking-[-0.04em] text-white md:text-5xl lg:text-6xl">{title}</h2>

      {subtitle && <p className="mt-5 text-base leading-8 text-slate-400 md:text-lg">{subtitle}</p>}

    </motion.div>

  );

}


function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [

    { label: "Home", href: "/apex" },

    { label: "Features", href: "/apex/features" },

    { label: "Pricing", href: "/apex/pricing" },

    { label: "About", href: "/apex/about" },

    { label: "Contact", href: "/apex/contact" },

    { label: "Login", href: "/login?choose=1" },

  ];

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);


  return (

    <motion.header

      initial={{ y: -24, opacity: 0 }}

      animate={{ y: 0, opacity: 1 }}

      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}

      className="fixed left-0 right-0 top-0 z-50 px-4 pt-4 md:px-8"

    >

      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/78 px-3 py-3 shadow-2xl shadow-blue-950/20 backdrop-blur-2xl md:px-6">

        <a href="#top" className="flex min-w-0 items-center gap-3" onClick={() => setMobileOpen(false)}>

          <div className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-300/20 bg-gradient-to-br from-blue-500/25 to-cyan-300/10 shadow-lg shadow-cyan-500/10">

            <Sparkles className="h-5 w-5 text-cyan-200" />

          </div>

          <div className="min-w-0">

            <div className="truncate text-lg font-black tracking-[0.18em] text-white sm:tracking-[0.24em]">APEX</div>

            <div className="-mt-1 hidden truncate text-[10px] uppercase tracking-[0.18em] text-cyan-100/55 xs:block sm:tracking-[0.28em]">AI School OS</div>

          </div>

        </a>


        <div className="hidden items-center gap-6 text-sm font-bold text-slate-300 xl:flex">

          {navLinks.map((item) => (

            <a key={item.label} href={item.href} className="transition hover:text-cyan-100">

              {item.label}

            </a>

          ))}

        </div>


        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-cyan-100 lg:flex xl:hidden">

          <Brain className="h-4 w-4" /> AI Everywhere

        </div>


        <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3">

          <a href="/apex/register-school" className="hidden rounded-full px-4 py-2 text-sm font-semibold text-slate-300 transition hover:text-white md:block">

            Get Started

          </a>

          <a

            href="/apex/demo-request"

            className="hidden rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-500/10 transition hover:scale-[1.02] hover:bg-cyan-50 sm:inline-flex"

          >

            Book Demo

          </a>

          <button
            type="button"
            aria-label={mobileOpen ? "Close APEX menu" : "Open APEX menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((value) => !value)}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-cyan-100 shadow-xl shadow-blue-950/20 backdrop-blur-xl xl:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

        </div>

      </nav>

      <div
        className="apex-mobile-menu-overlay xl:hidden"
        data-open={mobileOpen ? "true" : "false"}
        style={{
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? "auto" : "none",
        }}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <aside
        className="apex-mobile-drawer flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-black/40 backdrop-blur-2xl xl:hidden"
        data-open={mobileOpen ? "true" : "false"}
        style={{
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? "auto" : "none",
          transform: mobileOpen ? "translateX(0)" : "translateX(calc(100% + 1rem))",
        }}
        aria-hidden={!mobileOpen}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
          <div>
            <div className="text-sm font-black uppercase tracking-[0.22em] text-white">APEX</div>
            <div className="text-xs font-semibold text-cyan-100/60">Education Gateway</div>
          </div>
          <button
            type="button"
            aria-label="Close APEX menu"
            onClick={() => setMobileOpen(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-cyan-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="custom-scrollbar flex-1 overflow-y-auto p-3">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="flex min-h-12 items-center justify-between rounded-xl px-4 py-3 text-sm font-bold text-slate-200 transition hover:bg-white/[0.07] hover:text-cyan-100"
            >
              {item.label}
              <ArrowRight className="h-4 w-4 text-cyan-200/70" />
            </a>
          ))}
        </div>

        <div className="grid gap-2 border-t border-white/10 p-3 sm:grid-cols-2">
          <a
            href="/apex/register-school"
            onClick={() => setMobileOpen(false)}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 px-4 text-sm font-bold text-white"
          >
            Get Started
          </a>
          <a
            href="/apex/demo-request"
            onClick={() => setMobileOpen(false)}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-4 text-sm font-bold text-slate-950"
          >
            Book Demo
          </a>
        </div>
      </aside>

    </motion.header>

  );

}


function FeatureChip({ children, index }) {

  return (

    <motion.div

      initial={{ opacity: 0, y: 26, scale: 0.86, filter: "blur(10px)" }}

      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}

      transition={{ delay: 1.15 + index * 0.075, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}

      whileHover={{ y: -4, scale: 1.04 }}

      className="group relative overflow-hidden rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-xs font-semibold text-cyan-50 shadow-xl shadow-blue-950/20 backdrop-blur-xl"

    >

      <motion.span

        animate={{ x: ["-140%", "140%"] }}

        transition={{ duration: 3.8, repeat: Infinity, delay: index * 0.22, ease: "easeInOut" }}

        className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-cyan-200/18 to-transparent"

      />

      <span className="relative z-10">{children}</span>

    </motion.div>

  );

}


function HeroIntroBeam() {

  return (

    <div className="pointer-events-none absolute inset-0 overflow-hidden">

      <motion.div

        initial={{ x: "-120%", opacity: 0 }}

        animate={{ x: "120%", opacity: [0, 0.7, 0] }}

        transition={{ duration: 2.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}

        className="absolute top-0 h-full w-1/3 rotate-12 bg-gradient-to-r from-transparent via-cyan-200/12 to-transparent blur-xl"

      />

      <motion.div

        initial={{ scaleX: 0, opacity: 0 }}

        animate={{ scaleX: 1, opacity: [0, 0.8, 0.2] }}

        transition={{ duration: 1.8, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}

        className="absolute left-1/2 top-[18%] h-px w-[80%] -translate-x-1/2 origin-center bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent shadow-[0_0_28px_rgba(34,211,238,0.7)]"

      />

    </div>

  );

}


function DashboardCard({ title, value, Icon, index }) {

  return (

    <motion.div

      initial={{ opacity: 0, y: 18 }}

      animate={{ opacity: 1, y: 0 }}

      transition={{ delay: 0.75 + index * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}

      whileHover={{ y: -4, scale: 1.02 }}

      className="group rounded-2xl border border-white/10 bg-white/[0.065] p-4 shadow-xl shadow-blue-950/20 backdrop-blur-xl"

    >

      <div className="mb-4 flex items-center justify-between">

        <div className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-300/15 bg-cyan-300/[0.08]">

          <Icon className="h-5 w-5 text-cyan-200" />

        </div>

        <div className="h-2 w-2 rounded-full bg-cyan-300 shadow-lg shadow-cyan-300/50" />

      </div>

      <div className="text-sm font-bold text-white">{title}</div>

      <div className="mt-1 text-xs text-slate-400">{value}</div>

    </motion.div>

  );

}


function FloatingDashboard() {

  return (

    <motion.div

      initial={{ opacity: 0, x: 60, rotateY: -14, scale: 0.94 }}

      animate={{ opacity: 1, x: 0, rotateY: -8, scale: 1 }}

      transition={{ duration: 1.1, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}

      className="relative mx-auto w-full max-w-2xl [perspective:1000px]"

    >

      <motion.div

        animate={{ y: [0, -14, 0] }}

        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}

        className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-gradient-to-br from-white/[0.12] via-white/[0.06] to-cyan-300/[0.035] p-4 shadow-[0_40px_120px_rgba(8,47,73,0.45)] backdrop-blur-2xl md:p-5"

      >

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.18),transparent_34%),radial-gradient(circle_at_80%_30%,rgba(37,99,235,0.22),transparent_38%)]" />

        <div className="relative z-10">

          <div className="mb-5 flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/40 p-4">

            <div>

              <div className="text-sm font-bold uppercase tracking-[0.22em] text-cyan-100/75">APEX Command Center</div>

              <div className="mt-2 text-2xl font-black tracking-tight text-white">Live School Intelligence</div>

            </div>

            <div className="hidden rounded-2xl border border-emerald-300/15 bg-emerald-300/10 px-4 py-2 text-xs font-bold text-emerald-100 sm:block">

              SYSTEM ACTIVE

            </div>

          </div>


          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">

            {modules.map((module, index) => (

              <DashboardCard key={module.title} {...module} Icon={module.icon} index={index} />

            ))}

          </div>


          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">

            <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">

              <div className="mb-3 flex items-center justify-between text-xs text-slate-400">

                <span>Academic Growth</span>

                <span className="text-cyan-200">+38%</span>

              </div>

              <div className="flex h-24 items-end gap-2">

                {[38, 48, 42, 66, 58, 76, 72, 86, 91].map((h, i) => (

                  <motion.div

                    key={i}

                    initial={{ height: 8 }}

                    animate={{ height: `${h}%` }}

                    transition={{ delay: 1.15 + i * 0.04, duration: 0.7 }}

                    className="flex-1 rounded-t-lg bg-gradient-to-t from-blue-600/60 to-cyan-200/80"

                  />

                ))}

              </div>

            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">

              <div className="mb-4 flex items-center justify-between text-xs text-slate-400">

                <span>Exam Control</span>

                <span className="text-cyan-200">Board Ready</span>

              </div>

              <div className="space-y-3">

                {[92, 78, 88].map((w, i) => (

                  <div key={i} className="h-3 overflow-hidden rounded-full bg-white/8">

                    <motion.div

                      initial={{ width: 0 }}

                      animate={{ width: `${w}%` }}

                      transition={{ delay: 1.15 + i * 0.12, duration: 0.9 }}

                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-200"

                    />

                  </div>

                ))}

              </div>

              <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-slate-300">

                <ShieldCheck className="h-4 w-4 text-cyan-200" /> Print-perfect papers, analytics, and approvals.

              </div>

            </div>

          </div>

        </div>

      </motion.div>

    </motion.div>

  );

}


function Hero() {

  const headlineWords = ["Run", "Your", "Entire", "School", "with", "AI", "in", "Every", "Workflow"];


  return (

    <section id="hero" className="relative flex min-h-screen items-center px-4 pb-28 pt-36 md:px-8 md:pt-40 lg:pt-36">

      <CinematicBackground />

      <HolographicOrbit />

      <HeroIntroBeam />

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,7,18,0.10),#030712_96%)]" />

      <GlowOrb className="left-[-10%] top-[18%] h-80 w-80 bg-blue-600/20" />

      <GlowOrb className="right-[-8%] top-[14%] h-96 w-96 bg-cyan-300/12" />


      <motion.div

        initial={{ opacity: 0 }}

        animate={{ opacity: [0, 0.25, 0] }}

        transition={{ duration: 1.8, delay: 0.05, ease: "easeOut" }}

        className="pointer-events-none absolute inset-0 bg-white"

      />


      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.92fr_1.08fr]">

        <div>

          <motion.div

            initial={{ opacity: 0, y: 22, scale: 0.96, filter: "blur(12px)" }}

            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}

            transition={{ duration: 0.75, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}

            className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-200/15 bg-cyan-200/[0.06] px-4 py-2 text-sm font-semibold text-cyan-100 backdrop-blur-xl"

          >

            <Sparkles className="h-4 w-4" /> AI-Powered School Operating System

          </motion.div>


          <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.055em] text-white md:text-7xl xl:text-8xl">

            {headlineWords.map((word, index) => (

              <motion.span

                key={`${word}-${index}`}

                initial={{ opacity: 0, y: 42, rotateX: -45, filter: "blur(14px)" }}

                animate={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}

                transition={{ delay: 0.48 + index * 0.055, duration: 0.72, ease: [0.22, 1, 0.36, 1] }}

                className="mr-[0.18em] inline-block [transform-origin:center_bottom]"

              >

                {word}

              </motion.span>

            ))}

          </h1>


          <motion.p

            initial={{ opacity: 0, y: 26, filter: "blur(10px)" }}

            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}

            transition={{ duration: 0.78, delay: 0.95, ease: [0.22, 1, 0.36, 1] }}

            className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl"

          >

            APEX gives teachers AI Homework, AI Diary, AI Quiz Assign, AI Paper Generator, and Manual Paper Generator - while students get AI Quiz, AI Monitoring, AI Homework Preparation, and parents receive Monthly AI Reports.

          </motion.p>


          <motion.div

            initial={{ opacity: 0, y: 24, scale: 0.96 }}

            animate={{ opacity: 1, y: 0, scale: 1 }}

            transition={{ duration: 0.72, delay: 1.08, ease: [0.22, 1, 0.36, 1] }}

            className="mt-9 flex flex-col gap-3 sm:flex-row"

          >

            <a href="/apex/demo-request" className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 px-7 py-4 text-base font-black text-white shadow-2xl shadow-cyan-500/20 transition hover:scale-[1.02]">

              <motion.span

                animate={{ x: ["-140%", "160%"] }}

                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}

                className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent"

              />

              <span className="relative z-10 inline-flex items-center gap-3">

                Book Demo <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />

              </span>

            </a>

            <a href="/apex/register-school" className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.06] px-7 py-4 text-base font-bold text-white backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/[0.1]">

              Get Started

            </a>

          </motion.div>


          <div className="mt-8 flex flex-wrap gap-3">

            {chips.map((chip, index) => (

              <FeatureChip key={chip} index={index}>{chip}</FeatureChip>

            ))}

          </div>

        </div>


        <motion.div

          initial={{ opacity: 0, x: 80, scale: 0.88, rotateY: -28, filter: "blur(18px)" }}

          animate={{ opacity: 1, x: 0, scale: 1, rotateY: 0, filter: "blur(0px)" }}

          transition={{ duration: 1.05, delay: 0.78, ease: [0.22, 1, 0.36, 1] }}

          className="relative"

        >

          <motion.div

            animate={{ rotate: [0, 360] }}

            transition={{ duration: 34, repeat: Infinity, ease: "linear" }}

            className="pointer-events-none absolute -inset-10 rounded-full border border-cyan-300/10 bg-[conic-gradient(from_90deg,transparent,rgba(34,211,238,0.12),transparent,rgba(37,99,235,0.12),transparent)] blur-[0.4px]"

          />

          <motion.div

            animate={{ scale: [1, 1.08, 1], opacity: [0.34, 0.58, 0.34] }}

            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}

            className="pointer-events-none absolute -inset-16 rounded-full bg-cyan-300/10 blur-3xl"

          />

          <FloatingDashboard />

        </motion.div>

      </div>

    </section>

  );

}


function StorytellingJourneySection() {
  const [activeScene, setActiveScene] = React.useState(0);

  const storySteps = [
    {
      label: "Scene 01 / Manual Chaos",
      title: "A school day starts with scattered work everywhere.",
      text: "Teachers write homework manually, diary notes are repeated again and again, quizzes take time, papers need formatting, parents ask for updates, and owners still wait for reports.",
      chips: ["Registers", "WhatsApp", "Manual Papers", "Late Reports"],
      visualTitle: "Disconnected School Workflow",
      stat: "6+ systems",
    },
    {
      label: "Scene 02 / Teacher AI",
      title: "APEX gives teachers an AI workspace for daily teaching.",
      text: "Teachers can create AI Homework, write AI Diary, assign AI Quizzes, generate exam papers, or build manual papers from one connected dashboard.",
      chips: ["AI Homework", "AI Diary", "AI Quiz Assign", "AI Papers"],
      visualTitle: "Teacher AI Command Panel",
      stat: "70% faster",
    },
    {
      label: "Scene 03 / Student AI",
      title: "Students get guided preparation instead of blind practice.",
      text: "APEX supports AI Quiz, AI Homework Preparation, learning monitoring, weak-area detection, and smarter preparation based on actual class work.",
      chips: ["AI Quiz", "AI Monitoring", "Practice", "Weak Areas"],
      visualTitle: "Student Learning Intelligence",
      stat: "Live guidance",
    },
    {
      label: "Scene 04 / Parent AI Reports",
      title: "Parents stop guessing and start understanding progress.",
      text: "APEX can send monthly AI reports with attendance, fee status, academic progress, teacher feedback summary, and clear child improvement insights.",
      chips: ["Monthly Reports", "Progress", "Attendance", "Fee Alerts"],
      visualTitle: "Parent Insight Report",
      stat: "Monthly AI",
    },
    {
      label: "Scene 05 / Exams Studio",
      title: "Papers become print-ready, structured, and controlled.",
      text: "AI Paper Generator and Manual Paper Generator work with question bank, marks distribution, Urdu/English formatting, and print-perfect layouts.",
      chips: ["AI Generator", "Manual Builder", "Question Bank", "Print PDF"],
      visualTitle: "Exam Paper Studio",
      stat: "Print ready",
    },
    {
      label: "Scene 06 / Owner Intelligence",
      title: "The owner finally sees the full school from one command center.",
      text: "Fees, academics, attendance, teacher workload, student performance, parent reports, and monthly school health become visible in one intelligent operating system.",
      chips: ["Fees", "Academics", "Reports", "School Health"],
      visualTitle: "APEX School Intelligence",
      stat: "One OS",
    },
  ];

  const currentStep = storySteps[activeScene];

  return (
    <section id="story" className="relative scroll-mt-32 px-4 py-28 md:px-8">
      <GlowOrb className="left-[-12%] top-[12%] h-[520px] w-[520px] bg-blue-600/12" />
      <GlowOrb className="right-[-12%] bottom-[8%] h-[520px] w-[520px] bg-cyan-300/10" />

      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="APEX Story"
          title="Scroll Through a Real School Day - and Watch APEX Take Over"
          subtitle="This is not a static feature list. APEX follows the daily journey of a school: teachers, students, parents, exams, reports, and owner intelligence all become connected through one premium operating system."
        />

        <div className="mt-16 grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
          {/* Left Column: Existing storytelling cards with viewport indicators */}
          <div className="space-y-6 lg:pb-24">
            {storySteps.map((step, index) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0.35, x: -26, scale: 0.98 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                onViewportEnter={() => setActiveScene(index)}
                viewport={{ amount: 0.55 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-white/[0.075] via-white/[0.045] to-cyan-300/[0.025] p-5 shadow-2xl shadow-blue-950/20 backdrop-blur-2xl cinematic-card"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(34,211,238,0.13),transparent_34%)] opacity-50 transition group-hover:opacity-100" />
                <div className="relative z-10">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div className="text-xs font-black uppercase tracking-[0.24em] text-cyan-100/60">{step.label}</div>
                    <div className="rounded-full border border-cyan-300/15 bg-cyan-300/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-100">
                      {step.stat}
                    </div>
                  </div>
                  <h3 className="text-2xl font-black leading-tight tracking-tight text-white md:text-3xl">{step.title}</h3>
                  <p className="mt-4 text-sm font-semibold leading-7 text-slate-400 md:text-base">{step.text}</p>
                  
                  {/* Mobile-only embedded visual grid to stack cleanly below story cards */}
                  <div className="mt-5 rounded-2xl border border-white/5 bg-slate-950/30 p-4 lg:hidden">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                      <span className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-200/70">{step.visualTitle}</span>
                      <span className="text-[10px] font-black text-cyan-400">ACTIVE SCENE</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {step.chips.map((chip) => (
                        <div key={chip} className="rounded-xl border border-white/5 bg-white/[0.03] p-2 text-center text-[10px] font-bold text-slate-300">
                          {chip}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 hidden lg:flex flex-wrap gap-2">
                    {step.chips.map((chip) => (
                      <span key={chip} className="rounded-full border border-white/10 bg-slate-950/35 px-3 py-1.5 text-xs font-bold text-slate-200">
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <ApexLiveStoryConsole activeScene={activeScene} />
        </div>
      </div>
    </section>
  );
}

function ModuleGalaxySection() {
  return <CleanApexModuleGalaxy />;
}

function ProblemSection() {

  return (

    <section id="problems" className="relative scroll-mt-32 px-4 py-24 md:px-8">

      <GlowOrb className="left-[-12%] top-[20%] h-[420px] w-[420px] bg-blue-600/10" />

      <GlowOrb className="right-[-12%] bottom-[5%] h-[420px] w-[420px] bg-cyan-300/8" />


      <div className="mx-auto max-w-7xl">

        <SectionHeader

          eyebrow="Why Schools Need APEX"

          title="Schools Are Still Running AI-Level Work Manually"

          subtitle="Teachers, students, parents, admins, and owners all need intelligence inside their daily workflow. APEX replaces scattered registers, WhatsApp follow-ups, manual paper making, weak monitoring, and delayed reporting with one AI-powered school operating system."

        />


        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          {problems.map(({ title, fix, icon: Icon }, index) => (

            <motion.div

              key={title}

              variants={fadeUp}

              initial="hidden"

              whileInView="visible"

              viewport={{ once: true, amount: 0.22 }}

              transition={{ delay: index * 0.06, duration: 0.68, ease: [0.22, 1, 0.36, 1] }}

              whileHover={{ y: -6 }}

              className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-white/[0.075] via-white/[0.045] to-cyan-300/[0.025] p-5 shadow-2xl shadow-blue-950/20 backdrop-blur-2xl cinematic-card"

            >

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(34,211,238,0.13),transparent_34%)] opacity-60 transition group-hover:opacity-100" />

              <div className="relative z-10">

                <div className="mb-5 flex items-start justify-between gap-4">

                  <div className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.08] shadow-lg shadow-cyan-500/10">

                    <Icon className="h-6 w-6 text-cyan-200" />

                  </div>

                  <div className="rounded-full border border-rose-300/15 bg-rose-300/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-rose-100">

                    Manual Pain

                  </div>

                </div>


                <h3 className="min-h-[84px] text-xl font-black leading-tight tracking-tight text-white md:text-2xl">

                  {title}

                </h3>


                <div className="mt-6 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.065] p-4">

                  <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-100/70">

                    <Sparkles className="h-4 w-4" /> APEX AI Fix

                  </div>

                  <p className="text-sm font-bold leading-6 text-cyan-50">{fix}</p>

                </div>


                <div className="mt-5 space-y-2.5">

                  {[78, 64, 88].map((width, lineIndex) => (

                    <div key={lineIndex} className="h-2 overflow-hidden rounded-full bg-white/10">

                      <motion.div

                        initial={{ width: 0 }}

                        whileInView={{ width: `${width}%` }}

                        viewport={{ once: true }}

                        transition={{ delay: 0.25 + lineIndex * 0.08, duration: 0.7 }}

                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-300"

                      />

                    </div>

                  ))}

                </div>

              </div>

            </motion.div>

          ))}

        </div>


        <motion.div

          initial={{ opacity: 0, y: 28 }}

          whileInView={{ opacity: 1, y: 0 }}

          viewport={{ once: true }}

          transition={{ duration: 0.75, delay: 0.18 }}

          className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-blue-950/20 backdrop-blur-2xl md:p-6"

        >

          <div className="grid items-center gap-5 lg:grid-cols-[0.8fr_1.2fr]">

            <div>

              <div className="text-sm font-black uppercase tracking-[0.24em] text-cyan-100/60">From Manual Work to AI Flow</div>

              <h3 className="mt-3 text-3xl font-black tracking-tight text-white">APEX does not add AI as decoration. It puts AI where school work actually happens.</h3>

            </div>

            <div className="grid gap-3 sm:grid-cols-3">

              {["Teachers", "Students", "Parents", "Exams", "Reports", "School Owners"].map((item, index) => (

                <div key={item} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-center">

                  <div className="mx-auto mb-3 grid h-9 w-9 place-items-center rounded-xl bg-cyan-300/10 text-cyan-100">

                    <Brain className="h-5 w-5" />

                  </div>

                  <div className="text-sm font-black text-white">AI for {item}</div>

                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">

                    <motion.div

                      initial={{ width: 0 }}

                      whileInView={{ width: `${70 + index * 4}%` }}

                      viewport={{ once: true }}

                      transition={{ delay: 0.2 + index * 0.06, duration: 0.7 }}

                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-300"

                    />

                  </div>

                </div>

              ))}

            </div>

          </div>

        </motion.div>

      </div>

    </section>

  );

}


function SolutionFlowSection() {
  return <BalancedIntelligentFlow />;
}

function AIEcosystemSection() {

  const aiRoles = [

    {

      audience: "For Teachers",

      title: "AI Teaching Workspace",

      icon: School,

      items: ["AI Homework", "AI Diary", "AI Quiz Assign", "AI Paper Generator", "Manual Paper Generator"],

    },

    {

      audience: "For Students",

      title: "AI Learning Companion",

      icon: GraduationCap,

      items: ["AI Quiz", "AI Monitoring", "AI Homework Preparation", "Performance Guidance", "Practice Support"],

    },

    {

      audience: "For Parents",

      title: "AI Progress Reports",

      icon: Smartphone,

      items: ["Monthly AI Reports", "Attendance Insights", "Fee Alerts", "Academic Progress", "Teacher Feedback Summary"],

    },

    {

      audience: "For School Leaders",

      title: "AI School Intelligence",

      icon: Building2,

      items: ["Live School Health", "Class Performance", "Fee Intelligence", "Teacher Workload", "Monthly Summary Reports"],

    },

  ];


  return (

    <section id="ai-ecosystem" className="relative scroll-mt-32 px-4 py-24 md:px-8">

      <GlowOrb className="left-[-12%] top-[12%] h-[460px] w-[460px] bg-blue-600/12" />

      <GlowOrb className="right-[-12%] bottom-[8%] h-[460px] w-[460px] bg-cyan-300/10" />


      <div className="mx-auto max-w-7xl">

        <SectionHeader

          eyebrow="AI Everywhere"

          title="APEX Puts AI Inside Every School Workflow"

          subtitle="APEX is not just a management system with one AI button. It brings AI into homework, diary writing, quiz assignment, paper generation, student monitoring, parent reports, and school intelligence."

        />


        <div className="mt-14 grid gap-5 lg:grid-cols-4">

          {aiRoles.map(({ audience, title, icon: Icon, items }, index) => (

            <motion.div

              key={title}

              variants={fadeUp}

              initial="hidden"

              whileInView="visible"

              viewport={{ once: true, amount: 0.22 }}

              transition={{ delay: index * 0.07, duration: 0.68, ease: [0.22, 1, 0.36, 1] }}

              whileHover={{ y: -6 }}

              className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.045] to-cyan-300/[0.025] p-5 shadow-2xl shadow-blue-950/25 backdrop-blur-2xl cinematic-card"

            >

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(34,211,238,0.14),transparent_34%)] opacity-70 transition group-hover:opacity-100" />

              <div className="relative z-10">

                <div className="mb-5 flex items-center justify-between gap-4">

                  <div className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.08] shadow-lg shadow-cyan-500/10">

                    <Icon className="h-6 w-6 text-cyan-200" />

                  </div>

                  <div className="rounded-full border border-cyan-300/15 bg-cyan-300/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">

                    AI Layer

                  </div>

                </div>


                <div className="text-xs font-black uppercase tracking-[0.22em] text-cyan-100/55">{audience}</div>

                <h3 className="mt-2 text-2xl font-black tracking-tight text-white">{title}</h3>

                <p className="mt-3 text-sm leading-6 text-slate-400">

                  Smart automation and intelligent support designed for this role's daily school workflow.

                </p>


                <div className="mt-6 space-y-3">

                  {items.map((item) => (

                    <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm font-bold text-slate-200">

                      <Sparkles className="h-4 w-4 shrink-0 text-cyan-200" />

                      {item}

                    </div>

                  ))}

                </div>

              </div>

            </motion.div>

          ))}

        </div>


        <motion.div

          initial={{ opacity: 0, y: 28 }}

          whileInView={{ opacity: 1, y: 0 }}

          viewport={{ once: true }}

          transition={{ duration: 0.75, delay: 0.18 }}

          className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-blue-950/20 backdrop-blur-2xl md:p-6"

        >

          <div className="grid items-center gap-5 lg:grid-cols-[0.8fr_1.2fr]">

            <div>

              <div className="text-sm font-black uppercase tracking-[0.24em] text-cyan-100/60">Unified AI Engine</div>

              <h3 className="mt-3 text-3xl font-black tracking-tight text-white">One AI brain, every module connected.</h3>

              <p className="mt-4 text-sm leading-7 text-slate-400">

                Homework, diary, quizzes, paper generation, monitoring, and reports should not feel separate. APEX connects them so teachers, students, parents, and owners all see smarter outcomes from the same system.

              </p>

            </div>

            <div className="grid gap-3 sm:grid-cols-3">

              {["AI Teaching", "AI Learning", "AI Reporting", "AI Exams", "AI Monitoring", "AI Analytics"].map((item, index) => (

                <div key={item} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-center">

                  <div className="mx-auto mb-3 grid h-9 w-9 place-items-center rounded-xl bg-cyan-300/10 text-cyan-100">

                    <Brain className="h-5 w-5" />

                  </div>

                  <div className="text-sm font-black text-white">{item}</div>

                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">

                    <motion.div

                      initial={{ width: 0 }}

                      whileInView={{ width: `${74 + index * 4}%` }}

                      viewport={{ once: true }}

                      transition={{ delay: 0.2 + index * 0.06, duration: 0.7 }}

                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-300"

                    />

                  </div>

                </div>

              ))}

            </div>

          </div>

        </motion.div>

      </div>

    </section>

  );

}


function PaperGeneratorSection() {

  const setupFields = [

    { label: "Class", value: "Class 9 / Punjab Board" },

    { label: "Subject", value: "English / Urdu / Science" },

    { label: "Pattern", value: "Board Pattern 2026" },

    { label: "Language", value: "Urdu + English Ready" },

  ];


  const questionTypes = [

    { name: "MCQs", count: "12", width: "92%" },

    { name: "Short Questions", count: "08", width: "78%" },

    { name: "Long Questions", count: "04", width: "64%" },

    { name: "Grammar / Objective", count: "06", width: "86%" },

  ];


  const workflow = ["Select syllabus", "Choose pattern", "Balance marks", "Generate print PDF"];


  return (

    <section id="ai-paper-generator" className="relative scroll-mt-32 px-4 py-24 md:px-8">

      <GlowOrb className="right-[-12%] top-[22%] h-[460px] w-[460px] bg-cyan-300/10" />

      <GlowOrb className="left-[-10%] bottom-[10%] h-[420px] w-[420px] bg-blue-600/12" />


      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.88fr_1.12fr]">

        <div>

          <SectionHeader

            center={false}

            eyebrow="AI Paper Generator"

            title="Generate Print-Perfect Papers in Minutes"

            subtitle="Create board-pattern papers with MCQs, short questions, long questions, Urdu/English formatting, past-paper intelligence, and question bank control."

          />


          <div className="mt-8 grid gap-3 sm:grid-cols-2">

            {paperFeatures.map((feature, index) => (

              <motion.div

                key={feature}

                variants={fadeUp}

                initial="hidden"

                whileInView="visible"

                viewport={{ once: true, amount: 0.25 }}

                transition={{ delay: index * 0.05, duration: 0.6 }}

                className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] p-4 text-sm font-bold text-slate-100 shadow-xl shadow-blue-950/15 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/[0.075]"

              >

                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-cyan-300/15 bg-cyan-300/[0.07]">

                  <CheckCircle2 className="h-5 w-5 text-cyan-200" />

                </div>

                {feature}

              </motion.div>

            ))}

          </div>


          <motion.div

            initial={{ opacity: 0, y: 24 }}

            whileInView={{ opacity: 1, y: 0 }}

            viewport={{ once: true }}

            transition={{ duration: 0.7, delay: 0.25 }}

            className="mt-8 rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-blue-950/20 backdrop-blur-xl"

          >

            <div className="mb-5 flex items-center gap-3">

              <div className="grid h-11 w-11 place-items-center rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.08]">

                <Printer className="h-5 w-5 text-cyan-200" />

              </div>

              <div>

                <h3 className="text-lg font-black text-white">Designed for real school printing</h3>

                <p className="text-sm text-slate-400">Not just generated text - proper paper format, marks, sections, and layout.</p>

              </div>

            </div>

            <div className="grid gap-3 sm:grid-cols-4">

              {workflow.map((step, index) => (

                <div key={step} className="rounded-2xl border border-white/10 bg-slate-950/35 p-3 text-center">

                  <div className="mx-auto mb-2 grid h-7 w-7 place-items-center rounded-full bg-cyan-300/10 text-xs font-black text-cyan-100">

                    {index + 1}

                  </div>

                  <div className="text-xs font-bold leading-5 text-slate-200">{step}</div>

                </div>

              ))}

            </div>

          </motion.div>

        </div>


        <motion.div

          initial={{ opacity: 0, x: 50, rotateY: -8 }}

          whileInView={{ opacity: 1, x: 0, rotateY: -3 }}

          viewport={{ once: true, amount: 0.2 }}

          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}

          className="relative [perspective:1000px]"

        >

          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.11] via-white/[0.055] to-cyan-300/[0.035] p-4 shadow-[0_40px_130px_rgba(8,47,73,0.42)] backdrop-blur-2xl md:p-5">

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(34,211,238,0.20),transparent_35%),radial-gradient(circle_at_10%_90%,rgba(37,99,235,0.18),transparent_32%)]" />

            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:54px_54px]" />


            <div className="relative z-10 overflow-hidden rounded-[1.6rem] border border-white/10 bg-slate-950/55">

              <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.045] px-5 py-4">

                <div>

                  <div className="text-xs font-black uppercase tracking-[0.24em] text-cyan-100/60">APEX AI Engine</div>

                  <h3 className="mt-1 text-2xl font-black tracking-tight text-white">Paper Generator Studio</h3>

                </div>

                <div className="hidden rounded-full border border-emerald-300/15 bg-emerald-300/10 px-4 py-2 text-xs font-black text-emerald-100 sm:block">

                  READY

                </div>

              </div>


              <div className="grid gap-4 p-5 lg:grid-cols-[0.95fr_1.05fr]">

                <div className="space-y-4">

                  <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">

                    <div className="mb-4 text-sm font-black text-white">Paper Setup</div>

                    <div className="space-y-3">

                      {setupFields.map((field) => (

                        <div key={field.label} className="rounded-xl border border-white/10 bg-slate-950/45 p-3">

                          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{field.label}</div>

                          <div className="mt-1 text-sm font-bold text-slate-100">{field.value}</div>

                        </div>

                      ))}

                    </div>

                  </div>


                  <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">

                    <div className="mb-3 flex items-center justify-between">

                      <div className="text-sm font-black text-white">Smart Controls</div>

                      <span className="text-xs font-bold text-cyan-200">Auto</span>

                    </div>

                    <div className="grid grid-cols-2 gap-2">

                      {["Marks", "Difficulty", "Chapters", "Format"].map((item) => (

                        <div key={item} className="rounded-xl bg-slate-950/45 px-3 py-3 text-center text-xs font-bold text-slate-300">

                          {item}

                        </div>

                      ))}

                    </div>

                  </div>

                </div>


                <div className="space-y-4">

                  <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">

                    <div className="mb-4 flex items-center justify-between text-sm font-black text-white">

                      <span>Question Distribution</span>

                      <span className="text-cyan-200">30 Marks</span>

                    </div>

                    <div className="space-y-4">

                      {questionTypes.map((item, index) => (

                        <div key={item.name}>

                          <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-300">

                            <span>{item.name}</span>

                            <span>{item.count}</span>

                          </div>

                          <div className="h-2.5 overflow-hidden rounded-full bg-white/10">

                            <motion.div

                              initial={{ width: 0 }}

                              whileInView={{ width: item.width }}

                              viewport={{ once: true }}

                              transition={{ delay: 0.35 + index * 0.08, duration: 0.75 }}

                              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-300"

                            />

                          </div>

                        </div>

                      ))}

                    </div>

                  </div>


                  <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">

                    <div className="mb-4 flex items-center justify-between">

                      <div>

                        <div className="text-sm font-black text-white">Live Preview</div>

                        <div className="text-xs text-slate-400">Print-ready paper layout</div>

                      </div>

                      <FileText className="h-5 w-5 text-cyan-200" />

                    </div>

                    <div className="rounded-xl bg-white/[0.88] p-3 text-slate-950 shadow-xl">

                      <div className="mb-2 h-3 w-2/3 rounded-full bg-slate-300" />

                      <div className="mb-3 h-2 w-1/2 rounded-full bg-slate-200" />

                      <div className="space-y-2">

                        {["Q1. Choose the correct answer", "Q2. Answer the following questions", "Q3. Long question with marks"].map((line) => (

                          <div key={line} className="flex items-center justify-between gap-3 text-[10px] font-bold">

                            <span>{line}</span>

                            <span className="rounded bg-slate-200 px-1.5 py-0.5">05</span>

                          </div>

                        ))}

                      </div>

                    </div>

                  </div>


                  <button className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-400 px-6 py-4 text-base font-black text-white shadow-2xl shadow-cyan-500/20 transition hover:scale-[1.01]">

                    Generate Paper <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />

                  </button>

                </div>

              </div>

            </div>

          </div>

        </motion.div>

      </div>

    </section>

  );

}


function RoleDashboardsSection() {

  const roleStats = {

    "Owner Dashboard": ["Revenue", "Growth", "Control"],

    "Admin Dashboard": ["Admissions", "Records", "Tasks"],

    "Teacher Dashboard": ["Classes", "Marks", "Work"],

    "Student Portal": ["Homework", "Results", "Notices"],

    "Parent App": ["Attendance", "Fees", "Updates"],

    "Account Office": ["Vouchers", "Paid", "Pending"],

  };


  return (

    <section id="dashboards" className="relative scroll-mt-32 px-4 py-24 md:px-8">

      <GlowOrb className="left-[-12%] top-[24%] h-[420px] w-[420px] bg-blue-600/12" />

      <GlowOrb className="right-[-10%] bottom-[8%] h-[420px] w-[420px] bg-cyan-300/10" />


      <div className="mx-auto max-w-7xl">

        <SectionHeader

          eyebrow="Role-Based System"

          title="Every Role Gets Its Own Intelligent Dashboard"

          subtitle="APEX gives each person the exact tools they need, without exposing unnecessary controls or confusing screens. Owners, admins, teachers, parents, students, and accounts all work from one connected system."

        />


        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          {roles.map(({ title, icon: Icon, features }, index) => (

            <motion.div

              key={title}

              variants={fadeUp}

              initial="hidden"

              whileInView="visible"

              viewport={{ once: true, amount: 0.22 }}

              transition={{ delay: index * 0.055, duration: 0.68, ease: [0.22, 1, 0.36, 1] }}

              whileHover={{ y: -6 }}

              className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-white/[0.075] via-white/[0.045] to-cyan-300/[0.025] p-5 shadow-2xl shadow-blue-950/20 backdrop-blur-2xl cinematic-card"

            >

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(34,211,238,0.14),transparent_34%)] opacity-70 transition group-hover:opacity-100" />

              <div className="relative z-10">

                <div className="mb-5 flex items-start justify-between gap-4">

                  <div className="grid h-13 w-13 place-items-center rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.08] p-3 shadow-lg shadow-cyan-500/10">

                    <Icon className="h-6 w-6 text-cyan-200" />

                  </div>

                  <div className="rounded-full border border-emerald-300/15 bg-emerald-300/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-100">

                    Live

                  </div>

                </div>


                <h3 className="text-2xl font-black tracking-tight text-white">{title}</h3>

                <p className="mt-3 text-sm leading-6 text-slate-400">

                  A focused workspace built around daily responsibilities, permissions, reports, and real-time school actions.

                </p>


                <div className="mt-5 space-y-3">

                  {features.map((feature) => (

                    <div key={feature} className="flex items-center gap-3 text-sm font-semibold text-slate-300">

                      <div className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-lg shadow-cyan-300/50" /> {feature}

                    </div>

                  ))}

                </div>


                <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/45 p-4">

                  <div className="mb-4 flex items-center justify-between">

                    <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan-100/55">Mini Preview</div>

                    <div className="flex gap-1.5">

                      <span className="h-2 w-2 rounded-full bg-cyan-300/70" />

                      <span className="h-2 w-2 rounded-full bg-blue-400/70" />

                      <span className="h-2 w-2 rounded-full bg-white/35" />

                    </div>

                  </div>


                  <div className="grid grid-cols-3 gap-2">

                    {(roleStats[title] || ["Track", "Manage", "Report"]).map((stat, statIndex) => (

                      <div key={stat} className="rounded-xl border border-white/10 bg-white/[0.055] p-3 text-center">

                        <div className="text-lg font-black text-white">{[92, 74, 38][statIndex]}</div>

                        <div className="mt-1 text-[10px] font-bold text-slate-400">{stat}</div>

                      </div>

                    ))}

                  </div>


                  <div className="mt-4 space-y-2.5">

                    {[86, 64, 78].map((width, lineIndex) => (

                      <div key={lineIndex} className="h-2 overflow-hidden rounded-full bg-white/10">

                        <motion.div

                          initial={{ width: 0 }}

                          whileInView={{ width: `${width}%` }}

                          viewport={{ once: true }}

                          transition={{ delay: 0.25 + lineIndex * 0.08, duration: 0.7 }}

                          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-300"

                        />

                      </div>

                    ))}

                  </div>

                </div>

              </div>

            </motion.div>

          ))}

        </div>

      </div>

    </section>

  );

}


function AnalyticsSection() {

  const metrics = [

    { label: "Student Performance", value: "92%", note: "+12% this term", width: "92%" },

    { label: "Fee Collection", value: "78%", note: "24 pending", width: "78%" },

    { label: "Attendance Rate", value: "96%", note: "Live today", width: "96%" },

    { label: "Exam Results", value: "84%", note: "Board pattern", width: "84%" },

  ];


  const insightRows = [

    { title: "Class VII-B needs attention", tag: "Academic" },

    { title: "Fee follow-up required", tag: "Finance" },

    { title: "Attendance improved this week", tag: "Attendance" },

    { title: "Paper generation completed", tag: "Exams" },

  ];


  const comparisonBars = [45, 64, 52, 78, 72, 88, 67, 91, 84, 96, 76, 89];

  const workload = [

    { label: "Assignments", value: 68 },

    { label: "Papers", value: 81 },

    { label: "Attendance", value: 74 },

    { label: "Results", value: 89 },

  ];


  return (

    <section id="analytics" className="relative scroll-mt-32 px-4 py-24 md:px-8">

      <GlowOrb className="left-[-14%] top-[20%] h-[480px] w-[480px] bg-blue-600/12" />

      <GlowOrb className="right-[-14%] bottom-[10%] h-[480px] w-[480px] bg-cyan-300/10" />


      <div className="mx-auto max-w-7xl">

        <SectionHeader

          eyebrow="School Intelligence"

          title="See Your School Like Never Before"

          subtitle="Track performance, fees, attendance, exams, classes, and teacher workload from one premium intelligence dashboard built for real school owners and administrators."

        />


        <motion.div

          initial={{ opacity: 0, y: 42 }}

          whileInView={{ opacity: 1, y: 0 }}

          viewport={{ once: true, amount: 0.16 }}

          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}

          className="relative mt-14 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.045] to-cyan-300/[0.025] p-4 shadow-2xl shadow-blue-950/35 backdrop-blur-2xl md:p-6 cinematic-card"

        >

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(37,99,235,0.20),transparent_34%),radial-gradient(circle_at_85%_20%,rgba(34,211,238,0.16),transparent_32%)]" />

          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:58px_58px]" />


          <div className="relative z-10">

            <div className="mb-5 flex flex-col justify-between gap-4 rounded-3xl border border-white/10 bg-slate-950/45 p-5 md:flex-row md:items-center">

              <div>

                <div className="text-xs font-black uppercase tracking-[0.25em] text-cyan-100/60">APEX Intelligence Layer</div>

                <h3 className="mt-2 text-2xl font-black tracking-tight text-white md:text-3xl">Live School Command Analytics</h3>

              </div>

              <div className="flex flex-wrap gap-2">

                {["Today", "This Month", "Board Exams"].map((filter, index) => (

                  <button

                    key={filter}

                    className={`rounded-full border px-4 py-2 text-xs font-black transition ${

                      index === 0

                        ? "border-cyan-300/25 bg-cyan-300/12 text-cyan-100"

                        : "border-white/10 bg-white/[0.045] text-slate-300 hover:bg-white/[0.075]"

                    }`}

                  >

                    {filter}

                  </button>

                ))}

              </div>

            </div>


            <div className="grid gap-4 lg:grid-cols-4">

              {metrics.map((metric, index) => (

                <motion.div

                  key={metric.label}

                  initial={{ opacity: 0, y: 22 }}

                  whileInView={{ opacity: 1, y: 0 }}

                  viewport={{ once: true }}

                  transition={{ delay: index * 0.06, duration: 0.65 }}

                  className="rounded-2xl border border-white/10 bg-slate-950/42 p-5 shadow-xl shadow-blue-950/15"

                >

                  <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{metric.label}</div>

                  <div className="mt-4 flex items-end justify-between gap-3">

                    <div className="text-4xl font-black tracking-tight text-white">{metric.value}</div>

                    <div className="text-right text-xs font-bold text-cyan-200">{metric.note}</div>

                  </div>

                  <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/10">

                    <motion.div

                      initial={{ width: 0 }}

                      whileInView={{ width: metric.width }}

                      viewport={{ once: true }}

                      transition={{ delay: 0.25 + index * 0.08, duration: 0.85 }}

                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-300"

                    />

                  </div>

                </motion.div>

              ))}

            </div>


            <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">

              <div className="rounded-3xl border border-white/10 bg-slate-950/42 p-5 shadow-xl shadow-blue-950/15">

                <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">

                  <div>

                    <h3 className="text-2xl font-black text-white">Class Performance Comparison</h3>

                    <p className="mt-1 text-sm text-slate-400">Compare academic growth across classes, sections, and exam cycles.</p>

                  </div>

                  <div className="rounded-full bg-cyan-300/10 px-4 py-2 text-xs font-black text-cyan-100">Live Trends</div>

                </div>


                <div className="flex h-72 items-end gap-2 rounded-2xl border border-white/10 bg-white/[0.035] p-4 md:gap-3">

                  {comparisonBars.map((height, index) => (

                    <div key={index} className="flex flex-1 flex-col items-center justify-end gap-2">

                      <motion.div

                        initial={{ height: 0 }}

                        whileInView={{ height: `${height}%` }}

                        viewport={{ once: true }}

                        transition={{ delay: index * 0.035, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}

                        className="w-full rounded-t-xl bg-gradient-to-t from-blue-700 via-blue-500 to-cyan-200 shadow-lg shadow-cyan-500/10"

                      />

                      <div className="hidden text-[10px] font-bold text-slate-500 md:block">{index + 1}</div>

                    </div>

                  ))}

                </div>

              </div>


              <div className="grid gap-4">

                <div className="rounded-3xl border border-white/10 bg-slate-950/42 p-5 shadow-xl shadow-blue-950/15">

                  <div className="mb-5 flex items-center justify-between">

                    <h3 className="text-xl font-black text-white">Teacher Workload</h3>

                    <Users className="h-5 w-5 text-cyan-200" />

                  </div>

                  <div className="space-y-4">

                    {workload.map((item, index) => (

                      <div key={item.label}>

                        <div className="mb-2 flex justify-between text-sm font-bold text-slate-300">

                          <span>{item.label}</span>

                          <span className="text-cyan-200">{item.value}%</span>

                        </div>

                        <div className="h-2.5 overflow-hidden rounded-full bg-white/10">

                          <motion.div

                            initial={{ width: 0 }}

                            whileInView={{ width: `${item.value}%` }}

                            viewport={{ once: true }}

                            transition={{ delay: 0.2 + index * 0.08, duration: 0.75 }}

                            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-300"

                          />

                        </div>

                      </div>

                    ))}

                  </div>

                </div>


                <div className="rounded-3xl border border-white/10 bg-slate-950/42 p-5 shadow-xl shadow-blue-950/15">

                  <div className="mb-5 flex items-center justify-between">

                    <h3 className="text-xl font-black text-white">Smart Insights</h3>

                    <Brain className="h-5 w-5 text-cyan-200" />

                  </div>

                  <div className="space-y-3">

                    {insightRows.map((row, index) => (

                      <motion.div

                        key={row.title}

                        initial={{ opacity: 0, x: 18 }}

                        whileInView={{ opacity: 1, x: 0 }}

                        viewport={{ once: true }}

                        transition={{ delay: 0.2 + index * 0.06, duration: 0.55 }}

                        className="rounded-2xl border border-white/10 bg-white/[0.045] p-4"

                      >

                        <div className="mb-2 inline-flex rounded-full bg-cyan-300/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-100">

                          {row.tag}

                        </div>

                        <div className="text-sm font-bold leading-5 text-slate-200">{row.title}</div>

                      </motion.div>

                    ))}

                  </div>

                </div>

              </div>

            </div>


            <div className="mt-4 grid gap-4 md:grid-cols-3">

              {[

                { label: "Fee Recovery", value: "Rs. 1.8M", icon: CreditCard },

                { label: "Active Students", value: "1,248", icon: GraduationCap },

                { label: "Generated Papers", value: "342", icon: FileText },

              ].map(({ label, value, icon: Icon }, index) => (

                <motion.div

                  key={label}

                  initial={{ opacity: 0, y: 20 }}

                  whileInView={{ opacity: 1, y: 0 }}

                  viewport={{ once: true }}

                  transition={{ delay: index * 0.06, duration: 0.6 }}

                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.045] p-5"

                >

                  <div>

                    <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{label}</div>

                    <div className="mt-2 text-2xl font-black text-white">{value}</div>

                  </div>

                  <div className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.08]">

                    <Icon className="h-6 w-6 text-cyan-200" />

                  </div>

                </motion.div>

              ))}

            </div>

          </div>

        </motion.div>

      </div>

    </section>

  );

}


function BenefitsSection() {

  return (

    <section id="ai-benefits" className="relative scroll-mt-32 px-4 py-24 md:px-8">

      <GlowOrb className="left-[-12%] top-[15%] h-[460px] w-[460px] bg-blue-600/12" />

      <GlowOrb className="right-[-12%] bottom-[8%] h-[460px] w-[460px] bg-cyan-300/10" />


      <div className="mx-auto max-w-7xl">

        <SectionHeader

          eyebrow="AI-Powered Benefits"

          title="Built for Real Schools That Want Smarter Daily Work"

          subtitle="APEX reduces repetitive school work, improves parent communication, helps students prepare better, supports teachers with AI, and gives owners real-time school intelligence."

        />


        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {benefits.map(({ title, detail, icon: Icon }, index) => (

            <motion.div

              key={title}

              variants={fadeUp}

              initial="hidden"

              whileInView="visible"

              viewport={{ once: true, amount: 0.22 }}

              transition={{ delay: index * 0.045, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}

              whileHover={{ y: -6 }}

              className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-white/[0.075] via-white/[0.045] to-cyan-300/[0.025] p-5 shadow-2xl shadow-blue-950/20 backdrop-blur-2xl cinematic-card"

            >

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(34,211,238,0.13),transparent_34%)] opacity-60 transition group-hover:opacity-100" />

              <div className="relative z-10">

                <div className="mb-5 flex items-center justify-between gap-3">

                  <div className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.08] shadow-lg shadow-cyan-500/10">

                    <Icon className="h-6 w-6 text-cyan-200" />

                  </div>

                  <div className="rounded-full border border-cyan-300/15 bg-cyan-300/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100">

                    AI

                  </div>

                </div>


                <h3 className="text-xl font-black tracking-tight text-white">{title}</h3>

                <p className="mt-3 min-h-[52px] text-sm leading-6 text-slate-400">{detail}</p>


                <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/35 p-3">

                  <div className="mb-2 flex items-center justify-between text-[11px] font-bold text-slate-400">

                    <span>Workflow Impact</span>

                    <span className="text-cyan-200">High</span>

                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/10">

                    <motion.div

                      initial={{ width: 0 }}

                      whileInView={{ width: `${78 + index * 2}%` }}

                      viewport={{ once: true }}

                      transition={{ delay: 0.2 + index * 0.04, duration: 0.7 }}

                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-300"

                    />

                  </div>

                </div>

              </div>

            </motion.div>

          ))}

        </div>


        <motion.div

          initial={{ opacity: 0, y: 28 }}

          whileInView={{ opacity: 1, y: 0 }}

          viewport={{ once: true }}

          transition={{ duration: 0.75, delay: 0.18 }}

          className="mt-6 grid gap-5 lg:grid-cols-3"

        >

          {[

            {

              title: "For Teachers",

              text: "Homework, diary, quiz assigning, paper creation, and class work become faster with AI assistance.",

            },

            {

              title: "For Students & Parents",

              text: "Students get AI learning support while parents receive monthly AI reports and clear progress insights.",

            },

            {

              title: "For Owners",

              text: "School owners see AI-powered academic health, fee status, workload, and performance summaries.",

            },

          ].map((item) => (

            <div key={item.title} className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-blue-950/15 backdrop-blur-xl">

              <div className="text-sm font-black uppercase tracking-[0.22em] text-cyan-100/60">{item.title}</div>

              <p className="mt-3 text-sm font-semibold leading-7 text-slate-300">{item.text}</p>

            </div>

          ))}

        </motion.div>

      </div>

    </section>

  );

}


function FinalCTA() {

  return (

    <section id="request-demo" className="relative scroll-mt-32 px-4 py-28 md:px-8">

      <GlowOrb className="left-1/2 top-1/2 h-[580px] w-[580px] -translate-x-1/2 -translate-y-1/2 bg-cyan-300/10" />


      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-blue-600/22 via-white/[0.06] to-cyan-300/12 p-8 text-center shadow-2xl shadow-blue-950/40 backdrop-blur-2xl md:p-16">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.24),transparent_35%),linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:auto,58px_58px,58px_58px]" />


        <div className="relative z-10 mx-auto max-w-5xl">

          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-200/15 bg-cyan-200/[0.06] px-4 py-2 text-sm font-semibold text-cyan-100 backdrop-blur-xl">

            <Sparkles className="h-4 w-4" /> AI-Powered School Operating System

          </div>


          <h2 className="text-4xl font-black leading-tight tracking-[-0.045em] text-white md:text-6xl lg:text-7xl">

            Ready to Run Your School with AI in Every Workflow?

          </h2>


          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-300">

            APEX gives teachers AI Homework, AI Diary, AI Quiz Assign, AI Paper Generator, and Manual Paper Generator - while students get AI Quiz, AI Monitoring, AI Homework Preparation, and parents receive Monthly AI Reports.

          </p>


          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            {[

              "AI for Teachers",

              "AI for Students",

              "AI for Parents",

              "AI for School Owners",

            ].map((item, index) => (

              <motion.div

                key={item}

                initial={{ opacity: 0, y: 18 }}

                whileInView={{ opacity: 1, y: 0 }}

                viewport={{ once: true }}

                transition={{ delay: index * 0.05, duration: 0.6 }}

                className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-sm font-black text-cyan-50 backdrop-blur-xl"

              >

                {item}

              </motion.div>

            ))}

          </div>


          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">

            <a href="/apex/demo-request" className="group inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 px-8 py-4 text-base font-black text-white shadow-2xl shadow-cyan-500/20 transition hover:scale-[1.02]">

              Book Demo <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />

            </a>

            <a href="/apex/register-school" className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.06] px-8 py-4 text-base font-bold text-white backdrop-blur-xl transition hover:bg-white/[0.1]">

              Get Started

            </a>

          </div>


          <div className="mt-8 text-sm font-semibold text-slate-400">

            One platform for academics, exams, homework, diary, quizzes, monitoring, parent reports, fees, and school intelligence.

          </div>

        </div>

      </div>

    </section>

  );

}


function CinematicSectionReveal({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 34, scale: 0.975, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function VerticalStoryProgress() {
  const [activeSection, setActiveSection] = React.useState("hero");

  const chapters = [
    { id: "hero", label: "Hero: Entry into APEX" },
    { id: "story", label: "Story: School Transformation" },
    { id: "module-galaxy", label: "Galaxy: OS Map" },
    { id: "problems", label: "Problems: Manual Pain" },
    { id: "platform", label: "Flow: Departments Connected" },
    { id: "ai-ecosystem", label: "Ecosystem: AI Everywhere" },
    { id: "ai-paper-generator", label: "Exams: Paper Generator" },
    { id: "dashboards", label: "Roles: Command Panels" },
    { id: "analytics", label: "Analytics: School Intelligence" },
    { id: "ai-benefits", label: "Benefits: School Outcomes" },
    { id: "request-demo", label: "Final Mission" },
  ];

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight / 3;
      for (const chapter of chapters) {
        const el = document.getElementById(chapter.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(chapter.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed right-6 top-1/2 z-50 hidden -translate-y-1/2 flex-col items-center gap-3.5 xl:flex">
      <div className="h-16 w-px bg-gradient-to-b from-transparent to-cyan-500/30" />
      {chapters.map((chapter) => {
        const isActive = activeSection === chapter.id;
        return (
          <button
            key={chapter.id}
            onClick={() => {
              const el = document.getElementById(chapter.id);
              if (el) {
                el.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="group relative flex h-4 w-4 items-center justify-center rounded-full focus:outline-none"
            aria-label={`Scroll to ${chapter.label}`}
          >
            {isActive && (
              <motion.span
                layoutId="activeStoryDot"
                className="absolute h-5 w-5 rounded-full border border-cyan-400/40 bg-cyan-400/8"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span
              className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                isActive
                  ? "bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.85)] scale-125"
                  : "bg-slate-600 hover:bg-slate-400 group-hover:scale-110"
              }`}
            />
            <span className="pointer-events-none absolute right-7 origin-right scale-90 rounded-lg border border-white/10 bg-slate-950/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-200/90 opacity-0 shadow-xl transition-all duration-300 backdrop-blur-md group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100 whitespace-nowrap">
              {chapter.label}
            </span>
          </button>
        );
      })}
      <div className="h-16 w-px bg-gradient-to-t from-transparent to-cyan-500/30" />
    </div>
  );
}

export default function ApexPremiumHomepage() {
  return (
    <main id="top" className="apex-page min-h-screen scroll-smooth overflow-x-hidden bg-[#030712] text-white selection:bg-cyan-300 selection:text-slate-950">
      <ApexHoverStyles />

      {/* Global Fixed Universe Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <CinematicBackground />
      </div>

      <Navbar />

      <Hero />

      <CinematicSectionReveal>
        <StorytellingJourneySection />
      </CinematicSectionReveal>

      <CinematicSectionReveal>
        <ModuleGalaxySection />
      </CinematicSectionReveal>

      <CinematicSectionReveal>
        <ApexLiveIntelligence />
      </CinematicSectionReveal>

      <CinematicSectionReveal>
        <ApexEcosystemMockups />
      </CinematicSectionReveal>

      <CinematicSectionReveal>
        <ApexRoleExperience />
      </CinematicSectionReveal>

      <CinematicSectionReveal>
        <ApexBusinessPortalSections />
      </CinematicSectionReveal>

      <CinematicSectionReveal>
        <ProblemSection />
      </CinematicSectionReveal>

      <CinematicSectionReveal>
        <SolutionFlowSection />
      </CinematicSectionReveal>

      <CinematicSectionReveal>
        <AIEcosystemSection />
      </CinematicSectionReveal>

      <CinematicSectionReveal>
        <ApexAIAutomationEngine />
      </CinematicSectionReveal>

      <CinematicSectionReveal>
        <PaperGeneratorSection />
      </CinematicSectionReveal>

      <CinematicSectionReveal>
        <RoleDashboardsSection />
      </CinematicSectionReveal>

      <CinematicSectionReveal>
        <AnalyticsSection />
      </CinematicSectionReveal>

      <CinematicSectionReveal>
        <BenefitsSection />
      </CinematicSectionReveal>

      <CinematicSectionReveal>
        <ApexPricingPlans />
      </CinematicSectionReveal>

      <CinematicSectionReveal>
        <FinalCTA />
      </CinematicSectionReveal>

      {/* Subtle Scroll Storytelling Indicator on desktop */}
      <VerticalStoryProgress />

      {/* Custom pure CSS animations and hover 3D tilt + sweep styles for cinematic holographic cards */}
      <style>{`
        .cinematic-card {
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.5s ease, border-color 0.5s ease;
          position: relative;
          z-index: 10;
        }
        .cinematic-card:hover {
          transform: translateY(-6px) perspective(1000px) rotateX(1.8deg) rotateY(-1.8deg);
          border-color: rgba(34, 211, 238, 0.38) !important;
          box-shadow: 0 20px 45px rgba(8, 47, 73, 0.44), 0 0 35px rgba(34, 211, 238, 0.16) !important;
        }
        .cinematic-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(to bottom right, rgba(255, 255, 255, 0.08), transparent, rgba(34, 211, 238, 0.08));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          opacity: 0.65;
          transition: opacity 0.5s ease, background 0.5s ease;
        }
        .cinematic-card:hover::before {
          opacity: 1;
          background: linear-gradient(to bottom right, rgba(34, 211, 238, 0.45), transparent, rgba(37, 99, 235, 0.45));
        }
        .cinematic-card::after {
          content: "";
          position: absolute;
          top: 0;
          left: -150%;
          width: 50%;
          height: 100%;
          background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.08), transparent);
          transform: skewX(-25deg);
          pointer-events: none;
        }
        .cinematic-card:hover::after {
          animation: lightSweep 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes lightSweep {
          100% {
            left: 200%;
          }
        }
      `}</style>
    </main>
  );
}
