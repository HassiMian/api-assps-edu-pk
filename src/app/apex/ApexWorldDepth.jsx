"use client";

import { motion, useTransform } from "framer-motion";

/** Always-alive depth layers — parallax rings, energy pulses, ambient drift. */
export default function ApexWorldDepth({ progress, reduce }) {
  const ring1 = useTransform(progress, [0, 1], [0, 120]);
  const ring2 = useTransform(progress, [0, 1], [0, -90]);
  const driftY = useTransform(progress, [0, 0.5, 1], [0, -60, -140]);
  const pulse = useTransform(progress, [0.1, 0.115, 0.23, 0.345], [0, 1, 0.3, 0.8]);
  const pulseOuter = useTransform(pulse, (p) => p * 0.5);

  if (reduce) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* parallax depth rings */}
      <motion.div
        style={{ rotate: ring1, y: driftY }}
        className="absolute left-1/2 top-[42%] h-[95vmin] w-[95vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/[0.04]"
      />
      <motion.div
        style={{ rotate: ring2 }}
        className="absolute left-1/2 top-[42%] h-[68vmin] w-[68vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-300/[0.05]"
      />
      <motion.div
        className="absolute left-1/2 top-[42%] h-[42vmin] w-[42vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.03]"
        animate={{ rotate: 360 }}
        transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
      />

      {/* awakening energy pulse — morphs from chaos to signal */}
      <motion.div
        style={{ opacity: pulse, scale: pulse }}
        className="absolute left-1/2 top-[42%] z-10 h-[30vmin] w-[30vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-300/30"
      />
      <motion.div
        style={{ opacity: pulseOuter }}
        className="absolute left-1/2 top-[42%] z-10 h-[44vmin] w-[44vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/15"
      />

      {/* ambient data filaments */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute h-px w-[28vmin] origin-left bg-gradient-to-r from-transparent via-cyan-300/20 to-transparent"
          style={{
            left: `${18 + i * 18}%`,
            top: `${22 + i * 14}%`,
            rotate: -12 + i * 8,
          }}
          animate={{ opacity: [0.1, 0.45, 0.1], scaleX: [0.6, 1, 0.6] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
        />
      ))}
    </div>
  );
}
