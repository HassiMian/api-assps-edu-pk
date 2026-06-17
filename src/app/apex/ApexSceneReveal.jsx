"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

/**
 * Version E — seamless chapter portal with depth parallax on inner content only.
 */
export default function ApexSceneReveal({ children, chapter = 0, className = "" }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center", "end start"],
  });

  const smooth = useSpring(scrollYProgress, { stiffness: 95, damping: 26, restDelta: 0.001 });
  const stagger = chapter * 0.012;
  const y = useTransform(smooth, [0, 0.26 + stagger, 0.55, 0.9, 1], [48, 16, 0, 0, -28]);
  const scale = useTransform(smooth, [0, 0.28 + stagger, 0.55, 1], [0.96, 0.99, 1, 0.98]);
  const opacity = useTransform(smooth, [0, 0.18 + stagger, 0.38, 0.88, 1], [0.75, 0.92, 1, 1, 0.9]);
  const blur = useTransform(smooth, [0, 0.22 + stagger, 0.45, 0.85, 1], [10, 4, 0, 0, 6]);
  const filter = useTransform(blur, (b) => (b > 0.5 ? `blur(${b}px)` : "none"));

  if (reduce) {
    return <div ref={ref} className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={`apex-scene-reveal ${className}`.trim()}>
      <motion.div
        className="apex-scene-reveal-inner"
        style={{ y, scale, opacity, filter }}
      >
        {children}
      </motion.div>
    </div>
  );
}
