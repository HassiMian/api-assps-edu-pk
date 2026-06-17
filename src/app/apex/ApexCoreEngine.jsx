"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CORE_PRESETS } from "./apexUniverseDesign";
import { ApexCoreSphere, ApexGlassCapsule } from "./ApexUniversePrimitives";

const DEFAULT_PLANETS = [
  [
    { c: "#3b82f6", s: 11 },
    { c: "#22d3ee", s: 9 },
    { c: "#c9a84c", s: 10 },
  ],
  [
    { c: "#10b981", s: 9 },
    { c: "#8b5cf6", s: 8 },
  ],
  [
    { c: "#f59e0b", s: 8 },
    { c: "#22d3ee", s: 7 },
  ],
];

export default function ApexCoreEngine({
  size,
  waves = true,
  rays = true,
  planets = DEFAULT_PLANETS,
  satellites = null,
  intensity = "full",
  preset = "default",
  className = "",
  style,
}) {
  const reduce = useReducedMotion();
  const wrapRef = useRef(null);
  const [containerPx, setContainerPx] = useState(typeof size === "number" ? size : 420);
  const cfg = CORE_PRESETS[preset] || CORE_PRESETS.default;
  const TILT = cfg.tilt;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof size === "number") return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w > 0) setContainerPx(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [size]);

  const base = typeof size === "number" ? size : containerPx;
  const coreSize = Math.max(64, Math.round(base * cfg.corePct));
  const dims = typeof size === "number" ? { width: size, height: size } : {};
  const ringDur = (d) => (reduce ? d * 2.5 : d * 1.65);

  const onMove = (e) => {
    if (reduce) return;
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--apex-pull-x", `${((e.clientX - r.left) / r.width - 0.5) * 10}px`);
    el.style.setProperty("--apex-pull-y", `${((e.clientY - r.top) / r.height - 0.5) * 10}px`);
  };
  const onLeave = () => {
    const el = wrapRef.current;
    if (el) {
      el.style.setProperty("--apex-pull-x", "0px");
      el.style.setProperty("--apex-pull-y", "0px");
    }
  };

  return (
    <div
      ref={wrapRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`apex-core-engine relative overflow-visible ${className}`}
      style={{ ...dims, ...style, perspective: "1280px" }}
      data-apex-version="E"
      data-apex-preset={preset}
    >
      <div className="apex-core-halo pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[155%] -translate-x-1/2 -translate-y-1/2 rounded-full">
        <motion.div
          className="apex-volumetric-glow absolute inset-0 rounded-full"
          animate={{ opacity: [0.35, 0.82, 0.35], scale: [1, 1.04, 1] }}
          transition={{ duration: reduce ? 10 : 8, repeat: Infinity, ease: "easeInOut" }}
        />
        {rays && !reduce && (
          <motion.div
            className="absolute inset-[6%] rounded-full opacity-35"
            style={{
              background:
                "conic-gradient(from 0deg, transparent, rgba(201,168,76,0.16), transparent 18%, rgba(34,211,238,0.12), transparent 36%, transparent)",
              maskImage: "radial-gradient(circle, transparent 32%, #000 40%, #000 78%, transparent 90%)",
              WebkitMaskImage: "radial-gradient(circle, transparent 32%, #000 40%, #000 78%, transparent 90%)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
          />
        )}
      </div>

      <div
        className="apex-core-stage absolute inset-0"
        style={{
          transform: "translate(var(--apex-pull-x,0px), var(--apex-pull-y,0px))",
          transformStyle: "preserve-3d",
        }}
      >
        {waves && !reduce &&
          [0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2 aspect-square w-[52%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/12"
              animate={{ scale: [0.75, 2.6], opacity: [0.22, 0] }}
              transition={{ duration: 6.5, repeat: Infinity, ease: "easeOut", delay: i * 2.2 }}
            />
          ))}

        <div
          className="apex-core-tilt absolute left-1/2 top-1/2 aspect-square w-[100%]"
          style={{
            transformStyle: "preserve-3d",
            transform: `translate(-50%, -50%) rotateX(${TILT}deg)`,
          }}
        >
          {cfg.orbits.map((orbit, oi) => {
            const orbitPlanets = planets[oi] || [];
            const ringSatellites = satellites?.filter((s) => s.orbit === oi) || [];
            return (
              <motion.div
                key={oi}
                className="absolute rounded-full"
                style={{
                  inset: orbit.inset,
                  border: `1px solid ${orbit.color}`,
                  transformStyle: "preserve-3d",
                  transform: `scaleY(${orbit.ellipse ?? 0.72})`,
                  boxShadow: `0 0 32px ${orbit.color}`,
                  filter: `drop-shadow(0 0 12px ${orbit.color})`,
                  zIndex: orbit.z,
                }}
                animate={{ rotateZ: orbit.dir * 360 }}
                transition={{ duration: ringDur(orbit.dur), repeat: Infinity, ease: "linear" }}
              >
                {orbitPlanets.map((p, pi) => {
                  const angle = (pi / Math.max(1, orbitPlanets.length)) * Math.PI * 2 + oi * 0.55;
                  const left = 50 + Math.cos(angle) * 50;
                  const top = 50 + Math.sin(angle) * 50;
                  return (
                    <span
                      key={pi}
                      className="apex-mini-moon absolute -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full"
                      style={{
                        left: `${left}%`,
                        top: `${top}%`,
                        width: p.s,
                        height: p.s,
                        "--moon-color": p.c,
                      }}
                    />
                  );
                })}

                {ringSatellites.map((sat, si) => {
                  const Icon = sat.icon;
                  const angle = sat.angle ?? si * 1.4;
                  const left = 50 + Math.cos(angle) * 50;
                  const top = 50 + Math.sin(angle) * 50;
                  return (
                    <div
                      key={sat.label}
                      className="absolute"
                      style={{ left: `${left}%`, top: `${top}%`, transform: "translate(-50%, -50%)" }}
                    >
                      <motion.div
                        animate={{ rotate: orbit.dir * -360 }}
                        transition={{ duration: ringDur(orbit.dur), repeat: Infinity, ease: "linear" }}
                      >
                        <ApexGlassCapsule
                          icon={Icon}
                          label={sat.label}
                          value={sat.value}
                          color={sat.color}
                          reduce={reduce}
                        />
                      </motion.div>
                    </div>
                  );
                })}
              </motion.div>
            );
          })}

          <div
            className="absolute left-1/2 top-1/2 z-30"
            style={{
              transform: `translate(-50%, -50%) rotateX(${-TILT}deg) translateZ(24px)`,
              transformStyle: "preserve-3d",
            }}
          >
            <ApexCoreSphere
              size={coreSize}
              logoFill={cfg.logoFill}
              intensity={intensity}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
