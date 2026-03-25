// ============================================================
// ProfessorView — 教授向けメインビュー
// Design: Academic Clarity
// Tabs: 講義資料・課題(RAG) | 統計・分析 | 学生フィードバック
// ============================================================
import { useState } from "react";
import { cn } from "@/lib/utils";
import { lectures } from "@/lib/mockData";
import RAGManagementTab from "./RAGManagementTab";
import StatsTab from "./StatsTab";
import StudentFeedbackTab from "./StudentFeedbackTab";

type ProfessorTab = "rag" | "stats" | "feedback";

const tabs: { id: ProfessorTab; label: string }[] = [
  { id: "rag", label: "講義資料・課題（RAG）" },
  { id: "stats", label: "統計・分析" },
  { id: "feedback", label: "学生フィードバック" },
];

export default function ProfessorView({ lectureId }: { lectureId: number }) {
  const [activeTab, setActiveTab] = useState<ProfessorTab>("rag");
  const lecture = lectures.find((l) => l.id === lectureId) ?? lectures[0];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 pt-5 pb-0 border-b border-border bg-background">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              現代社会と心理学（{lecture.number}回）
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">{lecture.number}回目</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-amber-700">教</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative px-4 py-2.5 text-sm font-medium transition-colors border-b-2",
                activeTab === tab.id
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === "rag" && <RAGManagementTab />}
        {activeTab === "stats" && <StatsTab />}
        {activeTab === "feedback" && <StudentFeedbackTab />}
      </div>
    </div>
  );
}
