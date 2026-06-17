/**
 * APEX Cinematic Universe — one continuous world, eight acts.
 * Scroll progress 0→1 maps to camera travel through the same universe.
 * The APEX Core never disappears; only the camera relationship changes.
 */

export const UNIVERSE_SCROLL_VH = 920;

export const ACTS = [
  {
    id: "chaos",
    marker: "top",
    act: "01",
    label: "Educational chaos",
    title: "Disconnected systems drift in the void",
    subtitle:
      "Registers, WhatsApp groups, attendance sheets, fee books — scattered, fragile, impossible to trust.",
    start: 0,
    end: 0.115,
    particle: "chaos",
    tint: "rgba(180,60,60,0.12)",
  },
  {
    id: "awakening",
    marker: "scene-awakening",
    act: "02",
    label: "Signal detected",
    title: "APEX Core awakens",
    subtitle:
      "A hidden intelligence emerges. Particles organize. The environment responds.",
    start: 0.115,
    end: 0.23,
    particle: "converge",
    tint: "rgba(201,168,76,0.14)",
  },
  {
    id: "os",
    marker: "scene-os",
    act: "03",
    label: "Inside the Core",
    title: "Apex OS — living school systems",
    subtitle:
      "Attendance, fees, students, exams, results — not cards. Systems. Orbiting one intelligence.",
    start: 0.23,
    end: 0.345,
    particle: "stream",
    tint: "rgba(59,130,246,0.12)",
  },
  {
    id: "ai",
    marker: "scene-ai",
    act: "04",
    label: "Neural depth",
    title: "APEX AI — intelligence routes",
    subtitle:
      "Knowledge streams. Neural networks. The world becomes smarter with every scroll.",
    start: 0.345,
    end: 0.46,
    particle: "knowledge",
    tint: "rgba(201,168,76,0.16)",
  },
  {
    id: "connect",
    marker: "scene-connect",
    act: "05",
    label: "Super App layer",
    title: "Parents · Teachers · Students — connected instantly",
    subtitle:
      "Floating mobile worlds. Live communication. Everyone in the same universe.",
    start: 0.46,
    end: 0.575,
    particle: "stream",
    tint: "rgba(34,211,238,0.12)",
  },
  {
    id: "web",
    marker: "scene-web",
    act: "06",
    label: "Website layer",
    title: "APEX Web — admissions & public presence",
    subtitle: "Growth. Visibility. Your school's front door to the world.",
    start: 0.575,
    end: 0.69,
    particle: "drift",
    tint: "rgba(16,185,129,0.12)",
  },
  {
    id: "command",
    marker: "scene-command",
    act: "07",
    label: "Command center",
    title: "Entire schools operating live",
    subtitle: "Everything connected. Everything flowing. Real-time command.",
    start: 0.69,
    end: 0.805,
    particle: "drift",
    tint: "rgba(34,211,238,0.14)",
  },
  {
    id: "galaxy",
    marker: "scene-galaxy",
    act: "08",
    label: "Education galaxy",
    title: "One ecosystem orbiting APEX Core",
    subtitle:
      "Apex OS · Apex Connect · Apex Web · Apex AI — one intelligence, one universe.",
    start: 0.805,
    end: 0.92,
    particle: "orbit",
    tint: "rgba(59,130,246,0.14)",
  },
  {
    id: "converge",
    marker: "scene-converge",
    act: "09",
    label: "Maximum distance",
    title: "The journey completes. The universe remains.",
    subtitle: "One core. One intelligence. Built for the next 100 years of schools.",
    start: 0.92,
    end: 1,
    particle: "converge",
    tint: "rgba(201,168,76,0.18)",
  },
];

export const CHAOS_FRAGMENTS = [
  { label: "Registers", x: 8, y: 14, rot: -12 },
  { label: "WhatsApp", x: 72, y: 10, rot: 8 },
  { label: "Attendance", x: 28, y: 38, rot: -6 },
  { label: "Fee books", x: 68, y: 48, rot: 10 },
  { label: "Excel files", x: 12, y: 62, rot: -14 },
  { label: "Paper diaries", x: 48, y: 72, rot: 5 },
];

export const OS_MODULES = [
  { name: "Admissions", color: "#3b82f6", angle: 0 },
  { name: "Students", color: "#22d3ee", angle: 45 },
  { name: "Attendance", color: "#10b981", angle: 90 },
  { name: "Fees", color: "#f59e0b", angle: 135 },
  { name: "Exams", color: "#8b5cf6", angle: 180 },
  { name: "Results", color: "#f43f5e", angle: 225 },
  { name: "HR", color: "#0ea5e9", angle: 270 },
  { name: "Payroll", color: "#14b8a6", angle: 315 },
];

export const AI_NODES = [
  "AI Homework",
  "AI Diary",
  "AI Quiz",
  "AI Monitoring",
  "Question Bank",
  "Paper Generator",
];

export const CONNECT_ROLES = [
  { role: "Parent", accent: "#f59e0b", x: 18, y: 28 },
  { role: "Teacher", accent: "#10b981", x: 50, y: 18 },
  { role: "Student", accent: "#38bdf8", x: 72, y: 32 },
];

export const GALAXY_SYSTEMS = [
  { name: "Apex OS", color: "#60a5fa", angle: 0 },
  { name: "Apex Connect", color: "#22d3ee", angle: 90 },
  { name: "Apex Web", color: "#34d399", angle: 180 },
  { name: "Apex AI", color: "#fbbf24", angle: 270 },
];

export const COMMAND_METRICS = [
  { label: "Live attendance", value: "96.8%" },
  { label: "Fee collection", value: "78%" },
  { label: "AI papers", value: "342" },
  { label: "Students synced", value: "1,184" },
];

/** Build opacity keyframes for useTransform from ACTS */
export function actOpacityKeyframes(acts = ACTS) {
  const input = [0];
  const output = [0];
  for (const act of acts) {
    const fade = 0.035;
    input.push(act.start, act.start + fade, act.end - fade, act.end);
    output.push(0, 1, 1, 0);
  }
  input.push(1);
  output.push(0);
  return { input, output };
}

/** Per-act opacity arrays for individual layers */
export function actLayerKeyframes(act, fade = 0.04) {
  const s = act.start;
  const e = act.end;
  return {
    input: [0, s, s + fade, e - fade, e, 1],
    output: [0, 0, 1, 1, 0, 0],
  };
}

/** Morph transition — travel/reveal, not hard section fades */
export function actMorphKeyframes(act, opts = {}) {
  const fade = opts.fade ?? 0.045;
  const s = act.start;
  const e = act.end;
  const enterY = opts.enterY ?? 36;
  const exitY = opts.exitY ?? -28;
  const enterScale = opts.enterScale ?? 0.86;
  const exitScale = opts.exitScale ?? 0.9;
  const enterRot = opts.enterRot ?? -5;
  const exitRot = opts.exitRot ?? 4;

  return {
    opacity: actLayerKeyframes(act, fade),
    y: {
      input: [s, s + fade, e - fade, e],
      output: [enterY, 0, 0, exitY],
    },
    scale: {
      input: [s, s + fade, e - fade, e],
      output: [enterScale, 1, 1, exitScale],
    },
    rotateZ: {
      input: [s, s + fade, e - fade, e],
      output: [enterRot, 0, 0, exitRot],
    },
  };
}

export const CHAOS_LINKS = [
  [0, 2], [1, 3], [2, 4], [3, 5], [0, 4], [1, 5],
];
