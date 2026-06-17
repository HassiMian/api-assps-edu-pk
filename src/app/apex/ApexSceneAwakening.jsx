"use client";

/**
 * Chapter 02 — APEX Core Awakens
 * Version E — cinematic chapter
 */

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import ApexParticleField from "./ApexParticleField";
import ApexCoreEngine from "./ApexCoreEngine";

export default function ApexSceneAwakening() {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const coreScale = useTransform(scrollYProgress, [0.08, 0.5], [0.82, 1]);
  const coreOpacity = useTransform(scrollYProgress, [0.05, 0.4], [0, 1]);

  return (
    <section
      id="scene-awakening"
      ref={ref}
      className="apex-scene relative flex min-h-[100dvh] scroll-mt-24 flex-col items-center justify-center overflow-x-clip py-24"
    >
      <ApexParticleField mode="converge" color="#22d3ee" accent="#c9a84c" density={1} />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-4 text-center sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/5 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-amber-200"
        >
          Chapter 02 · APEX Core Awakens
        </motion.div>

        <motion.div
          style={{ scale: reduce ? 1 : coreScale, opacity: reduce ? 1 : coreOpacity }}
          className="my-6 flex w-full max-w-[min(640px,92vw)] items-center justify-center sm:my-8"
        >
          <ApexCoreEngine
            preset="awakening"
            className="aspect-square w-full max-w-[min(560px,88vw)]"
          />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-amber-200 via-white to-cyan-200 bg-clip-text text-3xl font-black leading-tight tracking-tight text-transparent sm:text-4xl md:text-6xl"
        >
          From chaos, intelligence awakens.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="mt-5 max-w-2xl text-base leading-8 text-slate-300 md:text-lg"
        >
          APEX Core organizes every school process — registers, sheets, chats and spreadsheets —
          into one connected education operating system.
        </motion.p>
      </div>
    </section>
  );
}
