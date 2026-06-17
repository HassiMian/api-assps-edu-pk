"use client";

import { useId, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

const VARIANTS = {
  core: {
    seed: 12,
    baseX: 0.42,
    baseY: 0.38,
    octaves: 5,
    elevation: 58,
    surfaceScale: 7,
    cloudFreq: "0.018 0.014",
    cloudOctaves: 3,
    cloudOpacity: 0.22,
    rotateDur: 140,
  },
  moon: {
    seed: 31,
    baseX: 0.68,
    baseY: 0.52,
    octaves: 5,
    elevation: 52,
    surfaceScale: 6,
    cloudFreq: "0.022 0.018",
    cloudOctaves: 3,
    cloudOpacity: 0.18,
    rotateDur: 110,
  },
};

/**
 * Physically-inspired planet shell — procedural noise, atmosphere, rim light.
 * feTurbulence + feDiffuseLighting + feDisplacementMap (Codrops / Cloud Four patterns).
 */
export default function ApexCelestialSurface({
  className = "",
  variant = "core",
  accent = "#22d3ee",
}) {
  const uid = useId().replace(/:/g, "");
  const reduce = useReducedMotion();
  const cfg = VARIANTS[variant] || VARIANTS.moon;
  const textureId = `apex-tex-${variant}-${uid}`;
  const cloudId = `apex-cloud-${variant}-${uid}`;

  const accentRgb = useMemo(() => {
    const hex = accent.replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16) || 34;
    const g = parseInt(hex.slice(2, 4), 16) || 211;
    const b = parseInt(hex.slice(4, 6), 16) || 238;
    return `${r} ${g} ${b}`;
  }, [accent]);

  return (
    <>
      <svg className="pointer-events-none absolute h-0 w-0" aria-hidden>
        <defs>
          <filter id={textureId} x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={`${cfg.baseX} ${cfg.baseY}`}
              numOctaves={cfg.octaves}
              seed={cfg.seed}
              result="noise"
            />
            <feDiffuseLighting in="noise" lightingColor={accent} surfaceScale={cfg.surfaceScale} result="lit">
              <feDistantLight azimuth="225" elevation={cfg.elevation} />
            </feDiffuseLighting>
            <feColorMatrix
              type="matrix"
              in="lit"
              values="0.35 0 0 0 0.04  0 0.38 0 0 0.06  0 0 0.42 0 0.12  0 0 0 0.92 0"
              result="tinted"
            />
            <feGaussianBlur in="tinted" stdDeviation="0.6" result="soft" />
            <feBlend in="SourceGraphic" in2="soft" mode="multiply" result="blend" />
            <feDisplacementMap
              in="blend"
              in2="noise"
              scale={variant === "core" ? 6 : 4}
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            <feComposite in="displaced" in2="SourceGraphic" operator="in" />
          </filter>

          <filter id={cloudId} x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={cfg.cloudFreq}
              numOctaves={cfg.cloudOctaves}
              seed={cfg.seed + 7}
              result="cloudNoise"
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.35 0"
              in="cloudNoise"
              result="cloudAlpha"
            />
            <feGaussianBlur in="cloudAlpha" stdDeviation="1.2" />
          </filter>
        </defs>
      </svg>

      <div
        className={`apex-celestial-surface absolute inset-0 rounded-full ${className}`}
        style={{
          filter: `url(#${textureId})`,
          "--planet-accent": accent,
          "--planet-accent-rgb": accentRgb,
        }}
      />
      <motion.div
        className="apex-celestial-clouds pointer-events-none absolute inset-0 rounded-full"
        style={{
          "--planet-accent": accent,
          "--planet-accent-rgb": accentRgb,
          filter: `url(#${cloudId})`,
          opacity: cfg.cloudOpacity,
        }}
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: cfg.rotateDur, repeat: Infinity, ease: "linear" }}
      />
      <div className="apex-celestial-terminator pointer-events-none absolute inset-0 rounded-full" />
      <div className="apex-celestial-specular pointer-events-none absolute inset-0 rounded-full" />
      <div
        className="apex-celestial-rimlight pointer-events-none absolute inset-0 rounded-full"
        style={{ "--planet-accent": accent, "--planet-accent-rgb": accentRgb }}
      />
      <div
        className="apex-celestial-atmo-shell pointer-events-none absolute -inset-[6%] rounded-full"
        style={{ "--planet-accent": accent, "--planet-accent-rgb": accentRgb }}
      />
    </>
  );
}
