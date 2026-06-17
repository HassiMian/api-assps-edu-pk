"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * ApexSymbol — transparent luminance-masked APEX mark.
 * variant: default | hero (intro) | core (engine) | header (nav)
 */
const MASK = "url(/apex-symbol.png)";

const maskStyle = {
  WebkitMaskImage: MASK,
  maskImage: MASK,
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskPosition: "center",
  maskPosition: "center",
  WebkitMaskSize: "contain",
  maskSize: "contain",
  WebkitMaskMode: "luminance",
  maskMode: "luminance",
};

const METALS = {
  platinum:
    "linear-gradient(155deg,#ffffff 0%,#f0f4fa 18%,#c8d2e0 42%,#8a96a8 68%,#d4dce8 88%,#ffffff 100%)",
  gold: "linear-gradient(155deg,#fff7e0 0%,#f3e7c4 26%,#d8b765 56%,#a9842f 82%,#efe2b8 100%)",
  ice: "linear-gradient(155deg,#ffffff 0%,#dcfaff 30%,#8fd6ea 62%,#4aa6c4 86%,#e6fbff 100%)",
};

export default function ApexSymbol({
  size = 96,
  tone = "platinum",
  glow = "rgba(201,168,76,0.55)",
  shimmer = true,
  variant = "default",
  className = "",
  style,
}) {
  const reduce = useReducedMotion();
  const metal = METALS[tone] || METALS.platinum;

  const isHero = variant === "hero";
  const isCore = variant === "core";
  const isHeader = variant === "header";

  const glowFilter = isHero
    ? `drop-shadow(0 0 28px ${glow}) drop-shadow(0 0 60px rgba(34,211,238,0.35)) drop-shadow(0 4px 12px rgba(0,0,0,0.5))`
    : isCore
    ? `drop-shadow(0 0 18px ${glow}) drop-shadow(0 0 36px rgba(34,211,238,0.25)) drop-shadow(0 2px 8px rgba(0,0,0,0.4))`
    : `drop-shadow(0 0 12px ${glow}) drop-shadow(0 1px 2px rgba(0,0,0,0.45))`;

  const shimmerDur = isHero ? 3.2 : isCore ? 5 : 4.5;
  const tilt = isHero && !reduce;

  return (
    <motion.div
      className={`apex-symbol relative ${className}`}
      style={{
        width: size,
        height: size,
        perspective: isHero || isCore ? 900 : 600,
        ...style,
      }}
      aria-label="APEX"
      role="img"
      animate={
        tilt
          ? { rotateY: [-6, 6, -6], rotateX: [3, -2, 3] }
          : isCore && !reduce
          ? { rotateY: [-3, 3, -3] }
          : undefined
      }
      transition={{
        duration: isHero ? 6 : 9,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {/* ambient halo — fully transparent outside mark */}
      {(isHero || isCore) && !reduce && (
        <motion.div
          className="pointer-events-none absolute -inset-[30%] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(201,168,76,0.15), rgba(34,211,238,0.08) 40%, transparent 70%)",
            filter: "blur(20px)",
          }}
          animate={{ opacity: [0.4, 0.85, 0.4], scale: [0.95, 1.08, 0.95] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* base metal */}
      <div
        className="absolute inset-0"
        style={{ ...maskStyle, background: metal, filter: glowFilter }}
      />

      {/* depth rim */}
      <div
        className="absolute inset-0"
        style={{
          ...maskStyle,
          background: "linear-gradient(155deg, transparent 40%, rgba(201,168,76,0.85) 100%)",
          mixBlendMode: "screen",
          opacity: isHeader ? 0.45 : 0.65,
        }}
      />

      {/* specular highlight */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          ...maskStyle,
          background: "linear-gradient(200deg, rgba(255,255,255,0.9) 0%, transparent 35%)",
          mixBlendMode: "overlay",
        }}
      />

      {/* primary shine sweep */}
      {shimmer && !reduce && (
        <motion.div
          className="absolute inset-0"
          style={{
            ...maskStyle,
            background:
              "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.95) 50%, transparent 70%)",
            backgroundSize: "280% 100%",
            mixBlendMode: "screen",
          }}
          animate={{ backgroundPosition: ["150% 0%", "-50% 0%"] }}
          transition={{
            duration: shimmerDur,
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: isHero ? 0.8 : 1.6,
          }}
        />
      )}

      {/* secondary micro-shine (hero/core only) */}
      {(isHero || isCore) && shimmer && !reduce && (
        <motion.div
          className="absolute inset-0 opacity-70"
          style={{
            ...maskStyle,
            background:
              "linear-gradient(75deg, transparent 55%, rgba(255,255,255,0.6) 62%, transparent 68%)",
            backgroundSize: "200% 200%",
            mixBlendMode: "screen",
          }}
          animate={{ backgroundPosition: ["0% 100%", "100% 0%"] }}
          transition={{ duration: shimmerDur * 1.4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      )}
    </motion.div>
  );
}
