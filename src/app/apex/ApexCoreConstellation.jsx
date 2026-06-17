"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import {
  ClipboardCheck,
  Users,
  CalendarCheck,
  CreditCard,
  FileCheck,
  Trophy,
  UserCog,
  Wallet,
} from "lucide-react";
import ApexParticleField from "./ApexParticleField";
import { ApexCoreSphere, ApexWorldNode } from "./ApexUniversePrimitives";

const MODULES = [
  { icon: ClipboardCheck, name: "Admissions", color: "#3b82f6" },
  { icon: Users, name: "Students", color: "#22d3ee" },
  { icon: CalendarCheck, name: "Attendance", color: "#10b981" },
  { icon: CreditCard, name: "Fees", color: "#f59e0b" },
  { icon: FileCheck, name: "Exams", color: "#8b5cf6" },
  { icon: Trophy, name: "Results", color: "#f43f5e" },
  { icon: UserCog, name: "HR", color: "#0ea5e9" },
  { icon: Wallet, name: "Payroll", color: "#14b8a6" },
];

const ROTATE_SECONDS = 84;

function buildPoints(box) {
  const center = box / 2;
  return MODULES.map((mod, i) => {
    const angle = (i / MODULES.length) * Math.PI * 2 - Math.PI / 2;
    const radius = i % 2 === 0 ? box * 0.36 : box * 0.42;
    const mx = center + Math.cos(angle) * radius;
    const my = center + Math.sin(angle) * radius;
    const ctrlAngle = angle + (i % 2 === 0 ? 0.48 : -0.48);
    const ctrlR = radius * 0.42;
    const cx = center + Math.cos(ctrlAngle) * ctrlR;
    const cy = center + Math.sin(ctrlAngle) * ctrlR;
    const forkX = center + (mx - center) * 0.58 + Math.sin(angle * 2) * 12;
    const forkY = center + (my - center) * 0.58 + Math.cos(angle * 2) * 10;
    return { ...mod, mx, my, cx, cy, forkX, forkY, center };
  });
}

function branchPath(p) {
  return `M${p.center},${p.center} Q${p.cx},${p.cy} ${p.forkX},${p.forkY} T${p.mx},${p.my}`;
}

export default function ApexCoreConstellation() {
  const reduce = useReducedMotion();
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.9", "center 0.35"],
  });
  const grow = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const constellationScale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const rotateSecs = reduce ? ROTATE_SECONDS * 2.2 : ROTATE_SECONDS;
  const BOX = 780;
  const POINTS = buildPoints(BOX);

  return (
    <section
      id="scene-os"
      ref={sectionRef}
      className="apex-scene relative min-h-[100dvh] scroll-mt-24 overflow-x-clip py-20 pb-36 text-white sm:py-24 sm:pb-44"
    >
      <ApexParticleField mode="drift" color="#3b82f6" accent="#22d3ee" density={0.65} />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-8 max-w-3xl text-center md:mb-12"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-300/5 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-blue-100">
            Chapter 03 · APEX OS
          </div>
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl md:text-6xl">
            One core. Branches of intelligence.
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-400 md:text-lg">
            Watch the APEX Core extend living branches — every school operation attaches and
            floats around one connected center.
          </p>
        </motion.div>

        <motion.div
          style={{ scale: reduce ? 1 : constellationScale }}
          className="relative mx-auto hidden w-full max-w-[780px] lg:block"
        >
          <div className="relative mx-auto aspect-square w-full">
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{ duration: rotateSecs, repeat: Infinity, ease: "linear" }}
            >
              <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${BOX} ${BOX}`} aria-hidden>
                <defs>
                  {POINTS.map((p, i) => (
                    <linearGradient key={i} id={`branch-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#c9a84c" stopOpacity="0.95" />
                      <stop offset="45%" stopColor={p.color} stopOpacity="0.75" />
                      <stop offset="100%" stopColor={p.color} stopOpacity="0.08" />
                    </linearGradient>
                  ))}
                </defs>
                {POINTS.map((p, i) => (
                  <motion.path
                    key={`branch-${i}`}
                    d={branchPath(p)}
                    fill="none"
                    stroke={`url(#branch-${i})`}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    style={{ pathLength: reduce ? 1 : grow }}
                  />
                ))}
                {!reduce &&
                  POINTS.map((p, i) => (
                    <motion.circle
                      key={`pulse-${i}`}
                      r="4"
                      fill={p.color}
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 3, repeat: Infinity, delay: i * 0.28, ease: "easeInOut" }}
                    >
                      <animateMotion
                        dur={`${3 + i * 0.15}s`}
                        repeatCount="indefinite"
                        path={branchPath(p)}
                      />
                    </motion.circle>
                  ))}
              </svg>

              {POINTS.map((p, i) => (
                <div
                  key={p.name}
                  className="absolute"
                  style={{
                    left: `${(p.mx / BOX) * 100}%`,
                    top: `${(p.my / BOX) * 100}%`,
                    transform: "translate(-50%, -50%)",
                    zIndex: 12,
                  }}
                >
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: rotateSecs, repeat: Infinity, ease: "linear" }}
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.6 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.05, duration: 0.55 }}
                    >
                      <ApexWorldNode
                        name={p.name}
                        color={p.color}
                        icon={p.icon}
                        status="live"
                        tier={i % 2 === 0 ? "middle" : "inner"}
                        reduce={reduce}
                      />
                    </motion.div>
                  </motion.div>
                </div>
              ))}
            </motion.div>

            <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
              <ApexCoreSphere size={240} logoFill={0.72} intensity="full" />
            </div>
          </div>
        </motion.div>

        <div className="lg:hidden">
          <div className="mx-auto mb-8 w-fit">
            <ApexCoreSphere size={200} logoFill={0.7} intensity="full" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {MODULES.map((mod, i) => (
              <motion.div
                key={mod.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.04 }}
              >
                <ApexWorldNode
                  name={mod.name}
                  color={mod.color}
                  icon={mod.icon}
                  status="live"
                  tier="inner"
                  reduce={reduce}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
