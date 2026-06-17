"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { ACTS } from "./apexUniverseData";

const ACT_FREQ = {
  chaos: 52,
  awakening: 68,
  os: 82,
  ai: 96,
  connect: 88,
  web: 76,
  command: 90,
  galaxy: 64,
  converge: 58,
};

/**
 * Optional cinematic ambient — user must opt in (browser autoplay policy).
 * Calm oscillator drone morphs with the active act.
 */
export default function ApexAmbientSound({ currentActId, enabled }) {
  const reduce = useReducedMotion();
  const [on, setOn] = useState(false);
  const ctxRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);

  const stop = useCallback(() => {
    try {
      gainRef.current?.gain.setValueAtTime(0, ctxRef.current?.currentTime || 0);
      oscRef.current?.stop();
      ctxRef.current?.close();
    } catch {
      /* ignore */
    }
    oscRef.current = null;
    gainRef.current = null;
    ctxRef.current = null;
  }, []);

  const start = useCallback(() => {
    if (reduce) return;
    stop();
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.value = ACT_FREQ[currentActId] || 64;
    filter.type = "lowpass";
    filter.frequency.value = 420;
    gain.gain.value = 0;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    const t = ctx.currentTime;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.028, t + 1.2);

    ctxRef.current = ctx;
    oscRef.current = osc;
    gainRef.current = gain;
  }, [currentActId, reduce, stop]);

  useEffect(() => {
    if (!on || !oscRef.current || !ctxRef.current) return;
    const freq = ACT_FREQ[currentActId] || 64;
    const t = ctxRef.current.currentTime;
    oscRef.current.frequency.setTargetAtTime(freq, t, 0.6);
  }, [currentActId, on]);

  useEffect(() => {
    if (!enabled) stop();
    return stop;
  }, [enabled, stop]);

  const toggle = () => {
    if (on) {
      stop();
      setOn(false);
    } else {
      start();
      setOn(true);
    }
  };

  if (reduce || !enabled) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={on ? "Mute ambient sound" : "Enable ambient sound"}
      className="fixed bottom-5 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-950/80 text-cyan-200/80 backdrop-blur-md transition hover:border-cyan-300/30 hover:text-cyan-100 sm:bottom-6 sm:left-6"
    >
      {on ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 opacity-60" />}
    </button>
  );
}
