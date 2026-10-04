"use client";

import DashboardLayout from "@/components/DashboardLayout";
import QuestionBankBrowser from "@/components/PaperGeneratorSaaS/QuestionBankBrowser";
import SettingsTab from "@/components/PaperGeneratorSaaS/SettingsTab";
import { useState } from "react";

const C = {
  gold: "#C8991A",
  goldL: "#e8b420",
  silver: "#E2E8F0",
  muted: "#94A3B8",
  border: "rgba(148,163,184,0.18)",
};

type SubTab = "browse" | "settings";

function SubTabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: active ? `linear-gradient(135deg, ${C.gold}, ${C.goldL})` : "rgba(8,24,43,0.96)",
        color: active ? "#071e34" : C.silver,
        fontWeight: 700,
        fontSize: 13,
        padding: "9px 16px",
        borderRadius: 12,
        border: active ? "none" : `1px solid ${C.border}`,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

export default function TeacherQuestionBankPage() {
  const [subTab, setSubTab] = useState<SubTab>("browse");

  return (
    <DashboardLayout role="teacher" title="Question Bank">
      <div className="overflow-hidden rounded-3xl border border-slate-700/60 bg-[#0b2747] shadow-2xl min-h-[85vh]">
        <div
          style={{
            background: "rgba(11,44,77,0.98)",
            padding: "12px 24px",
            display: "flex",
            gap: 10,
            alignItems: "center",
            borderBottom: "1px solid rgba(200,153,26,0.14)",
            flexWrap: "wrap",
          }}
        >
          <SubTabBtn active={subTab === "browse"} onClick={() => setSubTab("browse")}>
            Browse & Manage
          </SubTabBtn>
          <SubTabBtn active={subTab === "settings"} onClick={() => setSubTab("settings")}>
            School Logo & Settings
          </SubTabBtn>
          <div style={{ marginLeft: "auto", fontSize: 12, color: C.muted }}>
            Upload your school logo here — it appears on all paper templates.
          </div>
        </div>

        <div style={{ padding: 24 }}>
          {subTab === "browse" && <QuestionBankBrowser />}
          {subTab === "settings" && <SettingsTab />}
        </div>
      </div>
    </DashboardLayout>
  );
}
