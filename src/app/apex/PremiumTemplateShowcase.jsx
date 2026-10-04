"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { FileStack, Sparkles, Layers, Globe, FileDown } from "lucide-react";
import { CLASSIC_TEMPLATES } from "@/components/PaperGeneratorSaaS/templatePickerData";
import { PREMIUM_TEMPLATE_PICKER } from "@/components/PaperGeneratorSaaS/templates/premium/PremiumTemplates";

function TemplateThumb({ template, active, onSelect }) {
  const thumb = template.thumb || {};
  const paper = thumb.paper || "#fff";
  const header = thumb.header || "#1a237e";
  const accent = thumb.accent || "#1a237e";
  const logoPos = thumb.logo || "center";

  return (
    <button
      type="button"
      onClick={() => onSelect(template.id)}
      className="group flex flex-col gap-3 rounded-2xl border p-4 text-left transition duration-200 ease-out"
      style={{
        borderColor: active ? "rgba(201,168,76,0.55)" : "rgba(255,255,255,0.1)",
        background: active ? "rgba(201,168,76,0.08)" : "rgba(255,255,255,0.04)",
        transform: active ? "translateY(-2px)" : undefined,
      }}
    >
      <div
        className="relative mx-auto overflow-hidden rounded-lg border shadow-lg"
        style={{
          width: 72,
          height: 96,
          borderColor: `${accent}33`,
        }}
      >
        {template.preview ? (
          <img
            src={template.preview}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <>
        {thumb.bar && (
          <div className="absolute bottom-0 left-0 top-0 w-1" style={{ background: accent }} />
        )}
        {thumb.headerBand && header !== paper ? (
          <div className="flex h-5 items-center gap-1 px-1.5" style={{ background: header }}>
            {logoPos === "left" && (
              <div className="h-2.5 w-2.5 rounded-sm opacity-90" style={{ background: accent }} />
            )}
            <div className="h-0.5 flex-1 rounded bg-white/50" />
          </div>
        ) : header !== paper ? (
          <div className="h-1 opacity-90" style={{ background: header }} />
        ) : null}
        {logoPos === "center" && (
          <div className="mt-2 flex justify-center">
            <div className="h-3.5 w-3.5 rounded-sm opacity-85" style={{ background: accent }} />
          </div>
        )}
        <div className="grid gap-1 px-2 py-2">
          <div className="h-0.5 rounded opacity-35" style={{ background: accent }} />
          <div className="h-0.5 w-[85%] rounded opacity-20" style={{ background: accent }} />
          <div className="h-0.5 w-[70%] rounded opacity-20" style={{ background: accent }} />
        </div>
          </>
        )}
      </div>
      <div>
        <div className={`text-sm font-bold leading-tight ${active ? "text-amber-200" : "text-white"}`}>
          {template.label || template.name}
        </div>
        <div className="mt-1 text-xs leading-5 text-slate-400">{template.desc || template.code}</div>
      </div>
    </button>
  );
}

const STUDIO_FEATURES = [
  { icon: Layers, label: "16 templates", detail: "6 classic + 10 premium institutional" },
  { icon: FileDown, label: "Real DOCX export", detail: "Paper, answer key & marking scheme" },
  { icon: FileStack, label: "Multi-set papers", detail: "Up to 5 shuffled sets A–E" },
  { icon: Globe, label: "Online exam publish", detail: "One-click student delivery link" },
];

export default function PremiumTemplateShowcase() {
  const reduce = useReducedMotion();
  const [activeId, setActiveId] = useState(PREMIUM_TEMPLATE_PICKER[0]?.id || "classic");
  const showcase = [...CLASSIC_TEMPLATES.slice(0, 3), ...PREMIUM_TEMPLATE_PICKER.slice(0, 9)];
  const active = showcase.find((t) => t.id === activeId) || showcase[0];

  return (
    <section
      id="paper-studio"
      className="apex-scene relative scroll-mt-24 overflow-x-clip py-24 sm:py-32"
    >
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-14 max-w-3xl text-center md:mb-16"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-100">
            <Sparkles className="h-4 w-4" /> Paper Generator Studio
          </div>
          <h2 className="bg-gradient-to-r from-cyan-200 via-white to-amber-200 bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-4xl md:text-5xl">
            Print-perfect papers. Enterprise-grade.
          </h2>
          <p className="mt-5 text-base leading-7 text-slate-300 md:text-lg">
            Board-pattern layouts, bilingual blocks, AI import review, and real Word exports — built for schools that take exams seriously.
          </p>
        </motion.div>

        <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STUDIO_FEATURES.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
              >
                <Icon className="h-5 w-5 text-cyan-300" />
                <div className="mt-3 text-sm font-bold text-white">{item.label}</div>
                <div className="mt-1 text-xs leading-6 text-slate-400">{item.detail}</div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-3 sm:grid-cols-3"
          >
            {showcase.map((template, i) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
              >
                <TemplateThumb
                  template={template}
                  active={activeId === template.id}
                  onSelect={setActiveId}
                />
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-[1.75rem] border border-amber-300/20 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-8 backdrop-blur-xl"
          >
            {!reduce && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[conic-gradient(from_0deg,transparent,rgba(201,168,76,0.25),transparent)] blur-xl"
              />
            )}
            <div className="relative">
              <div className="text-xs font-black uppercase tracking-[0.2em] text-amber-200/80">Selected template</div>
              <h3 className="mt-3 text-2xl font-black text-white">{active?.label || active?.name}</h3>
              <p className="mt-3 max-w-[65ch] text-sm leading-7 text-slate-300">
                {active?.desc || "Institutional examination layout with logo placement, section dividers, and print-safe typography."}
              </p>
              <ul className="mt-6 space-y-3 text-sm text-slate-300">
                {[
                  "Smart paste + AI gap-fill from question bank",
                  "Confidence review queue for imported items",
                  "Bilingual EN/Urdu blocks in document editor",
                  "Publish selected MCQ + short/long as online exam",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
                    {line}
                  </li>
                ))}
              </ul>
              <Link
                href="/apex/demo-request"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-amber-300 px-6 py-3 text-sm font-black text-slate-950 transition hover:opacity-90"
              >
                Request studio demo
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
