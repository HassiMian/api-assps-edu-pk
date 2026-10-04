"use client";

import { motion, useReducedMotion } from "framer-motion";
import { GraduationCap, Users, UserRound, ShieldCheck } from "lucide-react";
import ApexParticleField from "./ApexParticleField";

const NODES = [
  { icon: GraduationCap, label: "Students", sub: "Learning path", pos: "left-[6%] top-[18%]", from: { x: -1, y: -1 } },
  { icon: Users, label: "Teachers", sub: "Class workflow", pos: "right-[6%] top-[18%]", from: { x: 1, y: -1 } },
  { icon: UserRound, label: "Parents", sub: "Real-time trust", pos: "left-[6%] bottom-[18%]", from: { x: -1, y: 1 } },
  { icon: ShieldCheck, label: "Administration", sub: "Full control", pos: "right-[6%] bottom-[18%]", from: { x: 1, y: 1 } },
];

export default function ApexSceneConnect() {
  const reduce = useReducedMotion();

  return (
    <section
      id="scene-connect"
      className="apex-scene relative flex min-h-[100dvh] scroll-mt-24 items-center overflow-hidden bg-[#04060e] py-24"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.14),transparent_58%)]" />
      <ApexParticleField mode="stream" color="#38bdf8" accent="#c9a84c" density={1.1} />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="mx-auto mb-10 max-w-3xl text-center md:mb-14">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/5 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-100">
            Scene 03 · Connection
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-6xl">
            The whole school connects to the core
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-400 md:text-lg">
            Students, teachers, parents, and administration become live data streams flowing
            into one intelligence layer.
          </p>
        </div>

        <div className="relative mx-auto h-[560px] max-w-4xl sm:h-[480px]">
          {/* connecting streams */}
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 800 480" preserveAspectRatio="xMidYMid meet" aria-hidden>
            <defs>
              <linearGradient id="apexStream" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
                <stop offset="50%" stopColor="#c9a84c" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[
              [110, 110],
              [690, 110],
              [110, 370],
              [690, 370],
            ].map(([x, y], i) => (
              <g key={i}>
                <line x1={x} y1={y} x2="400" y2="240" stroke="url(#apexStream)" strokeWidth="1.6" />
                {!reduce && (
                  <motion.circle
                    r="3.5"
                    fill="#c9a84c"
                    initial={{ cx: x, cy: y, opacity: 0 }}
                    animate={{ cx: [x, 400], cy: [y, 240], opacity: [0, 1, 0] }}
                    transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
                  />
                )}
              </g>
            ))}
          </svg>

          {/* center core */}
          <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
            <motion.div
              animate={
                reduce
                  ? undefined
                  : {
                      scale: [1, 1.06, 1],
                      boxShadow: [
                        "0 0 50px rgba(201,168,76,0.3)",
                        "0 0 90px rgba(34,211,238,0.4)",
                        "0 0 50px rgba(201,168,76,0.3)",
                      ],
                    }
              }
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="flex h-28 w-28 flex-col items-center justify-center rounded-full border border-amber-300/30 bg-gradient-to-br from-slate-900 via-blue-950 to-cyan-950 backdrop-blur-2xl sm:h-32 sm:w-32"
            >
              <img src="/apex-logo.svg" alt="APEX Core" className="h-8 w-auto object-contain" />
              <span className="mt-1 text-[9px] font-black uppercase tracking-[0.3em] text-amber-200/80">Core</span>
            </motion.div>
          </div>

          {/* role nodes */}
          {NODES.map((node, i) => {
            const Icon = node.icon;
            return (
              <motion.div
                key={node.label}
                className={`absolute z-30 w-[150px] ${node.pos}`}
                initial={{ opacity: 0, scale: 0.8, x: node.from.x * 30, y: node.from.y * 30 }}
                whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-center shadow-xl backdrop-blur-xl">
                  <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-200 ring-1 ring-cyan-300/25">
                    <Icon size={20} />
                  </div>
                  <p className="text-sm font-black text-white">{node.label}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">{node.sub}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
