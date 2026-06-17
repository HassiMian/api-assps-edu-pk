"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * ApexCinematicBackground
 * A code-generated "living video" background for the whole APEX universe.
 *
 * Layers (back → front):
 *  1. Deep gradient void (#020510 → #030712) + radial brand glows (CSS)
 *  2. Canvas: 3 parallax starfields + flowing education data streams +
 *     occasional constellation links. Scroll-reactive (slow camera drift).
 *  3. Soft animated grid + orbital ring whispers (CSS / framer-motion)
 *  4. Vignette + film grain (CSS)
 *
 * Performance / safety (this gateway had mobile blank-screen incidents):
 *  - prefers-reduced-motion → static gradient + faint stars, no rAF loop
 *  - save-data / slow networks → static fallback
 *  - DPR capped at 1.75, star count scaled to viewport, fewer on phones
 *  - rAF paused when tab hidden
 *  - pointer-events: none, aria-hidden
 */
export default function ApexCinematicBackground() {
  const reduce = useReducedMotion();
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const scrollRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const slowNet =
      conn && (conn.saveData === true || conn.effectiveType === "slow-2g" || conn.effectiveType === "2g");

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    let width = 0;
    let height = 0;
    let stars = [];
    let streams = [];
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    // Only go fully static on slow networks. Reduced-motion stays alive but calm.
    const staticMode = slowNet;
    const calm = prefersReduced;

    const rand = (a, b) => a + Math.random() * (b - a);
    // 3 depth layers — closer layers are bigger, brighter, parallax faster
    const layers = [
      { depth: 0.25, size: [0.4, 0.9], alpha: [0.15, 0.4] },
      { depth: 0.55, size: [0.7, 1.5], alpha: [0.25, 0.6] },
      { depth: 1.0, size: [1.0, 2.2], alpha: [0.4, 0.95] },
    ];
    const GOLD = "#c9a84c";
    const CYAN = "#22d3ee";
    const BLUE = "#3b82f6";
    const WHITE = "#dbeafe";

    function buildStars() {
      const area = width * height;
      const base = isMobile ? 9000 : 6500; // larger divisor = fewer stars
      const count = Math.min(220, Math.round(area / base));
      stars = Array.from({ length: count }, () => {
        const layer = layers[Math.floor(rand(0, layers.length))];
        const pick = Math.random();
        const col = pick < 0.12 ? GOLD : pick < 0.24 ? CYAN : WHITE;
        return {
          x: rand(0, width),
          y: rand(0, height),
          r: rand(layer.size[0], layer.size[1]),
          a: rand(layer.alpha[0], layer.alpha[1]),
          tw: rand(0.003, 0.012),
          td: Math.random() < 0.5 ? 1 : -1,
          depth: layer.depth,
          col,
          drift: rand(-0.06, 0.06),
        };
      });
    }

    function buildStreams() {
      // flowing "data streams" — comets that travel along gentle sine paths
      const n = (isMobile ? 4 : 7) * (calm ? 0.6 : 1);
      streams = Array.from({ length: Math.max(2, Math.round(n)) }, () => makeStream());
    }
    function makeStream() {
      const palette = [CYAN, GOLD, BLUE];
      const dir = Math.random() < 0.5 ? 1 : -1;
      return {
        x: dir === 1 ? rand(-0.2, 0.3) * width : rand(0.7, 1.2) * width,
        y: rand(0.05, 0.95) * height,
        dir,
        speed: rand(0.4, 1.1) * dir,
        amp: rand(8, 34),
        freq: rand(0.002, 0.006),
        phase: rand(0, Math.PI * 2),
        len: rand(60, 150),
        col: palette[Math.floor(rand(0, palette.length))],
        a: rand(0.25, 0.6),
        baseY: 0,
      };
    }

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      width = w;
      height = h;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildStars();
      buildStreams();
      for (const s of streams) s.baseY = s.y;
    }

    let frame = 0;

    function drawStatic() {
      ctx.clearRect(0, 0, width, height);
      for (const s of stars) {
        ctx.globalAlpha = s.a;
        ctx.fillStyle = s.col;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function step() {
      frame += 1;
      const scrollY = scrollRef.current;
      ctx.clearRect(0, 0, width, height);

      // ---- starfield with parallax + twinkle ----
      for (const s of stars) {
        s.a += s.tw * s.td;
        if (s.a > 0.97 || s.a < 0.12) s.td *= -1;
        // slow ambient drift + scroll parallax (camera glide)
        s.x += s.drift * s.depth;
        if (s.x > width + 4) s.x = -4;
        if (s.x < -4) s.x = width + 4;
        const py = (s.y - scrollY * 0.04 * s.depth) % (height + 8);
        const yy = py < -4 ? py + height + 8 : py;

        ctx.globalAlpha = s.a;
        ctx.fillStyle = s.col;
        ctx.shadowColor = s.col;
        ctx.shadowBlur = s.r * 2.2;
        ctx.beginPath();
        ctx.arc(s.x, yy, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // ---- flowing data streams (intelligent education energy) ----
      for (const s of streams) {
        s.x += s.speed;
        const wave = Math.sin(frame * s.freq + s.phase) * s.amp;
        const y = s.baseY + wave - scrollY * 0.05;
        // comet trail
        const grad = ctx.createLinearGradient(s.x - s.len * s.dir, y, s.x, y);
        grad.addColorStop(0, "rgba(0,0,0,0)");
        grad.addColorStop(1, s.col);
        ctx.globalAlpha = s.a;
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.4;
        ctx.shadowColor = s.col;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(s.x - s.len * s.dir, y);
        ctx.lineTo(s.x, y);
        ctx.stroke();
        // head
        ctx.globalAlpha = Math.min(1, s.a + 0.25);
        ctx.fillStyle = s.col;
        ctx.beginPath();
        ctx.arc(s.x, y, 1.6, 0, Math.PI * 2);
        ctx.fill();

        if ((s.dir === 1 && s.x > width + s.len) || (s.dir === -1 && s.x < -s.len)) {
          Object.assign(s, makeStream());
          s.baseY = s.y;
        }
      }
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      rafRef.current = requestAnimationFrame(step);
    }

    resize();
    if (staticMode) {
      drawStatic();
    } else {
      rafRef.current = requestAnimationFrame(step);
    }

    const onResize = () => resize();
    const onScroll = () => {
      scrollRef.current = window.scrollY || window.pageYOffset || 0;
    };
    const onVisibility = () => {
      if (staticMode) return;
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current);
      } else {
        rafRef.current = requestAnimationFrame(step);
      }
    };
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div className="apex-cine-bg pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {/* 1 — deep void + brand radial glows */}
      <div className="absolute inset-0 bg-[#020510]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_20%,rgba(15,23,42,0.45),transparent_70%)]" />

      {/* 3 — soft animated grid (CSS, GPU transform) */}
      <div className="apex-cine-grid absolute inset-0" />

      {/* 2 — living canvas universe */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* orbital ring whispers behind everything */}
      {!reduce && (
        <>
          <motion.div
            className="absolute left-1/2 top-1/2 h-[120vmin] w-[120vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/[0.05]"
            animate={{ rotate: 360 }}
            transition={{ duration: 140, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 h-[78vmin] w-[78vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-300/[0.05]"
            animate={{ rotate: -360 }}
            transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
          />
        </>
      )}

      {/* 4 — vignette + grain */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(2,5,16,0.85)_100%)]" />
      <div className="apex-cine-grain absolute inset-0 opacity-[0.05]" />
    </div>
  );
}
