// ============================================================
// ProfessorView — 教授向けメインビュー
// Design: Academic Clarity
// Tabs: 講義資料・課題(RAG) のみ
// ============================================================
import { lectures } from "@/lib/mockData";
import RAGManagementTab from "./RAGManagementTab";

export default function ProfessorView({ lectureId }: { lectureId: number }) {
  const lecture = lectures.find((l) => l.id === lectureId) ?? lectures[0];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-border bg-background">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              現代社会と心理学（{lecture.number}回）
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">{lecture.number}回目 — 教授用管理画面</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-amber-700">教</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content: RAG Management only */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <RAGManagementTab />
      </div>
    </div>
  );
}
