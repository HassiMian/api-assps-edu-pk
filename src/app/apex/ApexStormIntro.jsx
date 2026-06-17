"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SkipForward } from "lucide-react";
import ApexOfficialLogo from "./ApexOfficialLogo";
import { APEX_BRAND_MODULES } from "./apexBrandModules";

const STORAGE_KEY = "apex_storm_intro_v5";
const ease = [0.22, 1, 0.36, 1];

// phases: 0 void → 1 logo → 2 storm → 3 branches → 4 orbit → 5 title → 6 exit
const PHASE_AT = [0, 900, 2200, 3800, 5200, 7800, 10000, 11800];

export default function ApexStormIntro({ onComplete }) {
  const reduce = useReducedMotion();
  const doneRef = useRef(false);
  const canvasRef = useRef(null);
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState(0);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    document.body.classList.remove("apex-cinema-active");
    setVisible(false);
    onComplete?.();
  }, [onComplete]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      /* ignore */
    }
    if (seen || reduce) finish();
  }, [reduce, finish]);

  useEffect(() => {
    if (!visible || reduce || doneRef.current) return;
    document.body.classList.add("apex-cinema-active");
    const timers = PHASE_AT.map((at, i) =>
      window.setTimeout(() => {
        if (i === PHASE_AT.length - 1) finish();
        else setPhase(i);
      }, at)
    );
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      document.body.classList.remove("apex-cinema-active");
    };
  }, [visible, reduce, finish]);

  // Storm particle canvas
  useEffect(() => {
    if (!visible || reduce || phase < 2) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let particles = [];
    let raf = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(180, Math.round((w * h) / 8000));
      particles = Array.from({ length: n }, () => ({
        a: Math.random() * Math.PI * 2,
        r: 40 + Math.random() * Math.min(w, h) * 0.42,
        speed: 0.003 + Math.random() * 0.008,
        size: 0.8 + Math.random() * 2,
        col: Math.random() < 0.5 ? "#22d3ee" : "#c9a84c",
      }));
    };

    const cx = () => w / 2;
    const cy = () => h / 2;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const intensity = phase >= 3 ? 1 : 0.55;
      for (const p of particles) {
        p.a += p.speed * intensity;
        const px = cx() + Math.cos(p.a) * p.r;
        const py = cy() + Math.sin(p.a) * p.r * 0.85;
        const grad = ctx.createRadialGradient(px, py, 0, px, py, p.size * 3);
        grad.addColorStop(0, p.col);
        grad.addColorStop(1, "transparent");
        ctx.globalAlpha = 0.35 + intensity * 0.35;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [visible, reduce, phase]);

  if (!visible) return null;

  const showBranches = phase >= 3;
  const showModules = phase >= 4;
  const showTitle = phase >= 5;
  const logoSize = phase >= 1 ? (phase >= 4 ? 200 : 280) : 80;

  return (
    <AnimatePresence>
      <motion.div
        key="apex-storm-intro"
        exit={{ opacity: 0, scale: 1.04 }}
        transition={{ duration: 1.1, ease }}
        className="apex-storm-intro fixed inset-0 z-[200] overflow-hidden bg-[#020510]"
        role="dialog"
        aria-label="APEX cinematic introduction"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_48%,rgba(34,211,238,0.14),transparent_65%)]" />
        <div className="apex-cinema-letterbox-top" aria-hidden />
        <div className="apex-cinema-letterbox-bottom" aria-hidden />
        <div className="apex-cinema-grain pointer-events-none absolute inset-0 opacity-[0.1]" aria-hidden />

        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" aria-hidden />

        <button
          type="button"
          onClick={finish}
          className="absolute right-4 top-5 z-50 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md transition hover:border-cyan-300/50 sm:right-8"
        >
          Skip <SkipForward className="h-4 w-4" />
        </button>

        {/* cinematic stage */}
        <div className="relative flex h-full w-full items-center justify-center">
          <motion.div
            className="relative flex items-center justify-center"
            style={{ width: "min(92vmin, 720px)", height: "min(92vmin, 720px)" }}
            animate={phase >= 6 ? { scale: 0.85, opacity: 0 } : { scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease }}
          >
            {/* shockwave on logo birth */}
            {phase >= 1 &&
              [0, 0.35, 0.7].map((d) => (
                <motion.span
                  key={d}
                  className="pointer-events-none absolute rounded-full border border-cyan-300/30"
                  initial={{ width: 60, height: 60, opacity: 0.8 }}
                  animate={{ width: 520, height: 520, opacity: 0 }}
                  transition={{ duration: 2.4, delay: d, repeat: phase < 4 ? Infinity : 0, ease: "easeOut" }}
                />
              ))}

            {/* branches from symbol center */}
            {showBranches && (
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full"
                viewBox="0 0 100 100"
                aria-hidden
              >
                {APEX_BRAND_MODULES.map((mod, i) => {
                  const rad = (mod.angle * Math.PI) / 180;
                  const x2 = 50 + Math.cos(rad) * 38;
                  const y2 = 50 + Math.sin(rad) * 38;
                  return (
                    <motion.line
                      key={mod.id}
                      x1="50"
                      y1="50"
                      x2={x2}
                      y2={y2}
                      stroke={mod.color}
                      strokeWidth="0.35"
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: [0.2, 0.75, 0.5] }}
                      transition={{ duration: 1.2, delay: i * 0.07, ease }}
                    />
                  );
                })}
              </svg>
            )}

            {/* orbiting modules on branch tips */}
            {showModules && (
              <motion.div
                className="absolute inset-0"
                animate={reduce ? undefined : { rotate: 360 }}
                transition={{ duration: 48, repeat: Infinity, ease: "linear" }}
              >
                {APEX_BRAND_MODULES.map((mod, i) => {
                  const rad = (mod.angle * Math.PI) / 180;
                  const left = 50 + Math.cos(rad) * 38;
                  const top = 50 + Math.sin(rad) * 38;
                  return (
                    <motion.div
                      key={mod.id}
                      className="absolute flex flex-col items-center gap-1"
                      style={{ left: `${left}%`, top: `${top}%`, transform: "translate(-50%,-50%)" }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.15 + i * 0.08, duration: 0.65, ease }}
                    >
                      <motion.div
                        animate={reduce ? undefined : { rotate: -360 }}
                        transition={{ duration: 48, repeat: Infinity, ease: "linear" }}
                        className="flex flex-col items-center gap-1"
                      >
                        <span
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-slate-950/80 text-[8px] font-black uppercase tracking-wider text-white shadow-lg backdrop-blur-md sm:h-10 sm:w-10 sm:text-[9px]"
                          style={{ boxShadow: `0 0 20px ${mod.color}66`, borderColor: `${mod.color}44` }}
                        >
                          {mod.label.split(" ")[0]}
                        </span>
                        <span className="whitespace-nowrap text-[8px] font-bold uppercase tracking-wider text-white/70 sm:text-[9px]">
                          {mod.label}
                        </span>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* center logo — hero scale, transparent, 3D shine */}
            <motion.div
              className="relative z-20"
              initial={{ scale: 0.2, opacity: 0, filter: "blur(16px)" }}
              animate={{
                scale: phase >= 1 ? 1 : 0.2,
                opacity: phase >= 1 ? 1 : 0,
                filter: phase >= 1 ? "blur(0px)" : "blur(16px)",
              }}
              transition={{ duration: 1.4, ease }}
            >
              <ApexOfficialLogo
                size={logoSize}
                priority
                className="drop-shadow-[0_8px_48px_rgba(201,168,76,0.5)]"
              />
            </motion.div>
          </motion.div>

          {/* title emerges after storm */}
          <AnimatePresence>
            {showTitle && (
              <motion.div
                className="absolute inset-x-0 bottom-[12%] z-30 px-6 text-center sm:bottom-[14%]"
                initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease }}
              >
                <h1 className="bg-gradient-to-r from-amber-100 via-white to-cyan-100 bg-clip-text text-3xl font-black leading-[1.02] tracking-tight text-transparent sm:text-5xl md:text-6xl">
                  Education Operating System
                </h1>
                <p className="mt-4 text-xs font-bold uppercase tracking-[0.28em] text-amber-200/80 sm:text-sm">
                  One core · Every module · One universe
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* progress bar */}
        <div className="absolute bottom-[6%] left-1/2 z-40 h-1 w-64 max-w-[85vw] -translate-x-1/2 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-300 via-cyan-400 to-blue-500"
            animate={{ width: `${Math.min(100, ((phase + 1) / 7) * 100)}%` }}
            transition={{ duration: 0.6, ease }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
