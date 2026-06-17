"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import ApexCardLoaderLines from "./ApexCardLoaderLines";

const products = [
  {
    id: "os",
    name: "Apex OS",
    tag: "School Admin SaaS",
    desc: "Complete control for owners and admins — students, fees, exams, analytics.",
    href: "https://app.assps.edu.pk",
    loader: [86, 72, 94],
    live: true,
  },
  {
    id: "connect",
    name: "Apex Connect",
    tag: "Teacher · Parent · Student",
    desc: "Role-based portals with homework, attendance, and monthly AI reports.",
    href: "https://api.assps.edu.pk/login",
    loader: [78, 88, 66],
    live: true,
  },
  {
    id: "web",
    name: "Apex Web",
    tag: "Public presence",
    desc: "Your school story, admissions, and trust — connected to the ecosystem.",
    href: "https://www.assps.edu.pk",
    loader: [70, 80, 76],
    live: true,
  },
];

export default function ApexProductsStrip() {
  return (
    <section id="products" className="relative scroll-mt-28 px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-14 max-w-3xl text-center"
        >
          <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-100">
            Product ecosystem
          </div>
          <h2 className="text-3xl font-black text-white sm:text-4xl md:text-5xl">Three surfaces. One intelligence.</h2>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-3">
          {products.map((p, index) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <Link
                  href={p.href}
                  className="cinematic-card group flex h-full flex-col rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl transition hover:border-cyan-300/30"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-200/80">{p.tag}</p>
                    {p.live && (
                      <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                        Live
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-white">{p.name}</h3>
                  <p className="mt-3 flex-1 text-sm leading-7 text-slate-400">{p.desc}</p>
                  <ApexCardLoaderLines widths={p.loader} className="mt-4" loop />
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-cyan-200">
                    Open <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
