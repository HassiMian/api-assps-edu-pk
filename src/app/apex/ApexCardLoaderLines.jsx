"use client";

import { motion, useReducedMotion } from "framer-motion";

const DEFAULT_WIDTHS = [78, 64, 88];

export default function ApexCardLoaderLines({ widths = DEFAULT_WIDTHS, className = "", loop = true }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className={`space-y-2.5 ${className}`} aria-hidden>
        {widths.map((w, i) => (
          <div key={i} className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-300" style={{ width: `${w}%` }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-2.5 ${className}`} aria-hidden>
      {widths.map((target, lineIndex) => {
        const low = Math.max(18, target - 30);
        const high = Math.min(96, target + 10);
        return (
          <div key={lineIndex} className="h-2 overflow-hidden rounded-full bg-white/10">
            {loop ? (
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 to-cyan-300"
                animate={{ width: [`${low}%`, `${target}%`, `${high}%`, `${target - 8}%`] }}
                transition={{
                  duration: 2.6,
                  repeat: Infinity,
                  repeatType: "mirror",
                  delay: lineIndex * 0.2,
                  ease: "easeInOut",
                }}
              />
            ) : (
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-300"
                initial={{ width: 0 }}
                whileInView={{ width: `${target}%` }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: 0.25 + lineIndex * 0.08, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
