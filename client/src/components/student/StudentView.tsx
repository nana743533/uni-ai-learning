// ============================================================
// StudentView — 学生向けメインビュー
// Design: Academic Clarity
// Tabs: AI相談 | みんなのQ&A | 講義資料・知識 | 授業の情報 | 感想・要望
// ============================================================
import { useState } from "react";
import { cn } from "@/lib/utils";
import AIChatTab from "./AIChatTab";
import CommunityQATab from "./CommunityQATab";
import LectureDocsTab from "./LectureDocsTab";
import FeedbackTab from "./FeedbackTab";
import CourseInfoTab from "./CourseInfoTab";

type StudentTab = "ai-chat" | "community-qa" | "lecture-docs" | "course-info" | "feedback";

const tabs: { id: StudentTab; label: string }[] = [
  { id: "ai-chat", label: "AI相談" },
  { id: "community-qa", label: "みんなのQ&A" },
  { id: "lecture-docs", label: "講義資料・知識" },
  { id: "course-info", label: "授業の情報" },
  { id: "feedback", label: "感想・要望" },
];

export default function StudentView() {
  const [activeTab, setActiveTab] = useState<StudentTab>("community-qa");

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 pt-5 pb-0 border-b border-border bg-background">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              現代社会と心理学
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">全10回 — 学生ビュー</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary-foreground">教</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative px-4 py-2.5 text-sm font-medium transition-colors border-b-2 whitespace-nowrap shrink-0",
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
        {activeTab === "ai-chat" && <AIChatTab />}
        {activeTab === "community-qa" && <CommunityQATab />}
        {activeTab === "lecture-docs" && <LectureDocsTab />}
        {activeTab === "course-info" && <CourseInfoTab />}
        {activeTab === "feedback" && <FeedbackTab />}
      </div>
    </div>
  );
}
