"use client";

import DashboardLayout from "@/components/DashboardLayout";
import api from "@/utils/api";
import { useSchoolBranding } from "@/hooks/useSchoolBranding";
import {
  FileText,
  Loader2,
  Printer,
  Search,
  User,
  GraduationCap,
  LayoutTemplate,
  FileSpreadsheet
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
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
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

const TEMPLATES = [
  { id: 'modern', name: 'Modern Radar' },
  { id: 'classic', name: 'Classic Tabular' },
  { id: 'visual', name: 'Visual Analytics' },
  { id: 'minimalist', name: 'Minimalist' },
  { id: 'comprehensive', name: 'Comprehensive Board' },
];

export default function ReportCards() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  
  const [activeTemplate, setActiveTemplate] = useState('modern');
  const [isBlankMode, setIsBlankMode] = useState(false);

  const { schoolName } = useSchoolBranding();

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    try {
      setLoading(true);
      const res = await api.get("/admin/students");
      setStudents(res.data?.data || []);
    } catch {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadStudentResults(student: Student) {
    setSelectedStudent(student);
    setIsBlankMode(false);
    setResultsLoading(true);
    try {
      const res = await api.get(`/exams/student-results/${student.id}`);
      setResults(res.data?.data || []);
    } catch {
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

  const resultsByExam = results.reduce((acc, r) => {
    if (!acc[r.exam_name]) acc[r.exam_name] = [];
    acc[r.exam_name].push(r);
    return acc;
  }, {} as Record<string, Result[]>);

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
      return { subject, percentage: pct, fill: pct >= 50 ? '#30D158' : '#FF375F' };
    });
  })();

  const printReport = () => window.print();

  const handleBlankSheetToggle = () => {
    setIsBlankMode(true);
    setSelectedStudent(null);
  }

  // â”€â”€â”€ TEMPLATE 1: Modern Radar â”€â”€â”€
  const renderModernRadar = (examName: string, examResults: Result[]) => {
    const totalObtained = examResults.reduce((sum, r) => sum + Number(r.marks_obtained || 0), 0);
    const totalMax = examResults.reduce((sum, r) => sum + Number(r.total_marks || 0), 0);
    const percentage = totalMax ? Math.round((totalObtained / totalMax) * 100) : 0;
    const overallGrade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : percentage >= 50 ? 'D' : percentage >= 33 ? 'E' : 'F';

    return (
      <div key={examName} className="border border-slate-700/50 rounded-2xl overflow-hidden print:border-slate-300 print:break-inside-avoid mb-8">
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
  };

  // â”€â”€â”€ TEMPLATE 2: Classic Tabular â”€â”€â”€
  const renderClassicTabular = (examName: string, examResults: Result[]) => {
    return (
      <div key={examName} className="mb-8 border-2 border-black p-6 print:break-inside-avoid bg-white">
        <h3 className="text-xl font-black text-center uppercase border-b-2 border-black pb-2 mb-4 text-black">{examName}</h3>
        <table className="w-full text-sm text-black border-collapse border border-black mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black px-4 py-2 text-left">Subject</th>
              <th className="border border-black px-4 py-2 text-center">Max Marks</th>
              <th className="border border-black px-4 py-2 text-center">Obtained</th>
              <th className="border border-black px-4 py-2 text-center">Grade</th>
            </tr>
          </thead>
          <tbody>
            {examResults.map((res) => (
              <tr key={res.id}>
                <td className="border border-black px-4 py-2 font-medium">{res.subject}</td>
                <td className="border border-black px-4 py-2 text-center">{res.total_marks}</td>
                <td className="border border-black px-4 py-2 text-center">{res.marks_obtained}</td>
                <td className="border border-black px-4 py-2 text-center font-bold">{res.grade}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold bg-gray-50">
              <td className="border border-black px-4 py-2 text-right">TOTAL</td>
              <td className="border border-black px-4 py-2 text-center">{examResults.reduce((s,r)=>s+Number(r.total_marks),0)}</td>
              <td className="border border-black px-4 py-2 text-center">{examResults.reduce((s,r)=>s+Number(r.marks_obtained),0)}</td>
              <td className="border border-black px-4 py-2 text-center">
                {Math.round((examResults.reduce((s,r)=>s+Number(r.marks_obtained),0) / examResults.reduce((s,r)=>s+Number(r.total_marks),0)) * 100) || 0}%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  };

  // â”€â”€â”€ TEMPLATE 3: Visual Analytics â”€â”€â”€
  const renderVisual = (examName: string, examResults: Result[]) => {
    const chartData = examResults.map(r => ({
      name: r.subject,
      obtained: Number(r.marks_obtained),
      lost: Number(r.total_marks) - Number(r.marks_obtained)
    }));

    return (
      <div key={examName} className="mb-8 p-6 bg-white border border-slate-200 rounded-xl shadow-sm print:break-inside-avoid">
        <h3 className="text-xl font-bold text-slate-800 mb-6">{examName}</h3>
        <div className="flex flex-col md:flex-row gap-6 items-center mb-6">
          <div className="w-full md:w-1/2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                <RechartsTooltip />
                <Bar dataKey="obtained" stackId="a" fill="#10b981" name="Marks Obtained" />
                <Bar dataKey="lost" stackId="a" fill="#ef4444" name="Marks Lost" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full md:w-1/2">
            <table className="w-full text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2 text-left">Subject</th>
                  <th className="px-3 py-2 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {examResults.map(r => (
                  <tr key={r.id}>
                    <td className="px-3 py-2 font-medium">{r.subject}</td>
                    <td className="px-3 py-2 text-right">
                      {r.marks_obtained}/{r.total_marks} 
                      <span className="ml-2 font-bold px-1.5 py-0.5 bg-slate-100 rounded text-xs">{r.grade}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // â”€â”€â”€ TEMPLATE 4: Minimalist â”€â”€â”€
  const renderMinimalist = (examName: string, examResults: Result[]) => {
    return (
      <div key={examName} className="mb-12 print:break-inside-avoid">
        <h3 className="text-2xl font-light text-slate-900 tracking-tight mb-4">{examName}</h3>
        <div className="w-12 h-1 bg-blue-500 mb-6"></div>
        <div className="space-y-4">
          {examResults.map(r => (
            <div key={r.id} className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div className="text-lg text-slate-700">{r.subject}</div>
              <div className="flex gap-8 items-center">
                <div className="text-slate-500 w-16 text-right">{r.marks_obtained} / {r.total_marks}</div>
                <div className="text-xl font-bold w-12 text-center text-slate-800">{r.grade}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // â”€â”€â”€ TEMPLATE 5: Comprehensive Board â”€â”€â”€
  const renderComprehensive = (examName: string, examResults: Result[]) => {
    const totalMax = examResults.reduce((s,r)=>s+Number(r.total_marks),0);
    const totalObt = examResults.reduce((s,r)=>s+Number(r.marks_obtained),0);
    const pct = totalMax ? ((totalObt/totalMax)*100).toFixed(1) : 0;
    
    return (
      <div key={examName} className="mb-8 border border-slate-800 bg-white p-8 print:break-inside-avoid shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100 rounded-bl-full -z-10"></div>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-slate-900 tracking-widest uppercase border-b-4 border-double border-slate-800 inline-block pb-1 px-4">{examName}</h2>
          <p className="text-slate-500 mt-2 tracking-widest text-sm uppercase">Official Board Result Transcript</p>
        </div>
        
        <table className="w-full text-slate-800 border-2 border-slate-800 mb-6">
          <thead className="bg-slate-800 text-white font-bold tracking-wider text-sm">
            <tr>
              <th className="py-2 px-4 text-left border-r border-slate-600">SUBJECT TITLE</th>
              <th className="py-2 px-4 text-center border-r border-slate-600">MAXIMUM</th>
              <th className="py-2 px-4 text-center border-r border-slate-600">OBTAINED</th>
              <th className="py-2 px-4 text-center border-r border-slate-600">PERCENT</th>
              <th className="py-2 px-4 text-center">GRADE</th>
            </tr>
          </thead>
          <tbody>
            {examResults.map(r => {
              const spct = Number(r.total_marks) ? Math.round((Number(r.marks_obtained)/Number(r.total_marks))*100) : 0;
              return (
                <tr key={r.id} className="border-b border-slate-300">
                  <td className="py-2 px-4 border-r border-slate-300 font-semibold">{r.subject}</td>
                  <td className="py-2 px-4 text-center border-r border-slate-300 text-slate-600">{r.total_marks}</td>
                  <td className="py-2 px-4 text-center border-r border-slate-300 font-bold">{r.marks_obtained}</td>
                  <td className="py-2 px-4 text-center border-r border-slate-300 text-slate-600">{spct}%</td>
                  <td className="py-2 px-4 text-center font-black">{r.grade}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot className="bg-slate-100 border-t-2 border-slate-800">
            <tr>
              <td className="py-3 px-4 text-right font-black tracking-widest">GRAND TOTAL</td>
              <td className="py-3 px-4 text-center font-bold text-slate-700">{totalMax}</td>
              <td className="py-3 px-4 text-center font-black text-xl">{totalObt}</td>
              <td className="py-3 px-4 text-center font-bold text-blue-600">{pct}%</td>
              <td className="py-3 px-4 text-center font-bold">-</td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  };

  const renderTemplateSelector = () => (
    <div className="flex gap-2 p-1 bg-slate-800/50 rounded-xl overflow-x-auto w-full max-w-full print:hidden hide-scrollbar">
      {TEMPLATES.map(t => (
        <button
          key={t.id}
          onClick={() => setActiveTemplate(t.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
            activeTemplate === t.id ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
          }`}
        >
          <LayoutTemplate className="w-4 h-4" /> {t.name}
        </button>
      ))}
    </div>
  );

  return (
    <DashboardLayout role="teacher" title="Automated Report Cards">
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] print:h-auto">
        {/* Left Sidebar: Students List (Hidden on Print) */}
        <div className="w-full lg:w-1/3 flex flex-col glass-card overflow-hidden print:hidden">
          <div className="p-4 border-b border-slate-700/50 bg-slate-800/30">
            <h3 className="text-lg font-bold text-white mb-3">Select Student</h3>
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, roll, class..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleBlankSheetToggle}
              className={`w-full flex justify-center items-center gap-2 p-2 rounded-xl text-sm font-bold border transition-all ${
                isBlankMode ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" /> Print Blank Mark Sheet
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="py-12 text-center"><Loader2 className="w-6 h-6 animate-spin text-blue-400 mx-auto" /></div>
            ) : filteredStudents.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">No students found.</div>
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
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0">
                      {s.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-white font-medium text-sm truncate">{s.name}</div>
                      <div className="text-slate-400 text-xs truncate">
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
          {isBlankMode ? (
            <div className="glass-card p-8 bg-white border-none print:shadow-none print:p-0">
               <div className="flex justify-between items-center mb-6 print:hidden">
                 <h2 className="text-2xl font-bold text-slate-800">Blank Mark Sheet Template</h2>
                 <button onClick={printReport} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-semibold text-sm">
                  <Printer className="w-4 h-4" /> Print Mark Sheet
                 </button>
               </div>
               
               <div className="text-center mb-8">
                  <h1 className="text-3xl font-black text-black uppercase tracking-wider">{schoolName || 'Al Siddique Smart School'}</h1>
                  <p className="text-slate-600 mt-2 uppercase font-bold tracking-widest">Teacher Manual Mark Sheet</p>
               </div>
               
               <div className="w-full overflow-x-auto">
                 <table className="w-full text-sm text-black border-collapse border border-black min-w-max">
                   <thead>
                     <tr className="bg-gray-100">
                       <th className="border border-black px-2 py-3 w-16">Roll No</th>
                       <th className="border border-black px-4 py-3 w-48 text-left">Student Name</th>
                       {[1,2,3,4,5,6,7,8].map(i => (
                         <th key={i} className="border border-black px-2 py-3 w-16 text-center text-xs text-slate-400">Subj {i}</th>
                       ))}
                       <th className="border border-black px-2 py-3 w-20 text-center">Total</th>
                       <th className="border border-black px-2 py-3 w-24 text-center">Remarks</th>
                     </tr>
                   </thead>
                   <tbody>
                     {filteredStudents.length > 0 ? filteredStudents.slice(0, 30).map((s, idx) => (
                       <tr key={s.id}>
                         <td className="border border-black px-2 py-3 text-center">{s.roll_number || s.gr_number || idx + 1}</td>
                         <td className="border border-black px-4 py-3 font-semibold">{s.name}</td>
                         {[1,2,3,4,5,6,7,8].map(i => (
                           <td key={i} className="border border-black px-2 py-3 text-center"></td>
                         ))}
                         <td className="border border-black px-2 py-3 text-center bg-gray-50"></td>
                         <td className="border border-black px-2 py-3 text-center"></td>
                       </tr>
                     )) : (
                       Array.from({ length: 25 }).map((_, idx) => (
                         <tr key={idx}>
                           <td className="border border-black px-2 py-3 text-center text-transparent">00</td>
                           <td className="border border-black px-4 py-3 text-transparent">Student Name</td>
                           {[1,2,3,4,5,6,7,8].map(i => (
                             <td key={i} className="border border-black px-2 py-3 text-center"></td>
                           ))}
                           <td className="border border-black px-2 py-3 text-center bg-gray-50"></td>
                           <td className="border border-black px-2 py-3 text-center"></td>
                         </tr>
                       ))
                     )}
                   </tbody>
                 </table>
               </div>
            </div>
          ) : !selectedStudent ? (
            <div className="glass-card h-full flex flex-col items-center justify-center text-slate-500 p-12 print:hidden">
              <FileText className="w-16 h-16 mb-4 opacity-20" />
              <h2 className="text-xl font-bold text-white mb-2">Automated Report Cards</h2>
              <p className="text-sm max-w-sm text-center">Select a student to generate premium report cards, or click Print Blank Mark Sheet for manual entry sheets.</p>
            </div>
          ) : resultsLoading ? (
            <div className="glass-card h-full flex items-center justify-center print:hidden">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
          ) : (
            <div className="space-y-6 print:space-y-8">
              {/* Header Action */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden glass-card p-4">
                <div className="text-slate-300 text-sm">
                  Viewing results for <span className="text-white font-bold">{selectedStudent.name}</span>
                </div>
                <button
                  onClick={printReport}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-semibold text-sm shrink-0"
                >
                  <Printer className="w-4 h-4" /> Print Report Card
                </button>
              </div>

              {renderTemplateSelector()}

              {/* Printable Report Card Area */}
              <div className="glass-card p-8 bg-slate-900 border-slate-700 print:border-none print:shadow-none print:p-0 print:bg-white text-black bg-white rounded-2xl min-h-screen">
                <div className="text-center mb-8 border-b border-slate-300 pb-6">
                  <h1 className="text-3xl font-black text-black uppercase tracking-wider">{schoolName || 'Al Siddique Smart School'}</h1>
                  <p className="text-slate-600 mt-2 font-bold tracking-widest">STUDENT ACADEMIC PROFILE</p>
                </div>

                {/* Always show Student Details Header on Print */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-300">
                    <h3 className="text-slate-500 text-xs font-bold uppercase mb-4 flex items-center gap-2">
                      <User className="w-4 h-4" /> Student Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-slate-600">Name</span>
                        <span className="text-black font-bold">{selectedStudent.name}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-slate-600">Class & Section</span>
                        <span className="text-black font-bold">{selectedStudent.class} {selectedStudent.section}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-slate-600">Roll / GR Number</span>
                        <span className="text-black font-bold">{selectedStudent.roll_number || selectedStudent.gr_number}</span>
                      </div>
                    </div>
                  </div>

                  {activeTemplate === 'modern' && radarData.length > 2 && (
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-300 flex flex-col items-center">
                      <h3 className="text-slate-500 text-xs font-bold uppercase w-full mb-2 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" /> Performance Radar
                      </h3>
                      <div className="h-48 w-full max-w-[250px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                            <PolarGrid stroke="#cbd5e1" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                            <Radar name="Score %" dataKey="percentage" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                            <RechartsTooltip wrapperClassName="print:hidden" />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                  {activeTemplate === 'visual' && radarData.length > 0 && (
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-300 flex flex-col items-center">
                       <h3 className="text-slate-500 text-xs font-bold uppercase w-full mb-2 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" /> Score Distribution
                      </h3>
                      <div className="h-48 w-full max-w-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={radarData} dataKey="percentage" nameKey="subject" cx="50%" cy="50%" outerRadius={60} label>
                              {radarData.map((entry, index) => <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />)}
                            </Pie>
                            <RechartsTooltip wrapperClassName="print:hidden" />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>

                {Object.keys(resultsByExam).length === 0 ? (
                  <div className="text-center py-12 text-slate-500 border border-dashed border-slate-300 rounded-2xl">
                    No examination results found for this student.
                  </div>
                ) : (
                  <div className="space-y-8">
                    {Object.entries(resultsByExam).map(([examName, examResults]) => {
                      if (activeTemplate === 'classic') return renderClassicTabular(examName, examResults);
                      if (activeTemplate === 'visual') return renderVisual(examName, examResults);
                      if (activeTemplate === 'minimalist') return renderMinimalist(examName, examResults);
                      if (activeTemplate === 'comprehensive') return renderComprehensive(examName, examResults);
                      return renderModernRadar(examName, examResults);
                    })}
                  </div>
                )}
                
                <div className="mt-16 pt-8 border-t border-slate-300 flex justify-between px-8">
                  <div className="text-center">
                    <div className="w-40 border-b border-slate-400 mb-2"></div>
                    <span className="text-xs text-slate-500 uppercase font-bold">Class Teacher Signature</span>
                  </div>
                  <div className="text-center">
                    <div className="w-40 border-b border-slate-400 mb-2"></div>
                    <span className="text-xs text-slate-500 uppercase font-bold">Principal Signature</span>
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
