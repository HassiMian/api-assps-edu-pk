"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import {
  NotebookPen,
  MessageCircle,
  ClipboardList,
  Receipt,
  Table2,
  BookMarked,
  AlertTriangle,
} from "lucide-react";
import ApexParticleField from "./ApexParticleField";

const CHAOS = [
  { icon: NotebookPen, label: "Manual Registers", note: "Hand-written, lost, illegible", rot: -8, x: "4%", y: "12%", d: 0 },
  { icon: MessageCircle, label: "WhatsApp Groups", note: "200 unread, no records", rot: 6, x: "62%", y: "8%", d: 0.1 },
  { icon: ClipboardList, label: "Attendance Sheets", note: "Re-counted every morning", rot: -4, x: "30%", y: "30%", d: 0.18 },
  { icon: Receipt, label: "Fee Registers", note: "Who paid? Nobody knows", rot: 9, x: "70%", y: "44%", d: 0.26 },
  { icon: Table2, label: "Excel Files", note: "12 versions, all wrong", rot: -10, x: "8%", y: "56%", d: 0.34 },
  { icon: BookMarked, label: "Paper Diaries", note: "Copied by hand, daily", rot: 5, x: "46%", y: "62%", d: 0.42 },
];

export default function ApexSceneChaos() {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const fade = useTransform(scrollYProgress, [0.55, 0.95], [1, 0.15]);

  return (
    <section
      id="scene-chaos"
      ref={ref}
      className="apex-scene relative flex min-h-[100dvh] scroll-mt-24 items-center overflow-hidden bg-[#05070f] py-24"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,30,30,0.18),transparent_60%)]" />
      <ApexParticleField mode="chaos" color="#94a3b8" accent="#b45309" density={0.9} />

      <motion.div style={{ opacity: reduce ? 1 : fade }} className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="mx-auto mb-12 max-w-3xl text-center md:mb-16">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-400/25 bg-red-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-red-200">
            <AlertTriangle className="h-4 w-4" /> Scene 01 · Before APEX
          </div>
          <h2 className="text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl md:text-6xl">
            Schools run on scattered chaos
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-400 md:text-lg">
            Registers, WhatsApp groups, attendance sheets, fee books, Excel files, paper diaries —
            disconnected, fragile, and impossible to trust.
          </p>
        </div>

        <div className="relative mx-auto h-[520px] max-w-5xl sm:h-[440px]">
          {CHAOS.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                className="absolute w-[200px]"
                style={{ left: item.x, top: item.y }}
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: item.d, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div
                  className="apex-chaos-card rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md"
                  style={{ rotate: `${item.rot}deg` }}
                  animate={reduce ? undefined : { y: [0, item.rot > 0 ? -12 : 12, 0] }}
                  transition={{ duration: 5 + item.d * 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-200 ring-1 ring-red-400/20">
                    <Icon size={18} />
                  </div>
                  <p className="text-sm font-black text-white">{item.label}</p>
                  <p className="mt-1 text-[11px] leading-5 text-slate-400">{item.note}</p>
                  <div className="mt-3 flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400/70" />
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400/60" />
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-500/50" />
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mx-auto mt-8 max-w-xl text-center text-sm font-bold uppercase tracking-[0.3em] text-slate-500"
        >
          There has to be a better way ↓
        </motion.p>
      </motion.div>
    </section>
  );
}
