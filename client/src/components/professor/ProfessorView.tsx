// ============================================================
// ProfessorView — 教授向けメインビュー
// Design: Academic Clarity
// Tabs: 講義資料・課題(RAG) のみ
// ============================================================
import RAGManagementTab from "./RAGManagementTab";

export default function ProfessorView() {
  return (
    <div className="flex flex-col h-full">
      {/* Content: RAG Management only */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <RAGManagementTab />
      </div>
    </div>
  );
}
