"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Layers3,
  School,
  GraduationCap,
  Smartphone,
  Printer,
  BarChart3,
} from "lucide-react";

export const storyScenes = [
  {
    step: "01",
    title: "Manual Chaos",
    description: "Registers, WhatsApp, manual papers and delayed reports.",
    modules: ["Registers", "WhatsApp", "Manual Papers", "Late Reports"],
    icon: Layers3,
  },
  {
    step: "02",
    title: "Teacher AI",
    description: "AI Homework, AI Diary, AI Quiz Assign and paper generation.",
    modules: ["AI Homework", "AI Diary", "AI Quiz", "Papers"],
    icon: School,
  },
  {
    step: "03",
    title: "Student AI",
    description: "AI Quiz, monitoring, practice and weak-area guidance.",
    modules: ["AI Quiz", "Monitoring", "Practice", "Weak Areas"],
    icon: GraduationCap,
  },
  {
    step: "04",
    title: "Parent Reports",
    description: "Monthly reports, progress, attendance and fee alerts.",
    modules: ["Monthly Reports", "Progress", "Attendance", "Fee Alerts"],
    icon: Smartphone,
  },
  {
    step: "05",
    title: "Exam Studio",
    description: "AI Generator, Manual Builder, Question Bank and Print PDF.",
    modules: ["AI Generator", "Manual Builder", "Question Bank", "Print PDF"],
    icon: Printer,
  },
  {
    step: "06",
    title: "Owner Intelligence",
    description: "Fees, academics, reports and complete school health.",
    modules: ["Fees", "Academics", "Reports", "School Health"],
    icon: BarChart3,
  },
];

export function useActiveStoryScene() {
  const [activeScene, setActiveScene] = useState(0);
  const refs = useRef([]);

  useEffect(() => {
    const observers = refs.current.map((element, index) => {
      if (!element) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveScene(index);
        },
        {
          threshold: 0.45,
          rootMargin: "-15% 0px -25% 0px",
        }
      );

      observer.observe(element);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, []);

  return { activeScene, refs };
}

export function ApexLiveStoryConsole({ activeScene = 0, activeSceneIndex }) {
  const resolvedScene = activeSceneIndex ?? activeScene;
  const scene = storyScenes[resolvedScene] || storyScenes[0];
  const Icon = scene.icon;

  return (
    <div className="sticky top-32 hidden lg:block">
      <motion.div
        key={scene.title}
        initial={{ opacity: 0, y: 24, scale: 0.96, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_40px_120px_rgba(8,47,73,0.35)] backdrop-blur-2xl"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_15%,rgba(34,211,238,0.18),transparent_34%),radial-gradient(circle_at_15%_85%,rgba(37,99,235,0.16),transparent_38%)]" />

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/10 bg-[conic-gradient(from_120deg,transparent,rgba(34,211,238,0.14),transparent,rgba(37,99,235,0.14),transparent)]"
        />

        <div className="relative z-10">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.24em] text-cyan-100/60">
                APEX Live Story Console
              </div>
              <h3 className="mt-2 text-3xl font-black text-white">
                {scene.title}
              </h3>
            </div>

            <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-black text-cyan-100">
              Scene {scene.step}
            </div>
          </div>

          <div className="relative mb-6 grid min-h-[230px] place-items-center rounded-[1.5rem] border border-white/10 bg-slate-950/45">
            <motion.div
              animate={{
                scale: [1, 1.08, 1],
                opacity: [0.45, 0.8, 0.45],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute h-44 w-44 rounded-full bg-cyan-300/10 blur-2xl"
            />

            <motion.div
              animate={{ y: [0, -10, 0], rotateY: [-5, 5, -5] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative grid h-32 w-40 place-items-center rounded-[1.5rem] border border-cyan-300/20 bg-white/[0.08] shadow-[0_0_70px_rgba(34,211,238,0.18)] backdrop-blur-2xl"
            >
              <Icon className="h-12 w-12 text-cyan-100" />
            </motion.div>

            {scene.modules.map((module, index) => {
              const positions = [
                "left-5 top-5",
                "right-5 top-7",
                "left-7 bottom-6",
                "right-7 bottom-7",
              ];

              return (
                <motion.div
                  key={module}
                  animate={{ y: [0, index % 2 === 0 ? -6 : 6, 0] }}
                  transition={{
                    duration: 4 + index,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className={`absolute ${positions[index]} rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-[10px] font-black text-cyan-50 backdrop-blur-xl`}
                >
                  {module}
                </motion.div>
              );
            })}
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
                <div className="mt-1 text-sm font-black text-white">{item}</div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 space-y-2">
            {storyScenes.map((item, index) => (
              <div key={item.title} className="flex items-center gap-3">
                <div
                  className={`h-2 w-2 rounded-full ${
                    index === resolvedScene
                      ? "bg-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.9)]"
                      : "bg-white/20"
                  }`}
                />
                <div
                  className={`text-xs font-bold ${
                    index === resolvedScene ? "text-cyan-100" : "text-slate-500"
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

export function AnimatedApexCore() {
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

export function AnimatedCoreLines() {
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

export function ApexHoverStyles() {
  return (
    <style>{`
      .apex-enhanced-card,
      .apex-page [class*="border-white/10"][class*="bg-white"] {
        position: relative;
        overflow: hidden;
        transform-style: preserve-3d;
        transition:
          transform 420ms cubic-bezier(.22,1,.36,1),
          border-color 420ms cubic-bezier(.22,1,.36,1),
          box-shadow 420ms cubic-bezier(.22,1,.36,1);
      }

      .apex-enhanced-card::before,
      .apex-page [class*="border-white/10"][class*="bg-white"]::before {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        pointer-events: none;
        background: linear-gradient(
          115deg,
          transparent 0%,
          rgba(255,255,255,0.08) 42%,
          rgba(34,211,238,0.10) 50%,
          transparent 60%
        );
        transform: translateX(-130%);
        opacity: 0;
        transition:
          transform 900ms cubic-bezier(.22,1,.36,1),
          opacity 280ms ease;
      }

      .apex-enhanced-card:hover,
      .apex-page [class*="border-white/10"][class*="bg-white"]:hover {
        transform: translateY(-5px) perspective(900px) rotateX(1.2deg) rotateY(-1.2deg);
        border-color: rgba(34, 211, 238, 0.24);
        box-shadow:
          0 28px 90px rgba(8, 47, 73, 0.32),
          0 0 34px rgba(34, 211, 238, 0.08);
      }

      .apex-enhanced-card:hover::before,
      .apex-page [class*="border-white/10"][class*="bg-white"]:hover::before {
        transform: translateX(130%);
        opacity: 1;
      }
    `}</style>
  );
}
