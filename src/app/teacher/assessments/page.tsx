"use client";

import DashboardLayout from "@/components/DashboardLayout";
import {PortalModuleHeading, PortalSupportNote} from '@/components/PortalModulePrimitives';
import {schoolDateISO} from '@/lib/schoolDate';
import api from "@/utils/api";
import {
  BookOpen,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  Loader2,
  Users,
  PieChart,
  Save,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode, type SelectHTMLAttributes } from "react";
import Link from "next/link";

const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "English",
  "Urdu",
  "Islamiyat",
  "Social Studies",
];

const SESSIONS = ["2026-2027", "2025-2026", "2024-2025"];
const EXAM_TYPES = ["Monthly Test", "Unit Test", "Mid Term", "Final Term", "Quiz", "Assignment"];

type Student = {
  id: number;
  name: string;
  gr_number?: string;
  roll_number?: string;
  class?: string;
  section?: string;
};

type TeachingClass = {
  label: string;
  cls: string;
  section: string;
  subjects: string[];
};

type SavedRow = {
  id: number;
  studentName: string;
  classLabel: string;
  subject: string;
  session: string;
  examType: string;
  marks: number;
  total: number;
};

type Toast = { ok: boolean; msg: string } | null;

function Field({
  label,
  children,
  step,
}: {
  label: string;
  children: ReactNode;
  step: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
        <span className="grid h-6 w-6 place-items-center rounded-lg bg-blue-500/15 text-blue-400">{step}</span>
        {label}
      </span>
      {children}
    </label>
  );
}

function SelectBox(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="cw-field w-full"
    />
  );
}

export default function TeacherExamination() {
  const [classes, setClasses] = useState<TeachingClass[]>([]);
  const [classLabel, setClassLabel] = useState("");
  const [subject, setSubject] = useState("");
  const [assignmentError,setAssignmentError] = useState('');
  const [session, setSession] = useState("2026-2027");
  const [examType, setExamType] = useState("Monthly Test");
  const [totalMarks, setTotalMarks] = useState("100");
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<Record<number, string>>({});
  const [savedRows, setSavedRows] = useState<SavedRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  const selectedClass = classes.find((item) => item.label === classLabel) || null;
  const availableSubjects = !selectedClass ? [] : selectedClass.subjects.length ? selectedClass.subjects : SUBJECTS;
  useEffect(() => {
    let cancelled = false;
    api.get('/portal/teaching-options')
      .then((res) => {
        if (cancelled) return;
        const rows = Array.isArray(res.data?.data?.classes) ? res.data.data.classes : [];
        const mapped: TeachingClass[] = rows.map((row: any) => {
          const cls = String(row.class_name || '').trim();
          const section = String(row.section || '').trim();
          return {
            label: `Class ${cls}${section ? `-${section}` : ''}`,
            cls,
            section,
            subjects: Array.isArray(row.subjects) ? row.subjects.filter(Boolean).map(String) : [],
          };
        }).filter((row: TeachingClass) => row.cls);
        setClasses(mapped);
        setAssignmentError('');
        setClassLabel(mapped[0]?.label || '');
      })
      .catch(() => {
        if (!cancelled) {
          setClasses([]);
          setClassLabel('');
          setAssignmentError('Could not fetch teacher assignments. Reload to distinguish missing classes from a service error.');
        }
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!availableSubjects.length) setSubject('');
    else if (!availableSubjects.includes(subject)) setSubject(availableSubjects[0]);
    setStudents([]);
    setMarks({});
  }, [classLabel]);

  const enteredCount = Object.values(marks).filter((value) => value !== "").length;

  const average = useMemo(() => {
    const values = Object.values(marks).filter(Boolean).map(Number);
    if (!values.length || !Number(totalMarks)) return null;
    return Math.round(values.reduce((sum, value) => sum + (value / Number(totalMarks)) * 100, 0) / values.length);
  }, [marks, totalMarks]);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    window.setTimeout(() => setToast(null), 3500);
  }

  async function loadStudents() {
    if (!selectedClass) {
      showToast('No class is assigned to this teacher account.', false);
      return;
    }
    setLoading(true);
    setMarks({});
    try {
      const res = await api.get('/students', {
        params: { active: true, class: selectedClass.cls, section: selectedClass.section || undefined },
      });
      const rows = Array.isArray(res.data?.data) ? res.data.data : [];
      setStudents(rows);
      if (!rows.length) showToast('No active students found in this assigned class.', false);
    } catch {
      setStudents([]);
      showToast('Students could not be loaded for this assigned class.', false);
    } finally {
      setLoading(false);
    }
  }

  function updateMark(studentId: number, value: string) {
    const total = Number(totalMarks) || 0;
    const nextValue = value === "" ? "" : String(Math.min(Math.max(Number(value), 0), total || Number(value)));
    setMarks((prev) => ({ ...prev, [studentId]: nextValue }));
  }

  async function saveMarks() {
    if (!selectedClass) { showToast('No assigned class selected.', false); return; }
    const entries = Object.entries(marks).filter(([, value]) => value !== "");
    if (!students.length) {
      showToast("Please load the students list first.", false);
      return;
    }
    if (!entries.length) {
      showToast("No student marks have been entered.", false);
      return;
    }

    setSaving(true);
    try {
      const examRes = await api.post("/admin/exams", {
        name: `${examType} - ${subject} - ${classLabel}`,
        type: examType,
        class: selectedClass.cls,
        section: selectedClass.section,
        subject,
        session,
        total_marks: Number(totalMarks),
        pass_marks: Math.round(Number(totalMarks) * 0.33),
        start_date: schoolDateISO(),
      });

      const examId = Number(examRes.data?.data?.id);
      if (!Number.isInteger(examId) || examId <= 0) throw new Error('Exam creation did not return a valid ID.');
      const results = entries
        .map(([studentId, value]) => {
          const student = students.find((item) => item.id === Number(studentId));
          if (!student) return null;
          return {
            exam_id: examId,
            student_id: student.id,
            student_name: student.name,
            subject,
            marks_obtained: Number(value),
            total_marks: Number(totalMarks),
          };
        })
        .filter(Boolean);

      const saveResponse = await api.post("/admin/exams/results", { results });
      if (!saveResponse.data?.success) throw new Error(saveResponse.data?.message || 'Marks were not confirmed by the backend.');

      setSavedRows(
        results.map((row) => ({
          id: Date.now() + Number(row?.student_id || 0),
          studentName: row?.student_name || "",
          classLabel,
          subject,
          session,
          examType,
          marks: Number(row?.marks_obtained || 0),
          total: Number(totalMarks),
        }))
      );
      showToast(`Marks saved for ${results.length} students.`);
    } catch {
      showToast("Marks could not be saved. Please check the backend/API.", false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout role="teacher" title="Examination">
      <PortalModuleHeading eyebrow="ACADEMIC ASSESSMENT" title="Marks and examinations" description="Choose a verified assigned class, enter marks carefully and publish only server-confirmed results."/>
      {assignmentError&&<p className="cw-error mb-5" role="alert">{assignmentError}</p>}
      {!assignmentError&&!classes.length&&<div className="mb-5"><PortalSupportNote>No class is linked to this teacher identity yet. School Admin can configure the class and subject assignments; unrelated classes are intentionally not shown.</PortalSupportNote></div>}
      {toast && (
        <div
          className={`fixed right-6 top-6 z-50 flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold shadow-xl ${
            toast.ok ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400" : "border-red-500/30 bg-red-500/15 text-red-400"
          }`}
        >
          {toast.ok && <CheckCircle2 className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { label: "Selected Class", value: classLabel||'Not assigned', icon: Users, color: "text-blue-400" },
          { label: "Subject", value: subject||'—', icon: BookOpen, color: "text-emerald-400" },
          { label: "Marks Entered", value: `${enteredCount}/${students.length || 0}`, icon: ClipboardList, color: "text-amber-400" },
          { label: "Average", value: average===null?'—':`${average}%`, icon: GraduationCap, color: "text-purple-400" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-5">
            <div className="flex items-center gap-3">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <div>
                <p className="text-xs text-slate-400">{stat.label}</p>
                <h3 className="text-lg font-bold text-white">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Marks Upload</h2>
            <p className="text-sm text-slate-400">Choose the class, subject, session, and exam type, then enter marks in each student box.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/teacher/assessments/report-cards"
              className="flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-5 py-3 font-bold text-white transition hover:bg-slate-700"
            >
              <PieChart className="h-4 w-4 text-purple-400" />
              Report Cards
            </Link>
            <button
              onClick={loadStudents}
              disabled={loading || !selectedClass}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
              Load Students
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Field step="1" label="Class Select">
            <SelectBox value={classLabel} onChange={(event) => setClassLabel(event.target.value)}>
              {!classes.length && <option value="">No assigned classes</option>}
              {classes.map((item) => (
                <option key={item.label} value={item.label}>{item.label}</option>
              ))}
            </SelectBox>
          </Field>

          <Field step="2" label="Subject Select">
            <SelectBox value={subject} disabled={!selectedClass} onChange={(event) => setSubject(event.target.value)}>
              {!availableSubjects.length&&<option value="">No assigned class selected</option>}
              {availableSubjects.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </SelectBox>
          </Field>

          <Field step="3" label="Session">
            <SelectBox value={session} onChange={(event) => setSession(event.target.value)}>
              {SESSIONS.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </SelectBox>
          </Field>

          <Field step="4" label="Exam Type">
            <SelectBox value={examType} onChange={(event) => setExamType(event.target.value)}>
              {EXAM_TYPES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </SelectBox>
          </Field>

          <Field step="5" label="Total Marks">
            <input
              type="number"
              min={1}
              value={totalMarks}
              onChange={(event) => setTotalMarks(event.target.value)}
              className="cw-field w-full"
            />
          </Field>
        </div>
      </div>

      <div className="mt-6 glass-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/50 p-5">
          <div>
            <h3 className="text-lg font-bold text-white">Students List</h3>
            <p className="text-sm text-slate-400">
              {students.length ? `${students.length} students loaded for ${classLabel}` : "Click Load Students to open the marks sheet."}
            </p>
          </div>
          <button
            onClick={saveMarks}
            disabled={saving || !students.length}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Marks
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          </div>
        ) : students.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Users className="mx-auto mb-3 h-12 w-12 opacity-30" />
            <p>No student list has been opened yet.</p>
          </div>
        ) : (
          <div className="min-h-[300px] relative">
            {/* Mobile Card View (hidden on lg and up) */}
            <div className="lg:hidden space-y-4 p-4">
              {students.map((student) => {
                const value = marks[student.id] || "";
                const pct = value && Number(totalMarks) ? Math.round((Number(value) / Number(totalMarks)) * 100) : 0;
                const grade = !value ? "-" : pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B" : pct >= 60 ? "C" : pct >= 50 ? "D" : pct >= 33 ? "E" : "F";
                return (
                  <div key={student.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-500/15 text-sm font-bold text-blue-400">
                          {student.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <span className="font-semibold text-white text-lg block">{student.name}</span>
                          <span className="font-mono text-xs text-slate-400">{student.gr_number || student.roll_number || `#${student.id}`}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`rounded-lg px-2.5 py-1 text-xs font-bold block mb-1 ${
                          !value
                            ? "bg-slate-700/40 text-slate-500"
                            : pct >= 80
                              ? "bg-emerald-500/10 text-emerald-400"
                              : pct >= 50
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-red-500/10 text-red-400"
                        }`}>
                          {grade}
                        </span>
                        <span className="font-bold text-slate-300 text-xs">{value ? `${pct}%` : "-"}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-slate-400 ml-1">Marks Obtained</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={Number(totalMarks) || 100}
                          value={value}
                          onChange={(event) => updateMark(student.id, event.target.value)}
                          placeholder="0"
                          className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 font-semibold text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 text-lg"
                        />
                        <span className="text-sm font-semibold text-slate-500 bg-slate-800/50 px-4 py-3 rounded-xl border border-slate-700/50">/ {totalMarks || 0}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View (hidden on small screens) */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="cw-data-table">
                <thead>
                  <tr className="border-b border-slate-700/50 text-xs uppercase text-slate-400">
                    <th className="px-5 py-4 text-left font-medium">Roll / GR</th>
                    <th className="px-5 py-4 text-left font-medium">Student</th>
                    <th className="px-5 py-4 text-left font-medium">Marks Box</th>
                    <th className="px-5 py-4 text-left font-medium">Percent</th>
                    <th className="px-5 py-4 text-left font-medium">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const value = marks[student.id] || "";
                    const pct = value && Number(totalMarks) ? Math.round((Number(value) / Number(totalMarks)) * 100) : 0;
                    const grade = !value ? "-" : pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B" : pct >= 60 ? "C" : pct >= 50 ? "D" : pct >= 33 ? "E" : "F";
                    return (
                      <tr key={student.id} className="border-b border-slate-700/30 transition hover:bg-slate-800/30">
                        <td className="px-5 py-4 font-mono text-xs text-slate-400">{student.gr_number || student.roll_number || `#${student.id}`}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-500/15 text-xs font-bold text-blue-400">
                              {student.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                            </div>
                            <span className="font-semibold text-white">{student.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={0}
                              max={Number(totalMarks) || 100}
                              value={value}
                              onChange={(event) => updateMark(student.id, event.target.value)}
                              placeholder="0"
                              className="w-28 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-semibold text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                            />
                            <span className="text-xs text-slate-500">/ {totalMarks || 0}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-300">{value ? `${pct}%` : "-"}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                              !value
                                ? "bg-slate-700/40 text-slate-500"
                                : pct >= 80
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : pct >= 50
                                    ? "bg-amber-500/10 text-amber-400"
                                    : "bg-red-500/10 text-red-400"
                            }`}
                          >
                            {grade}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {savedRows.length > 0 && (
        <div className="mt-6 glass-card p-5">
          <h3 className="mb-3 text-lg font-bold text-white">Last Saved</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {savedRows.slice(0, 6).map((row) => (
              <div key={row.id} className="rounded-xl border border-slate-700/60 bg-slate-800/30 p-4">
                <p className="font-semibold text-white">{row.studentName}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {row.classLabel} - {row.subject} - {row.examType} - {row.session}
                </p>
                <p className="mt-2 text-sm font-bold text-emerald-400">
                  {row.marks} / {row.total}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
