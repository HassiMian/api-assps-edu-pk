import { UNIVERSE_SCROLL_VH } from "./apexUniverseData";

/** Desktop camera path — full cinematic travel */
export const DESKTOP_CAMERA = {
  scrollVh: UNIVERSE_SCROLL_VH,
  y: [0, 0.115, 0.23, 0.345, 0.46, 0.575, 0.69, 0.805, 0.92, 1],
  yValues: [0, -24, -58, -95, -130, -165, -195, -230, -260, -285],
  scale: [0, 0.115, 0.23, 0.345, 0.46, 0.575, 0.69, 0.805, 0.92, 1],
  scaleValues: [1.2, 1.04, 0.88, 1.42, 1.18, 1.02, 0.84, 0.6, 0.5, 0.44],
  rotateZ: [0, 0.23, 0.345, 0.46, 0.805],
  rotateZValues: [0, -2, 4, -3, 0],
  rotateX: [0.2, 0.345, 0.46, 0.575],
  rotateXValues: [0, 10, 4, 0],
  x: [0.46, 0.575, 0.69],
  xValues: [0, 12, -8],
  coreScale: [0, 0.06, 0.115, 0.23, 0.345, 0.46, 0.69, 0.805, 0.92, 1],
  coreScaleValues: [0.06, 0.1, 0.38, 0.82, 1.15, 1.0, 0.72, 0.52, 0.44, 0.4],
};

/** Mobile — shorter journey, tighter framing, less parallax */
export const MOBILE_CAMERA = {
  scrollVh: 680,
  y: [0, 0.115, 0.23, 0.46, 0.69, 0.805, 0.92, 1],
  yValues: [0, -16, -40, -85, -130, -170, -200, -220],
  scale: [0, 0.115, 0.345, 0.575, 0.805, 0.92, 1],
  scaleValues: [1.08, 1.0, 1.2, 1.0, 0.72, 0.58, 0.52],
  rotateZ: [0, 0.345, 0.805],
  rotateZValues: [0, 2, 0],
  rotateX: [0.23, 0.345],
  rotateXValues: [0, 5],
  x: [0.46, 0.69],
  xValues: [0, -6],
  coreScale: [0, 0.115, 0.345, 0.69, 0.805, 0.92, 1],
  coreScaleValues: [0.12, 0.42, 1.0, 0.78, 0.55, 0.48, 0.44],
};

export function getCameraProfile() {
  if (typeof window === "undefined") return DESKTOP_CAMERA;
  return window.matchMedia("(max-width: 768px)").matches ? MOBILE_CAMERA : DESKTOP_CAMERA;
}
