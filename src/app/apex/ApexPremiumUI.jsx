"use client";

import React, { useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";

const easePremium = [0.22, 1, 0.36, 1];

export function StaggerTagline({ words = ["Learn", "Grow", "Lead", "Transform"], className = "" }) {
  return (
    <p className={`flex flex-wrap items-center justify-start gap-x-2 gap-y-1 text-sm font-bold uppercase tracking-[0.28em] text-amber-200/90 md:text-base ${className}`}>
      {words.map((word, index) => (
        <React.Fragment key={word}>
          <motion.span
            initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.72 + index * 0.11, duration: 0.55, ease: easePremium }}
            className="inline-block"
          >
            {word}
          </motion.span>
          {index < words.length - 1 && (
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.78 + index * 0.11, duration: 0.35 }}
              className="text-cyan-300/50"
              aria-hidden
            >
              •
            </motion.span>
          )}
        </React.Fragment>
      ))}
    </p>
  );
}

export function MagneticButton({
  href,
  children,
  variant = "primary",
  className = "",
  external = false,
  onClick,
}) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 320, damping: 22 });
  const springY = useSpring(y, { stiffness: 320, damping: 22 });

  const onMove = useCallback(
    (event) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      x.set((event.clientX - rect.left - rect.width / 2) * 0.18);
      y.set((event.clientY - rect.top - rect.height / 2) * 0.18);
    },
    [x, y]
  );

  const onLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  const base =
    "apex-magnetic-btn group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3.5 text-sm font-black transition-shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 md:px-7 md:py-4 md:text-base";

  const variants = {
    primary:
      "bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 text-white shadow-[0_0_40px_rgba(34,211,238,0.25)] hover:shadow-[0_0_55px_rgba(34,211,238,0.4)]",
    secondary:
      "border border-white/15 bg-white/[0.06] text-white backdrop-blur-xl hover:border-cyan-300/35 hover:bg-white/[0.1]",
    whatsapp:
      "border border-emerald-400/25 bg-emerald-500/15 text-emerald-50 backdrop-blur-xl hover:bg-emerald-500/25",
  };

  const inner = (
    <motion.span
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
      whileTap={{ scale: 0.97 }}
    >
      <span className="apex-btn-ripple" aria-hidden />
      <span className="apex-btn-glow" aria-hidden />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.span>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="border-0 bg-transparent p-0">
        {inner}
      </button>
    );
  }

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="no-underline">
        {inner}
      </a>
    );
  }

  return (
    <Link href={href || "#"} className="no-underline">
      {inner}
    </Link>
  );
}

export function HeroMouseAtmosphere() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smoothX = useSpring(mx, { stiffness: 40, damping: 18 });
  const smoothY = useSpring(my, { stiffness: 40, damping: 18 });

  const onMove = useCallback(
    (e) => {
      const w = typeof window !== "undefined" ? window.innerWidth : 1;
      const h = typeof window !== "undefined" ? window.innerHeight : 1;
      mx.set((e.clientX / w - 0.5) * 48);
      my.set((e.clientY / h - 0.5) * 48);
    },
    [mx, my]
  );

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      onMouseMove={onMove}
      aria-hidden
    >
      <motion.div
        style={{ x: smoothX, y: smoothY }}
        className="absolute -left-[20%] top-[8%] h-[55vh] w-[55vh] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.35),transparent_68%)] blur-3xl"
      />
      <motion.div
        style={{ x: smoothX, y: smoothY }}
        className="absolute -right-[15%] top-[12%] h-[50vh] w-[50vh] rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.22),transparent_70%)] blur-3xl"
      />
      <motion.div
        animate={{ opacity: [0.35, 0.65, 0.35] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-[linear-gradient(105deg,transparent_42%,rgba(255,255,255,0.04)_50%,transparent_58%)]"
      />
      {[...Array(24)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-cyan-200/40"
          style={{
            left: `${(i * 17) % 100}%`,
            top: `${(i * 23) % 100}%`,
          }}
          animate={{ y: [0, -12 - (i % 5) * 4, 0], opacity: [0.2, 0.9, 0.2] }}
          transition={{ duration: 4 + (i % 6), repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

export function GlassTiltCard({ children, className = "" }) {
  const ref = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${py * -10}deg) rotateY(${px * 10}deg) translateY(-8px)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "";
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`apex-glass-card ${className}`}
    >
      {children}
    </div>
  );
}
