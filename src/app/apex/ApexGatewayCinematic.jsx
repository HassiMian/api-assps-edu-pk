"use client";

/**
 * APEX Gateway — Cinematic Landing
 * Active visual version: E — Unified Navy + Celestial Realism + Production Flow
 * @see apexUniverseDesign.js (Versions A/B archived in presets)
 */

import { useState } from "react";
import dynamic from "next/dynamic";
import ApexCinematicBackground from "./ApexCinematicBackground";
import ApexCinematicNavbar from "./ApexCinematicNavbar";
import ApexFilmHero from "./ApexFilmHero";
import ApexSceneAwakening from "./ApexSceneAwakening";
import ApexFinalMission from "./ApexFinalMission";
import ApexStormIntro from "./ApexStormIntro";
import ApexScrollProgress from "./ApexScrollProgress";
import ApexSceneReveal from "./ApexSceneReveal";

function SectionSkeleton({ label }) {
  return (
    <div
      className="flex min-h-[36vh] flex-col items-center justify-center gap-4 px-4 py-16"
      aria-busy="true"
      aria-label={`Loading ${label}`}
    >
      <div className="h-10 w-56 max-w-full animate-pulse rounded-full bg-white/10" />
      <div className="h-4 w-72 max-w-full animate-pulse rounded-full bg-white/5" />
    </div>
  );
}

const ApexCoreConstellation = dynamic(() => import("./ApexCoreConstellation"), {
  loading: () => <SectionSkeleton label="APEX OS Core" />,
});
const ApexSceneAI = dynamic(() => import("./ApexSceneAI"), {
  loading: () => <SectionSkeleton label="AI awakening" />,
});
const ApexSceneSuperApp = dynamic(() => import("./ApexSceneSuperApp"), {
  loading: () => <SectionSkeleton label="Super app universe" />,
});
const ApexSceneWeb = dynamic(() => import("./ApexSceneWeb"), {
  loading: () => <SectionSkeleton label="APEX Web" />,
});
const ApexSceneCommandCenter = dynamic(() => import("./ApexSceneCommandCenter"), {
  loading: () => <SectionSkeleton label="Command center" />,
});
const ApexSceneGalaxy = dynamic(() => import("./ApexSceneGalaxy"), {
  loading: () => <SectionSkeleton label="Education galaxy" />,
});
const ApexSceneConverge = dynamic(() => import("./ApexSceneConverge"), {
  loading: () => <SectionSkeleton label="Final convergence" />,
});
const ApexPricingPlans = dynamic(() => import("./ApexPricingPlans"), {
  loading: () => <SectionSkeleton label="Subscription plans" />,
});

function ApexCinematicFooter() {
  const links = [
    { label: "Features", href: "/apex/features" },
    { label: "Pricing", href: "/apex/pricing" },
    { label: "Enterprise", href: "/apex/enterprise" },
    { label: "Demo", href: "/apex/demo-request" },
    { label: "Contact", href: "/apex/contact" },
    { label: "Privacy", href: "/apex/privacy-policy" },
    { label: "Terms", href: "/apex/terms" },
  ];

  return (
    <footer className="relative border-t border-white/10 px-4 py-12 text-center sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-slate-400">
        {links.map((item) => (
          <a key={item.href} href={item.href} className="transition hover:text-cyan-200">
            {item.label}
          </a>
        ))}
      </div>
      <p className="mx-auto mt-6 max-w-xl text-xs text-slate-500">
        © {new Date().getFullYear()} APEX Education OS · Al Siddique School System
      </p>
    </footer>
  );
}

export default function ApexGatewayCinematic() {
  const [cinemaDone, setCinemaDone] = useState(false);

  return (
    <div id="top" className="apex-page relative min-h-[100dvh] overflow-x-hidden bg-transparent text-white">
      <ApexStormIntro onComplete={() => setCinemaDone(true)} />
      <ApexCinematicBackground />
      <div
        className="transition-opacity duration-700"
        style={{ opacity: cinemaDone ? 1 : 0, pointerEvents: cinemaDone ? "auto" : "none" }}
      >
        <ApexScrollProgress />
        <ApexCinematicNavbar />
      </div>
      <main
        className="relative z-10 w-full max-w-[100vw] transition-opacity duration-1000"
        style={{ opacity: cinemaDone ? 1 : 0 }}
      >
        <ApexSceneReveal chapter={0}>
          <ApexFilmHero />
        </ApexSceneReveal>
        <ApexSceneReveal chapter={1}>
          <ApexSceneAwakening />
        </ApexSceneReveal>
        <ApexSceneReveal chapter={2}>
          <ApexCoreConstellation />
        </ApexSceneReveal>
        <ApexSceneReveal chapter={3}>
          <ApexSceneAI />
        </ApexSceneReveal>
        <ApexSceneReveal chapter={4}>
          <ApexSceneSuperApp />
        </ApexSceneReveal>
        <ApexSceneReveal chapter={5}>
          <ApexSceneWeb />
        </ApexSceneReveal>
        <ApexSceneReveal chapter={6}>
          <ApexSceneCommandCenter />
        </ApexSceneReveal>
        <ApexSceneReveal chapter={7}>
          <ApexSceneGalaxy />
        </ApexSceneReveal>
        <ApexSceneReveal chapter={8}>
          <ApexSceneConverge />
        </ApexSceneReveal>
        <ApexSceneReveal chapter={9}>
          <ApexPricingPlans />
        </ApexSceneReveal>
        <ApexSceneReveal chapter={10}>
          <ApexFinalMission />
        </ApexSceneReveal>
        <ApexCinematicFooter />
      </main>
    </div>
  );
}
