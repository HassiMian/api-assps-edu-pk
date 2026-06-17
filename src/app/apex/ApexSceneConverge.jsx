"use client";

/**
 * Chapter 09 — Final Convergence
 * Version E — cinematic chapter
 */

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { MagneticButton } from "./ApexPremiumUI";
import ApexParticleField from "./ApexParticleField";
import ApexCoreEngine from "./ApexCoreEngine";
import { ApexWorldNode } from "./ApexUniversePrimitives";
import { ORBIT_TIER_BY_RING } from "./apexUniverseDesign";

const MODULES = [
  { name: "Schools", color: "#3b82f6", ring: 0 },
  { name: "Students", color: "#22d3ee", ring: 0 },
  { name: "Teachers", color: "#10b981", ring: 0 },
  { name: "Parents", color: "#8b5cf6", ring: 0 },
  { name: "AI", color: "#f59e0b", ring: 1 },
  { name: "SaaS", color: "#60a5fa", ring: 1 },
  { name: "Super App", color: "#34d399", ring: 1 },
  { name: "Website", color: "#a78bfa", ring: 1 },
  { name: "Attendance", color: "#14b8a6", ring: 2 },
  { name: "Fees", color: "#fbbf24", ring: 2 },
  { name: "Exams", color: "#f43f5e", ring: 2 },
  { name: "Results", color: "#0ea5e9", ring: 2 },
];

const RINGS = [
  { radiusPct: 38, dur: 82, dir: 1, phase: 0 },
  { radiusPct: 46, dur: 102, dir: -1, phase: Math.PI / 8 },
  { radiusPct: 52, dur: 122, dir: 1, phase: Math.PI / 4 },
];

function moduleAngle(ringIndex, indexInRing, countInRing) {
  return -Math.PI / 2 + (indexInRing / countInRing) * Math.PI * 2 + RINGS[ringIndex].phase;
}

function ConvergeNode({ mod, angle, reduce, rotateSecs, ringDir, radiusPct, tier }) {
  const left = 50 + Math.cos(angle) * radiusPct;
  const top = 50 + Math.sin(angle) * radiusPct;

  return (
    <div
      className="absolute"
      style={{ left: `${left}%`, top: `${top}%`, transform: "translate(-50%, -50%)" }}
    >
      <motion.div
        animate={{ rotate: ringDir * -360 }}
        transition={{ duration: rotateSecs, repeat: Infinity, ease: "linear" }}
      >
        <ApexWorldNode name={mod.name} color={mod.color} tier={tier} status="synced" reduce={reduce} />
      </motion.div>
    </div>
  );
}

export default function ApexSceneConverge() {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const pull = useTransform(scrollYProgress, [0.1, 0.55], [0.92, 1]);
  const fade = useTransform(scrollYProgress, [0.08, 0.4], [0, 1]);

  return (
    <section
      id="scene-converge"
      ref={ref}
      className="apex-scene relative flex min-h-[100dvh] scroll-mt-24 items-center overflow-x-clip py-20 pb-28 sm:py-24"
    >
      <ApexParticleField mode="converge" color="#22d3ee" accent="#c9a84c" density={1} />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 text-center sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-100"
        >
          Chapter 09 · Final Convergence
        </motion.div>

        <motion.div
          style={{ scale: reduce ? 1 : pull, opacity: reduce ? 1 : fade }}
          className="relative mx-auto my-6 flex w-full max-w-[min(800px,94vw)] items-center justify-center sm:my-8"
        >
          <div className="apex-converge-stage relative aspect-square w-full">
            {RINGS.map((ring, ri) => (
              <div
                key={ri}
                className="pointer-events-none absolute left-1/2 top-1/2 aspect-square rounded-full border border-white/[0.08]"
                style={{
                  width: `${ring.radiusPct * 2}%`,
                  height: `${ring.radiusPct * 2}%`,
                  transform: "translate(-50%, -50%) scaleY(0.76)",
                  boxShadow: "0 0 40px rgba(34,211,238,0.05)",
                  opacity: 0.7 + ri * 0.08,
                }}
              />
            ))}

            {RINGS.map((ring, ri) => {
              const ringMods = MODULES.filter((m) => m.ring === ri);
              const rotateSecs = reduce ? ring.dur * 2.2 : ring.dur;
              const tier = ORBIT_TIER_BY_RING[ri] || "middle";
              return (
                <motion.div
                  key={`ring-${ri}`}
                  className="absolute inset-0"
                  style={{ zIndex: 10 + ri }}
                  animate={{ rotate: ring.dir * 360 }}
                  transition={{ duration: rotateSecs, repeat: Infinity, ease: "linear" }}
                >
                  {ringMods.map((mod, mi) => (
                    <ConvergeNode
                      key={mod.name}
                      mod={mod}
                      angle={moduleAngle(ri, mi, ringMods.length)}
                      reduce={reduce}
                      rotateSecs={rotateSecs}
                      ringDir={ring.dir}
                      radiusPct={ring.radiusPct}
                      tier={tier}
                    />
                  ))}
                </motion.div>
              );
            })}

            <div className="absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2">
              <ApexCoreEngine
                preset="converge"
                intensity="calm"
                className="h-[min(180px,26vw)] w-[min(180px,26vw)] sm:h-[min(220px,30vw)] sm:w-[min(220px,30vw)]"
              />
            </div>
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-6xl"
        >
          Everything converges into one Core.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-gradient-to-r from-amber-200 via-cyan-200 to-blue-300 bg-clip-text text-xl font-black uppercase tracking-[0.3em] text-transparent sm:text-2xl"
        >
          Learn <span className="text-cyan-300/50">•</span> Grow <span className="text-cyan-300/50">•</span> Lead{" "}
          <span className="text-cyan-300/50">•</span> Transform
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-9 flex justify-center"
        >
          <MagneticButton href="/apex/demo-request" variant="primary">
            Launch Your School Into The Future <ArrowRight className="h-5 w-5" />
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
}
