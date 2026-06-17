"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  MonitorCog,
  Smartphone,
  Globe,
  BrainCircuit,
  Activity,
  Wallet,
  Sparkles,
  Users,
  ClipboardCheck,
  CalendarCheck,
  CreditCard,
  FileCheck,
  Trophy,
  AlertTriangle,
  NotebookPen,
  MessageCircle,
  Table2,
} from "lucide-react";
import ApexCoreEngine from "./ApexCoreEngine";
import ApexParticleField from "./ApexParticleField";
import ApexNarrativeDirector from "./ApexNarrativeDirector";
import ApexSymbol from "./ApexSymbol";
import ApexWorldDepth from "./ApexWorldDepth";
import ApexConvergeCTA from "./ApexConvergeCTA";
import ApexJourneyRail from "./ApexJourneyRail";
import ApexMorphActLayer from "./ApexMorphActLayer";
import { MagneticButton } from "./ApexPremiumUI";
import {
  ACTS,
  CHAOS_FRAGMENTS,
  CHAOS_LINKS,
  OS_MODULES,
  AI_NODES,
  CONNECT_ROLES,
  GALAXY_SYSTEMS,
  COMMAND_METRICS,
  actLayerKeyframes,
} from "./apexUniverseData";
import { DESKTOP_CAMERA, getCameraProfile } from "./apexCameraProfiles";

const CHAOS_ICONS = [NotebookPen, MessageCircle, ClipboardCheck, CreditCard, Table2, AlertTriangle];
const OS_ICONS = [ClipboardCheck, Users, CalendarCheck, CreditCard, FileCheck, Trophy, Users, Wallet];

function ChaosLayer({ progress, reduce }) {
  const act = ACTS[0];
  return (
    <ApexMorphActLayer progress={progress} act={act} morph={{ enterY: 50, enterScale: 1.1, enterRot: -8 }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(circle at 50% 40%, ${act.tint}, transparent 62%)` }}
      />
      {/* broken connections — disconnected chaos */}
      <svg className="absolute inset-0 h-full w-full opacity-30" aria-hidden>
        {CHAOS_LINKS.map(([a, b], i) => {
          const fa = CHAOS_FRAGMENTS[a];
          const fb = CHAOS_FRAGMENTS[b];
          return (
            <motion.line
              key={i}
              x1={`${fa.x + 8}%`}
              y1={`${fa.y + 4}%`}
              x2={`${fb.x + 8}%`}
              y2={`${fb.y + 4}%`}
              stroke="#b45309"
              strokeWidth="0.5"
              strokeDasharray="2 3"
              animate={reduce ? undefined : { opacity: [0.1, 0.5, 0.1] }}
              transition={{ duration: 3 + i * 0.4, repeat: Infinity }}
            />
          );
        })}
      </svg>
      {CHAOS_FRAGMENTS.map((f, i) => {
        const Icon = CHAOS_ICONS[i];
        return (
          <motion.div
            key={f.label}
            className="absolute flex items-center gap-2 rounded-xl border border-red-400/15 bg-red-500/[0.06] px-3 py-2 backdrop-blur-sm"
            style={{ left: `${f.x}%`, top: `${f.y}%`, rotate: f.rot }}
            animate={
              reduce ? undefined : { y: [0, i % 2 ? -16 : 16, 0], opacity: [0.3, 0.75, 0.3] }
            }
            transition={{ duration: 5 + i * 0.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <Icon className="h-3.5 w-3.5 text-red-300/70" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{f.label}</span>
          </motion.div>
        );
      })}
    </ApexMorphActLayer>
  );
}

function AwakeningLayer({ progress, reduce }) {
  const act = ACTS[1];
  return (
    <ApexMorphActLayer progress={progress} act={act} morph={{ enterScale: 0.7, enterY: 20 }}>
      {!reduce &&
        [0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-[42%] rounded-full border border-amber-300/25"
            style={{ width: 80 + i * 60, height: 80 + i * 60, marginLeft: -(40 + i * 30), marginTop: -(40 + i * 30) }}
            animate={{ scale: [0.6, 2.8], opacity: [0.5, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeOut", delay: i * 1.1 }}
          />
        ))}
      <div className="absolute left-1/2 top-[16%] z-25 -translate-x-1/2">
        <motion.div
          animate={reduce ? undefined : { scale: [1, 1.08, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <ApexSymbol size={64} tone="platinum" glow="rgba(201,168,76,0.75)" shimmer={!reduce} />
        </motion.div>
      </div>
      {/* scan line discovering the signal */}
      {!reduce && (
        <motion.div
          className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent"
          animate={{ top: ["20%", "75%", "20%"] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </ApexMorphActLayer>
  );
}

function OSModulesLayer({ progress, reduce }) {
  const act = ACTS[2];
  const orbitRotate = useTransform(progress, [act.start, act.end], [0, 45]);

  return (
    <ApexMorphActLayer progress={progress} act={act} morph={{ enterScale: 1.4, exitScale: 0.85 }}>
      <motion.div
        className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2"
        style={{ rotate: reduce ? 0 : orbitRotate, width: "88vmin", height: "88vmin", maxWidth: 640, maxHeight: 640 }}
      >
        {/* orbit ring */}
        <div className="absolute inset-[12%] rounded-full border border-cyan-300/20 shadow-[inset_0_0_40px_rgba(34,211,238,0.08)]" />
        <div className="absolute inset-[22%] rounded-full border border-amber-300/15" />

        {OS_MODULES.map((mod, i) => {
          const rad = (mod.angle * Math.PI) / 180;
          const x = 50 + Math.cos(rad) * 38;
          const y = 50 + Math.sin(rad) * 38;
          const Icon = OS_ICONS[i];
          return (
            <motion.div
              key={mod.name}
              className="absolute flex flex-col items-center gap-1.5"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
              animate={reduce ? undefined : { scale: [1, 1.08, 1] }}
              transition={{ duration: 4 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-slate-950/80 backdrop-blur-md sm:h-10 sm:w-10"
                style={{ boxShadow: `0 0 20px ${mod.color}55` }}
              >
                <Icon className="h-4 w-4" style={{ color: mod.color }} />
              </div>
              <span className="whitespace-nowrap text-[9px] font-bold uppercase tracking-wider text-white/75 sm:text-[10px]">
                {mod.name}
              </span>
            </motion.div>
          );
        })}
      </motion.div>
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-35" aria-hidden>
        {OS_MODULES.map((mod) => {
          const rad = (mod.angle * Math.PI) / 180;
          const x2 = 50 + Math.cos(rad) * 24;
          const y2 = 50 + Math.sin(rad) * 24;
          return (
            <line key={mod.name} x1="50" y1="50" x2={x2} y2={y2} stroke={mod.color} strokeWidth="0.12" strokeOpacity="0.6" />
          );
        })}
      </svg>
    </ApexMorphActLayer>
  );
}

function AILayer({ progress, reduce }) {
  const act = ACTS[3];
  return (
    <ApexMorphActLayer progress={progress} act={act} morph={{ enterY: 24, enterRot: 6 }}>
      <svg className="absolute inset-0 h-full w-full" aria-hidden>
        {AI_NODES.map((_, i) => {
          const a = (i / AI_NODES.length) * Math.PI * 2;
          const x = 50 + Math.cos(a) * 30;
          const y = 50 + Math.sin(a) * 30;
          const a2 = ((i + 2) / AI_NODES.length) * Math.PI * 2;
          const x2 = 50 + Math.cos(a2) * 30;
          const y2 = 50 + Math.sin(a2) * 30;
          return (
            <g key={i}>
              <motion.line
                x1="50"
                y1="50"
                x2={x}
                y2={y}
                stroke="#c9a84c"
                strokeWidth="0.18"
                animate={reduce ? undefined : { opacity: [0.12, 0.65, 0.12] }}
                transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.18 }}
              />
              <motion.line
                x1={x}
                y1={y}
                x2={x2}
                y2={y2}
                stroke="#22d3ee"
                strokeWidth="0.1"
                strokeOpacity="0.35"
                animate={reduce ? undefined : { opacity: [0.05, 0.35, 0.05] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.25 }}
              />
              <motion.circle
                cx={x}
                cy={y}
                r="0.9"
                fill="#22d3ee"
                animate={reduce ? undefined : { r: [0.7, 1.1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
              />
            </g>
          );
        })}
      </svg>
      {AI_NODES.map((name, i) => {
        const a = (i / AI_NODES.length) * Math.PI * 2 - Math.PI / 2;
        const left = 50 + Math.cos(a) * 32;
        const top = 50 + Math.sin(a) * 32;
        return (
          <div
            key={name}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-[9px] font-bold uppercase tracking-wider text-amber-100/85 sm:text-[10px]"
            style={{ left: `${left}%`, top: `${top}%` }}
          >
            {name}
          </div>
        );
      })}
    </ApexMorphActLayer>
  );
}

function ConnectLayer({ progress, reduce }) {
  const act = ACTS[4];
  return (
    <ApexMorphActLayer progress={progress} act={act} morph={{ enterScale: 0.9, exitY: -20 }}>
      <svg className="absolute inset-0 h-full w-full" aria-hidden>
        {CONNECT_ROLES.map((r) => (
          <motion.line
            key={r.role}
            x1={`${r.x}%`}
            y1={`${r.y}%`}
            x2="50%"
            y2="42%"
            stroke={r.accent}
            strokeWidth="0.15"
            strokeOpacity="0.4"
            animate={reduce ? undefined : { strokeOpacity: [0.15, 0.55, 0.15] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
        ))}
      </svg>
      {CONNECT_ROLES.map((r, i) => (
        <motion.div
          key={r.role}
          className="absolute w-[128px] rounded-2xl border border-white/10 bg-slate-950/70 p-3 backdrop-blur-xl sm:w-[148px]"
          style={{ left: `${r.x}%`, top: `${r.y}%`, transform: "translate(-50%,-50%)" }}
          animate={reduce ? undefined : { y: [0, -12, 0] }}
          transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="mb-2 flex items-center gap-2">
            <Smartphone className="h-4 w-4" style={{ color: r.accent }} />
            <span className="text-xs font-black text-white">{r.role}</span>
          </div>
          <div className="space-y-1.5">
            {["Live sync", "Notifications", "AI updates"].map((row, j) => (
              <div key={j} className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full" style={{ background: r.accent }} />
                <span className="text-[9px] text-slate-400">{row}</span>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </ApexMorphActLayer>
  );
}

function WebLayer({ progress }) {
  const act = ACTS[5];
  return (
    <ApexMorphActLayer progress={progress} act={act} morph={{ enterY: 30, exitScale: 0.88 }}>
      <div className="absolute left-[8%] top-[18%] w-[200px] overflow-hidden rounded-2xl border border-emerald-300/20 bg-slate-950/80 shadow-2xl backdrop-blur-xl sm:w-[240px]">
        <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-red-400/70" />
          <span className="h-2 w-2 rounded-full bg-amber-400/70" />
          <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
        </div>
        <div className="p-4">
          <Globe className="mb-2 h-5 w-5 text-emerald-300" />
          <p className="text-xs font-bold text-white">Admissions Portal</p>
          <p className="mt-2 text-[10px] text-slate-400">Apply · Enroll · Grow</p>
        </div>
      </div>
      <div className="absolute right-[6%] top-[26%] rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-md">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Public Website</p>
        <p className="mt-1 text-sm font-black text-white">assps.edu.pk</p>
        <p className="mt-1 text-[9px] text-emerald-300/80">Live · Indexed · Growing</p>
      </div>
    </ApexMorphActLayer>
  );
}

function CommandLayer({ progress, reduce }) {
  const act = ACTS[6];
  const icons = [Activity, Wallet, Sparkles, Users];
  const positions = ["left-[5%] top-[18%]", "right-[5%] top-[22%]", "left-[7%] bottom-[26%]", "right-[7%] bottom-[22%]"];

  return (
    <ApexMorphActLayer progress={progress} act={act} morph={{ enterScale: 0.92 }}>
      {/* radar sweep */}
      {!reduce && (
        <motion.div
          className="absolute left-1/2 top-[42%] h-[50vmin] w-[50vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/10"
          style={{
            background: "conic-gradient(from 0deg, transparent 0deg, rgba(34,211,238,0.12) 40deg, transparent 80deg)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      )}
      <div className="absolute left-1/2 top-[42%] h-32 w-48 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-slate-950/50 backdrop-blur-md">
        <p className="border-b border-white/10 px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-cyan-200">
          Command Center
        </p>
        <div className="grid grid-cols-2 gap-2 p-2">
          {COMMAND_METRICS.slice(0, 4).map((m) => (
            <div key={m.label} className="rounded-lg bg-white/[0.04] px-2 py-1.5">
              <p className="text-[8px] text-slate-500">{m.label}</p>
              <p className="text-xs font-black text-white">{m.value}</p>
            </div>
          ))}
        </div>
      </div>
      {COMMAND_METRICS.map((m, i) => {
        const Icon = icons[i];
        return (
          <motion.div
            key={m.label}
            className={`absolute ${positions[i]} flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 backdrop-blur-xl`}
            animate={reduce ? undefined : { opacity: [0.65, 1, 0.65] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
          >
            <Icon className="h-4 w-4 text-cyan-300" />
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{m.label}</p>
              <p className="text-sm font-black text-white">{m.value}</p>
            </div>
          </motion.div>
        );
      })}
    </ApexMorphActLayer>
  );
}

function GalaxyLayer({ progress, reduce }) {
  const act = ACTS[7];
  const sysIcons = { "Apex OS": MonitorCog, "Apex Connect": Smartphone, "Apex Web": Globe, "Apex AI": BrainCircuit };
  const orbitSpin = useTransform(progress, [act.start, act.end], [0, -30]);

  return (
    <ApexMorphActLayer progress={progress} act={act} morph={{ enterScale: 0.75, exitScale: 0.7 }}>
      <motion.div
        className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2"
        style={{ rotate: reduce ? 0 : orbitSpin, width: "96vmin", height: "96vmin", maxWidth: 700, maxHeight: 700 }}
      >
        <div className="absolute inset-[8%] rounded-full border border-blue-300/15" />
        <div className="absolute inset-[18%] rounded-full border border-cyan-300/10" />
        <svg className="absolute inset-0 h-full w-full" aria-hidden>
          {GALAXY_SYSTEMS.map((sys) => {
            const rad = (sys.angle * Math.PI) / 180;
            const x = 50 + Math.cos(rad) * 40;
            const y = 50 + Math.sin(rad) * 40;
            return (
              <line key={sys.name} x1="50" y1="50" x2={x} y2={y} stroke={sys.color} strokeWidth="0.12" strokeOpacity="0.45" />
            );
          })}
        </svg>
        {GALAXY_SYSTEMS.map((sys, i) => {
          const rad = (sys.angle * Math.PI) / 180;
          const x = 50 + Math.cos(rad) * 40;
          const y = 50 + Math.sin(rad) * 40;
          const Icon = sysIcons[sys.name];
          return (
            <motion.div
              key={sys.name}
              className="absolute flex flex-col items-center gap-2"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
              animate={reduce ? undefined : { y: [0, i % 2 ? -10 : 10, 0] }}
              transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut" }}
            >
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-slate-950/80 backdrop-blur-xl"
                style={{ boxShadow: `0 0 28px ${sys.color}55` }}
              >
                <Icon className="h-6 w-6" style={{ color: sys.color }} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/85">{sys.name}</span>
            </motion.div>
          );
        })}
      </motion.div>
    </ApexMorphActLayer>
  );
}

function ParticleAct({ progress, act }) {
  const { input, output } = actLayerKeyframes(act);
  const opacity = useTransform(progress, input, output);
  return (
    <motion.div style={{ opacity }} className="absolute inset-0">
      <ApexParticleField
        mode={act.particle}
        color={act.id === "chaos" ? "#94a3b8" : act.id === "ai" ? "#fcd34d" : "#22d3ee"}
        accent="#c9a84c"
        density={act.id === "chaos" ? 0.85 : act.id === "ai" ? 1.2 : 1}
      />
    </motion.div>
  );
}

function TintAct({ progress, act }) {
  const { input, output } = actLayerKeyframes(act);
  const opacity = useTransform(progress, input, output);
  return (
    <motion.div style={{ opacity }} className="pointer-events-none absolute inset-0">
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse 80% 60% at 50% 45%, ${act.tint}, transparent 70%)` }}
      />
    </motion.div>
  );
}

function WorldEntryCTA({ progress }) {
  const opacity = useTransform(progress, [0.06, 0.1, 0.14], [0, 1, 0]);
  const y = useTransform(progress, [0.06, 0.1], [16, 0]);

  return (
    <motion.div
      style={{ opacity, y }}
      className="pointer-events-auto absolute right-4 top-[calc(5rem+12px)] z-40 hidden sm:block md:right-16"
    >
      <MagneticButton href="/apex/demo-request" variant="primary" className="!px-5 !py-2.5 !text-xs">
        Request Demo
      </MagneticButton>
    </motion.div>
  );
}

export default function ApexWorldStage({ onActChange }) {
  const reduce = useReducedMotion();
  const containerRef = useRef(null);
  const [currentActId, setCurrentActId] = useState("chaos");
  const [camera, setCamera] = useState(DESKTOP_CAMERA);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 28, restDelta: 0.0008 });

  useEffect(() => {
    const update = () => setCamera(getCameraProfile());
    update();
    const mq = window.matchMedia("(max-width: 768px)");
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const cameraY = useTransform(progress, camera.y, camera.yValues);
  const cameraScale = useTransform(progress, camera.scale, camera.scaleValues);
  const cameraRotateZ = useTransform(progress, camera.rotateZ, camera.rotateZValues);
  const cameraRotateX = useTransform(progress, camera.rotateX, camera.rotateXValues);
  const cameraX = useTransform(progress, camera.x, camera.xValues);
  const coreScale = useTransform(progress, camera.coreScale, camera.coreScaleValues);
  const coreOpacity = useTransform(progress, [0, 0.04, 0.98, 1], [0.2, 1, 1, 0.92]);
  const coreGlow = useTransform(
    progress,
    [0, 0.115, 0.345, 0.69, 0.805],
    [
      "0 0 40px rgba(180,60,60,0.2), 0 0 80px rgba(180,60,60,0.08)",
      "0 0 90px rgba(201,168,76,0.45), 0 0 150px rgba(201,168,76,0.18)",
      "0 0 130px rgba(34,211,238,0.55), 0 0 220px rgba(34,211,238,0.22)",
      "0 0 100px rgba(34,211,238,0.4), 0 0 180px rgba(34,211,238,0.15)",
      "0 0 170px rgba(59,130,246,0.5), 0 0 260px rgba(59,130,246,0.2)",
    ]
  );

  const hudOpacity = useTransform(progress, [0, 0.02], [0, 1]);
  const scrollCueOpacity = useTransform(progress, [0, 0.05, 0.1], [1, 1, 0]);
  const actLabel = useTransform(progress, (v) => {
    const act = ACTS.find((a) => v >= a.start && v < a.end) || ACTS[ACTS.length - 1];
    return `Act ${act.act} · ${act.label}`;
  });

  useMotionValueEvent(progress, "change", (v) => {
    const act = ACTS.find((a) => v >= a.start && v < a.end) || ACTS[ACTS.length - 1];
    setCurrentActId((prev) => (prev === act.id ? prev : act.id));
    onActChange?.(act.id);
  });

  return (
    <div
      ref={containerRef}
      className="apex-universe-scroll relative"
      style={{ height: `${camera.scrollVh}vh` }}
    >
      {ACTS.map((act) =>
        act.marker && act.marker !== "top" ? (
          <div
            key={act.marker}
            id={act.marker}
            className="pointer-events-none absolute left-0 h-px w-px"
            style={{ top: `${act.start * 100}%` }}
            aria-hidden
          />
        ) : null
      )}
      <div id="top" className="pointer-events-none absolute left-0 top-0 h-px w-px" aria-hidden />

      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden">
        <motion.div
          className="relative h-full w-full"
          style={{
            x: reduce ? 0 : cameraX,
            y: reduce ? 0 : cameraY,
            scale: reduce ? 1 : cameraScale,
            rotateZ: reduce ? 0 : cameraRotateZ,
            rotateX: reduce ? 0 : cameraRotateX,
            transformPerspective: 1400,
            transformStyle: "preserve-3d",
          }}
        >
          <ApexWorldDepth progress={progress} reduce={reduce} />

          {ACTS.map((act) => (
            <TintAct key={`tint-${act.id}`} progress={progress} act={act} />
          ))}

          {!reduce &&
            ACTS.map((act) => (
              <ParticleAct key={act.id} progress={progress} act={act} />
            ))}

          <ChaosLayer progress={progress} reduce={reduce} />
          <AwakeningLayer progress={progress} reduce={reduce} />
          <OSModulesLayer progress={progress} reduce={reduce} />
          <AILayer progress={progress} reduce={reduce} />
          <ConnectLayer progress={progress} reduce={reduce} />
          <WebLayer progress={progress} />
          <CommandLayer progress={progress} reduce={reduce} />
          <GalaxyLayer progress={progress} reduce={reduce} />

          <motion.div
            className="pointer-events-none absolute left-1/2 top-[42%] z-20 -translate-x-1/2 -translate-y-1/2"
            style={{ scale: coreScale, opacity: coreOpacity, boxShadow: coreGlow }}
          >
            <ApexCoreEngine
              className="h-[min(72vmin,520px)] w-[min(72vmin,520px)]"
              intensity={reduce ? "calm" : "full"}
            />
          </motion.div>

          <ApexNarrativeDirector progress={progress} reduce={reduce} />
          <ApexConvergeCTA progress={progress} />
          <WorldEntryCTA progress={progress} />

          <motion.div
            style={{ opacity: hudOpacity }}
            className="pointer-events-none absolute left-4 top-[calc(5rem+8px)] z-40 hidden flex-col gap-1 sm:flex"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-200/40">
              Camera · travelling
            </span>
            <motion.span className="font-mono text-[10px] tracking-wide text-amber-200/60">
              {actLabel}
            </motion.span>
          </motion.div>

          <motion.div
            style={{ opacity: scrollCueOpacity }}
            className="pointer-events-none absolute bottom-8 left-1/2 z-40 -translate-x-1/2 text-center"
          >
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.35em] text-slate-500">
              Scroll to travel deeper
            </p>
            <div className="mx-auto flex h-9 w-5 items-start justify-center rounded-full border border-white/15 p-1">
              <motion.span
                className="h-2 w-1 rounded-full bg-cyan-300"
                animate={reduce ? undefined : { y: [0, 10, 0], opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>

      <ApexJourneyRail progress={progress} currentActId={currentActId} />
    </div>
  );
}
