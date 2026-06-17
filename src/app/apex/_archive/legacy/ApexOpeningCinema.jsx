"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SkipForward } from "lucide-react";

const STORAGE_KEY = "apex_cinema_seen_v2";
const DURATION_MS = 7500;

const CAPTIONS = [
  { at: 0, line: "Before sunrise, a school wakes up…", sub: "Education begins in quiet chaos" },
  { at: 0.18, line: "Paper registers · challans · endless threads", sub: "Manual work everywhere" },
  { at: 0.4, line: "Teachers carry the weight of every class", sub: "Homework · diary · exams · reports" },
  { at: 0.58, line: "One intelligent core connects every role", sub: "Students · parents · owners · staff" },
  { at: 0.78, line: "APEX Education OS", sub: "Learn · Grow · Lead · Transform" },
];

function drawFrame(ctx, w, h, t) {
  const cx = w * 0.5;
  const ground = h * 0.76;
  const dawn = Math.min(1, t * 2);

  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, `rgba(2, 6, 23, ${1 - dawn * 0.12})`);
  sky.addColorStop(0.4, `rgba(15, 23, 42, ${0.92 - dawn * 0.15})`);
  sky.addColorStop(0.65, `rgba(30, 58, 138, ${0.3 + dawn * 0.28})`);
  sky.addColorStop(1, `rgba(6, 78, 99, ${0.22 + dawn * 0.38})`);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  const sunY = h * (0.28 - Math.min(0.1, t * 0.06));
  const sunG = ctx.createRadialGradient(cx, sunY, 0, cx, sunY, h * 0.42);
  sunG.addColorStop(0, `rgba(251, 191, 36, ${0.42 * dawn})`);
  sunG.addColorStop(0.35, `rgba(34, 211, 238, ${0.14 * dawn})`);
  sunG.addColorStop(1, "transparent");
  ctx.fillStyle = sunG;
  ctx.fillRect(0, 0, w, h);

  const buildingAlpha = Math.min(1, (t - 0.04) * 2.8);
  if (buildingAlpha > 0) {
    ctx.save();
    ctx.globalAlpha = buildingAlpha * 0.94;
    const bw = Math.min(w * 0.48, 340);
    const bh = h * 0.24;
    const bx = cx - bw / 2;
    const by = ground - bh;
    const grad = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
    grad.addColorStop(0, "rgba(15, 23, 42, 0.98)");
    grad.addColorStop(1, "rgba(3, 7, 18, 1)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") ctx.roundRect(bx, by, bw, bh, 10);
    else ctx.rect(bx, by, bw, bh);
    ctx.fill();
    const flagPole = bx + bw * 0.12;
    ctx.strokeStyle = "rgba(148, 163, 184, 0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(flagPole, by - h * 0.06);
    ctx.lineTo(flagPole, by + 8);
    ctx.stroke();
    ctx.fillStyle = `rgba(34, 211, 238, ${0.5 + Math.sin(t * 6) * 0.1})`;
    ctx.beginPath();
    ctx.moveTo(flagPole, by - h * 0.055);
    ctx.lineTo(flagPole + 28, by - h * 0.04);
    ctx.lineTo(flagPole, by - h * 0.02);
    ctx.closePath();
    ctx.fill();
    const cols = 6;
    const rows = 3;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const wx = bx + 14 + c * ((bw - 28) / cols);
        const wy = by + 14 + r * ((bh - 28) / rows);
        const glow = 0.25 + Math.sin(t * 9 + c * 1.3 + r) * 0.2;
        ctx.fillStyle = `rgba(34, 211, 238, ${glow * buildingAlpha})`;
        ctx.fillRect(wx, wy, (bw - 28) / cols - 6, (bh - 28) / rows - 5);
      }
    }
    ctx.restore();
  }

  if (t > 0.1 && t < 0.55) {
    const paperCount = 22;
    for (let i = 0; i < paperCount; i++) {
      const seed = i * 2.11;
      const drift = ((t - 0.1) * 2.2 + seed) % 1;
      const px = ((Math.sin(seed * 1.7 + t * 3) + 1) / 2) * w;
      const py = ground - 30 - drift * h * 0.4;
      ctx.save();
      ctx.globalAlpha = 0.12 + 0.28 * (1 - Math.abs(t - 0.32) / 0.25);
      ctx.fillStyle = i % 4 === 0 ? "rgba(251, 191, 36, 0.55)" : "rgba(226, 232, 240, 0.45)";
      ctx.translate(px, py);
      ctx.rotate(seed + t * 3.5);
      ctx.fillRect(-12, -8, 24, 16);
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.strokeRect(-10, -6, 20, 12);
      ctx.restore();
    }
  }

  if (t > 0.22 && t < 0.62) {
    const figures = 5;
    for (let i = 0; i < figures; i++) {
      const fx = w * (0.18 + i * 0.14) + Math.sin(t * 4 + i) * 8;
      const fy = ground - 8;
      const fa = Math.min(1, (t - 0.22 - i * 0.04) * 4);
      ctx.save();
      ctx.globalAlpha = fa * 0.55;
      ctx.fillStyle = "rgba(148, 163, 184, 0.7)";
      ctx.beginPath();
      ctx.arc(fx, fy - 22, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(fx - 5, fy - 16, 10, 18);
      ctx.restore();
    }
  }

  if (t > 0.36) {
    const corePulse = 0.52 + Math.sin(t * 11) * 0.1;
    const cy = ground - h * 0.3;
    const coreR = Math.min(w, h) * (0.055 + (t - 0.36) * 0.045) * corePulse;
    const coreG = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 3.2);
    coreG.addColorStop(0, `rgba(34, 211, 238, ${0.6 * Math.min(1, (t - 0.36) * 2.2)})`);
    coreG.addColorStop(0.45, "rgba(59, 130, 246, 0.18)");
    coreG.addColorStop(1, "transparent");
    ctx.fillStyle = coreG;
    ctx.beginPath();
    ctx.arc(cx, cy, coreR * 3.2, 0, Math.PI * 2);
    ctx.fill();

    const nodes = [
      { angle: -1.35 },
      { angle: -0.45 },
      { angle: 0.55 },
      { angle: 1.45 },
      { angle: 2.35 },
    ];
    const orbit = Math.min(w, h) * 0.24 * Math.min(1, (t - 0.4) * 2.2);
    nodes.forEach((node, i) => {
      const a = node.angle + t * 0.12;
      const nx = cx + Math.cos(a) * orbit;
      const ny = cy + Math.sin(a) * orbit * 0.52;
      const linkAlpha = Math.min(1, (t - 0.42) * 3);
      ctx.strokeStyle = `rgba(34, 211, 238, ${0.4 * linkAlpha})`;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(nx, ny);
      ctx.stroke();
      ctx.fillStyle = `rgba(255, 255, 255, ${0.85 * linkAlpha})`;
      ctx.beginPath();
      ctx.arc(nx, ny, 5 + (i % 2), 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = "rgba(255,255,255,0.96)";
    ctx.beginPath();
    ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(2, 6, 23, 0.92)";
    ctx.font = `800 ${Math.max(12, coreR * 0.5)}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("APEX", cx, cy);
  }

  if (t > 0.88) {
    ctx.fillStyle = `rgba(3, 7, 18, ${Math.min(1, (t - 0.88) / 0.12)})`;
    ctx.fillRect(0, 0, w, h);
  }
}

export default function ApexOpeningCinema({ onComplete }) {
  const reduce = useReducedMotion();
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const [captionIndex, setCaptionIndex] = useState(0);
  const [skipIntro, setSkipIntro] = useState(false);

  const finish = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
    onComplete?.();
  }, [onComplete]);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") {
        setSkipIntro(true);
        finish();
        return;
      }
    } catch {
      /* ignore */
    }
  }, [finish]);

  useEffect(() => {
    if (reduce) {
      finish();
      return;
    }
    if (skipIntro) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);
    document.body.classList.add("apex-cinema-active");

    const tick = (now) => {
      if (!startRef.current) startRef.current = now;
      const elapsed = now - startRef.current;
      const t = Math.min(1, elapsed / DURATION_MS);
      setProgress(t);

      const capIdx = CAPTIONS.reduce((acc, c, i) => (t >= c.at ? i : acc), 0);
      setCaptionIndex(capIdx);

      const ctx = canvas.getContext("2d");
      const rect = canvas.getBoundingClientRect();
      if (ctx) {
        ctx.clearRect(0, 0, rect.width, rect.height);
        drawFrame(ctx, rect.width, rect.height, t);
      }

      if (t >= 1) {
        finish();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      document.body.classList.remove("apex-cinema-active");
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [reduce, finish, skipIntro]);

  if (!visible || skipIntro) return null;

  const cap = CAPTIONS[captionIndex];

  return (
    <AnimatePresence>
      <motion.div
        key="cinema"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="apex-opening-cinema fixed inset-0 z-[120] flex flex-col bg-[#020617]"
        role="dialog"
        aria-label="APEX opening experience"
      >
        <div className="apex-cinema-letterbox-top" aria-hidden />
        <div className="apex-cinema-letterbox-bottom" aria-hidden />

        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />
        <div className="apex-cinema-grain pointer-events-none absolute inset-0" aria-hidden />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_75%,rgba(34,211,238,0.1),transparent_55%)]" />

        <button
          type="button"
          onClick={finish}
          className="absolute right-4 top-[calc(8%+1rem)] z-20 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-200 backdrop-blur-md transition hover:border-cyan-300/40 hover:text-white sm:right-6"
        >
          Skip <SkipForward className="h-4 w-4" />
        </button>

        <div className="relative z-10 flex flex-1 flex-col items-center justify-end px-6 pb-[12vh] pt-24 text-center sm:pb-[14vh]">
          <motion.div
            key={captionIndex}
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl px-2"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.38em] text-cyan-300/85 sm:text-xs">{cap.sub}</p>
            <h2 className="mt-3 text-2xl font-black leading-[1.05] text-white sm:text-4xl md:text-5xl">{cap.line}</h2>
          </motion.div>

          <div className="mt-10 h-1 w-52 max-w-[75vw] overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-amber-300 via-cyan-400 to-blue-500 shadow-[0_0_20px_rgba(34,211,238,0.45)]"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
