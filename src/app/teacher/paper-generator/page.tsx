"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import PTSPaperGenerator from "@/components/PaperGeneratorSaaS/PTSPaperGenerator";
import AIGeneratorTab from "@/components/PaperGeneratorSaaS/AIGeneratorTab";
import ManualPaperTab from "@/components/PaperGeneratorSaaS/ManualPaperTab";
import HandwrittenScannerTab from "@/components/PaperGeneratorSaaS/HandwrittenScannerTab";
import DailyDiaryFeature from "@/components/PaperGeneratorSaaS/DailyDiaryFeature";
import LessonPlanTab from "@/components/PaperGeneratorSaaS/LessonPlanTab";
import NotesMakerTab from "@/components/PaperGeneratorSaaS/NotesMakerTab";
import AIImportTab from "@/components/PaperGeneratorSaaS/AIImportTab";
import ManualQuestionEntry from "@/components/PaperGeneratorSaaS/ManualQuestionEntry";
import QuestionBankBrowser from "@/components/PaperGeneratorSaaS/QuestionBankBrowser";
import { usePaperStore } from "@/components/PaperGeneratorSaaS/usePaperStore";
import BoardPaperGenerator from "@/components/PaperGeneratorSaaS/BoardPaperGenerator";
import UnifiedPaperGenerator from "@/components/PaperGeneratorSaaS/UnifiedPaperGenerator";
import { useAuth } from "@/context/AuthContext";

const C = {
  gold:'#C8991A', goldL:'#e8b420', silver:'#E2E8F0',
  muted:'#94A3B8', border:'rgba(148,163,184,0.18)',
}

type TabId = 'build' | 'unified' | 'board' | 'qbank' | 'manual' | 'ai' | 'import' | 'scan' | 'notes' | 'diary' | 'lesson'

const TABS: { id: TabId; label: string; adminOnly?: boolean }[] = [
  { id: 'build', label: 'School Paper' },
  { id: 'unified', label: 'Unified Paper Generator' },
  { id: 'board', label: 'Board Paper' },
  { id: 'qbank', label: 'Question Bank' },
  { id: 'import', label: 'AI Import PDF' },
  { id: 'manual', label: 'Manual Entry' },
  { id: 'ai', label: 'AI Generator' },
  { id: 'notes', label: 'Notes Maker' },
  { id: 'diary', label: 'Daily Diary' },
  { id: 'lesson', label: 'Lesson Plans' },
  { id: 'scan', label: 'AI Scan' },
]

const TEACHER_TABS = TABS.filter((tab) => !tab.adminOnly);

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      background: active ? `linear-gradient(135deg, ${C.gold}, ${C.goldL})` : 'rgba(8,24,43,0.96)',
      color: active ? '#071e34' : '#d8e2f0',
      fontWeight: 600, fontSize: 13, padding: '10px 18px', borderRadius: 14,
      border: active ? 'none' : `1px solid rgba(200,153,26,0.14)`,
      cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s',
      boxShadow: active ? '0 12px 24px rgba(200,153,26,0.16)' : 'none',
    }}>
      {children}
    </button>
  )
}

export default function TeacherPaperGenerator() {
  const { user } = useAuth();
  const { paperSettings } = usePaperStore();
  const [activeTab, setActiveTab] = useState<TabId>("build");
  const [loadedPaper, setLoadedPaper] = useState<any>(null);

  const handleProceedToPreview = (paper: any) => {
    setLoadedPaper(paper);
    setActiveTab('build');
  };

  return (
    <DashboardLayout role="teacher" title="Paper Generator">
      <div className="overflow-hidden rounded-3xl border border-slate-700/60 bg-[#0b2747] shadow-2xl min-h-[85vh]">

        {/* Tab strip */}
        <div className="paper-generator-tabs" style={{
          background: 'rgba(11,44,77,0.98)', padding: '12px 24px',
          display: 'flex', gap: 10, alignItems: 'center',
          borderBottom: '1px solid rgba(200,153,26,0.14)',
          flexWrap: 'nowrap',
          overflowX: 'auto',
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
        }}>
          {TEACHER_TABS.map(t => (
            <TabBtn key={t.id} active={activeTab === t.id} onClick={() => { setActiveTab(t.id); if (t.id !== 'build') setLoadedPaper(null) }}>
              {t.label}
            </TabBtn>
          ))}
          <div className="paper-generator-tabs-status" style={{ marginLeft: 'auto', fontSize: 11, color: '#e8b420', fontWeight: 600, flex: '0 0 auto' }}>
            Connected as {user?.name || 'Teacher'} - SaaS session active
          </div>
        </div>

        {/* Tab content */}
        <div className="paper-generator-content" style={{ padding: '24px' }}>
          {activeTab === 'build' && <PTSPaperGenerator loadedPaper={loadedPaper} />}
          {activeTab === 'unified' && <UnifiedPaperGenerator />}
          {activeTab === 'board' && <BoardPaperGenerator loadedPaper={loadedPaper} />}
          {activeTab === 'qbank' && <QuestionBankBrowser />}
          {activeTab === 'import' && <AIImportTab />}
          {activeTab === 'manual' && <ManualQuestionEntry />}
          {activeTab === 'ai' && <AIGeneratorTab onProceedToPreview={handleProceedToPreview} />}
          {activeTab === 'notes' && <NotesMakerTab />}
          {activeTab === 'diary' && <DailyDiaryFeature />}
          {activeTab === 'lesson' && <LessonPlanTab settings={paperSettings} />}
          {activeTab === 'scan' && <HandwrittenScannerTab onProceedToPreview={handleProceedToPreview} />}
        </div>

      </div>
    </DashboardLayout>
  );
}
