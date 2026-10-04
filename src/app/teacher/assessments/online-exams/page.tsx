"use client";

import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Globe,
  Loader2,
  Users,
  BarChart3,
  XCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  closeOnlineExam,
  fetchOnlineExamAttempts,
  fetchOnlineExamList,
} from "@/lib/onlineExamService";

type ExamRow = {
  id: number;
  title: string;
  subject?: string;
  class?: string;
  duration?: number;
  total_marks?: number;
  status?: string;
  attempt_count?: number;
  avg_pct?: number;
  created_at?: string;
};

type AttemptRow = {
  id: number;
  user_name?: string;
  student_name?: string;
  roll_number?: string;
  score?: number;
  total_marks?: number;
  pct?: number;
  grade?: string;
  submitted_at?: string;
};

export default function TeacherOnlineExamsPage() {
  const [exams, setExams] = useState<ExamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [attemptsLoading, setAttemptsLoading] = useState(false);

  async function loadExams() {
    setLoading(true);
    try {
      const rows = await fetchOnlineExamList();
      setExams(rows || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExams();
  }, []);

  async function toggleAttempts(examId: number) {
    if (expandedId === examId) {
      setExpandedId(null);
      setAttempts([]);
      return;
    }
    setExpandedId(examId);
    setAttemptsLoading(true);
    try {
      const data = await fetchOnlineExamAttempts(examId);
      setAttempts(data?.attempts || []);
    } catch {
      setAttempts([]);
    } finally {
      setAttemptsLoading(false);
    }
  }

  async function handleClose(examId: number) {
    await closeOnlineExam(examId);
    await loadExams();
  }

  return (
    <DashboardLayout role="teacher" title="Online Exams">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
            <Globe className="h-3.5 w-3.5" />
            Delivery dashboard
          </div>
          <h2 className="mt-4 text-2xl font-bold text-white">Published online exams</h2>
          <p className="mt-2 max-w-[65ch] text-sm leading-7 text-slate-400">
            Track student attempts, average scores, and close exams when the window ends.
          </p>
        </div>
        <Link
          href="/teacher/paper-generator?tab=online"
          className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-violet-500"
        >
          Publish Online Exam →
        </Link>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-3 py-20 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading…
        </div>
      )}

      {!loading && exams.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-12 text-center">
          <Globe className="mx-auto mb-4 h-10 w-10 text-slate-500" />
          <p className="font-semibold text-white">No online exams yet</p>
          <p className="mt-2 text-sm text-slate-400">
            Publish from Paper Generator → Online Test tab → Publish Exam Now.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {exams.map((exam) => {
          const open = expandedId === exam.id;
          return (
            <div
              key={exam.id}
              className="overflow-hidden rounded-2xl border border-white/10 bg-slate-800/50"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 p-6">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-bold text-white">{exam.title}</h3>
                    <span
                      className={`rounded-full px-3 py-0.5 text-xs font-bold ${
                        exam.status === "published"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-slate-600/40 text-slate-400"
                      }`}
                    >
                      {exam.status || "published"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">
                    {[exam.subject, exam.class].filter(Boolean).join(" · ")}
                    {exam.duration ? ` · ${exam.duration} min` : ""}
                    {exam.total_marks ? ` · ${exam.total_marks} marks` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Users className="h-4 w-4 text-cyan-400" />
                    <span>{exam.attempt_count ?? 0} attempts</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <BarChart3 className="h-4 w-4 text-amber-400" />
                    <span>Avg {exam.avg_pct ?? 0}%</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 border-t border-white/5 px-6 py-4">
                <a
                  href={`/student/online-test/${exam.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-bold text-cyan-300 transition hover:bg-cyan-500/20"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Preview student view
                </a>
                <button
                  type="button"
                  onClick={() => toggleAttempts(exam.id)}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-xs font-bold text-slate-300 transition hover:bg-white/5"
                >
                  {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  View attempts
                </button>
                {exam.status === "published" && (
                  <button
                    type="button"
                    onClick={() => handleClose(exam.id)}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-500/25 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-300 transition hover:bg-red-500/20"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Close exam
                  </button>
                )}
              </div>

              {open && (
                <div className="border-t border-white/5 bg-slate-900/40 px-6 py-4">
                  {attemptsLoading ? (
                    <div className="flex items-center gap-2 py-4 text-sm text-slate-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading attempts…
                    </div>
                  ) : attempts.length === 0 ? (
                    <p className="py-4 text-sm text-slate-500">No submissions yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[480px] text-left text-sm">
                        <thead>
                          <tr className="text-xs uppercase tracking-wider text-slate-500">
                            <th className="pb-3 pr-4">Student</th>
                            <th className="pb-3 pr-4">Score</th>
                            <th className="pb-3 pr-4">Grade</th>
                            <th className="pb-3">Submitted</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attempts.map((a) => (
                            <tr key={a.id} className="border-t border-white/5 text-slate-300">
                              <td className="py-3 pr-4">
                                {a.student_name || a.user_name || "Student"}
                                {a.roll_number ? (
                                  <span className="ml-2 text-xs text-slate-500">#{a.roll_number}</span>
                                ) : null}
                              </td>
                              <td className="py-3 pr-4">
                                {a.score}/{a.total_marks} ({a.pct}%)
                              </td>
                              <td className="py-3 pr-4 font-bold text-cyan-300">{a.grade}</td>
                              <td className="py-3 text-xs text-slate-500">
                                {a.submitted_at
                                  ? new Date(a.submitted_at).toLocaleString()
                                  : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
