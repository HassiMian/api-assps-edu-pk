"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
} from "lucide-react";
import type { OnlineExam } from "@/lib/onlineExamService";
import { fetchOnlineExam, submitOnlineExamAttempt } from "@/lib/onlineExamService";

const GRADE_LABELS = [
  { min: 90, label: "A+", color: "#10b981" },
  { min: 80, label: "A", color: "#34d399" },
  { min: 70, label: "B", color: "#3b82f6" },
  { min: 60, label: "C", color: "#f59e0b" },
  { min: 50, label: "D", color: "#f97316" },
  { min: 0, label: "F", color: "#ef4444" },
];

const getGrade = (pct: number) =>
  GRADE_LABELS.find((g) => pct >= g.min) || GRADE_LABELS[GRADE_LABELS.length - 1];

function isAnswerCorrect(q: OnlineExam["questions"][0], userAnswer: string) {
  const user = String(userAnswer || "").trim().toLowerCase();
  const correct = String(q.correct || "").trim().toLowerCase();
  if (!user || !correct) return false;
  if (user === correct) return true;

  if (q.type !== "mcq" || !q.options?.length) return false;

  const letters = ["a", "b", "c", "d"];
  const correctIdx = letters.indexOf(correct);
  if (correctIdx >= 0) {
    const optionText = String(q.options[correctIdx] || "").trim().toLowerCase();
    return user === optionText;
  }

  const optionIdx = q.options.findIndex(
    (opt) => String(opt || "").trim().toLowerCase() === correct,
  );
  if (optionIdx >= 0) {
    const letter = letters[optionIdx];
    return user === correct || user === letter;
  }

  return false;
}

function formatTime(secs: number) {
  const m = Math.floor(secs / 60)
    .toString()
    .padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

type Props = {
  examId: string;
  backHref?: string;
};

export default function OnlineTestPlayer({ examId, backHref = "/student/exams" }: Props) {
  const router = useRouter();
  const [exam, setExam] = useState<OnlineExam | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    total: number;
    pct: number;
    detail: Array<OnlineExam["questions"][0] & { userAnswer: string; isCorrect: boolean }>;
    auto: boolean;
  } | null>(null);
  const [warn5, setWarn5] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchOnlineExam(examId);
        if (!data?.questions?.length) throw new Error("no questions");
        if (data.status === "closed") throw new Error("closed");
        if (!cancelled) {
          setExam(data);
          setTimeLeft((data.duration || 30) * 60);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error && err.message === "closed"
              ? "This exam has been closed by your teacher."
              : "Exam not found or has no questions.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [examId]);

  const submit = useCallback(
    (auto = false) => {
      if (!exam) return;
      if (timerRef.current) clearInterval(timerRef.current);
      let totalScore = 0;
      const totalMarks = exam.questions.reduce((s, q) => s + q.marks, 0);
      const detail = exam.questions.map((q) => {
        const userAnswer = answers[q.id] || "";
        const isCorrect = isAnswerCorrect(q, userAnswer);
        if (isCorrect) totalScore += q.marks;
        return { ...q, userAnswer, isCorrect };
      });
      const pct = Math.round((totalScore / totalMarks) * 100);
      setResult({ score: totalScore, total: totalMarks, pct, detail, auto });
      setSubmitted(true);
      if (exam.id && exam.id !== "demo") {
        submitOnlineExamAttempt(exam.id, {
          score: totalScore,
          total_marks: totalMarks,
          pct,
          answers,
        }).catch(() => {});
      }
    },
    [exam, answers],
  );

  useEffect(() => {
    if (!exam || submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          submit(true);
          return 0;
        }
        if (prev === 300) setWarn5(true);
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [exam, submitted, submit]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
          <p className="text-slate-400">Loading exam…</p>
        </div>
      </div>
    );
  }

  if (loadError || !exam) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
        <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-red-400" />
        <h2 className="text-xl font-bold text-white">Unable to load exam</h2>
        <p className="mt-2 text-sm text-slate-400">{loadError || "Please try again later."}</p>
        <button
          type="button"
          onClick={() => router.push(backHref)}
          className="mt-6 rounded-xl bg-slate-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-600"
        >
          Back
        </button>
      </div>
    );
  }

  if (submitted && result) {
    const grade = getGrade(result.pct);
    const answered = Object.keys(answers).length;
    return (
      <div className="mx-auto max-w-2xl">
        {result.auto && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Time expired — exam submitted automatically.
          </div>
        )}
        <div className="mb-6 rounded-2xl border border-white/10 bg-slate-800/70 p-8 text-center">
          <div
            className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full border-4"
            style={{ borderColor: grade.color, background: `${grade.color}18` }}
          >
            <span className="text-4xl font-black" style={{ color: grade.color }}>
              {grade.label}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">Exam complete</h1>
          <p className="mb-6 text-slate-400">{exam.title}</p>
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-slate-700/50 p-4">
              <div className="text-3xl font-black" style={{ color: grade.color }}>
                {result.pct}%
              </div>
              <div className="mt-1 text-xs text-slate-400">Score</div>
            </div>
            <div className="rounded-xl bg-slate-700/50 p-4">
              <div className="text-3xl font-black text-white">
                {result.score}
                <span className="text-base font-normal text-slate-400">/{result.total}</span>
              </div>
              <div className="mt-1 text-xs text-slate-400">Marks</div>
            </div>
            <div className="rounded-xl bg-slate-700/50 p-4">
              <div className="text-3xl font-black text-white">
                {answered}
                <span className="text-base font-normal text-slate-400">/{exam.questions.length}</span>
              </div>
              <div className="mt-1 text-xs text-slate-400">Attempted</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.push(backHref)}
            className="rounded-xl bg-cyan-600 px-8 py-3 font-bold text-white transition hover:bg-cyan-500"
          >
            Back to exams
          </button>
        </div>
        <h3 className="mb-3 text-lg font-bold text-white">Answer review</h3>
        <div className="space-y-3">
          {result.detail.map((q, i) => (
            <div
              key={q.id}
              className={`rounded-xl border p-4 ${
                q.isCorrect
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : "border-red-500/20 bg-red-500/5"
              }`}
            >
              <div className="flex items-start gap-3">
                {q.isCorrect ? (
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                ) : (
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">
                    {i + 1}. {q.text}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Your answer:{" "}
                    <span className={q.isCorrect ? "text-emerald-400" : "text-red-400"}>
                      {q.userAnswer || "Not answered"}
                    </span>
                  </p>
                  {!q.isCorrect && (
                    <p className="mt-0.5 text-xs text-emerald-400">Correct: {q.correct}</p>
                  )}
                </div>
                <span
                  className="shrink-0 text-xs font-bold"
                  style={{ color: q.isCorrect ? "#10b981" : "#ef4444" }}
                >
                  {q.isCorrect ? `+${q.marks}` : "0"}/{q.marks}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const q = exam.questions[current];
  const totalMarks = exam.questions.reduce((s, qq) => s + qq.marks, 0);
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / exam.questions.length) * 100);
  const urgent = timeLeft < 300;

  return (
    <div className="relative -mx-4 -mt-4 sm:mx-0 sm:mt-0">
      <div
        className={`sticky top-0 z-40 flex items-center justify-between gap-4 px-4 py-3 sm:px-6 ${
          urgent
            ? "border-b border-red-500/40 bg-red-900/90"
            : "border-b border-white/10 bg-slate-800/95"
        }`}
      >
        <div className="truncate font-bold text-white">{exam.title}</div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden text-sm text-slate-400 sm:inline">
            {answeredCount}/{exam.questions.length} answered
          </span>
          <div
            className={`flex items-center gap-2 font-mono text-xl font-bold ${
              urgent ? "animate-pulse text-red-400" : "text-cyan-400"
            }`}
          >
            <Clock className="h-5 w-5" />
            {formatTime(timeLeft)}
          </div>
          <button
            type="button"
            onClick={() => setConfirmEnd(true)}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-1.5 text-sm font-bold text-white transition hover:bg-red-500"
          >
            <Send className="h-4 w-4" />
            Submit
          </button>
        </div>
      </div>

      {warn5 && (
        <div className="fixed left-1/2 top-16 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/15 px-5 py-3 text-sm font-semibold text-red-400 shadow-xl">
          <AlertTriangle className="h-4 w-4" />
          5 minutes remaining
        </div>
      )}

      <div className="flex min-h-[70vh]">
        <aside className="hidden w-56 shrink-0 border-r border-white/5 bg-slate-800/60 p-4 md:block">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Questions
          </div>
          <div className="mb-4 grid grid-cols-5 gap-1.5">
            {exam.questions.map((qq, i) => (
              <button
                key={qq.id}
                type="button"
                onClick={() => setCurrent(i)}
                className={`h-9 w-9 rounded-lg text-xs font-bold transition ${
                  i === current ? "ring-2 ring-cyan-400" : ""
                } ${
                  answers[qq.id]
                    ? "bg-emerald-500/25 text-emerald-300"
                    : "bg-slate-700 text-slate-400"
                } ${flagged.has(qq.id) ? "ring-1 ring-amber-400" : ""}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-slate-400">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-700">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500">Total: {totalMarks} marks</div>
        </aside>

        <main className="flex-1 p-6 md:p-10">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm text-slate-400">
                Question {current + 1} of {exam.questions.length}
              </span>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-semibold text-cyan-300">
                  {q.marks} mark{q.marks > 1 ? "s" : ""}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setFlagged((prev) => {
                      const n = new Set(prev);
                      if (n.has(q.id)) n.delete(q.id);
                      else n.add(q.id);
                      return n;
                    })
                  }
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition ${
                    flagged.has(q.id)
                      ? "border-amber-500/40 bg-amber-500/15 text-amber-400"
                      : "border-slate-600 text-slate-500 hover:border-slate-500"
                  }`}
                >
                  <Flag className="h-3 w-3" />
                  {flagged.has(q.id) ? "Flagged" : "Flag"}
                </button>
              </div>
            </div>

            <div className="mb-6 rounded-2xl border border-white/10 bg-slate-800/50 p-8">
              <h2 className="mb-6 text-xl font-semibold leading-relaxed text-white">{q.text}</h2>
              {q.type === "mcq" ? (
                <div className="space-y-3">
                  {(q.options || []).map((opt, i) => {
                    const letters = ["A", "B", "C", "D"];
                    const selected = answers[q.id] === opt;
                    return (
                      <label
                        key={i}
                        className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${
                          selected
                            ? "border-cyan-500/50 bg-cyan-500/15"
                            : "border-slate-600/50 bg-slate-700/30 hover:border-slate-500"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          value={opt}
                          checked={selected}
                          onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                          className="sr-only"
                        />
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                            selected ? "bg-cyan-500 text-white" : "bg-slate-600 text-slate-300"
                          }`}
                        >
                          {letters[i]}
                        </span>
                        <span className={selected ? "text-white" : "text-slate-300"}>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-400">Your answer</label>
                  <textarea
                    rows={4}
                    value={answers[q.id] || ""}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                    placeholder="Type your answer here…"
                    className="w-full resize-none rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-base text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                disabled={current === 0}
                className="flex items-center gap-2 rounded-xl border border-slate-600 px-5 py-2.5 text-slate-400 transition hover:border-slate-500 hover:text-white disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                type="button"
                onClick={() => setCurrent((c) => Math.min(exam.questions.length - 1, c + 1))}
                disabled={current === exam.questions.length - 1}
                className="ml-auto flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 font-medium text-white transition hover:bg-cyan-500 disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-1 md:hidden">
              {exam.questions.map((qq, i) => (
                <button
                  key={qq.id}
                  type="button"
                  onClick={() => setCurrent(i)}
                  className={`h-8 w-8 rounded-lg text-xs font-bold ${
                    i === current ? "ring-2 ring-cyan-400" : ""
                  } ${
                    answers[qq.id]
                      ? "bg-emerald-500/25 text-emerald-300"
                      : "bg-slate-700 text-slate-400"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>

      {confirmEnd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-800 p-8 text-center">
            <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-amber-400" />
            <h3 className="mb-2 text-xl font-bold text-white">Submit exam?</h3>
            <p className="mb-6 text-sm text-slate-400">
              You have answered {answeredCount} of {exam.questions.length} questions.
              {exam.questions.length - answeredCount > 0 &&
                ` ${exam.questions.length - answeredCount} unanswered.`}
              <br />
              This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmEnd(false)}
                className="flex-1 rounded-xl border border-slate-600 py-2.5 text-slate-400 transition hover:border-slate-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmEnd(false);
                  submit(false);
                }}
                className="flex-1 rounded-xl bg-red-600 py-2.5 font-bold text-white transition hover:bg-red-500"
              >
                Submit now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
