"use client";

import { useEffect, useRef } from "react";

/**
 * Lightweight canvas-2D particle field — the "Floating Content Universe" engine.
 * Deliberately NOT WebGL/three.js: keeps low-end phones safe (this gateway had
 * mobile blank-screen/perf incidents). Guards mirror ApexPremiumIntro:
 *  - disabled on prefers-reduced-motion
 *  - disabled on very small screens / save-data / slow networks
 *  - paused when the host section is offscreen (IntersectionObserver)
 *  - devicePixelRatio capped, particle count scaled to viewport
 *
 * mode:
 *  - "drift"    : ambient floating dust
 *  - "chaos"    : jittery, disorganized scatter (Scene 1)
 *  - "converge" : particles pulled toward center, then orbit (Scene 2 awakening)
 *  - "stream"   : particles flow from edges into the center (Scene 3 connect)
 *  - "orbit"    : stable rings orbiting center (Scene 8 galaxy)
 */
export default function ApexParticleField({
  mode = "drift",
  color = "#22d3ee",
  accent = "#c9a84c",
  density = 1,
  className = "",
  style,
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const activeRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (typeof window === "undefined") return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conn =
      navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const slowNet =
      conn &&
      (conn.saveData === true ||
        conn.effectiveType === "slow-2g" ||
        conn.effectiveType === "2g");
    const tooSmall = window.matchMedia("(max-width: 420px)").matches;

    // Perf bail only: slow networks / tiny phones (CSS fallbacks remain).
    // Reduced-motion → stay ALIVE but calmer (per project motion rule), not frozen.
    if (slowNet || tooSmall) {
      return;
    }
    const calm = prefersReduced;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    let width = 0;
    let height = 0;
    let cx = 0;
    let cy = 0;
    let particles = [];

    const baseCount = mode === "orbit" ? 90 : 70;
    const count = Math.round(
      Math.min(160, baseCount * density * (window.innerWidth > 1280 ? 1.25 : 0.85) * (calm ? 0.5 : 1))
    );

    const rand = (a, b) => a + Math.random() * (b - a);

    function makeParticle(i) {
      const useAccent = Math.random() < (mode === "knowledge" ? 0.55 : 0.32);
      const ring = mode === "orbit" ? rand(0.18, 0.46) : 0;
      const angle = Math.random() * Math.PI * 2;
      return {
        x: rand(0, width),
        y: rand(0, height),
        // velocity
        vx: rand(-0.4, 0.4),
        vy: rand(-0.4, 0.4),
        size: rand(0.6, mode === "chaos" ? 2.4 : 1.9),
        col: useAccent ? accent : color,
        alpha: rand(0.25, 0.85),
        twinkle: rand(0.005, 0.02),
        tdir: Math.random() < 0.5 ? 1 : -1,
        // orbit params
        ringR: ring,
        angle,
        speed: rand(0.0015, 0.005) * (Math.random() < 0.5 ? 1 : -1),
        seed: i,
      };
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      cx = width / 2;
      cy = height / 2;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (particles.length === 0) {
        particles = Array.from({ length: count }, (_, i) => makeParticle(i));
      }
    }

    function step() {
      if (!activeRef.current) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }
      ctx.clearRect(0, 0, width, height);

      const minDim = Math.min(width, height);

      for (const p of particles) {
        // twinkle
        p.alpha += p.twinkle * p.tdir;
        if (p.alpha > 0.9 || p.alpha < 0.2) p.tdir *= -1;

        if (mode === "orbit") {
          p.angle += p.speed;
          const r = p.ringR * minDim;
          p.x = cx + Math.cos(p.angle) * r;
          p.y = cy + Math.sin(p.angle) * r * 0.62;
        } else if (mode === "converge" || mode === "stream") {
          const dx = cx - p.x;
          const dy = cy - p.y;
          const dist = Math.hypot(dx, dy) || 1;
          const pull = mode === "stream" ? 0.012 : 0.006;
          p.vx += (dx / dist) * pull;
          p.vy += (dy / dist) * pull;
          // gentle tangential swirl so they orbit instead of collapsing
          p.vx += (-dy / dist) * 0.004;
          p.vy += (dx / dist) * 0.004;
          p.vx *= 0.965;
          p.vy *= 0.965;
          p.x += p.vx;
          p.y += p.vy;
          // respawn near edges when they reach the core
          if (dist < minDim * 0.06) {
            const edge = Math.floor(rand(0, 4));
            if (edge === 0) (p.x = rand(0, width)), (p.y = -10);
            else if (edge === 1) (p.x = width + 10), (p.y = rand(0, height));
            else if (edge === 2) (p.x = rand(0, width)), (p.y = height + 10);
            else (p.x = -10), (p.y = rand(0, height));
            p.vx = rand(-0.3, 0.3);
            p.vy = rand(-0.3, 0.3);
          }
        } else {
          // drift / chaos / knowledge
          const jitter = mode === "chaos" ? (calm ? 0.16 : 0.5) : calm ? 0.04 : 0.08;
          p.vx += rand(-jitter, jitter);
          p.vy += rand(-jitter, jitter);
          p.vx = Math.max(-1.2, Math.min(1.2, p.vx * 0.94));
          p.vy = Math.max(-1.2, Math.min(1.2, p.vy * 0.94));
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
          if (p.y < -10) p.y = height + 10;
          if (p.y > height + 10) p.y = -10;
        }

        ctx.beginPath();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.col;
        ctx.shadowColor = p.col;
        ctx.shadowBlur = p.size * 3;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // connective strands for converge/stream/orbit — energy network feel
      if (mode === "converge" || mode === "stream" || mode === "orbit") {
        ctx.globalAlpha = 0.14;
        ctx.lineWidth = 0.6;
        ctx.shadowBlur = 0;
        for (let i = 0; i < particles.length; i += 3) {
          const p = particles[i];
          const d = Math.hypot(p.x - cx, p.y - cy);
          if (d < minDim * 0.4) {
            ctx.strokeStyle = p.col;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(cx, cy);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(step);
    }

    resize();
    rafRef.current = requestAnimationFrame(step);

    const onResize = () => {
      particles = [];
      resize();
    };
    window.addEventListener("resize", onResize);

    // Pause when offscreen to save battery / CPU
    const io = new IntersectionObserver(
      (entries) => {
        activeRef.current = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    const onVisibility = () => {
      activeRef.current = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      io.disconnect();
    };
  }, [mode, color, accent, density]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      style={style}
      aria-hidden
    />
  );
}
