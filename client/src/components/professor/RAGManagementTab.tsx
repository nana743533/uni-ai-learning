// ============================================================
// RAGManagementTab — 教授用資料・課題ナレッジベース管理（RAG）
// Design: Academic Clarity
// Features:
//   - ドキュメントリスト（チェックボックス・AIオン/オフ・削除）
//   - ドラッグ&ドロップアップロードエリア
//   - 新規アップロードボタン
// ============================================================
import { useState } from "react";
import {
  FileText,
  Globe,
  File,
  Trash2,
  Upload,
  Plus,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { ragDocuments, type RAGDocument } from "@/lib/mockData";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

export default function RAGManagementTab() {
  const [docs, setDocs] = useState<RAGDocument[]>(ragDocuments);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [isDragOver, setIsDragOver] = useState(false);

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

  const handleUpload = () => {
    toast("アップロード機能は近日公開予定です");
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
          onClick={handleUpload}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          新規アップロード
        </button>
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

        {docs.map((doc, idx) => (
          <div
            key={doc.id}
            className={cn(
              "grid grid-cols-[auto_1fr_auto_auto_auto] gap-0 items-center px-4 py-3",
              idx < docs.length - 1 ? "border-b border-border/50" : "",
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
        ))}
      </div>

      {/* Drag & Drop Upload */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragOver(false); toast("アップロード機能は近日公開予定です"); }}
        onClick={handleUpload}
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
    </div>
  );
}
