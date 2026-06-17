"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * ApexMark — the official APEX symbol (white-on-black PNG) rendered as a
 * glowing, transparent mark for the dark universe.
 *
 * The source asset (/apex-symbol.png) has a solid black background. We use
 * `mix-blend-mode: screen` so the black drops out over the dark scenes and
 * only the luminous silver symbol remains — no rectangular seam, no need for
 * a pre-cut transparent PNG. A soft gold/cyan drop-shadow gives it the
 * "living core" energy without replacing the brand with generic art.
 *
 * Props:
 *  - size: px size of the square mark
 *  - glow: "gold" | "cyan" | "soft" | "none"
 *  - pulse: animate the glow breathing (disabled on reduced-motion)
 */
export default function ApexMark({
  size = 64,
  glow = "gold",
  pulse = false,
  className = "",
  style,
}) {
  const reduce = useReducedMotion();

  const glowFilter = {
    gold: "drop-shadow(0 0 10px rgba(201,168,76,0.65)) drop-shadow(0 0 28px rgba(201,168,76,0.35))",
    cyan: "drop-shadow(0 0 10px rgba(34,211,238,0.65)) drop-shadow(0 0 28px rgba(34,211,238,0.3))",
    soft: "drop-shadow(0 0 8px rgba(226,232,240,0.45)) drop-shadow(0 0 22px rgba(34,211,238,0.25))",
    none: "none",
  }[glow] || "none";

  const animate =
    pulse && !reduce
      ? { filter: [glowFilter, glowFilter.replace(/0\.65/g, "0.95"), glowFilter], scale: [1, 1.04, 1] }
      : undefined;

  return (
    <motion.img
      src="/apex-symbol.png"
      alt="APEX"
      draggable={false}
      animate={animate}
      transition={pulse && !reduce ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : undefined}
      className={`pointer-events-none select-none object-contain ${className}`}
      style={{
        width: size,
        height: size,
        mixBlendMode: "screen",
        filter: glowFilter,
        ...style,
      }}
    />
  );
}
