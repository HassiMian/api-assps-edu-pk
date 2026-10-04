"use client";

import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Clock, Globe, Loader2, BookOpen } from "lucide-react";
import { fetchAvailableOnlineExams } from "@/lib/onlineExamService";

type ExamRow = {
  id: number;
  title: string;
  subject?: string;
  class?: string;
  duration?: number;
  total_marks?: number;
  status?: string;
  created_at?: string;
};

export default function StudentExamsPage() {
  const [exams, setExams] = useState<ExamRow[]>([]);
  const [classFilter, setClassFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAvailableOnlineExams()
      .then(({ exams: rows, meta }) => {
        setExams(rows || []);
        setClassFilter(meta?.classFilter || null);
      })
      .catch(() => setError("Could not load exams. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout role="student" title="Online Exams">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
          <Globe className="h-3.5 w-3.5" />
          Live assessments
        </div>
        <h2 className="mt-4 text-2xl font-bold text-white">Published exams</h2>
        <p className="mt-2 max-w-[65ch] text-sm leading-7 text-slate-400">
          Exams published by your teachers appear here. Select one to begin — timer starts when you open the paper.
          {classFilter && (
            <span className="mt-2 block text-cyan-300/90">Showing exams for {classFilter} and school-wide papers.</span>
          )}
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-3 py-20 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading exams…
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-sm text-red-300">{error}</div>
      )}

      {!loading && !error && exams.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-12 text-center">
          <BookOpen className="mx-auto mb-4 h-10 w-10 text-slate-500" />
          <p className="font-semibold text-white">No live exams right now</p>
          <p className="mt-2 text-sm text-slate-400">Check back when your teacher publishes an online test.</p>
        </div>
      )}

      {!loading && exams.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {exams.map((exam) => (
            <Link
              key={exam.id}
              href={`/student/online-test/${exam.id}`}
              className="group rounded-2xl border border-white/10 bg-slate-800/50 p-6 transition duration-200 ease-out hover:-translate-y-1 hover:border-cyan-500/30 hover:bg-slate-800/80"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-200">{exam.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {[exam.subject, exam.class].filter(Boolean).join(" · ") || "General"}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-400">
                  Live
                </span>
              </div>
              <div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {exam.duration || 30} min
                </span>
                <span>{exam.total_marks || "—"} marks</span>
              </div>
              <div className="mt-4 text-sm font-semibold text-cyan-400">Start exam →</div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
