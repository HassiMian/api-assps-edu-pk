/**
 * APEX Visual Universe — Version E (Unified Navy + Celestial Realism)
 * Uses official processed PNGs: symbol, wordmark, brand-lockup (cores).
 */

export const APEX_VISUAL_VERSION = "E";
export const APEX_OFFICIAL_LOGO = "/apex-brand-lockup.png";
/** Logo occupies 60–75% of visible core diameter */
export const APEX_LOGO_CORE_FILL = 0.68;

/** Smaller core body, much larger orbit rings — star-system proportions */
export const CORE_PRESETS = {
  hero: {
    corePct: 0.17,
    logoFill: 0.7,
    tilt: 56,
    orbits: [
      { inset: "0%", dur: 62, dir: 1, color: "rgba(34,211,238,0.26)", z: 14, ellipse: 0.7 },
      { inset: "4%", dur: 50, dir: -1, color: "rgba(201,168,76,0.3)", z: 10, ellipse: 0.74 },
      { inset: "8%", dur: 70, dir: 1, color: "rgba(59,130,246,0.22)", z: 6, ellipse: 0.78 },
    ],
  },
  awakening: {
    corePct: 0.16,
    logoFill: 0.72,
    tilt: 58,
    orbits: [
      { inset: "0%", dur: 66, dir: 1, color: "rgba(34,211,238,0.28)", z: 14, ellipse: 0.68 },
      { inset: "3%", dur: 54, dir: -1, color: "rgba(201,168,76,0.32)", z: 10, ellipse: 0.72 },
      { inset: "7%", dur: 72, dir: 1, color: "rgba(59,130,246,0.24)", z: 6, ellipse: 0.76 },
    ],
  },
  converge: {
    corePct: 0.15,
    logoFill: 0.68,
    tilt: 54,
    orbits: [
      { inset: "1%", dur: 74, dir: 1, color: "rgba(34,211,238,0.2)", z: 12, ellipse: 0.72 },
      { inset: "5%", dur: 58, dir: -1, color: "rgba(201,168,76,0.26)", z: 8, ellipse: 0.76 },
      { inset: "9%", dur: 86, dir: 1, color: "rgba(59,130,246,0.18)", z: 4, ellipse: 0.8 },
    ],
  },
  galaxy: {
    corePct: 0.18,
    logoFill: 0.74,
    tilt: 0,
    orbits: [],
  },
  default: {
    corePct: 0.17,
    logoFill: 0.7,
    tilt: 56,
    orbits: [
      { inset: "0%", dur: 56, dir: 1, color: "rgba(34,211,238,0.28)", z: 12, ellipse: 0.72 },
      { inset: "4%", dur: 46, dir: -1, color: "rgba(201,168,76,0.32)", z: 8, ellipse: 0.76 },
      { inset: "8%", dur: 64, dir: 1, color: "rgba(59,130,246,0.24)", z: 4, ellipse: 0.8 },
    ],
  },
};

export const ORBIT_NODE_TIERS = {
  inner: { planet: 76, halo: 36, labelSize: "0.75rem", opacity: 1, depthBlur: 0 },
  middle: { planet: 84, halo: 38, labelSize: "0.8125rem", opacity: 0.96, depthBlur: 0 },
  outer: { planet: 68, halo: 32, labelSize: "0.75rem", opacity: 0.82, depthBlur: 1.2 },
};

export const ORBIT_TIER_BY_RING = ["inner", "middle", "outer"];
