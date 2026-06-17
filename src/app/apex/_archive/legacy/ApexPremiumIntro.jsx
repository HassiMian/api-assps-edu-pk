"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SkipForward } from "lucide-react";
import ApexParticleField from "./ApexParticleField";

const STORAGE_KEY = "apex_cinema_seen_v4";

const BOOT_LINES = [
  "apex.core.boot()",
  "linking 8 school systems",
  "activating AI intelligence layer",
  "syncing parents · teachers · students",
];

// phase → elapsed ms
const TIMELINE = [0, 850, 2000, 3150, 4500];

export default function ApexPremiumIntro({ onComplete }) {
  const reduce = useReducedMotion();
  const doneRef = useRef(false);
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

  // Skip if already seen this session, or reduced motion.
  useEffect(() => {
    if (typeof window === "undefined") return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      /* ignore */
    }
    if (seen || reduce) {
      finish();
    }
  }, [reduce, finish]);

  // Drive the boot timeline.
  useEffect(() => {
    if (!visible || reduce || doneRef.current) return;
    document.body.classList.add("apex-cinema-active");
    const timers = TIMELINE.map((at, i) =>
      window.setTimeout(() => {
        if (i === TIMELINE.length - 1) finish();
        else setPhase(i);
      }, at)
    );
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      document.body.classList.remove("apex-cinema-active");
    };
  }, [visible, reduce, finish]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="apex-boot-intro"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="apex-premium-intro fixed inset-0 z-[120] flex items-center justify-center overflow-hidden bg-black"
        role="dialog"
        aria-label="APEX boot sequence"
      >
        {/* Deep-space particle convergence */}
        <ApexParticleField mode="converge" color="#22d3ee" accent="#c9a84c" density={1.25} />

        {/* atmosphere */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.12),transparent_55%)]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.3]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage: "radial-gradient(circle at 50% 50%, black, transparent 75%)",
          }}
          aria-hidden
        />
        <div className="apex-cinema-letterbox-top" aria-hidden />
        <div className="apex-cinema-letterbox-bottom" aria-hidden />
        <div className="apex-cinema-grain pointer-events-none absolute inset-0 opacity-[0.12]" aria-hidden />
        <div className="apex-scanline pointer-events-none absolute inset-0" aria-hidden />

        {/* HUD corner brackets */}
        <div className="apex-hud-bracket apex-hud-bracket-tl" aria-hidden />
        <div className="apex-hud-bracket apex-hud-bracket-tr" aria-hidden />
        <div className="apex-hud-bracket apex-hud-bracket-bl" aria-hidden />
        <div className="apex-hud-bracket apex-hud-bracket-br" aria-hidden />

        {/* Skip */}
        <button
          type="button"
          onClick={finish}
          className="absolute right-4 top-[calc(8%+0.5rem)] z-30 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/55 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md transition hover:border-cyan-300/50"
        >
          Skip <SkipForward className="h-4 w-4" />
        </button>

        {/* Center stage: ignition → logo → headline */}
        <div className="relative z-20 flex w-full max-w-3xl flex-col items-center px-6 text-center">
          {/* core ignition */}
          <div className="relative mb-8 flex h-40 w-40 items-center justify-center sm:h-48 sm:w-48">
            {/* shockwave rings */}
            <AnimatePresence>
              {phase >= 1 &&
                [0, 0.4, 0.8].map((d) => (
                  <motion.span
                    key={d}
                    className="absolute rounded-full border border-cyan-300/40"
                    initial={{ width: 40, height: 40, opacity: 0.7 }}
                    animate={{ width: 360, height: 360, opacity: 0 }}
                    transition={{ duration: 1.8, delay: d, repeat: Infinity, ease: "easeOut" }}
                  />
                ))}
            </AnimatePresence>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-amber-300/20 bg-[conic-gradient(from_90deg,transparent,rgba(201,168,76,0.3),transparent,rgba(34,211,238,0.25),transparent)]"
            />
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: phase >= 1 ? 1 : 0.2, opacity: phase >= 1 ? 1 : 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex h-24 w-24 items-center justify-center rounded-full border border-amber-300/30 bg-gradient-to-br from-slate-900 via-blue-950 to-cyan-950 shadow-[0_0_80px_rgba(34,211,238,0.5)] sm:h-28 sm:w-28"
            >
              <AnimatePresence>
                {phase >= 2 && (
                  <motion.img
                    src="/apex-logo.svg"
                    alt="APEX"
                    initial={{ opacity: 0, scale: 0.7, filter: "blur(10px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    className="h-9 w-auto object-contain sm:h-11"
                  />
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* headline lockup */}
          <AnimatePresence>
            {phase >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 22, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-200/90 sm:text-xs">
                  APEX
                </p>
                <h2 className="mt-3 bg-gradient-to-r from-amber-200 via-white to-cyan-200 bg-clip-text text-3xl font-black uppercase leading-[1.05] tracking-tight text-transparent sm:text-5xl md:text-6xl">
                  Education Operating System
                </h2>
                <p className="mt-4 text-xs font-bold uppercase tracking-[0.3em] text-slate-400 sm:text-sm">
                  Built for the next 100 years of schools
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Boot console (bottom-left) */}
        <div className="absolute bottom-[10%] left-4 z-20 hidden max-w-xs font-mono text-[11px] leading-6 text-cyan-200/90 sm:left-8 sm:block">
          {BOOT_LINES.map((line, i) => {
            const show = phase >= (i < 2 ? 1 : 2);
            return (
              <motion.div
                key={line}
                initial={{ opacity: 0, x: -14 }}
                animate={show ? { opacity: 1, x: 0 } : { opacity: 0, x: -14 }}
                transition={{ duration: 0.4, delay: (i % 2) * 0.25 }}
                className="flex items-center gap-2"
              >
                <span className="text-amber-300/80">›</span>
                <span>{line}</span>
                {show && <span className="text-emerald-400">✓</span>}
              </motion.div>
            );
          })}
        </div>

        {/* progress */}
        <div className="absolute bottom-[8%] left-1/2 z-20 h-1 w-56 max-w-[80vw] -translate-x-1/2 overflow-hidden rounded-full bg-white/15">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-amber-300 via-cyan-400 to-blue-500"
            initial={{ width: "0%" }}
            animate={{ width: `${Math.min(100, (phase / 4) * 100 + 8)}%` }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
