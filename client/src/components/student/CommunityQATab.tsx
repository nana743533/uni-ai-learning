// ============================================================
// CommunityQATab — みんなのQ&Aタブ
// Design: Academic Clarity
// Features:
//   - 全授業横断（授業回で絞り込まない）
//   - Upvote数・関連度スコアで優先度順に表示
//   - 匿名表示（Student A等）
//   - 質問投稿フォーム
// ============================================================
import { useState } from "react";
import { ThumbsUp, Send, Mic, Paperclip, User, ChevronDown, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { qaThreads, lectures, type QAThread } from "@/lib/mockData";
import { toast } from "sonner";

type SortKey = "upvotes" | "relevance" | "newest";

const sortLabels: Record<SortKey, string> = {
  upvotes: "参考になった順",
  relevance: "関連度順",
  newest: "新着順",
};

function LectureBadge({ lectureId }: { lectureId: number }) {
  const lec = lectures.find((l) => l.id === lectureId);
  if (!lec) return null;
  return (
    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
      第{lec.number}回
    </span>
  );
}

function RelevanceBadge({ score }: { score: number }) {
  return (
    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary">
      関連度 {Math.round(score * 100)}%
    </span>
  );
}

function QAThreadCard({ thread }: { thread: QAThread }) {
  const [upvoted, setUpvoted] = useState(false);
  const [localUpvotes, setLocalUpvotes] = useState(thread.upvotes);
  const [expanded, setExpanded] = useState(false);

  const firstMsg = thread.messages[0];
  const allMessages = expanded ? thread.messages : thread.messages.slice(0, 2);

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden">
      {/* Thread Meta */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-border/50">
        <div className="flex items-center gap-2">
          <LectureBadge lectureId={thread.lectureId} />
          <RelevanceBadge score={thread.relevanceScore} />
        </div>
        <button
          onClick={() => {
            if (upvoted) { setUpvoted(false); setLocalUpvotes((v) => v - 1); }
            else { setUpvoted(true); setLocalUpvotes((v) => v + 1); }
          }}
          className={cn(
            "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border transition-colors",
            upvoted
              ? "bg-amber-50 text-amber-600 border-amber-200"
              : "bg-background text-muted-foreground border-border hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200"
          )}
        >
          <ThumbsUp className="w-3 h-3" />
          参考になった {localUpvotes}
        </button>
      </div>

      {/* Messages */}
      <div className="px-4 py-3 space-y-3">
        {allMessages.map((msg) => (
          <div key={msg.id} className="chat-message flex gap-3">
            {msg.role === "ai" ? (
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-primary-foreground font-['Inter']">Ai</span>
              </div>
            ) : (
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-muted-foreground mb-1">
                {msg.role === "ai" ? "Aiチューター" : msg.studentId}
              </p>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Expand toggle */}
      {thread.messages.length > 2 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-center gap-1 py-2 text-xs text-muted-foreground hover:text-foreground border-t border-border/50 transition-colors"
        >
          <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", expanded && "rotate-180")} />
          {expanded ? "折りたたむ" : `残り${thread.messages.length - 2}件を表示`}
        </button>
      )}
    </div>
  );
}

export default function CommunityQATab() {
  const [input, setInput] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("upvotes");

  const sortedThreads = [...qaThreads].sort((a, b) => {
    if (sortKey === "upvotes") return b.upvotes - a.upvotes;
    if (sortKey === "relevance") return b.relevanceScore - a.relevanceScore;
    return b.id - a.id;
  });

  const handlePost = () => {
    if (!input.trim()) return;
    toast("質問を投稿しました。AIが回答を生成中です...");
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Sort Bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-background shrink-0">
        <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <span className="text-xs text-muted-foreground">並び順：</span>
        <div className="flex gap-1">
          {(["upvotes", "relevance", "newest"] as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setSortKey(key)}
              className={cn(
                "text-xs px-2.5 py-1 rounded-full border transition-colors",
                sortKey === key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
              )}
            >
              {sortLabels[key]}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-muted-foreground font-['Inter']">
          {sortedThreads.length}件
        </span>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {sortedThreads.map((thread) => (
          <QAThreadCard key={thread.id} thread={thread} />
        ))}
      </div>

      {/* Input Bar */}
      <div className="px-4 py-3 border-t border-border bg-background shrink-0">
        <div className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 shadow-sm">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-primary font-['Inter']">Ai</span>
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePost()}
            placeholder="みんなのQ&Aに質問を投稿する..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button onClick={() => toast("音声入力機能は近日公開予定です")} className="text-muted-foreground hover:text-foreground transition-colors">
            <Mic className="w-4 h-4" />
          </button>
          <button onClick={() => toast("ファイル添付機能は近日公開予定です")} className="text-muted-foreground hover:text-foreground transition-colors">
            <Paperclip className="w-4 h-4" />
          </button>
          <button
            onClick={handlePost}
            disabled={!input.trim()}
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
