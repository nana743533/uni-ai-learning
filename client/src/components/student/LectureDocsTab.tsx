// ============================================================
// LectureDocsTab — 講義資料・知識タブ（学生向け）
// Features:
//   - 授業回ティッカーで絞り込み
//   - S3にアップロードされた実際の資料を表示
//   - AIナレッジ対象/対象外で分類
//   - 外部リンクで資料を開く
// ============================================================
import { useState } from "react";
import { FileText, Globe, File, ExternalLink, Search, ChevronLeft, ChevronRight, Lock, Loader2 } from "lucide-react";
import { lectures } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

function DocTypeIcon({ type }: { type: string }) {
  const t = (type ?? "").toLowerCase();
  if (t === "pdf") return (
    <div className="w-8 h-8 rounded bg-red-50 flex items-center justify-center shrink-0">
      <FileText className="w-4 h-4 text-red-500" />
    </div>
  );
  if (t === "doc" || t === "docx") return (
    <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center shrink-0">
      <FileText className="w-4 h-4 text-blue-500" />
    </div>
  );
  if (t === "ppt" || t === "pptx") return (
    <div className="w-8 h-8 rounded bg-orange-50 flex items-center justify-center shrink-0">
      <FileText className="w-4 h-4 text-orange-500" />
    </div>
  );
  if (t === "web") return (
    <div className="w-8 h-8 rounded bg-green-50 flex items-center justify-center shrink-0">
      <Globe className="w-4 h-4 text-green-500" />
    </div>
  );
  return (
    <div className="w-8 h-8 rounded bg-gray-50 flex items-center justify-center shrink-0">
      <File className="w-4 h-4 text-gray-500" />
    </div>
  );
}

export default function LectureDocsTab() {
  const defaultLecture = lectures.find((l) => l.status === "current") ?? lectures[0];
  const [selectedLectureNumber, setSelectedLectureNumber] = useState(defaultLecture.number);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedLecture = lectures.find((l) => l.number === selectedLectureNumber) ?? lectures[0];
  const selectedIndex = lectures.findIndex((l) => l.number === selectedLectureNumber);

  const goPrev = () => {
    if (selectedIndex > 0) setSelectedLectureNumber(lectures[selectedIndex - 1].number);
  };
  const goNext = () => {
    if (selectedIndex < lectures.length - 1) setSelectedLectureNumber(lectures[selectedIndex + 1].number);
  };

  // DBから資料一覧を取得（AIオンのもののみ学生に表示）
  const { data: docs = [], isLoading } = trpc.documents.list.useQuery(
    { lectureNumber: selectedLectureNumber },
    { refetchOnWindowFocus: false }
  );

  const filteredDocs = docs.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const enabledDocs = filteredDocs.filter((d) => d.aiEnabled === "on");
  const disabledDocs = filteredDocs.filter((d) => d.aiEnabled !== "on");
  const isUpcoming = selectedLecture.status === "upcoming";

  return (
    <div className="flex flex-col h-full">
      {/* ── 授業回セレクター ─────────────────────────────── */}
      <div className="px-4 py-3 border-b border-border bg-background shrink-0">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          授業回を選択
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={goPrev}
            disabled={selectedIndex === 0}
            className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-colors shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex-1 overflow-x-auto flex gap-1.5 px-0.5 scrollbar-none">
            {lectures.map((lec) => (
              <button
                key={lec.id}
                onClick={() => setSelectedLectureNumber(lec.number)}
                className={cn(
                  "flex items-center justify-center px-3 py-1.5 rounded-lg border shrink-0 transition-all",
                  selectedLectureNumber === lec.number
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : lec.status === "upcoming"
                    ? "bg-background text-muted-foreground border-border opacity-60 hover:opacity-100"
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
            disabled={selectedIndex === lectures.length - 1}
            className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-colors shrink-0"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── コンテンツ ───────────────────────────────────── */}
      {isUpcoming ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
            <Lock className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">
              第{selectedLecture.number}回の資料はまだ公開されていません
            </p>
            <p className="text-xs text-muted-foreground">
              授業日になると資料が公開されます。
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`第${selectedLecture.number}回の資料を検索...`}
              className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              読み込み中...
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="text-center py-10 text-sm text-muted-foreground">
              {searchQuery ? "検索結果がありません" : "この回の資料はまだアップロードされていません"}
            </div>
          ) : (
            <>
              {/* AIナレッジ対象資料 */}
              {enabledDocs.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    AIナレッジ対象資料（{enabledDocs.length}件）
                  </p>
                  <div className="space-y-2">
                    {enabledDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:border-primary/30 hover:bg-accent/30 transition-all group"
                      >
                        <DocTypeIcon type={doc.fileType} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : ""}
                          </p>
                        </div>
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded hover:bg-muted text-primary hover:text-primary/80 transition-colors opacity-0 group-hover:opacity-100"
                          title="外部リンクで開く"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary shrink-0">
                          AI対象
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* その他資料 */}
              {disabledDocs.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    その他資料（{disabledDocs.length}件）
                  </p>
                  <div className="space-y-2">
                    {disabledDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50 hover:bg-card transition-all group"
                      >
                        <DocTypeIcon type={doc.fileType} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : ""}
                          </p>
                        </div>
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                          title="外部リンクで開く"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                          AI対象外
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
