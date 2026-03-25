// ============================================================
// LectureDocsTab — 講義資料・知識タブ（学生向け）
// Design: Academic Clarity
// Features:
//   - タブ内で授業回を選択（ティッカー形式）
//   - 選択した回の資料一覧を表示
//   - AIナレッジ対象/対象外で分類
//   - 資料ダウンロード・外部リンク
// ============================================================
import { useState } from "react";
import { FileText, Globe, File, Download, ExternalLink, Search, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { lectures, ragDocuments } from "@/lib/mockData";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function DocTypeIcon({ type }: { type: string }) {
  if (type === "pdf") return (
    <div className="w-8 h-8 rounded bg-red-50 flex items-center justify-center shrink-0">
      <FileText className="w-4 h-4 text-red-500" />
    </div>
  );
  if (type === "doc") return (
    <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center shrink-0">
      <FileText className="w-4 h-4 text-blue-500" />
    </div>
  );
  if (type === "web") return (
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
  // 現在の授業回をデフォルト選択
  const defaultLecture = lectures.find((l) => l.status === "current") ?? lectures[0];
  const [selectedLectureId, setSelectedLectureId] = useState(defaultLecture.id);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedLecture = lectures.find((l) => l.id === selectedLectureId) ?? lectures[0];
  const selectedIndex = lectures.findIndex((l) => l.id === selectedLectureId);

  const goPrev = () => {
    if (selectedIndex > 0) setSelectedLectureId(lectures[selectedIndex - 1].id);
  };
  const goNext = () => {
    if (selectedIndex < lectures.length - 1) setSelectedLectureId(lectures[selectedIndex + 1].id);
  };

  const docsForLecture = ragDocuments.filter((d) => d.lectureId === selectedLectureId);
  const filteredDocs = docsForLecture.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const enabledDocs = filteredDocs.filter((d) => d.aiEnabled);
  const disabledDocs = filteredDocs.filter((d) => !d.aiEnabled);
  const isUpcoming = selectedLecture.status === "upcoming";

  return (
    <div className="flex flex-col h-full">
      {/* ── 授業回セレクター ─────────────────────────────── */}
      <div className="px-4 py-3 border-b border-border bg-background shrink-0">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          授業回を選択
        </p>

        {/* Ticker / Horizontal scroll */}
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
                onClick={() => setSelectedLectureId(lec.id)}
                className={cn(
                  "flex flex-col items-center px-3 py-1.5 rounded-lg border text-center shrink-0 transition-all",
                  selectedLectureId === lec.id
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : lec.status === "upcoming"
                    ? "bg-background text-muted-foreground border-border opacity-60 hover:opacity-100"
                    : "bg-background text-foreground border-border hover:border-primary/40 hover:bg-accent/40"
                )}
              >
                <span className={cn(
                  "text-[10px] font-bold font-['Inter']",
                  selectedLectureId === lec.id ? "text-primary-foreground" : ""
                )}>
                  第{lec.number}回
                </span>
                {lec.status === "current" && selectedLectureId !== lec.id && (
                  <span className="text-[8px] text-amber-500 font-medium">今回</span>
                )}
                {lec.status === "upcoming" && (
                  <Lock className="w-2.5 h-2.5 mt-0.5 opacity-60" />
                )}
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

        {/* Selected lecture info */}
        <div className="mt-2.5 flex items-center gap-2">
          <div className={cn(
            "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
            selectedLecture.status === "current" ? "bg-amber-100" :
            selectedLecture.status === "completed" ? "bg-primary/10" : "bg-muted"
          )}>
            <span className={cn(
              "text-[9px] font-bold font-['Inter']",
              selectedLecture.status === "current" ? "text-amber-600" :
              selectedLecture.status === "completed" ? "text-primary" : "text-muted-foreground"
            )}>
              {selectedLecture.number}
            </span>
          </div>
          <p className="text-sm font-semibold text-foreground">{selectedLecture.title}</p>
          {selectedLecture.status === "current" && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200 ml-auto shrink-0">
              今回
            </span>
          )}
          {selectedLecture.status === "upcoming" && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground ml-auto shrink-0">
              未公開
            </span>
          )}
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

          {filteredDocs.length === 0 ? (
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
                        <DocTypeIcon type={doc.type} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
                          <p className="text-[11px] text-muted-foreground">{doc.uploadedBy}</p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => toast("ダウンロード機能は近日公開予定です")}
                            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toast("外部リンク機能は近日公開予定です")}
                            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
                        <DocTypeIcon type={doc.type} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
                          <p className="text-[11px] text-muted-foreground">{doc.uploadedBy}</p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => toast("ダウンロード機能は近日公開予定です")}
                            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toast("外部リンク機能は近日公開予定です")}
                            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
