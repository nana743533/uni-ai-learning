// ============================================================
// LectureDocsTab — 講義資料・知識タブ（学生向け）
// Design: Academic Clarity
// ============================================================
import { FileText, Globe, File, Download, ExternalLink, Search, Send, Mic, Paperclip } from "lucide-react";
import { ragDocuments } from "@/lib/mockData";
import { toast } from "sonner";
import { useState } from "react";

function DocTypeIcon({ type }: { type: string }) {
  if (type === "pdf") return (
    <div className="w-8 h-8 rounded bg-red-50 flex items-center justify-center">
      <FileText className="w-4 h-4 text-red-500" />
    </div>
  );
  if (type === "doc") return (
    <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center">
      <FileText className="w-4 h-4 text-blue-500" />
    </div>
  );
  if (type === "web") return (
    <div className="w-8 h-8 rounded bg-green-50 flex items-center justify-center">
      <Globe className="w-4 h-4 text-green-500" />
    </div>
  );
  return (
    <div className="w-8 h-8 rounded bg-gray-50 flex items-center justify-center">
      <File className="w-4 h-4 text-gray-500" />
    </div>
  );
}

export default function LectureDocsTab({ lectureTitle }: { lectureTitle: string }) {
  const [input, setInput] = useState("");
  const enabledDocs = ragDocuments.filter((d) => d.aiEnabled);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="資料を検索..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* AI対象資料 */}
        <div className="mb-6">
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
                    onClick={() => toast("外部リンクを開く機能は近日公開予定です")}
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

        {/* AI対象外資料 */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            その他資料
          </p>
          <div className="space-y-2">
            {ragDocuments.filter((d) => !d.aiEnabled).map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50 opacity-70 hover:opacity-100 transition-all group"
              >
                <DocTypeIcon type={doc.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
                  <p className="text-[11px] text-muted-foreground">{doc.uploadedBy}</p>
                </div>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                  AI対象外
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Input Bar */}
      <div className="px-4 py-3 border-t border-border bg-background">
        <div className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 shadow-sm">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-primary font-['Inter']">Ai</span>
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { toast("AIナレッジ検索機能は近日公開予定です"); setInput(""); } }}
            placeholder="AIにナレッジ検索・質問してください..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button onClick={() => toast("音声入力機能は近日公開予定です")} className="text-muted-foreground hover:text-foreground transition-colors">
            <Mic className="w-4 h-4" />
          </button>
          <button onClick={() => toast("ファイル添付機能は近日公開予定です")} className="text-muted-foreground hover:text-foreground transition-colors">
            <Paperclip className="w-4 h-4" />
          </button>
          <button
            disabled={!input.trim()}
            onClick={() => { toast("AIナレッジ検索機能は近日公開予定です"); setInput(""); }}
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
