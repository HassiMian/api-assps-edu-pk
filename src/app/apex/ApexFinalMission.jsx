"use client";

import { motion } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";
import { MagneticButton } from "./ApexPremiumUI";
import { apexWhatsAppUrl } from "./apexContact";

export default function ApexFinalMission() {
  return (
    <section id="request-demo" className="relative scroll-mt-28 px-4 py-20 sm:px-6 md:py-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="apex-final-mission-panel relative mx-auto max-w-7xl overflow-hidden rounded-[1.75rem] p-6 text-center sm:rounded-[2rem] sm:p-8 md:p-14"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(34,211,238,0.08),transparent_70%)]" />
        <div className="relative z-10 mx-auto max-w-3xl">
          <img
            src="/apex-logo-full.png"
            alt="APEX Education OS"
            className="mx-auto mb-6 h-14 w-auto max-w-[min(100%,320px)] object-contain opacity-95 sm:h-16"
          />
          <div className="mx-auto mb-5 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-100/90">
            Final mission
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
            Ready to transform your school?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-300">
            Request a SaaS demo, talk to our team on WhatsApp, or open the login gateway for your role.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
            <MagneticButton href="/apex/demo-request" variant="primary">
              Request SaaS Demo <ArrowRight className="h-5 w-5" />
            </MagneticButton>
            <MagneticButton
              href={apexWhatsAppUrl("Hello APEX team, I want a school demo.")}
              variant="whatsapp"
              external
            >
              <MessageCircle className="h-5 w-5" /> WhatsApp Support
            </MagneticButton>
            <MagneticButton href="/gateway" variant="secondary">
              Login Gateway
            </MagneticButton>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
