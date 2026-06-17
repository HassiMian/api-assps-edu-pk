"use client";

import { useEffect, useRef } from "react";
import { ACTS } from "./apexUniverseData";

const SNAP_THRESHOLD = 0.055;
const SNAP_DEBOUNCE_MS = 140;

/**
 * Lenis smooth scroll + gentle chapter snap at act boundaries.
 * Desktop only — mobile keeps free scroll for natural touch feel.
 */
export function useApexLenis(enabled) {
  const lenisRef = useRef(null);
  const snapTimerRef = useRef(null);
  const snappingRef = useRef(false);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    let lenis;
    let raf;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const snapEnabled = !isMobile && !prefersReduced;

    const snapToAct = () => {
      if (!snapEnabled || snappingRef.current) return;
      const container = document.querySelector(".apex-universe-scroll");
      if (!container || !lenis) return;

      const max = container.scrollHeight - window.innerHeight;
      if (max <= 0) return;

      const progress = window.scrollY / max;
      let nearest = ACTS[0].start;
      let bestDist = Infinity;

      for (const act of ACTS) {
        const d = Math.abs(progress - act.start);
        if (d < bestDist) {
          bestDist = d;
          nearest = act.start;
        }
      }

      if (bestDist > SNAP_THRESHOLD) return;

      const targetY = nearest * max;
      if (Math.abs(window.scrollY - targetY) < 24) return;

      snappingRef.current = true;
      lenis.scrollTo(targetY, {
        duration: 0.85,
        easing: (t) => 1 - Math.pow(1 - t, 3),
        onComplete: () => {
          snappingRef.current = false;
        },
      });
    };

    const scheduleSnap = () => {
      if (!snapEnabled) return;
      clearTimeout(snapTimerRef.current);
      snapTimerRef.current = setTimeout(snapToAct, SNAP_DEBOUNCE_MS);
    };

    (async () => {
      try {
        const Lenis = (await import("lenis")).default;
        lenis = new Lenis({
          duration: 1.12,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          touchMultiplier: isMobile ? 1.1 : 1.4,
        });
        lenisRef.current = lenis;

        lenis.on("scroll", scheduleSnap);

        const tick = (time) => {
          lenis.raf(time);
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);

        document.documentElement.classList.add("lenis", "lenis-smooth");
      } catch {
        /* native scroll fallback */
      }
    })();

    return () => {
      clearTimeout(snapTimerRef.current);
      if (raf) cancelAnimationFrame(raf);
      lenis?.destroy();
      lenisRef.current = null;
      document.documentElement.classList.remove("lenis", "lenis-smooth");
    };
  }, [enabled]);

  return lenisRef;
}
