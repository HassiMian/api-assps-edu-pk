"use client";

import { motion, useReducedMotion } from "framer-motion";
import ApexOfficialLogo from "./ApexOfficialLogo";
import ApexCelestialSurface from "./ApexCelestialSurface";
import { APEX_LOGO_CORE_FILL } from "./apexUniverseDesign";

/** Celestial core — realistic planet + official logo (60–75% fill) */
export function ApexCoreSphere({
  size = 120,
  logoFill = APEX_LOGO_CORE_FILL,
  intensity = "full",
  className = "",
}) {
  const reduce = useReducedMotion();
  const pulse = intensity === "calm" ? [1, 1.02, 1] : [1, 1.035, 1];

  return (
    <div className={`apex-celestial-core relative ${className}`} style={{ width: size, height: size }}>
      <motion.div
        className="apex-celestial-corona pointer-events-none absolute -inset-[36%] rounded-full"
        animate={reduce ? undefined : { opacity: [0.35, 0.72, 0.35], scale: [0.94, 1.08, 0.94] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="apex-celestial-atmosphere pointer-events-none absolute -inset-[14%] rounded-full"
        animate={reduce ? undefined : { opacity: [0.45, 0.85, 0.45] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="apex-celestial-body relative flex h-full w-full items-center justify-center overflow-hidden rounded-full"
        animate={reduce ? undefined : { scale: pulse }}
        transition={{ duration: reduce ? 8 : 6.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <ApexCelestialSurface variant="core" accent="#c9a84c" />
        <div className="relative z-10 flex h-full w-full items-center justify-center">
          <ApexOfficialLogo coreFill={logoFill} size={size} priority />
        </div>
      </motion.div>
    </div>
  );
}

/** Hero live-stat glass capsule */
export function ApexGlassCapsule({ icon: Icon, label, value, color, reduce }) {
  return (
    <motion.div
      className="apex-glass-capsule"
      style={{ "--capsule-accent": color }}
      animate={reduce ? undefined : { y: [0, -5, 0] }}
      transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="apex-glass-capsule-icon" style={{ color }}>
        <Icon className="h-4 w-4" strokeWidth={2.25} />
      </div>
      <div className="apex-glass-capsule-body">
        <span className="apex-glass-capsule-label">{label}</span>
        <span className="apex-glass-capsule-value">{value}</span>
      </div>
    </motion.div>
  );
}

/** Premium orbiting world */
export function ApexWorldNode({
  name,
  color,
  icon: Icon = null,
  status = "live",
  tier = "middle",
  reduce,
}) {
  const sizes = {
    inner: { planet: 92, halo: 42, labelSize: "0.8125rem", opacity: 1, depthBlur: 0 },
    middle: { planet: 100, halo: 44, labelSize: "0.875rem", opacity: 0.96, depthBlur: 0 },
    outer: { planet: 84, halo: 38, labelSize: "0.75rem", opacity: 0.84, depthBlur: 1 },
  };
  const t = sizes[tier] || sizes.middle;

  return (
    <motion.div
      className="apex-world-node flex flex-col items-center"
      style={{ opacity: t.opacity, filter: t.depthBlur ? `blur(${t.depthBlur}px)` : undefined }}
      animate={reduce ? undefined : { y: [0, tier === "outer" ? -5 : -8, 0] }}
      transition={{ duration: 5.5 + (tier === "outer" ? 1 : 0), repeat: Infinity, ease: "easeInOut" }}
      whileHover={reduce ? undefined : { scale: 1.05 }}
    >
      {Icon && (
        <div
          className="apex-world-node-halo mb-2 flex items-center justify-center rounded-full"
          style={{ width: t.halo, height: t.halo, color, "--node-color": color }}
        >
          <Icon size={Math.round(t.halo * 0.48)} strokeWidth={2.25} />
        </div>
      )}
      <div
        className="apex-world-node-planet relative overflow-hidden rounded-full"
        style={{ width: t.planet, height: t.planet, "--node-color": color }}
      >
        <ApexCelestialSurface variant="moon" accent={color} />
        <div className="apex-world-planet-glow pointer-events-none absolute inset-0 rounded-full" />
      </div>
      <p
        className="apex-world-node-name mt-3 max-w-[6.5rem] text-center font-extrabold leading-tight text-slate-50"
        style={{ fontSize: t.labelSize }}
      >
        {name}
      </p>
      <span className="apex-world-node-status mt-1">{status}</span>
    </motion.div>
  );
}

export function ApexOrbitModuleNode(props) {
  return <ApexWorldNode {...props} />;
}
