"use client";

import { useState } from "react";
import { useMotionValueEvent } from "framer-motion";
import { ACTS } from "./apexUniverseData";
import ApexNarrativeText from "./ApexNarrativeText";

/** Renders narrative for the active act only — no stacked copy fighting for space. */
export default function ApexNarrativeDirector({ progress, reduce }) {
  const [activeId, setActiveId] = useState(ACTS[0].id);

  useMotionValueEvent(progress, "change", (v) => {
    const act = ACTS.find((a) => v >= a.start && v < a.end) || ACTS[ACTS.length - 1];
    setActiveId((prev) => (prev === act.id ? prev : act.id));
  });

  const act = ACTS.find((a) => a.id === activeId) || ACTS[0];
  return <ApexNarrativeText key={act.id} progress={progress} act={act} reduce={reduce} />;
}
