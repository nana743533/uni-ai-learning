// ============================================================
// CommunityQATab — みんなのQ&Aタブ
// Design: Academic Clarity
// Features:
//   - Upvote順表示
//   - 関連度スコア0.8以上フィルタリング
//   - 匿名表示（Student A等）
//   - 質問投稿フォーム
// ============================================================
import { useState, useRef, useEffect } from "react";
import { ThumbsUp, Send, Mic, Paperclip, User, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { qaThreads, type QAThread } from "@/lib/mockData";
import { toast } from "sonner";

function RelevanceBadge({ score }: { score: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary">
      関連度 {Math.round(score * 100)}%
    </span>
  );
}

function UpvoteBadge({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
      <ThumbsUp className="w-3 h-3" />
      参考になった {count}
    </span>
  );
}

function QAThreadCard({ thread }: { thread: QAThread }) {
  const [upvoted, setUpvoted] = useState(false);
  const [localUpvotes, setLocalUpvotes] = useState(thread.upvotes);

  const handleUpvote = () => {
    if (upvoted) {
      setUpvoted(false);
      setLocalUpvotes((v) => v - 1);
    } else {
      setUpvoted(true);
      setLocalUpvotes((v) => v + 1);
    }
  };

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden">
      <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-border/50">
        <div className="flex items-center gap-2">
          <RelevanceBadge score={thread.relevanceScore} />
        </div>
        <button
          onClick={handleUpvote}
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

      <div className="px-4 py-3 space-y-3">
        {thread.messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "chat-message flex gap-3",
              msg.role === "ai" ? "flex-row" : "flex-row"
            )}
          >
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
    </div>
  );
}

export default function CommunityQATab({ lectureTitle }: { lectureTitle: string }) {
  const [input, setInput] = useState("");
  const [localThreads, setLocalThreads] = useState(
    [...qaThreads]
      .filter((t) => t.relevanceScore >= 0.8)
      .sort((a, b) => b.upvotes - a.upvotes)
  );

  const handlePost = () => {
    if (!input.trim()) return;
    toast("質問を投稿しました。AIが回答を生成中です...");
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header Info */}
      <div className="flex items-center gap-2 px-4 py-2 bg-accent/50 border-b border-border text-xs text-muted-foreground">
        <Info className="w-3.5 h-3.5 text-primary shrink-0" />
        <span>
          <strong className="text-foreground">第1回「{lectureTitle}」</strong>関連の質問を
          関連度0.8以上・Upvote順で表示しています（全て匿名）
        </span>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          みんなのQ&A チャット履歴（第1回 講義関連）
        </p>
        {localThreads.map((thread) => (
          <QAThreadCard key={thread.id} thread={thread} />
        ))}
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
            onKeyDown={(e) => e.key === "Enter" && handlePost()}
            placeholder="みんなのQ&Aに質問を投稿する、またはプロンプトを入力..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={() => toast("音声入力機能は近日公開予定です")}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Mic className="w-4 h-4" />
          </button>
          <button
            onClick={() => toast("ファイル添付機能は近日公開予定です")}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
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
