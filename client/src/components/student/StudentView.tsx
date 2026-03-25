// ============================================================
// StudentView — 学生向けメインビュー
// Design: Academic Clarity
// Tabs: AI相談 | みんなのQ&A | 講義資料・知識 | 感想・要望
// ============================================================
import { useState } from "react";
import { cn } from "@/lib/utils";
import { lectures } from "@/lib/mockData";
import AIChatTab from "./AIChatTab";
import CommunityQATab from "./CommunityQATab";
import LectureDocsTab from "./LectureDocsTab";
import FeedbackTab from "./FeedbackTab";

type StudentTab = "ai-chat" | "community-qa" | "lecture-docs" | "feedback";

const tabs: { id: StudentTab; label: string }[] = [
  { id: "ai-chat", label: "AI相談" },
  { id: "community-qa", label: "みんなのQ&A" },
  { id: "lecture-docs", label: "講義資料・知識" },
  { id: "feedback", label: "感想・要望" },
];

export default function StudentView({ lectureId }: { lectureId: number }) {
  const [activeTab, setActiveTab] = useState<StudentTab>("community-qa");
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
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary-foreground">教</span>
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
        {activeTab === "ai-chat" && <AIChatTab lectureTitle={lecture.title} />}
        {activeTab === "community-qa" && <CommunityQATab lectureTitle={lecture.title} />}
        {activeTab === "lecture-docs" && <LectureDocsTab lectureTitle={lecture.title} />}
        {activeTab === "feedback" && <FeedbackTab lectureTitle={lecture.title} />}
      </div>
    </div>
  );
}
