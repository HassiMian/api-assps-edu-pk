"use client";

import { motion, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { MagneticButton } from "./ApexPremiumUI";
import { ACTS } from "./apexUniverseData";

/** World-embedded CTAs — emerge at journey end, not a separate section block. */
export default function ApexConvergeCTA({ progress }) {
  const act = ACTS[ACTS.length - 1];
  const opacity = useTransform(
    progress,
    [act.start, act.start + 0.03, act.end - 0.02, act.end],
    [0, 1, 1, 0]
  );
  const y = useTransform(progress, [act.start, act.start + 0.04], [24, 0]);
  const scale = useTransform(progress, [act.start, act.start + 0.05], [0.92, 1]);

  return (
    <motion.div
      style={{ opacity, y, scale }}
      className="pointer-events-auto absolute inset-x-0 top-[58%] z-35 mx-auto flex max-w-lg flex-col items-center gap-3 px-6 sm:top-[56%]"
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <MagneticButton href="/apex/demo-request" variant="primary">
          Request SaaS Demo <ArrowRight className="h-5 w-5" />
        </MagneticButton>
        <MagneticButton href="#pricing" variant="secondary">
          View Plans
        </MagneticButton>
      </div>
      <p className="text-center text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">
        Enter the operating system
      </p>
    </motion.div>
  );
}
