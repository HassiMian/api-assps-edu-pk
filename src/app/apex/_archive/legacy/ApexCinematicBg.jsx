"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Lightweight fixed background — GPU-friendly, no WebGL */
export default function ApexCinematicBg() {
  const reduce = useReducedMotion();

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[#030712]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(59,130,246,0.22),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_90%_60%,rgba(34,211,238,0.08),transparent_50%)]" />
      {!reduce && (
        <>
          <motion.div
            className="absolute -left-[20%] top-[10%] h-[55vh] w-[55vh] rounded-full bg-blue-600/12 blur-[100px]"
            animate={{ x: [0, 40, 0], y: [0, 24, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -right-[15%] top-[35%] h-[45vh] w-[45vh] rounded-full bg-cyan-400/10 blur-[90px]"
            animate={{ x: [0, -32, 0], y: [0, -20, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
          <div
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)",
              backgroundSize: "64px 64px",
            }}
          />
          <motion.div
            className="absolute left-1/2 top-0 h-[120vh] w-[2px] -translate-x-1/2 bg-gradient-to-b from-cyan-300/0 via-cyan-300/25 to-transparent"
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}
    </div>
  );
}
