"use client";

import { motion, useTransform } from "framer-motion";
import { actMorphKeyframes } from "./apexUniverseData";

/** Physical morph layer — opacity + translate + scale + rotate, never a hard section cut. */
export default function ApexMorphActLayer({ progress, act, children, className = "", morph }) {
  const kf = actMorphKeyframes(act, morph);
  const opacity = useTransform(progress, kf.opacity.input, kf.opacity.output);
  const y = useTransform(progress, kf.y.input, kf.y.output);
  const scale = useTransform(progress, kf.scale.input, kf.scale.output);
  const rotateZ = useTransform(progress, kf.rotateZ.input, kf.rotateZ.output);

  return (
    <motion.div
      style={{ opacity, y, scale, rotateZ }}
      className={`absolute inset-0 will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  );
}
