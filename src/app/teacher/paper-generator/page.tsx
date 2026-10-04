"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
  BookOpenCheck, BrainCircuit, ChevronRight, ClipboardList, FileStack,
  GraduationCap, Layers3, LibraryBig, NotebookTabs, ScanLine, Sparkles,
  UsersRound, WandSparkles, Wifi, ShieldCheck, RefreshCw, School, FileText,
} from "lucide-react";
import PTSPaperGenerator from "@/components/PaperGeneratorSaaS/PTSPaperGenerator";
import AIGeneratorTab from "@/components/PaperGeneratorSaaS/AIGeneratorTab";
import ManualQuestionEntry from "@/components/PaperGeneratorSaaS/ManualQuestionEntry";
import QuestionBankBrowser from "@/components/PaperGeneratorSaaS/QuestionBankBrowser";
import { usePaperStore } from "@/components/PaperGeneratorSaaS/usePaperStore";
import BoardPaperGenerator from "@/components/PaperGeneratorSaaS/BoardPaperGenerator";
import UnifiedPaperGenerator from "@/components/PaperGeneratorSaaS/UnifiedPaperGenerator";
import SavedPapersTab from "@/components/PaperGeneratorSaaS/SavedPapersTab";
import AIImportTab from "@/components/PaperGeneratorSaaS/AIImportTab";
import HandwrittenScannerTab from "@/components/PaperGeneratorSaaS/HandwrittenScannerTab";
import NotesMakerTab from "@/components/PaperGeneratorSaaS/NotesMakerTab";
import DailyDiaryFeature from "@/components/PaperGeneratorSaaS/DailyDiaryFeature";
import LessonPlanTab from "@/components/PaperGeneratorSaaS/LessonPlanTab";
import ConnectOnlineExamWizard from "@/components/OnlineExam/ConnectOnlineExamWizard";
import PaperAiJobToasts from "@/components/PaperGeneratorSaaS/PaperAiJobToasts";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/api";

type TabId = "build" | "unified" | "board" | "qbank" | "saved" | "manual" | "ai" | "import" | "scan" | "notes" | "diary" | "lesson" | "online";
type TeachingClass = { class_name: string; section?: string; subjects?: string[] };
type StudentRow = { id: number | string; name?: string; class?: string; section?: string; roll_number?: string | number };

type NavItem = { id: TabId; label: string; description: string; icon: ComponentType<{size?: number; className?: string}> };
const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  { label: "CREATE", items: [
    { id: "build", label: "Paper Builder", description: "School paper workflow", icon: FileText },
    { id: "unified", label: "Unified Builder", description: "Structured assessment", icon: Layers3 },
    { id: "board", label: "Board Pattern", description: "Board-style paper", icon: GraduationCap },
    { id: "manual", label: "Manual Entry", description: "Add your own questions", icon: NotebookTabs },
  ]},
  { label: "LIBRARY", items: [
    { id: "qbank", label: "Question Bank", description: "Approved assigned questions", icon: LibraryBig },
    { id: "saved", label: "My Papers", description: "Only papers created by you", icon: FileStack },
  ]},
  { label: "INTELLIGENCE", items: [
    { id: "ai", label: "AI Generator", description: "Generate a draft", icon: WandSparkles },
    { id: "import", label: "Import PDF", description: "Extract questions", icon: BrainCircuit },
    { id: "scan", label: "AI Scan", description: "Scan handwritten pages", icon: ScanLine },
  ]},
  { label: "TEACHING", items: [
    { id: "online", label: "Online Test", description: "Prepare online assessment", icon: Wifi },
    { id: "notes", label: "Notes Maker", description: "Create learning notes", icon: BookOpenCheck },
    { id: "diary", label: "Daily Diary", description: "Class diary", icon: ClipboardList },
    { id: "lesson", label: "Lesson Plans", description: "Plan instruction", icon: Sparkles },
  ]},
];

export default function TeacherPaperGenerator() {
  const { user } = useAuth();
  const { paperSettings, savedPapers } = usePaperStore();
  const [activeTab, setActiveTab] = useState<TabId>("build");
  const [loadedPaper, setLoadedPaper] = useState<any>(null);
  const [classes, setClasses] = useState<TeachingClass[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [schoolName, setSchoolName] = useState("AL SIDDIQUE SCHOLARS PUBLIC SCHOOL");
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const [contextError, setContextError] = useState("");
  const [contextLoading, setContextLoading] = useState(true);

  const loadContext = async () => {
    setContextLoading(true); setContextError("");
    const [teaching, roster, settings] = await Promise.allSettled([
      api.get("/portal/teaching-options"),
      api.get("/students?active=true"),
      api.get("/settings"),
    ]);
    let failures = 0;
    if (teaching.status === "fulfilled" && teaching.value.data?.success && Array.isArray(teaching.value.data?.data?.classes)) {
      setClasses(teaching.value.data.data.classes);
    } else { setClasses([]); failures++; }
    if (roster.status === "fulfilled" && roster.value.data?.success && Array.isArray(roster.value.data?.data)) {
      setStudents(roster.value.data.data);
    } else { setStudents([]); failures++; }
    if (settings.status === "fulfilled" && settings.value.data?.success && settings.value.data?.data) {
      const data = settings.value.data.data;
      if (data.school_name) setSchoolName(data.school_name);
      if (data.school_logo) setSchoolLogo(String(data.school_logo));
    }
    if (failures) setContextError("Some live class context could not be verified. Paper creation remains limited by server-side assignment rules.");
    setContextLoading(false);
  };

  useEffect(() => { loadContext(); }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const tab = new URLSearchParams(window.location.search).get("tab") as TabId | null;
    if (tab && NAV_GROUPS.some(group => group.items.some(item => item.id === tab))) setActiveTab(tab);
  }, []);

  const subjects = useMemo(() => [...new Set(classes.flatMap(item => item.subjects || []).filter(Boolean))], [classes]);
  const active = NAV_GROUPS.flatMap(group => group.items).find(item => item.id === activeTab) || NAV_GROUPS[0].items[0];
  const safeLogo = schoolLogo && (/^https?:\/\//i.test(schoolLogo) || schoolLogo.startsWith("/")) ? schoolLogo : null;

  const openTab = (id: TabId) => {
    setActiveTab(id);
    if (id !== "build") setLoadedPaper(null);
    if (typeof window !== "undefined") window.history.replaceState({}, "", `?tab=${id}`);
  };
  const handleProceedToPreview = (paper: any) => { setLoadedPaper(paper); openTab("build"); };

  return (
    <DashboardLayout role="teacher" title="Paper Studio">
      <PaperAiJobToasts />
      <div className="paper-studio-v4 paper-studio-v5">
        <section className="ps4-hero">
          <div className="ps4-brandmark" aria-hidden={!safeLogo}>
            {safeLogo ? <img src={safeLogo} alt={`${schoolName} logo`} /> : <ShieldCheck size={30} />}
          </div>
          <div className="ps4-hero-copy">
            <div className="ps4-eyebrow">ASSPS ACADEMIC OS · ASSESSMENT WORKSPACE V5</div>
            <h1>Paper Studio <span className="ps5-version">V5</span></h1>
            <p>Create secure, class-scoped assessments from the approved Question Bank, then continue them from <strong>My Papers</strong> anywhere you sign in.</p>
            <div className="ps4-school-line"><School size={14}/><span>{schoolName}</span></div>
          </div>
          <div className="ps4-session-card">
            <span className="ps4-session-dot" />
            <div><strong>{user?.name || "Teacher"}</strong><small>Signed in · server-scoped teacher session</small></div>
          </div>
        </section>

        {contextError && <div role="alert" className="ps4-context-error"><span>{contextError}</span><button type="button" onClick={loadContext}><RefreshCw size={14}/> Retry</button></div>}

        <section className="ps4-metrics" aria-label="Teaching context">
          <article><span className="ps4-metric-icon"><GraduationCap size={18}/></span><div><strong>{contextLoading ? "…" : classes.length}</strong><small>Assigned classes</small></div></article>
          <article><span className="ps4-metric-icon"><UsersRound size={18}/></span><div><strong>{contextLoading ? "…" : students.length}</strong><small>Assigned students</small></div></article>
          <article><span className="ps4-metric-icon"><LibraryBig size={18}/></span><div><strong>{contextLoading ? "…" : subjects.length}</strong><small>Assigned subjects</small></div></article>
          <article><span className="ps4-metric-icon"><FileStack size={18}/></span><div><strong>{savedPapers.length}</strong><small>My saved papers</small></div></article>
        </section>

        <section className="ps5-trust-strip" aria-label="Teacher paper access policy">
          <div><ShieldCheck size={18}/><span><strong>Private teacher vault</strong><small>My Papers contains only papers created by your signed-in account. Other teachers’ saved papers are neither listed nor editable here.</small></span></div>
          <div><LibraryBig size={18}/><span><strong>Scoped Question Bank</strong><small>Only approved questions for your assigned classes and subjects are available to select.</small></span></div>
          <div><School size={18}/><span><strong>Admin governed</strong><small>School-wide paper governance, approval and oversight remain an Admin/Principal responsibility.</small></span></div>
        </section>

        <section className="ps4-class-context">
          <div className="ps4-context-heading"><div><span>LIVE CLASS CONTEXT</span><strong>Your teaching scope</strong></div><small>Paper saving is server-blocked outside these assignments.</small></div>
          <div className="ps4-class-list">
            {!contextLoading && !classes.length ? <div className="ps4-empty-context">No class assignment is linked to this teacher account yet.</div> : classes.map((item, index) => (
              <div className="ps4-class-pill" key={`${item.class_name}-${item.section}-${index}`}>
                <span>{item.class_name}{item.section ? ` · ${item.section}` : ""}</span>
                <small>{(item.subjects || []).join(" · ") || "Assigned class"}</small>
              </div>
            ))}
          </div>
        </section>

        <div className="ps4-workspace">
          <aside className="ps4-rail" aria-label="Paper Studio tools">
            {NAV_GROUPS.map(group => <div className="ps4-nav-group" key={group.label}>
              <div className="ps4-nav-group-label">{group.label}</div>
              {group.items.map(item => {
                const Icon = item.icon; const selected = activeTab === item.id;
                return <button key={item.id} type="button" aria-current={selected ? "page" : undefined} className={`ps4-nav-item ${selected ? "is-active" : ""}`} onClick={() => openTab(item.id)}>
                  <span className="ps4-nav-icon"><Icon size={17}/></span>
                  <span className="ps4-nav-copy"><strong>{item.label}</strong><small>{item.description}</small></span>
                  <ChevronRight size={15} className="ps4-nav-chevron"/>
                </button>;
              })}
            </div>)}
          </aside>

          <main className="ps4-main">
            <header className="ps4-module-head"><div><span>{NAV_GROUPS.find(g => g.items.some(i => i.id === activeTab))?.label}</span><h2>{active.label}</h2><p>{active.description}. This workspace uses ASSPS paper rules and the server-authorized teacher scope.</p></div><ShieldCheck size={22}/></header>
            <div className="ps4-mobile-nav" aria-label="Paper Studio mobile tools">
              {NAV_GROUPS.flatMap(group => group.items).map(item => <button type="button" key={item.id} className={activeTab===item.id?"is-active":""} onClick={()=>openTab(item.id)}>{item.label}</button>)}
            </div>
            <div className={`paper-studio-v4-engine ps4-engine-${activeTab}`}>
              {activeTab === "build" && <PTSPaperGenerator loadedPaper={loadedPaper} />}
              {activeTab === "unified" && <UnifiedPaperGenerator />}
              {activeTab === "board" && <BoardPaperGenerator loadedPaper={loadedPaper} />}
              {activeTab === "qbank" && <QuestionBankBrowser />}
              {activeTab === "saved" && <SavedPapersTab onLoadPaper={(paper:any) => { setLoadedPaper(paper); openTab(paper?.sourceTab === "unified" || paper?.paperSource === "unified-paper-generator" ? "unified" : "build"); }} />}
              {activeTab === "manual" && <ManualQuestionEntry />}
              {activeTab === "ai" && <AIGeneratorTab onProceedToPreview={handleProceedToPreview} />}
              {activeTab === "import" && <AIImportTab />}
              {activeTab === "scan" && <HandwrittenScannerTab onProceedToPreview={handleProceedToPreview} />}
              {activeTab === "online" && <ConnectOnlineExamWizard />}
              {activeTab === "notes" && <NotesMakerTab />}
              {activeTab === "diary" && <DailyDiaryFeature />}
              {activeTab === "lesson" && <LessonPlanTab settings={paperSettings} />}
            </div>
          </main>
        </div>
      </div>
    </DashboardLayout>
  );
}
