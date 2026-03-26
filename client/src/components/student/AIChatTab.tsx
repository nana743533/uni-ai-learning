// ============================================================
// AIChatTab — AI相談タブ（Gemini API対応）
// Design: Academic Clarity
// Features:
//   - 新規チャット作成はモーダルなし（即座に「無題」で作成）
//   - 設定パネルで参照する授業回を複数選択
//   - RAGコンテキストバーに選択中の回を表示
//   - プロンプト補佐ボタン（逆質問ロジック）
//   - Gemini APIによるリアルAI応答
//   - Streamdownによるマークダウンレンダリング
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
  MessageSquarePlus,
  Info,
  Settings,
  X,
  AlertCircle,
  ChevronDown,
  Sparkles,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { lectures } from "@/lib/mockData";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";

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

// ─── AI Models ───────────────────────────────────────────────────
interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  active: boolean;
}

const aiModels: AIModel[] = [
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "Google",
    description: "高速・軽量な汎用モデル",
    active: true,
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    description: "高精度マルチモーダル",
    active: false,
  },
  {
    id: "claude-4-sonnet",
    name: "Claude 4 Sonnet",
    provider: "Anthropic",
    description: "長文脈・深い推論",
    active: false,
  },
];

function ModelSelector({
  selectedModelId,
  onSelect,
}: {
  selectedModelId: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selectedModel = aiModels.find((m) => m.id === selectedModelId)!;

  // 外側クリックで閉じる
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border border-border bg-background hover:border-primary/40 transition-colors shrink-0"
      >
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        <span className="text-foreground">{selectedModel.name}</span>
        <ChevronDown className={cn("w-3 h-3 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 rounded-xl border border-border bg-popover text-popover-foreground shadow-lg z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-border">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">モデル選択</p>
          </div>
          <div className="py-1">
            {aiModels.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  if (model.active) {
                    onSelect(model.id);
                    setOpen(false);
                  } else {
                    toast("このモデルは近日対応予定です");
                  }
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                  model.active
                    ? model.id === selectedModelId
                      ? "bg-primary/8"
                      : "hover:bg-muted/50"
                    : "opacity-50 cursor-not-allowed"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold",
                  model.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {model.active ? (
                    <Sparkles className="w-4 h-4" />
                  ) : (
                    <Lock className="w-3.5 h-3.5" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xs font-semibold",
                      model.id === selectedModelId ? "text-primary" : "text-foreground"
                    )}>
                      {model.name}
                    </span>
                    {!model.active && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-muted text-muted-foreground leading-none">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {model.provider} — {model.description}
                  </p>
                </div>
                {model.id === selectedModelId && model.active && (
                  <Check className="w-4 h-4 text-primary shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const suggestions = [
  "例えば「AIバイアスの具体的な事例と対策を教えて」と聞いてみてください！",
  "例えば「個人情報保護法とGDPRの違いを分かりやすく説明して」と聞いてみてください！",
  "例えば「デジタル市民権の観点からSNSの問題点を整理して」と聞いてみてください！",
];

// ─── Settings Panel ──────────────────────────────────────────
function SettingsPanel({
  selectedIds,
  onChange,
  onClose,
}: {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  onClose: () => void;
}) {
  const selectedSet = new Set(selectedIds);

  const toggle = (id: number) => {
    const next = new Set(selectedSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(Array.from(next));
  };

  const selectAll = () => onChange(lectures.map((l) => l.id));
  const clearAll = () => onChange([]);

  return (
    <div className="w-64 shrink-0 border-l border-border flex flex-col bg-sidebar">
      {/* Header */}
      <div className="px-4 py-3 border-b border-sidebar-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-foreground">設定</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Section */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mb-3">
          <p className="text-xs font-bold text-foreground mb-0.5">参照する授業回</p>
          <p className="text-[11px] text-muted-foreground mb-3">
            AIが検索対象とする講義資料を選択してください（複数選択可）
          </p>
          <div className="flex gap-3 mb-3">
            <button
              onClick={selectAll}
              className="text-xs text-primary hover:underline font-medium"
            >
              全て選択
            </button>
            <button
              onClick={clearAll}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              全て解除
            </button>
            <span className="ml-auto text-[11px] text-muted-foreground font-['Inter']">
              {selectedIds.length}回選択中
            </span>
          </div>

          {/* Lecture List */}
          <div className="space-y-0.5">
            {lectures.map((lecture) => {
              const checked = selectedSet.has(lecture.id);
              return (
                <button
                  key={lecture.id}
                  onClick={() => toggle(lecture.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors",
                    checked ? "bg-primary/8" : "hover:bg-muted/50"
                  )}
                >
                  <div
                    className={cn(
                      "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                      checked
                        ? "bg-primary border-primary"
                        : "border-border bg-background"
                    )}
                  >
                    {checked && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                  </div>
                  <span className="text-xs font-medium text-foreground font-['Inter']">
                    第{lecture.number}回
                  </span>
                  <span className="text-xs text-muted-foreground truncate flex-1">
                    {lecture.title}
                  </span>
                </button>
              );
            })}
          </div>
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
    <div className="w-48 shrink-0 border-r border-border flex flex-col bg-sidebar">
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
            {s.selectedLectureIds.length > 0 && (
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                第{s.selectedLectureIds.slice(0, 3).join("・")}回{s.selectedLectureIds.length > 3 ? "…" : ""} 参照
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────
export default function AIChatTab() {
  // 初期セッションを即座に作成して入力欄を最初から表示する
  const [initialSession] = useState<ChatSession>(() => {
    const allIds = lectures.map((l) => l.id);
    return {
      id: Date.now(),
      title: "無題",
      selectedLectureIds: allIds,
      messages: [
        {
          id: 0,
          role: "ai" as const,
          content:
            `こんにちは！「情報社会と倫理」のAI学習アシスタントです。\n\nプライバシー・著作権・AI倫理・デジタル市民権など、全${allIds.length}回の講義資料をもとに質問にお答えします。右上の「設定」から参照する授業回を絞り込むこともできます。\n\n${suggestions[0]}`,
        },
      ],
    };
  });
  const [sessions, setSessions] = useState<ChatSession[]>([initialSession]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(initialSession.id);
  const [showSettings, setShowSettings] = useState(false);
  const [input, setInput] = useState("");
  const [pendingButton, setPendingButton] = useState<PromptButton | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState("gemini-2.5-flash");
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null;

  // tRPC mutation for Gemini API
  const sendMutation = trpc.chat.send.useMutation({
    onSuccess: (data) => {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...s.messages, { id: Date.now(), role: "ai", content: data.reply }] }
            : s
        )
      );
      setIsLoading(false);
      setApiError(null);
    },
    onError: (err) => {
      setIsLoading(false);
      setApiError(`AI応答エラー: ${err.message}`);
      toast.error("AI応答の取得に失敗しました。しばらく待ってから再試行してください。");
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, isLoading]);

  // 設定パネルで参照回が変更されたとき
  const handleLectureIdsChange = (ids: number[]) => {
    if (!activeSessionId) return;
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId ? { ...s, selectedLectureIds: ids } : s
      )
    );
  };

  // 新規チャット作成（モーダルなし・即座に作成・全回デフォルト選択）
  const handleCreateSession = () => {
    const allIds = lectures.map((l) => l.id);
    const newSession: ChatSession = {
      id: Date.now(),
      title: "無題",
      selectedLectureIds: allIds,
      messages: [
        {
          id: 0,
          role: "ai",
          content:
            `こんにちは！「情報社会と倫理」のAI学習アシスタントです。\n\nプライバシー・著作権・AI倫理・デジタル市民権など、全${allIds.length}回の講義資料をもとに質問にお答えします。右上の「設定」から参照する授業回を絞り込むこともできます。\n\n${suggestions[0]}`,
        },
      ],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setApiError(null);
    // 設定パネルはデフォルトで閉じた状態
  };

  // Gemini APIにメッセージ送信
  const callGeminiAPI = (session: ChatSession, newUserContent: string) => {
    const selectedLectureNames = session.selectedLectureIds.map((id) => {
      const lec = lectures.find((l) => l.id === id);
      return lec ? `第${lec.number}回「${lec.title}」` : "";
    }).filter(Boolean);

    // 会話履歴をGemini形式に変換（最新20件まで）
    const historyMessages = session.messages
      .filter((m) => m.id !== 0) // 初期ウェルカムメッセージを除外
      .slice(-20)
      .map((m) => ({
        role: m.role === "user" ? "user" as const : "model" as const,
        content: m.content,
      }));

    // 新しいユーザーメッセージを追加
    const allMessages = [
      ...historyMessages,
      { role: "user" as const, content: newUserContent },
    ];

    setIsLoading(true);
    sendMutation.mutate({
      messages: allMessages,
      selectedLectures: selectedLectureNames,
    });
  };

  const handlePromptButton = (btn: PromptButton) => {
    if (!activeSession || isLoading) return;
    setPendingButton(btn);
    const userMsg = `${btn.label}${btn.subLabel} を使いたい`;

    // ユーザーメッセージを追加
    const updatedSession = {
      ...activeSession,
      messages: [...activeSession.messages, { id: Date.now(), role: "user" as const, content: userMsg }],
    };
    setSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? updatedSession : s))
    );

    // 逆質問をAIから生成（Gemini API経由）
    const reverseQPrompt =
      `ユーザーが「${btn.label}${btn.subLabel}」機能を使いたいと言っています。\n` +
      `より良い回答をするために、以下の3点について確認してください：\n` +
      btn.reverseQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n") +
      `\n\n最後に「例えば〜と聞いてみてください」という形のサジェストを1つ添えてください。`;

    callGeminiAPI(updatedSession, reverseQPrompt);
  };

  const handleSend = () => {
    if (!input.trim() || !activeSession || isLoading) return;
    const userContent = input.trim();
    setInput("");
    setApiError(null);

    // ユーザーメッセージを追加
    const updatedSession = {
      ...activeSession,
      messages: [...activeSession.messages, { id: Date.now(), role: "user" as const, content: userContent }],
    };
    setSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? updatedSession : s))
    );

    if (pendingButton) {
      setPendingButton(null);
    }

    // Gemini APIに送信
    callGeminiAPI(updatedSession, userContent);
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Session List */}
      <ChatSessionList
        sessions={sessions}
        activeId={activeSessionId}
        onSelect={(id) => { setActiveSessionId(id); setShowSettings(false); setApiError(null); }}
        onNew={handleCreateSession}
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
                「新規チャット」からチャットを作成し、設定で参照したい授業回を選択してください。
              </p>
            </div>
            <button
              onClick={handleCreateSession}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              新規チャットを作成
            </button>
          </div>
        ) : (
          <>
            {/* Chat Toolbar */}
            <div className="flex items-center gap-2 px-4 py-2 bg-accent/50 border-b border-border shrink-0">
              <ModelSelector
                selectedModelId={selectedModelId}
                onSelect={setSelectedModelId}
              />
              <div className="w-px h-4 bg-border shrink-0" />
              <Info className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="text-xs text-muted-foreground">参照資料：</span>
              <div className="flex gap-1 flex-wrap flex-1">
                {activeSession.selectedLectureIds.length === 0 ? (
                  <span className="text-xs text-muted-foreground italic">未設定（右の設定から選択）</span>
                ) : (
                  activeSession.selectedLectureIds.map((id) => {
                    const lec = lectures.find((l) => l.id === id);
                    return lec ? (
                      <span
                        key={id}
                        className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium"
                      >
                        第{lec.number}回
                      </span>
                    ) : null;
                  })
                )}
              </div>
              {/* Settings Toggle */}
              <button
                onClick={() => setShowSettings((v) => !v)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors shrink-0",
                  showSettings
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:text-foreground hover:border-primary/40"
                )}
              >
                <Settings className="w-3.5 h-3.5" />
                設定
              </button>
            </div>

            {/* API Error Banner */}
            {apiError && (
              <div className="flex items-center gap-2 px-4 py-2 bg-destructive/10 border-b border-destructive/20 shrink-0">
                <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                <span className="text-xs text-destructive">{apiError}</span>
              </div>
            )}

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
                      "max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed",
                      msg.role === "ai"
                        ? "ai-bubble rounded-tl-none text-foreground"
                        : "bg-primary text-primary-foreground rounded-tr-none whitespace-pre-wrap"
                    )}
                  >
                    {msg.role === "ai" ? (
                      <Streamdown className="prose prose-sm max-w-none text-foreground [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5">
                        {msg.content}
                      </Streamdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
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
                    disabled={isLoading}
                    className="prompt-btn flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-accent/50 min-w-[84px] shrink-0 text-center disabled:opacity-50 disabled:cursor-not-allowed"
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
                  onKeyDown={(e) => {
                    // Shift+Enter で送信、Enter のみは改行（IME確定でも誤送信しない）
                    if (e.key === "Enter" && e.shiftKey && !e.nativeEvent.isComposing && !isLoading) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={isLoading ? "AI が回答を生成中..." : "Shift+Enter で送信 — AI相談に質問する..."}
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-60"
                />
                <button onClick={() => toast("音声入力機能は近日公開予定です")} className="text-muted-foreground hover:text-foreground transition-colors">
                  <Mic className="w-4 h-4" />
                </button>
                <button onClick={() => toast("ファイル添付機能は近日公開予定です")} className="text-muted-foreground hover:text-foreground transition-colors">
                  <Paperclip className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && activeSession && (
        <SettingsPanel
          selectedIds={activeSession.selectedLectureIds}
          onChange={handleLectureIdsChange}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
