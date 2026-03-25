// ============================================================
// RAGManagementTab — 教授用資料・課題ナレッジベース管理（RAG）
// Features:
//   - 授業回ティッカーで絞り込み表示
//   - ファイルをS3にアップロード（実際のストレージ）
//   - ドキュメントリスト（AIオン/オフ・削除・外部リンク）
// ============================================================
import { useState, useRef, useCallback } from "react";
import {
  Globe,
  File,
  Upload,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
  Loader2,
  Trash2,
} from "lucide-react";
import { lectures } from "@/lib/mockData";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

// ─── DocTypeIcon ─────────────────────────────────────────────
function DocTypeIcon({ type }: { type: string }) {
  const t = type.toLowerCase();
  if (t === "pdf") return (
    <div className="w-8 h-8 rounded bg-red-50 flex items-center justify-center shrink-0">
      <span className="text-[9px] font-bold text-red-600">PDF</span>
    </div>
  );
  if (t === "doc" || t === "docx") return (
    <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center shrink-0">
      <span className="text-[9px] font-bold text-blue-600">DOC</span>
    </div>
  );
  if (t === "ppt" || t === "pptx") return (
    <div className="w-8 h-8 rounded bg-orange-50 flex items-center justify-center shrink-0">
      <span className="text-[9px] font-bold text-orange-600">PPT</span>
    </div>
  );
  if (t === "web") return (
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
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [selectedLectureNumber, setSelectedLectureNumber] = useState<number>(1);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.documents.upload.useMutation({
    onSuccess: () => {
      toast.success(`第${selectedLectureNumber}回に「${title}」をアップロードしました`);
      onSuccess();
      onClose();
    },
    onError: (err) => {
      toast.error(`アップロード失敗: ${err.message}`);
    },
  });

  const handleFileSelect = (f: File) => {
    setFile(f);
    if (!title) {
      setTitle(f.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  }, [title]);

  const handleUpload = async () => {
    if (!file) { toast.error("ファイルを選択してください"); return; }
    if (!title.trim()) { toast.error("タイトルを入力してください"); return; }

    // Base64エンコード
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadMutation.mutate({
        lectureNumber: selectedLectureNumber,
        title: title.trim(),
        fileName: file.name,
        fileData: base64,
        fileSize: file.size,
        aiEnabled: "on",
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">資料をアップロード</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              対象の授業回・タイトル・ファイルを指定してください
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
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
                  onClick={() => setSelectedLectureNumber(lec.number)}
                  className={cn(
                    "flex items-center justify-center w-9 h-9 rounded-lg border text-xs font-bold font-['Inter'] transition-all",
                    selectedLectureNumber === lec.number
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background text-foreground border-border hover:border-primary/40 hover:bg-accent/40"
                  )}
                >
                  {lec.number}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">タイトル</p>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例：第1回 講義スライド（ガイダンス）"
              className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
            />
          </div>

          {/* File Drop Zone */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">ファイル</p>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all",
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40 hover:bg-accent/20"
              )}
            >
              {file ? (
                <div className="flex items-center justify-center gap-2">
                  <DocTypeIcon type={file.name.split(".").pop() ?? ""} />
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    クリックまたはドラッグ&ドロップでファイルを選択
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT
                  </p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileSelect(f);
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border flex gap-3">
          <button
            onClick={onClose}
            disabled={uploadMutation.isPending}
            className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            onClick={handleUpload}
            disabled={uploadMutation.isPending || !file}
            className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploadMutation.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" />アップロード中...</>
            ) : (
              <><Upload className="w-4 h-4" />アップロード</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────
export default function RAGManagementTab() {
  const [selectedLectureNumber, setSelectedLectureNumber] = useState<number>(1);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const tickerRef = useRef<HTMLDivElement>(null);

  const utils = trpc.useUtils();

  // DBから資料一覧を取得
  const { data: docs = [], isLoading } = trpc.documents.list.useQuery(
    { lectureNumber: selectedLectureNumber },
    { refetchOnWindowFocus: false }
  );

  const deleteMutation = trpc.documents.delete.useMutation({
    onSuccess: () => {
      toast.success("資料を削除しました");
      utils.documents.list.invalidate();
    },
    onError: (err) => toast.error(`削除失敗: ${err.message}`),
  });

  const toggleAiMutation = trpc.documents.toggleAi.useMutation({
    onSuccess: () => utils.documents.list.invalidate(),
    onError: (err) => toast.error(`更新失敗: ${err.message}`),
  });

  const goPrev = () => setSelectedLectureNumber((prev) => Math.max(1, prev - 1));
  const goNext = () => setSelectedLectureNumber((prev) => Math.min(lectures.length, prev + 1));

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
            disabled={selectedLectureNumber <= 1}
            className="p-1 rounded-md hover:bg-muted transition-colors disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div ref={tickerRef} className="flex-1 overflow-x-auto flex gap-1.5 px-0.5 scrollbar-none">
            {lectures.map((lec) => (
              <button
                key={lec.id}
                onClick={() => setSelectedLectureNumber(lec.number)}
                className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-lg border shrink-0 transition-all",
                  selectedLectureNumber === lec.number
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background text-foreground border-border hover:border-primary/40 hover:bg-accent/40"
                )}
              >
                <span className={cn(
                  "text-xs font-bold font-['Inter']",
                  selectedLectureNumber === lec.number ? "text-primary-foreground" : ""
                )}>
                  {lec.number}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={goNext}
            disabled={selectedLectureNumber >= lectures.length}
            className="p-1 rounded-md hover:bg-muted transition-colors disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Document Table */}
      <div className="border border-border rounded-xl overflow-hidden bg-card mb-4">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-0 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2.5 border-b border-border bg-muted/30">
          <div className="pl-11">ファイル名</div>
          <div className="w-28 text-center">AIナレッジ対象</div>
          <div className="w-16 text-center">開く</div>
          <div className="w-12 text-center">削除</div>
        </div>

        {isLoading ? (
          <div className="px-4 py-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            読み込み中...
          </div>
        ) : docs.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            第{selectedLectureNumber}回の資料はまだありません
          </div>
        ) : (
          docs.map((doc, idx) => (
            <div
              key={doc.id}
              className={cn(
                "grid grid-cols-[1fr_auto_auto_auto] gap-0 items-center px-4 py-3",
                idx < docs.length - 1 ? "border-b border-border/50" : "",
                "hover:bg-muted/20"
              )}
            >
              {/* File Info */}
              <div className="flex items-center gap-3 min-w-0">
                <DocTypeIcon type={doc.fileType} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : ""}
                  </p>
                </div>
              </div>

              {/* AI Toggle */}
              <div className="w-28 flex items-center justify-center gap-2">
                <button
                  onClick={() =>
                    toggleAiMutation.mutate({
                      id: doc.id,
                      aiEnabled: doc.aiEnabled === "on" ? "off" : "on",
                    })
                  }
                  className={cn(
                    "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                    doc.aiEnabled === "on" ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform",
                      doc.aiEnabled === "on" ? "translate-x-4" : "translate-x-1"
                    )}
                  />
                </button>
                <span className={cn(
                  "text-xs font-semibold",
                  doc.aiEnabled === "on" ? "text-primary" : "text-muted-foreground"
                )}>
                  {doc.aiEnabled === "on" ? "ON" : "OFF"}
                </span>
              </div>

              {/* Open Link */}
              <div className="w-16 flex items-center justify-center">
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg hover:bg-accent transition-colors text-primary"
                  title="外部リンクで開く"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Delete */}
              <div className="w-12 flex items-center justify-center">
                <button
                  onClick={() => deleteMutation.mutate({ id: doc.id })}
                  disabled={deleteMutation.isPending}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-destructive disabled:opacity-50"
                  title="削除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => utils.documents.list.invalidate()}
        />
      )}
    </div>
  );
}
