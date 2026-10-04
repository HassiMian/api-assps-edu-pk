"use client";

import { motion, useTransform } from "framer-motion";
import { ACTS } from "./apexUniverseData";

export default function ApexJourneyRail({ progress, currentActId }) {
  const fillHeight = useTransform(progress, [0, 1], ["0%", "100%"]);

  return (
    <div
      className="apex-journey-rail pointer-events-none fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-2 sm:flex md:right-5"
      aria-hidden
    >
      <span className="mb-1 font-mono text-[8px] uppercase tracking-[0.35em] text-slate-600 [writing-mode:vertical-lr]">
        Journey
      </span>
      <div className="relative h-48 w-px overflow-hidden rounded-full bg-white/10 md:h-56">
        <motion.div
          className="absolute inset-x-0 top-0 bg-gradient-to-b from-amber-300 via-cyan-400 to-blue-500"
          style={{ height: fillHeight }}
        />
      </div>
      <div className="mt-1 flex flex-col gap-1.5">
        {ACTS.map((act) => {
          const active = act.id === currentActId;
          return (
            <span
              key={act.id}
              className={`h-1.5 w-1.5 rounded-full transition-all duration-500 ${
                active ? "scale-150 bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.8)]" : "bg-white/20"
              }`}
            />
          );
        })}
      </div>
      <span className="mt-1 font-mono text-[9px] tabular-nums text-cyan-200/50">
        {ACTS.find((a) => a.id === currentActId)?.act || "01"}
      </span>
    </div>
  );
}
