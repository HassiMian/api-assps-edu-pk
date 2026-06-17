"use client";

/**
 * Chapter 08 — Living Education Galaxy™
 * Central APEX sun + four orbiting worlds + energy stream connections.
 * Official logo only — no generated branding.
 */

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { MonitorCog, Smartphone, Globe, BrainCircuit, ArrowUpRight } from "lucide-react";
import ApexParticleField from "./ApexParticleField";
import ApexCelestialSurface from "./ApexCelestialSurface";
import { ApexCoreSphere } from "./ApexUniversePrimitives";

const BOX = 800;
const CENTER = BOX / 2;
const ORBIT_R = BOX * 0.46;
const ORBIT_SECONDS = 140;

const WORLDS = [
  {
    id: "os",
    name: "Apex OS",
    tag: "School Management SaaS",
    icon: MonitorCog,
    href: "https://app.assps.edu.pk",
    angle: -Math.PI * 0.72,
    color: "#60a5fa",
    glow: "from-blue-500/40",
    text: "text-blue-200",
    float: -8,
  },
  {
    id: "connect",
    name: "Apex Connect",
    tag: "Parent · Teacher · Student",
    icon: Smartphone,
    href: "https://api.assps.edu.pk/login",
    angle: -Math.PI * 0.28,
    color: "#22d3ee",
    glow: "from-cyan-500/40",
    text: "text-cyan-200",
    float: 10,
  },
  {
    id: "web",
    name: "Apex Web",
    tag: "Website + Admissions",
    icon: Globe,
    href: "https://www.assps.edu.pk",
    angle: Math.PI * 0.72,
    color: "#34d399",
    glow: "from-emerald-500/40",
    text: "text-emerald-200",
    float: 8,
  },
  {
    id: "ai",
    name: "Apex AI",
    tag: "Intelligence everywhere",
    icon: BrainCircuit,
    href: "#scene-ai",
    angle: Math.PI * 0.28,
    color: "#fbbf24",
    glow: "from-amber-500/40",
    text: "text-amber-200",
    float: -10,
  },
];

function worldPos(angle) {
  return {
    x: CENTER + Math.cos(angle) * ORBIT_R,
    y: CENTER + Math.sin(angle) * ORBIT_R,
  };
}

function energyPath(angle, i) {
  const { x, y } = worldPos(angle);
  const wobble = (i % 2 === 0 ? 1 : -1) * 24;
  const c1x = CENTER + (x - CENTER) * 0.2 + wobble;
  const c1y = CENTER + (y - CENTER) * 0.2 - wobble * 0.45;
  const c2x = CENTER + (x - CENTER) * 0.52 - wobble * 0.35;
  const c2y = CENTER + (y - CENTER) * 0.52 + wobble * 0.3;
  const forkX = CENTER + (x - CENTER) * 0.7 + Math.sin(angle * 2.5) * 14;
  const forkY = CENTER + (y - CENTER) * 0.7 + Math.cos(angle * 2.5) * 10;
  return {
    x,
    y,
    d: `M${CENTER},${CENTER} C${c1x},${c1y} ${c2x},${c2y} ${forkX},${forkY} T${x},${y}`,
  };
}

export default function ApexSceneGalaxy() {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "center 0.4"] });
  const grow = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const streams = WORLDS.map((w, i) => energyPath(w.angle, i));
  const orbitSecs = reduce ? ORBIT_SECONDS * 2.5 : ORBIT_SECONDS;

  return (
    <section
      id="scene-galaxy"
      ref={ref}
      className="apex-scene apex-galaxy-scene relative flex min-h-[100dvh] scroll-mt-24 items-center overflow-x-clip py-20 pb-36 sm:py-24 sm:pb-40"
    >
      <ApexParticleField mode="orbit" color="#22d3ee" accent="#c9a84c" density={0.85} />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mx-auto mb-8 max-w-3xl text-center md:mb-10"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-amber-100">
            Chapter 08 · Living Education Galaxy™
          </div>
          <h2 className="bg-gradient-to-r from-amber-200 via-white to-cyan-200 bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-4xl md:text-6xl">
            One galaxy. Four worlds. One Core.
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-300 md:text-lg">
            Apex OS, Apex Connect, Apex Web and Apex AI orbit the living APEX sun — connected by
            intelligent energy streams across the education universe.
          </p>
        </motion.div>

        <div className="relative mx-auto hidden w-full max-w-[800px] lg:block">
          <div className="relative mx-auto aspect-square w-full">
            {/* orbital whisper ring */}
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 rounded-full border border-white/[0.06]"
              style={{
                width: `${(ORBIT_R * 2 / BOX) * 100}%`,
                height: `${(ORBIT_R * 2 / BOX) * 100}%`,
                transform: "translate(-50%, -50%)",
                boxShadow: "0 0 80px rgba(34,211,238,0.06), inset 0 0 60px rgba(201,168,76,0.04)",
              }}
            />

            <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${BOX} ${BOX}`} aria-hidden>
              <defs>
                <filter id="galaxy-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                {streams.map((s, i) => (
                  <linearGradient
                    key={i}
                    id={`galaxy-energy-${i}`}
                    gradientUnits="userSpaceOnUse"
                    x1={CENTER}
                    y1={CENTER}
                    x2={s.x}
                    y2={s.y}
                  >
                    <stop offset="0%" stopColor="#c9a84c" stopOpacity="1" />
                    <stop offset="35%" stopColor={WORLDS[i].color} stopOpacity="0.85" />
                    <stop offset="100%" stopColor={WORLDS[i].color} stopOpacity="0.15" />
                  </linearGradient>
                ))}
              </defs>

              {streams.map((s, i) => (
                <g key={WORLDS[i].id} filter="url(#galaxy-glow)">
                  <motion.path
                    d={s.d}
                    fill="none"
                    stroke={`url(#galaxy-energy-${i})`}
                    strokeWidth="3"
                    strokeLinecap="round"
                    style={{ pathLength: reduce ? 1 : grow }}
                  />
                  <motion.path
                    d={s.d}
                    fill="none"
                    stroke={WORLDS[i].color}
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeDasharray="6 14"
                    animate={reduce ? undefined : { strokeDashoffset: [0, -40] }}
                    transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, ease: "linear" }}
                    opacity={0.5}
                  />
                  {!reduce && (
                    <>
                      <circle r="5" fill={WORLDS[i].color} opacity="0.9">
                        <animateMotion dur={`${2.8 + i * 0.4}s`} repeatCount="indefinite" path={s.d} />
                      </circle>
                      <circle r="3" fill="#fff" opacity="0.7">
                        <animateMotion
                          dur={`${3.6 + i * 0.5}s`}
                          repeatCount="indefinite"
                          path={s.d}
                          begin={`${0.8 + i * 0.2}s`}
                        />
                      </circle>
                    </>
                  )}
                </g>
              ))}
            </svg>

            {/* APEX sun */}
            <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
              <ApexCoreSphere size={228} logoFill={0.72} intensity="calm" />
            </div>

            {/* orbiting worlds */}
            <motion.div
              className="absolute inset-0"
              animate={reduce ? undefined : { rotate: 360 }}
              transition={{ duration: orbitSecs, repeat: Infinity, ease: "linear" }}
            >
              {WORLDS.map((w, i) => {
                const { x, y } = streams[i];
                const Icon = w.icon;
                const isExternal = w.href.startsWith("http");
                const Wrapper = isExternal ? "a" : Link;
                const wrapperProps = isExternal
                  ? { href: w.href, target: "_blank", rel: "noopener noreferrer" }
                  : { href: w.href };

                return (
                  <div
                    key={w.id}
                    className="absolute z-30 w-[152px] sm:w-[176px]"
                    style={{
                      left: `${(x / BOX) * 100}%`,
                      top: `${(y / BOX) * 100}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <motion.div
                      animate={reduce ? undefined : { rotate: -360 }}
                      transition={{ duration: orbitSecs, repeat: Infinity, ease: "linear" }}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.82 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <motion.div
                          animate={
                            reduce
                              ? undefined
                              : { y: [0, w.float, 0], rotateZ: [-1.5, 1.5, -1.5] }
                          }
                          transition={{
                            y: { duration: 5.5 + i * 0.7, repeat: Infinity, ease: "easeInOut" },
                            rotateZ: { duration: 7 + i, repeat: Infinity, ease: "easeInOut" },
                          }}
                          whileHover={reduce ? undefined : { scale: 1.04 }}
                        >
                        <Wrapper
                          {...wrapperProps}
                          className="apex-world-card group relative block overflow-hidden rounded-[1.5rem] border border-white/12 bg-slate-950/65 p-4 text-left no-underline shadow-2xl backdrop-blur-xl sm:p-5"
                        >
                          <div className={`pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br ${w.glow} to-transparent blur-2xl`} />
                          <div className="relative z-10">
                            <div className="mb-3 flex items-center gap-3">
                              <div
                                className="apex-galaxy-planet relative shrink-0"
                                style={{ width: 52, height: 52, "--planet-accent": w.color }}
                              >
                                <ApexCelestialSurface variant="moon" accent={w.color} />
                              </div>
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] ${w.text}`}
                                style={{ boxShadow: `0 0 20px ${w.color}35` }}
                              >
                                <Icon size={18} strokeWidth={2.25} />
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-sm font-black text-white sm:text-base">{w.name}</h3>
                              <ArrowUpRight className="h-3.5 w-3.5 text-cyan-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </div>
                            <p className="mt-1 text-[11px] leading-4 text-slate-400">{w.tag}</p>
                          </div>
                        </Wrapper>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>

        <div className="lg:hidden">
          <div className="mx-auto mb-8 flex justify-center">
            <ApexCoreSphere size={180} logoFill={0.72} intensity="calm" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {WORLDS.map((w, i) => {
              const Icon = w.icon;
              const isExternal = w.href.startsWith("http");
              const Wrapper = isExternal ? "a" : Link;
              const wrapperProps = isExternal
                ? { href: w.href, target: "_blank", rel: "noopener noreferrer" }
                : { href: w.href };

              return (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: i * 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Wrapper
                    {...wrapperProps}
                    className="apex-world-card group relative block overflow-hidden rounded-[1.35rem] border border-white/12 bg-slate-950/65 p-4 text-left no-underline shadow-xl backdrop-blur-xl"
                  >
                    <div
                      className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${w.glow} to-transparent blur-2xl`}
                    />
                    <div className="relative z-10">
                      <div className="mb-3 flex items-center gap-3">
                        <div
                          className="apex-galaxy-planet relative shrink-0"
                          style={{ width: 44, height: 44, "--planet-accent": w.color }}
                        >
                          <ApexCelestialSurface variant="moon" accent={w.color} />
                        </div>
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] ${w.text}`}
                          style={{ boxShadow: `0 0 16px ${w.color}35` }}
                        >
                          <Icon size={16} strokeWidth={2.25} />
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-black text-white">{w.name}</h3>
                        <ArrowUpRight className="h-3.5 w-3.5 text-cyan-300" />
                      </div>
                      <p className="mt-1 text-[11px] leading-4 text-slate-400">{w.tag}</p>
                    </div>
                  </Wrapper>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
