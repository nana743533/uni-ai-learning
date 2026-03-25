// ============================================================
// AIChatTab — AI相談タブ
// Design: Academic Clarity
// Features:
//   - 新規チャット作成時に「参照する授業回」を複数選択
//   - RAGコンテキストを選択した回に限定して表示
//   - プロンプト補佐ボタン（逆質問ロジック）
//   - UXサジェスト（例えば〜と聞いてみてください）
// ============================================================
import { useState, useRef, useEffect } from "react";
import {
  Send,
  Mic,
  Paperclip,
  BookOpen,
  PenLine,
  FileQuestion,
  Lightbulb,
  Search,
  Plus,
  Check,
  ChevronDown,
  X,
  MessageSquarePlus,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { lectures } from "@/lib/mockData";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────
interface Message {
  id: number;
  role: "user" | "ai";
  content: string;
}

interface ChatSession {
  id: number;
  title: string;
  selectedLectureIds: number[];
  messages: Message[];
  createdAt: string;
}

interface PromptButton {
  id: string;
  icon: React.ReactNode;
  label: string;
  subLabel: string;
  reverseQuestions: string[];
}

// ─── Prompt Buttons ─────────────────────────────────────────
const promptButtons: PromptButton[] = [
  {
    id: "deep-dive",
    icon: <BookOpen className="w-5 h-5" />,
    label: "「授業内容の",
    subLabel: "深掘り質問」",
    reverseQuestions: [
      "どのトピックについて深掘りしたいですか？",
      "理解が難しかった部分はどこですか？",
      "具体的な事例と一緒に説明してほしいですか？",
    ],
  },
  {
    id: "assignment",
    icon: <PenLine className="w-5 h-5" />,
    label: "「課題・",
    subLabel: "レポート相談」",
    reverseQuestions: [
      "課題のテーマや問いは何ですか？",
      "文字数や形式の指定はありますか？",
      "構成案を作ってほしいですか、それとも内容のアドバイスが欲しいですか？",
    ],
  },
  {
    id: "test-prep",
    icon: <FileQuestion className="w-5 h-5" />,
    label: "「テスト",
    subLabel: "予想問題作成」",
    reverseQuestions: [
      "記述式・選択式、どちらの形式が良いですか？",
      "重点的に出題してほしいトピックはありますか？",
      "難易度はどのくらいを想定していますか？",
    ],
  },
  {
    id: "summary",
    icon: <Lightbulb className="w-5 h-5" />,
    label: "「要点まとめ",
    subLabel: "リクエスト」",
    reverseQuestions: [
      "どの回の講義をまとめてほしいですか？",
      "箇条書きと文章形式、どちらが好みですか？",
      "特に重要だと思うキーワードはありますか？",
    ],
  },
  {
    id: "related-docs",
    icon: <Search className="w-5 h-5" />,
    label: "「関連資料",
    subLabel: "の探索」",
    reverseQuestions: [
      "どのテーマに関連する資料を探していますか？",
      "論文・書籍・Webサイト、どれを優先しますか？",
      "日本語・英語どちらの資料が良いですか？",
    ],
  },
];

const suggestions = [
  "例えば「社会的比較理論をSNSの具体例で説明して」と聞いてみてください！",
  "例えば「この講義で最も重要な概念を3つ挙げて」と聞いてみてください！",
  "例えば「フロイトとユングの違いを分かりやすく教えて」と聞いてみてください！",
];

// ─── Lecture Selector Modal ─────────────────────────────────
function LectureSelectorModal({
  selectedIds,
  onConfirm,
  onCancel,
}: {
  selectedIds: number[];
  onConfirm: (ids: number[]) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<Set<number>>(new Set(selectedIds));

  const toggle = (id: number) => {
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setDraft(new Set(lectures.map((l) => l.id)));
  const clearAll = () => setDraft(new Set());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">参照する授業回を選択</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              AIが検索対象とする講義資料を選んでください（複数選択可）
            </p>
          </div>
          <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Quick actions */}
        <div className="px-5 py-2.5 border-b border-border/50 flex gap-3">
          <button
            onClick={selectAll}
            className="text-xs text-primary hover:underline font-medium"
          >
            全て選択
          </button>
          <span className="text-border">|</span>
          <button
            onClick={clearAll}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            全て解除
          </button>
          <span className="ml-auto text-xs text-muted-foreground font-['Inter']">
            {draft.size}回選択中
          </span>
        </div>

        {/* Lecture List */}
        <div className="overflow-y-auto max-h-72 px-3 py-2">
          {lectures.map((lecture) => {
            const checked = draft.has(lecture.id);
            return (
              <button
                key={lecture.id}
                onClick={() => toggle(lecture.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors mb-0.5",
                  checked ? "bg-primary/8" : "hover:bg-muted/50"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                    checked
                      ? "bg-primary border-primary"
                      : "border-border bg-background"
                  )}
                >
                  {checked && <Check className="w-3 h-3 text-primary-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-foreground">
                    第{lecture.number}回
                  </span>
                  <span className="text-sm text-muted-foreground ml-2">
                    {lecture.title}
                  </span>
                </div>
                {lecture.status === "completed" && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary shrink-0">
                    資料あり
                  </span>
                )}
                {lecture.status === "current" && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200 shrink-0">
                    今回
                  </span>
                )}
              </button>
            );
          })}
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
            onClick={() => onConfirm(Array.from(draft))}
            disabled={draft.size === 0}
            className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            この資料でチャット開始
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Chat Session List ───────────────────────────────────────
function ChatSessionList({
  sessions,
  activeId,
  onSelect,
  onNew,
}: {
  sessions: ChatSession[];
  activeId: number | null;
  onSelect: (id: number) => void;
  onNew: () => void;
}) {
  return (
    <div className="w-52 shrink-0 border-r border-border flex flex-col bg-sidebar">
      <div className="px-3 py-3 border-b border-sidebar-border">
        <button
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
        >
          <MessageSquarePlus className="w-3.5 h-3.5" />
          新規チャット
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {sessions.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            チャット履歴なし
          </p>
        )}
        {sessions.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={cn(
              "w-full text-left px-3 py-2.5 rounded-lg mb-0.5 transition-colors",
              activeId === s.id ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/60"
            )}
          >
            <p
              className={cn(
                "text-xs font-medium truncate",
                activeId === s.id ? "text-primary" : "text-sidebar-foreground"
              )}
            >
              {s.title}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
              第{s.selectedLectureIds.join("・")}回 参照
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────
export default function AIChatTab() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [input, setInput] = useState("");
  const [pendingButton, setPendingButton] = useState<PromptButton | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, isTyping]);

  // 新規チャット作成確定
  const handleCreateSession = (ids: number[]) => {
    setShowModal(false);
    const selectedLectures = lectures.filter((l) => ids.includes(l.id));
    const title =
      selectedLectures.length === 1
        ? `第${selectedLectures[0].number}回 相談`
        : `第${selectedLectures.map((l) => l.number).join("・")}回 相談`;
    const newSession: ChatSession = {
      id: Date.now(),
      title,
      selectedLectureIds: ids,
      createdAt: new Date().toISOString(),
      messages: [
        {
          id: 0,
          role: "ai",
          content:
            `参照資料：${selectedLectures.map((l) => `第${l.number}回「${l.title}」`).join("、")} を設定しました。\n\nこれらの資料をもとに、どんなことでも気軽に質問してください！\n\n${suggestions[0]}`,
        },
      ],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const addAIMessage = (content: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...s.messages, { id: Date.now(), role: "ai", content }] }
            : s
        )
      );
      setIsTyping(false);
    }, 800);
  };

  const handlePromptButton = (btn: PromptButton) => {
    if (!activeSession) return;
    setPendingButton(btn);
    const userMsg = `${btn.label}${btn.subLabel} を使いたい`;
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, messages: [...s.messages, { id: Date.now(), role: "user", content: userMsg }] }
          : s
      )
    );
    const reverseQ =
      `より良い回答をするために、いくつか確認させてください！\n\n` +
      btn.reverseQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n") +
      `\n\n${suggestions[Math.floor(Math.random() * suggestions.length)]}`;
    addAIMessage(reverseQ);
  };

  const handleSend = () => {
    if (!input.trim() || !activeSession) return;
    const userContent = input.trim();
    setInput("");
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, messages: [...s.messages, { id: Date.now(), role: "user", content: userContent }] }
          : s
      )
    );
    if (pendingButton) {
      setPendingButton(null);
      const ids = activeSession.selectedLectureIds;
      const refs = lectures
        .filter((l) => ids.includes(l.id))
        .map((l) => `第${l.number}回`)
        .join("・");
      addAIMessage(
        `ご回答ありがとうございます！${refs}の資料をもとに回答を生成します。\n\n（※ここでは実際のAI応答がRAGで生成されます。現在はデモ表示です。）\n\n${suggestions[Math.floor(Math.random() * suggestions.length)]}`
      );
    } else {
      const ids = activeSession.selectedLectureIds;
      const refs = lectures
        .filter((l) => ids.includes(l.id))
        .map((l) => `第${l.number}回`)
        .join("・");
      addAIMessage(
        `${refs}の資料をもとに回答します。\n\n（※ここでは実際のAI応答がRAGで生成されます。現在はデモ表示です。）\n\n${suggestions[Math.floor(Math.random() * suggestions.length)]}`
      );
    }
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Session List */}
      <ChatSessionList
        sessions={sessions}
        activeId={activeSessionId}
        onSelect={setActiveSessionId}
        onNew={() => setShowModal(true)}
      />

      {/* Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!activeSession ? (
          // Empty state
          <div className="flex-1 flex flex-col items-center justify-center gap-5 px-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <MessageSquarePlus className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground mb-1">AI相談を始めましょう</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                「新規チャット」から参照したい授業回の資料を選択して、チャットを開始してください。
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              新規チャットを作成
            </button>
          </div>
        ) : (
          <>
            {/* RAG Context Bar */}
            <div className="flex items-center gap-2 px-4 py-2 bg-accent/50 border-b border-border text-xs text-muted-foreground shrink-0">
              <Info className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>参照資料：</span>
              <div className="flex gap-1 flex-wrap">
                {activeSession.selectedLectureIds.map((id) => {
                  const lec = lectures.find((l) => l.id === id);
                  return lec ? (
                    <span
                      key={id}
                      className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium"
                    >
                      第{lec.number}回
                    </span>
                  ) : null;
                })}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {activeSession.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "chat-message flex gap-3",
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  {msg.role === "ai" && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[11px] font-bold text-primary-foreground font-['Inter']">Ai</span>
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
                      msg.role === "ai"
                        ? "ai-bubble rounded-tl-none text-foreground"
                        : "bg-primary text-primary-foreground rounded-tr-none"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="chat-message flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <span className="text-[11px] font-bold text-primary-foreground font-['Inter']">Ai</span>
                  </div>
                  <div className="ai-bubble rounded-xl rounded-tl-none px-4 py-3">
                    <div className="flex gap-1 items-center h-5">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Prompt Buttons */}
            <div className="px-4 py-3 border-t border-border bg-background shrink-0">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {promptButtons.map((btn) => (
                  <button
                    key={btn.id}
                    onClick={() => handlePromptButton(btn)}
                    className="prompt-btn flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-accent/50 min-w-[84px] shrink-0 text-center"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center text-primary">
                      {btn.icon}
                    </div>
                    <span className="text-[10px] font-medium text-foreground leading-tight">
                      {btn.label}
                      <br />
                      {btn.subLabel}
                    </span>
                  </button>
                ))}
              </div>
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
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="AI相談に質問する、またはプロンプトを入力..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <button onClick={() => toast("音声入力機能は近日公開予定です")} className="text-muted-foreground hover:text-foreground transition-colors">
                  <Mic className="w-4 h-4" />
                </button>
                <button onClick={() => toast("ファイル添付機能は近日公開予定です")} className="text-muted-foreground hover:text-foreground transition-colors">
                  <Paperclip className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <LectureSelectorModal
          selectedIds={[]}
          onConfirm={handleCreateSession}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
