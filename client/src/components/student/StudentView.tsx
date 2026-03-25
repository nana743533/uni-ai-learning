// ============================================================
// StudentView — 学生向けメインビュー
// Design: Academic Clarity
// Tabs: AI相談 | みんなのQ&A | 講義資料・知識
// ============================================================
import { useState } from "react";
import { cn } from "@/lib/utils";
import AIChatTab from "./AIChatTab";
import CommunityQATab from "./CommunityQATab";
import LectureDocsTab from "./LectureDocsTab";

type StudentTab = "ai-chat" | "community-qa" | "lecture-docs";

const tabs: { id: StudentTab; label: string }[] = [
  { id: "ai-chat", label: "AI相談" },
  { id: "community-qa", label: "みんなのQ&A" },
  { id: "lecture-docs", label: "講義資料・知識" },
];

export default function StudentView() {
  const [activeTab, setActiveTab] = useState<StudentTab>("community-qa");

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="px-6 border-b border-border bg-background shrink-0">
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
      </div>
    </div>
  );
}
