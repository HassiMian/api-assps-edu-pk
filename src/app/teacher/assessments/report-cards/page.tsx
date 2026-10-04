"use client";

import DashboardLayout from "@/components/DashboardLayout";
import {PortalModuleHeading} from '@/components/PortalModulePrimitives';
import api from "@/utils/api";
import {
  FileText,
  Loader2,
  Printer,
  Search,
  User,
  GraduationCap
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";

type Student = {
  id: number;
  name: string;
  gr_number?: string;
  roll_number?: string;
  class?: string;
  section?: string;
};

type Result = {
  id: number;
  exam_id: number;
  student_id: number;
  subject: string;
  marks_obtained: number;
  total_marks: number;
  grade: string;
  exam_name: string;
  session: string;
  exam_type: string;
};

export default function ReportCards() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [rosterError,setRosterError] = useState('');
  const [resultsError,setResultsError] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    try {
      setLoading(true);
      const res = await api.get("/admin/students");
      if(!res.data?.success||!Array.isArray(res.data?.data))throw new Error(res.data?.message || 'Student roster could not be verified.');
      setStudents(res.data.data);setRosterError('');
    } catch (err:any) {
      setRosterError(err?.response?.data?.message||err?.message||'Teacher student roster is currently unavailable.');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadStudentResults(student: Student) {
    setSelectedStudent(student);
    setResultsLoading(true);setResultsError('');setResults([]);
    try {
      const res = await api.get(`/exams/student-results/${student.id}`);
      if(!res.data?.success||!Array.isArray(res.data?.data))throw new Error(res.data?.message || 'Saved assessment results are unavailable.');
      setResults(res.data.data);
    } catch (err:any) {
      setResultsError(err?.response?.data?.message||err?.message||'Report results could not be verified.');
      setResults([]);
    } finally {
      setResultsLoading(false);
    }
  }

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.gr_number || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.roll_number || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.class || "").toLowerCase().includes(search.toLowerCase())
  );

  // Group by Exam Name to show report cards per exam
  const resultsByExam = results.reduce((acc, r) => {
    if (!acc[r.exam_name]) acc[r.exam_name] = [];
    acc[r.exam_name].push(r);
    return acc;
  }, {} as Record<string, Result[]>);

  // Radar chart data based on overall average percentage per subject
  const radarData = (() => {
    if (!results.length) return [];
    const subjects = Array.from(new Set(results.map(r => r.subject)));
    return subjects.map(subject => {
      const subjectResults = results.filter(r => r.subject === subject);
      let totalObtained = 0;
      let totalMax = 0;
      subjectResults.forEach(r => {
        totalObtained += Number(r.marks_obtained || 0);
        totalMax += Number(r.total_marks || 0);
      });
      const pct = totalMax ? Math.round((totalObtained / totalMax) * 100) : 0;
      return { subject, percentage: pct };
    });
  })();

  const printReport = () => {
    if(resultsLoading||resultsError||!results.length)return;
    window.print();
  };

  return (
    <DashboardLayout role="teacher" title="Automated Report Cards">
      <div className="print:hidden"><PortalModuleHeading eyebrow="OFFICIAL ACADEMIC REPORTING" title="Report cards" description="Browse verified school-linked assessment records. Printing is available only when real saved results have loaded."/>
      {rosterError&&<div role="alert" className="cw-error mb-5 flex flex-wrap items-center justify-between gap-3"><span>{rosterError}</span><button type="button" onClick={fetchStudents} className="cw-module-secondary">Retry roster</button></div>}
      {resultsError&&<div role="alert" className="cw-error mb-5 flex flex-wrap items-center justify-between gap-3"><span>{resultsError}</span>{selectedStudent&&<button type="button" onClick={()=>loadStudentResults(selectedStudent)} className="cw-module-secondary">Retry results</button>}</div>}
      </div>
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] print:h-auto">
        {/* Left Sidebar: Students List (Hidden on Print) */}
        <div className="w-full lg:w-1/3 flex flex-col glass-card overflow-hidden print:hidden">
          <div className="p-4 border-b border-slate-700/50 bg-slate-800/30">
            <h3 className="text-lg font-bold text-white mb-3">Select Student</h3>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                aria-label="Search assigned students by name, roll or class"
                placeholder="Search by name, roll, class..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="cw-field w-full pl-9"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="py-12 text-center"><Loader2 className="w-6 h-6 animate-spin text-blue-400 mx-auto" /></div>
            ) : filteredStudents.length === 0 ? (
              <div className="py-12 px-4 text-center text-slate-500 text-sm">{rosterError?'Unable to verify assigned students.':search.trim()?'No students match the search.':'No assigned students were returned.'}</div>
            ) : (
              <div className="space-y-1">
                {filteredStudents.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => loadStudentResults(s)}
                    className={`w-full text-left p-3 rounded-xl transition-colors flex items-center gap-3 ${
                      selectedStudent?.id === s.id ? "bg-blue-600/20 border border-blue-500/30" : "hover:bg-slate-800/50 border border-transparent"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 font-bold text-xs">
                      {s.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">{s.name}</div>
                      <div className="text-slate-400 text-xs">
                        Class {s.class} {s.section} • Roll: {s.roll_number || s.gr_number}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Content: Report Card View */}
        <div className="w-full lg:w-2/3 overflow-y-auto print:w-full print:overflow-visible">
          {!selectedStudent ? (
            <div className="glass-card h-full flex flex-col items-center justify-center text-slate-500 p-12 print:hidden">
              <FileText className="w-16 h-16 mb-4 opacity-20" />
              <h2 className="text-xl font-bold text-white mb-2">Automated Report Cards</h2>
              <p className="text-sm max-w-sm text-center">Select a student from the list to view their academic profile, radar analysis, and generate report cards.</p>
            </div>
          ) : resultsLoading ? (
            <div className="glass-card h-full flex items-center justify-center print:hidden">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
          ) : (
            <div className="space-y-6 print:space-y-8">
              {/* Header Action */}
              <div className="flex justify-between items-center print:hidden glass-card p-4">
                <div className="text-slate-300 text-sm">
                  Viewing results for <span className="text-white font-bold">{selectedStudent.name}</span>
                </div>
                <button
                  onClick={printReport}
                  disabled={resultsLoading||!!resultsError||!results.length}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-semibold text-sm"
                >
                  <Printer className="w-4 h-4" /> Print Report Card
                </button>
              </div>

              {/* Printable Report Card Area */}
              <div className="glass-card p-8 bg-slate-900 border-slate-700 print:border-none print:shadow-none print:p-0">
                <div className="text-center mb-8 border-b border-slate-700 pb-6 print:border-slate-300">
                  <h1 className="text-3xl font-black text-white print:text-black uppercase tracking-wider">Student Academic Profile</h1>
                  <p className="text-slate-400 print:text-slate-600 mt-2">School-verified assessment record</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50 print:border-slate-300 print:bg-white">
                    <h3 className="text-slate-400 text-xs font-bold uppercase mb-4 flex items-center gap-2 print:text-slate-500">
                      <User className="w-4 h-4" /> Student Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between border-b border-slate-700/50 pb-2 print:border-slate-200">
                        <span className="text-slate-400 print:text-slate-600">Name</span>
                        <span className="text-white font-bold print:text-black">{selectedStudent.name}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-700/50 pb-2 print:border-slate-200">
                        <span className="text-slate-400 print:text-slate-600">Class & Section</span>
                        <span className="text-white font-bold print:text-black">{selectedStudent.class} {selectedStudent.section}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-700/50 pb-2 print:border-slate-200">
                        <span className="text-slate-400 print:text-slate-600">Roll / GR Number</span>
                        <span className="text-white font-bold print:text-black">{selectedStudent.roll_number || selectedStudent.gr_number}</span>
                      </div>
                    </div>
                  </div>

                  {radarData.length > 2 ? (
                    <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50 print:border-slate-300 print:bg-white flex flex-col items-center">
                      <h3 className="text-slate-400 text-xs font-bold uppercase w-full mb-2 flex items-center gap-2 print:text-slate-500">
                        <GraduationCap className="w-4 h-4" /> Performance Radar Analysis
                      </h3>
                      <div className="h-48 w-full max-w-[250px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                            <PolarGrid stroke="#475569" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                            <Radar
                              name="Score %"
                              dataKey="percentage"
                              stroke="#3b82f6"
                              fill="#3b82f6"
                              fillOpacity={0.5}
                            />
                            <RechartsTooltip wrapperClassName="print:hidden" contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50 print:border-slate-300 print:bg-white flex items-center justify-center text-slate-500 text-sm">
                      Not enough subject data for radar analysis.
                    </div>
                  )}
                </div>

                {Object.keys(resultsByExam).length === 0 ? (
                  <div className="text-center py-12 text-slate-500 border border-dashed border-slate-700 rounded-2xl print:border-slate-300">
                    {resultsError?'Results could not be verified. Please retry.':'No examination results have been saved for this student.'}
                  </div>
                ) : (
                  <div className="space-y-8">
                    {Object.entries(resultsByExam).map(([examName, examResults]) => {
                      const totalObtained = examResults.reduce((sum, r) => sum + Number(r.marks_obtained || 0), 0);
                      const totalMax = examResults.reduce((sum, r) => sum + Number(r.total_marks || 0), 0);
                      const percentage = totalMax ? Math.round((totalObtained / totalMax) * 100) : 0;
                      const overallGrade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : percentage >= 50 ? 'D' : percentage >= 33 ? 'E' : 'F';

                      return (
                        <div key={examName} className="border border-slate-700/50 rounded-2xl overflow-hidden print:border-slate-300 print:break-inside-avoid">
                          <div className="bg-slate-800/80 px-5 py-4 border-b border-slate-700/50 flex flex-wrap justify-between items-center print:bg-slate-100 print:border-slate-300">
                            <div>
                              <h3 className="text-lg font-bold text-white print:text-black">{examName}</h3>
                              <p className="text-xs text-slate-400 print:text-slate-500">{examResults[0].session} • {examResults[0].exam_type}</p>
                            </div>
                            <div className="text-right flex items-center gap-4">
                              <div>
                                <div className="text-xs text-slate-400 print:text-slate-500 uppercase font-bold">Total Score</div>
                                <div className="text-lg font-black text-blue-400 print:text-blue-600">{totalObtained} / {totalMax} <span className="text-sm">({percentage}%)</span></div>
                              </div>
                              <div className="w-12 h-12 rounded-full bg-slate-900 border-2 border-blue-500 flex items-center justify-center text-xl font-black text-white print:border-slate-400 print:text-black print:bg-white">
                                {overallGrade}
                              </div>
                            </div>
                          </div>
                          <table className="w-full text-sm text-left text-slate-300 print:text-black">
                            <thead className="bg-slate-900/50 text-xs uppercase text-slate-400 border-b border-slate-700/50 print:bg-slate-50 print:text-slate-600 print:border-slate-300">
                              <tr>
                                <th className="px-5 py-3 font-semibold">Subject</th>
                                <th className="px-5 py-3 font-semibold">Marks Obtained</th>
                                <th className="px-5 py-3 font-semibold">Total Marks</th>
                                <th className="px-5 py-3 font-semibold text-right">Grade</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/30 print:divide-slate-200">
                              {examResults.map((res) => (
                                <tr key={res.id}>
                                  <td className="px-5 py-3 font-medium text-white print:text-black">{res.subject}</td>
                                  <td className="px-5 py-3 font-mono">{res.marks_obtained}</td>
                                  <td className="px-5 py-3 font-mono text-slate-500 print:text-slate-500">{res.total_marks}</td>
                                  <td className="px-5 py-3 text-right">
                                    <span className={`px-2 py-1 rounded text-xs font-bold print:bg-transparent print:border print:border-slate-300 ${
                                      res.grade.includes('A') ? 'bg-emerald-500/10 text-emerald-400' :
                                      res.grade.includes('F') ? 'bg-red-500/10 text-red-400' :
                                      'bg-blue-500/10 text-blue-400'
                                    }`}>
                                      {res.grade}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                <div className="mt-16 pt-8 border-t border-slate-700 print:border-slate-300 flex justify-between px-8">
                  <div className="text-center">
                    <div className="w-40 border-b border-slate-500 print:border-slate-400 mb-2"></div>
                    <span className="text-xs text-slate-400 uppercase font-bold print:text-slate-500">Class Teacher Signature</span>
                  </div>
                  <div className="text-center">
                    <div className="w-40 border-b border-slate-500 print:border-slate-400 mb-2"></div>
                    <span className="text-xs text-slate-400 uppercase font-bold print:text-slate-500">Principal Signature</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
