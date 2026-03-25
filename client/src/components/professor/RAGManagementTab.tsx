// ============================================================
// RAGManagementTab — 教授用資料・課題ナレッジベース管理（RAG）
// Design: Academic Clarity
// Features:
//   - 授業回ティッカーで絞り込み表示（学生側と同様）
//   - アップロード時に授業回を指定するモーダル
//   - ドキュメントリスト（チェックボックス・AIオン/オフ・削除）
//   - ドラッグ&ドロップアップロードエリア
// ============================================================
import { useState, useRef } from "react";
import {
  Globe,
  File,
  Upload,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
} from "lucide-react";
import { ragDocuments, lectures, type RAGDocument } from "@/lib/mockData";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── DocTypeIcon ─────────────────────────────────────────────
function DocTypeIcon({ type }: { type: string }) {
  if (type === "pdf") return (
    <div className="w-8 h-8 rounded bg-red-50 flex items-center justify-center shrink-0">
      <span className="text-[9px] font-bold text-red-600">PDF</span>
    </div>
  );
  if (type === "doc") return (
    <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center shrink-0">
      <span className="text-[9px] font-bold text-blue-600">DOC</span>
    </div>
  );
  if (type === "web") return (
    <div className="w-8 h-8 rounded bg-green-50 flex items-center justify-center shrink-0">
      <Globe className="w-4 h-4 text-green-600" />
    </div>
  );
  return (
    <div className="w-8 h-8 rounded bg-gray-50 flex items-center justify-center shrink-0">
      <File className="w-4 h-4 text-gray-500" />
    </div>
  );
}

// ─── Upload Modal ────────────────────────────────────────────
function UploadModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: (lectureId: number, title: string) => void;
  onCancel: () => void;
}) {
  const [selectedLectureId, setSelectedLectureId] = useState<number>(1);
  const [title, setTitle] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">資料をアップロード</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              対象の授業回とファイル名を指定してください
            </p>
          </div>
          <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Lecture Selector */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">対象の授業回</p>
            <div className="flex flex-wrap gap-1.5">
              {lectures.map((lec) => (
                <button
                  key={lec.id}
                  onClick={() => setSelectedLectureId(lec.id)}
                  className={cn(
                    "flex items-center justify-center w-9 h-9 rounded-lg border text-xs font-bold font-['Inter'] transition-all",
                    selectedLectureId === lec.id
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background text-foreground border-border hover:border-primary/40 hover:bg-accent/40"
                  )}
                >
                  {lec.number}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              選択中：第{lectures.find((l) => l.id === selectedLectureId)?.number}回
            </p>
          </div>

          {/* File Title */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">ファイル名・タイトル</p>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例：第1回 講義スライド（ガイダンス）"
              className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={() => {
              if (!title.trim()) { toast.error("ファイル名を入力してください"); return; }
              onConfirm(selectedLectureId, title.trim());
            }}
            className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            アップロード
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────
export default function RAGManagementTab() {
  const [docs, setDocs] = useState<RAGDocument[]>(ragDocuments);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedLectureId, setSelectedLectureId] = useState<number>(1);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const tickerRef = useRef<HTMLDivElement>(null);

  const filteredDocs = docs.filter((d) => d.lectureId === selectedLectureId);

  const goPrev = () => {
    setSelectedLectureId((prev) => Math.max(1, prev - 1));
  };
  const goNext = () => {
    setSelectedLectureId((prev) => Math.min(lectures.length, prev + 1));
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAI = (id: number) => {
    setDocs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, aiEnabled: !d.aiEnabled } : d))
    );
  };

  const handleDelete = (id: number) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
    toast.success("資料を削除しました");
  };

  const handleUploadConfirm = (lectureId: number, title: string) => {
    const newDoc: RAGDocument = {
      id: Date.now(),
      lectureId,
      type: "pdf",
      title,
      uploadedBy: "○○教授",
      aiEnabled: true,
    };
    setDocs((prev) => [...prev, newDoc]);
    setSelectedLectureId(lectureId);
    setShowUploadModal(false);
    toast.success(`第${lectures.find((l) => l.id === lectureId)?.number}回に「${title}」を追加しました`);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-foreground">
            教授用資料・課題ナレッジベース管理（RAG）
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            AIが参照する資料を管理します。ONにした資料のみAIが検索対象にします。
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          新規アップロード
        </button>
      </div>

      {/* ── 授業回ティッカー ─────────────────────────────── */}
      <div className="mb-4 bg-card border border-border rounded-xl px-3 py-2.5">
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            disabled={selectedLectureId <= 1}
            className="p-1 rounded-md hover:bg-muted transition-colors disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div ref={tickerRef} className="flex-1 overflow-x-auto flex gap-1.5 px-0.5 scrollbar-none">
            {lectures.map((lec) => {
              const count = docs.filter((d) => d.lectureId === lec.id).length;
              return (
                <button
                  key={lec.id}
                  onClick={() => setSelectedLectureId(lec.id)}
                  className={cn(
                    "relative flex items-center justify-center w-9 h-9 rounded-lg border shrink-0 transition-all",
                    selectedLectureId === lec.id
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background text-foreground border-border hover:border-primary/40 hover:bg-accent/40"
                  )}
                >
                  <span className={cn(
                    "text-xs font-bold font-['Inter']",
                    selectedLectureId === lec.id ? "text-primary-foreground" : ""
                  )}>
                    {lec.number}
                  </span>
                  {count > 0 && selectedLectureId !== lec.id && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-primary/80 text-[8px] font-bold text-white flex items-center justify-center font-['Inter']">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={goNext}
            disabled={selectedLectureId >= lectures.length}
            className="p-1 rounded-md hover:bg-muted transition-colors disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Document Table */}
      <div className="border border-border rounded-xl overflow-hidden bg-card mb-4">
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-0 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2.5 border-b border-border bg-muted/30">
          <div className="w-5" />
          <div className="pl-10">ファイル名</div>
          <div className="w-20 text-center">アップロード者</div>
          <div className="w-28 text-center">AIナレッジ対象</div>
          <div className="w-12 text-center">操作</div>
        </div>

        {filteredDocs.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            第{lectures.find((l) => l.id === selectedLectureId)?.number}回の資料はまだありません
          </div>
        ) : (
          filteredDocs.map((doc, idx) => (
            <div
              key={doc.id}
              className={cn(
                "grid grid-cols-[auto_1fr_auto_auto_auto] gap-0 items-center px-4 py-3",
                idx < filteredDocs.length - 1 ? "border-b border-border/50" : "",
                selected.has(doc.id) ? "bg-primary/5" : "hover:bg-muted/20"
              )}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selected.has(doc.id)}
                onChange={() => toggleSelect(doc.id)}
                className="w-4 h-4 rounded border-border accent-primary"
              />

              {/* File Info */}
              <div className="flex items-center gap-3 pl-3 min-w-0">
                <DocTypeIcon type={doc.type} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
                </div>
              </div>

              {/* Uploader */}
              <div className="w-20 text-center">
                <span className="text-xs text-muted-foreground">{doc.uploadedBy}</span>
              </div>

              {/* AI Toggle */}
              <div className="w-28 flex items-center justify-center gap-2">
                <button
                  onClick={() => toggleAI(doc.id)}
                  className="flex items-center gap-1.5"
                >
                  {doc.aiEnabled ? (
                    <>
                      <span className="text-[10px] font-bold text-primary">ON</span>
                      <div className="w-9 h-5 rounded-full bg-primary relative">
                        <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" />
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] font-bold text-muted-foreground">OFF</span>
                      <div className="w-9 h-5 rounded-full bg-muted relative">
                        <div className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" />
                      </div>
                    </>
                  )}
                </button>
              </div>

              {/* Delete */}
              <div className="w-12 flex justify-center">
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="px-2 py-1 text-[11px] font-medium text-destructive border border-destructive/30 rounded hover:bg-destructive/5 transition-colors"
                >
                  削除
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Drag & Drop Upload */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragOver(false); setShowUploadModal(true); }}
        onClick={() => setShowUploadModal(true)}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/40 hover:bg-accent/30"
        )}
      >
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <Upload className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">ドラッグ&ドロップ</p>
          <p className="text-xs text-muted-foreground mt-0.5">ファイルアップロード</p>
        </div>
        <p className="text-[11px] text-muted-foreground">PDF / DOC / DOCX / URL</p>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onConfirm={handleUploadConfirm}
          onCancel={() => setShowUploadModal(false)}
        />
      )}
    </div>
  );
}
