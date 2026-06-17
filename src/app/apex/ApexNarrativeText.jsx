"use client";

import { motion, useTransform } from "framer-motion";

const ease = [0.22, 1, 0.36, 1];

/**
 * World-emergent narrative copy — text forms from the environment,
 * not from layout blocks. Driven entirely by scroll progress.
 */
export default function ApexNarrativeText({ progress, act, reduce }) {
  const { input, output } = {
    input: [0, act.start, act.start + 0.04, act.end - 0.04, act.end, 1],
    output: [0, 0, 1, 1, 0, 0],
  };

  const opacity = useTransform(progress, input, output);
  const y = useTransform(progress, [act.start, act.start + 0.05, act.end - 0.05, act.end], [28, 0, 0, -20]);
  const blur = useTransform(progress, [act.start, act.start + 0.05, act.end - 0.05, act.end], [12, 0, 0, 8]);
  const scale = useTransform(progress, [act.start, act.start + 0.06], [0.94, 1]);
  const wave = useTransform(progress, [act.start, act.start + 0.03], [0.6, 1]);
  const subtitleOpacity = useTransform(progress, [act.start + 0.05, act.start + 0.09], [0, 1]);
  const lineOpacity = useTransform(progress, [act.start + 0.06, act.start + 0.1], [0, 0.5]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);

  if (reduce) {
    return (
      <div className="pointer-events-none absolute inset-x-0 bottom-[14%] z-30 mx-auto max-w-3xl px-6 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-200/80">
          Act {act.act} · {act.label}
        </p>
        <h2 className="mt-3 text-2xl font-black leading-tight text-white sm:text-4xl">{act.title}</h2>
        <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">{act.subtitle}</p>
      </div>
    );
  }

  return (
    <motion.div
      style={{ opacity, y, scale, filter }}
      className="pointer-events-none absolute inset-x-0 bottom-[12%] z-30 mx-auto max-w-3xl px-6 text-center sm:bottom-[14%]"
    >
      {/* energy wave that carries the headline */}
      <motion.div
        style={{ opacity: wave, scaleX: wave }}
        className="mx-auto mb-5 h-px w-32 origin-center bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent"
      />
      <motion.p
        style={{ opacity: wave }}
        className="text-[10px] font-black uppercase tracking-[0.42em] text-cyan-200/80 sm:text-xs"
      >
        Act {act.act} · {act.label}
      </motion.p>
      <motion.h2
        initial={false}
        className="mt-3 bg-gradient-to-r from-amber-100 via-white to-cyan-100 bg-clip-text text-2xl font-black leading-[1.05] tracking-tight text-transparent sm:text-4xl md:text-5xl"
      >
        {act.title}
      </motion.h2>
      <motion.p
        style={{ opacity: subtitleOpacity }}
        className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300/90 sm:text-base"
      >
        {act.subtitle}
      </motion.p>
      <motion.div
        style={{ opacity: lineOpacity }}
        className="mx-auto mt-6 h-px w-48 bg-gradient-to-r from-transparent via-amber-300/30 to-transparent"
        transition={{ duration: 0.6, ease }}
      />
    </motion.div>
  );
}
