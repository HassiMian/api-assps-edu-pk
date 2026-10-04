"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Globe, Loader2, Rocket } from "lucide-react";
import { usePaperStore } from "@/components/PaperGeneratorSaaS/usePaperStore";
import { publishOnlineExam } from "@/lib/onlineExamService";

type QuestionRow = {
  id: string | number;
  text?: string;
  textUrdu?: string;
  marks?: number;
  options?: Array<{ label?: string; text?: string } | string>;
  answer?: string;
};

export default function ConnectOnlineExamWizard() {
  const { subjects, getQuestionsForPaper } = usePaperStore();
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState({
    title: "",
    classLevel: "9",
    subject: "",
    duration: 30,
  });
  const [selectedMCQ, setSelectedMCQ] = useState<QuestionRow[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [publishedId, setPublishedId] = useState<number | null>(null);

  const availableSubjects = useMemo(() => {
    const rows = (subjects || []) as Array<{ name?: string; classLevel?: string }>;
    return [
      ...new Set(
        rows
          .filter((s) => !config.classLevel || s.classLevel === config.classLevel)
          .map((s) => s.name)
          .filter(Boolean),
      ),
    ] as string[];
  }, [subjects, config.classLevel]);

  const mcqPool = useMemo(
    () =>
      getQuestionsForPaper({
        subjectName: config.subject,
        classLevel: config.classLevel,
        type: "mcq",
      }) as QuestionRow[],
    [config.subject, config.classLevel, getQuestionsForPaper],
  );

  const toggleMcq = (q: QuestionRow) => {
    setSelectedMCQ((prev) =>
      prev.find((x) => x.id === q.id) ? prev.filter((x) => x.id !== q.id) : [...prev, { ...q }],
    );
  };

  async function handlePublish() {
    if (!selectedMCQ.length || publishing) return;
    setPublishing(true);
    setError("");
    try {
      const data = await publishOnlineExam({
        config,
        selectedMCQ,
        selectedShort: [],
        selectedLong: [],
      });
      setPublishedId(Number(data?.id) || null);
      setStep(2);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error)?.message ||
        "Failed to publish exam";
      setError(message);
    } finally {
      setPublishing(false);
    }
  }

  if (step === 2 && publishedId) {
    const studentUrl = `/student/online-test/${publishedId}`;
    return (
      <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-8 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-emerald-400" />
        <h3 className="text-xl font-bold text-white">Exam published</h3>
        <p className="mt-2 text-sm text-slate-400">
          {config.title || "Online Exam"} is live for students on Connect.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href={studentUrl}
            className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-500"
          >
            Preview student view
          </Link>
          <Link
            href="/teacher/assessments/online-exams"
            className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-bold text-slate-200 transition hover:bg-white/5"
          >
            View delivery dashboard
          </Link>
          <button
            type="button"
            onClick={() => {
              setStep(0);
              setPublishedId(null);
              setSelectedMCQ([]);
            }}
            className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-white/5"
          >
            Publish another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300">
          <Globe className="h-3.5 w-3.5" />
          Online delivery
        </div>
        {["Setup", "Questions", "Publish"].map((label, i) => (
          <span
            key={label}
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              step === i ? "bg-cyan-500/20 text-cyan-300" : "text-slate-500"
            }`}
          >
            {i + 1}. {label}
          </span>
        ))}
      </div>

      {step === 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1.5 block text-slate-400">Exam title</span>
            <input
              value={config.title}
              onChange={(e) => setConfig((c) => ({ ...c, title: e.target.value }))}
              placeholder="Mid Term Physics — Class 9"
              className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-white"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-slate-400">Class</span>
            <select
              value={config.classLevel}
              onChange={(e) => setConfig((c) => ({ ...c, classLevel: e.target.value, subject: "" }))}
              className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-white"
            >
              {["6", "7", "8", "9", "10", "11", "12"].map((cls) => (
                <option key={cls} value={cls}>
                  Class {cls}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-slate-400">Subject</span>
            <select
              value={config.subject}
              onChange={(e) => setConfig((c) => ({ ...c, subject: e.target.value }))}
              className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-white"
            >
              <option value="">Select subject</option>
              {availableSubjects.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-slate-400">Duration (minutes)</span>
            <input
              type="number"
              min={5}
              max={180}
              value={config.duration}
              onChange={(e) => setConfig((c) => ({ ...c, duration: Number(e.target.value) || 30 }))}
              className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-white"
            />
          </label>
          <button
            type="button"
            onClick={() => setStep(1)}
            disabled={!config.title.trim()}
            className="md:col-span-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-500 disabled:opacity-40"
          >
            Continue to questions →
          </button>
        </div>
      )}

      {step === 1 && (
        <div>
          <p className="mb-4 text-sm text-slate-400">
            Select MCQs from the question bank ({selectedMCQ.length} selected)
          </p>
          {mcqPool.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-500">
              No MCQs found for this class and subject. Add questions in Question Bank first.
            </p>
          ) : (
            <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
              {mcqPool.map((q, i) => {
                const picked = selectedMCQ.some((x) => x.id === q.id);
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => toggleMcq(q)}
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      picked
                        ? "border-cyan-500/40 bg-cyan-500/10"
                        : "border-white/10 bg-slate-800/40 hover:border-white/20"
                    }`}
                  >
                    <div className="text-sm font-medium text-white">
                      Q{i + 1}. {q.text}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setStep(0)}
              className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-bold text-slate-300"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={!selectedMCQ.length || publishing}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:opacity-40"
            >
              {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
              Publish exam now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
