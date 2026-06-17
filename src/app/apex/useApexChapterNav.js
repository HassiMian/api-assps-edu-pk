"use client";

import { useEffect, useState } from "react";

const CHAPTERS = [
  { id: "scene-awakening", label: "Core" },
  { id: "scene-os", label: "APEX OS" },
  { id: "scene-ai", label: "AI" },
  { id: "scene-galaxy", label: "Galaxy" },
  { id: "pricing", label: "Plans" },
];

export default function useApexChapterNav() {
  const [active, setActive] = useState("scene-awakening");

  useEffect(() => {
    const sections = CHAPTERS.map((c) => document.getElementById(c.id)).filter(Boolean);
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) setActive(visible[0].target.id);
      },
      { rootMargin: "-28% 0px -52% 0px", threshold: [0.12, 0.35, 0.55] }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return { active, chapters: CHAPTERS };
}
