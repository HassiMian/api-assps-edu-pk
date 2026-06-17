"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export default function ApexScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });

  return (
    <motion.div
      className="apex-scroll-glow pointer-events-none fixed left-0 right-0 top-[env(safe-area-inset-top,0px)] z-[60] h-[3px] origin-left bg-gradient-to-r from-amber-300 via-cyan-400 to-blue-500"
      style={{ scaleX }}
      aria-hidden
    />
  );
}
