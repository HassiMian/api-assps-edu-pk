"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Wordmark matching attached APEX logo — chevron Λ + PEX, wide tracking. */
export default function ApexBrandWordmark({ size = "md", className = "" }) {
  const reduce = useReducedMotion();
  const sizes = {
    sm: "text-lg tracking-[0.32em]",
    md: "text-xl tracking-[0.34em] sm:text-2xl md:text-[1.65rem]",
    lg: "text-3xl tracking-[0.36em] sm:text-4xl",
  };

  return (
    <motion.span
      className={`apex-brand-wordmark inline-flex items-baseline font-black text-white ${sizes[size] || sizes.md} ${className}`}
      animate={
        reduce
          ? undefined
          : {
              textShadow: [
                "0 0 18px rgba(201,168,76,0.25)",
                "0 0 36px rgba(34,211,238,0.4)",
                "0 0 18px rgba(201,168,76,0.25)",
              ],
            }
      }
      transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      aria-label="APEX"
    >
      <span
        className="apex-brand-chevron mr-[0.08em] bg-gradient-to-b from-white via-slate-100 to-slate-300 bg-clip-text text-transparent"
        style={{ fontSize: "1.12em", lineHeight: 1 }}
      >
        Λ
      </span>
      <span className="bg-gradient-to-r from-slate-100 via-white to-slate-200 bg-clip-text text-transparent">PEX</span>
    </motion.span>
  );
}
