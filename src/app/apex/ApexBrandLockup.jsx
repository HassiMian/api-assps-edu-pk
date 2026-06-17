"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Header brand — official processed assets from user lockup.
 * Left: apex-symbol.png | Right: apex-wordmark.png (APEX + tagline)
 */
export default function ApexBrandLockup({ onClick, compact = false }) {
  const reduce = useReducedMotion();
  const symbolSize = compact ? 40 : 48;
  const wordH = compact ? 28 : 34;
  const wordW = compact ? 108 : 132;

  return (
    <a
      href="#top"
      onClick={onClick}
      className="apex-brand-lockup group flex min-w-0 items-center gap-2.5 sm:gap-3"
    >
      <motion.div
        className="relative shrink-0"
        animate={reduce ? undefined : { scale: [1, 1.02, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        whileHover={reduce ? undefined : { scale: 1.04 }}
      >
        <Image
          src="/apex-symbol.png"
          alt=""
          width={symbolSize}
          height={symbolSize}
          className="object-contain drop-shadow-[0_4px_24px_rgba(180,200,220,0.35)]"
          style={{ width: symbolSize, height: symbolSize }}
          priority
          draggable={false}
        />
      </motion.div>

      <div className="relative shrink-0" style={{ width: wordW, height: wordH }} aria-hidden>
        <Image
          src="/apex-wordmark.png"
          alt=""
          width={547}
          height={135}
          className="pointer-events-none max-h-full max-w-full select-none object-contain object-left"
          priority
          draggable={false}
        />
      </div>
      <span className="sr-only">APEX Education OS</span>
    </a>
  );
}
