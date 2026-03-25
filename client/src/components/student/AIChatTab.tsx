// ============================================================
// AIChatTab — AI相談タブ
// Design: Academic Clarity
// Features:
//   - RAGコンテキスト制限の表示
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
  ChevronRight,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Message {
  id: number;
  role: "user" | "ai";
  content: string;
  isReverseQuestion?: boolean;
}

interface PromptButton {
  id: string;
  icon: React.ReactNode;
  label: string;
  subLabel: string;
  reverseQuestions: string[];
}

const promptButtons: PromptButton[] = [
  {
    id: "deep-dive",
    icon: <BookOpen className="w-6 h-6" />,
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
    icon: <PenLine className="w-6 h-6" />,
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
    icon: <FileQuestion className="w-6 h-6" />,
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
    icon: <Lightbulb className="w-6 h-6" />,
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
    icon: <Search className="w-6 h-6" />,
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

export default function AIChatTab({ lectureTitle }: { lectureTitle: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "ai",
      content: `こんにちは！「${lectureTitle}」の学習をサポートします。\n\n今回の講義資料をもとに、どんなことでも気軽に質問してください。下のボタンからも始められますよ。\n\n${suggestions[0]}`,
    },
  ]);
  const [input, setInput] = useState("");
  const [pendingButton, setPendingButton] = useState<PromptButton | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addAIMessage = (content: string, isReverseQuestion = false) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "ai",
          content,
          isReverseQuestion,
        },
      ]);
      setIsTyping(false);
    }, 800);
  };

  const handlePromptButton = (btn: PromptButton) => {
    setPendingButton(btn);
    const userMsg = `${btn.label}${btn.subLabel} を使いたい`;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", content: userMsg },
    ]);
    const reverseQ =
      `より良い回答をするために、いくつか確認させてください！\n\n` +
      btn.reverseQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n") +
      `\n\n${suggestions[Math.floor(Math.random() * suggestions.length)]}`;
    addAIMessage(reverseQ, true);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userContent = input.trim();
    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", content: userContent },
    ]);

    if (pendingButton) {
      setPendingButton(null);
      const response = `ご回答ありがとうございます！「${lectureTitle}」の資料をもとに回答を生成します。\n\n（※ここでは実際のAI応答がRAGで生成されます。現在はデモ表示です。）\n\n今回の資料にはありませんが、一般論として補足すると…この内容は心理学の基礎として非常に重要です。\n\n${suggestions[Math.floor(Math.random() * suggestions.length)]}`;
      addAIMessage(response);
    } else {
      const response = `「${lectureTitle}」の資料をもとに回答します。\n\n（※ここでは実際のAI応答がRAGで生成されます。現在はデモ表示です。）\n\n${suggestions[Math.floor(Math.random() * suggestions.length)]}`;
      addAIMessage(response);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* RAG Context Indicator */}
      <div className="flex items-center gap-2 px-4 py-2 bg-accent/50 border-b border-border text-xs text-muted-foreground">
        <Info className="w-3.5 h-3.5 text-primary shrink-0" />
        <span>
          AI検索範囲：<strong className="text-foreground">第1回「{lectureTitle}」</strong>の資料のみ
        </span>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
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

      {/* Prompt Action Buttons */}
      <div className="px-4 py-3 border-t border-border bg-background">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {promptButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => handlePromptButton(btn)}
              className="prompt-btn flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-accent/50 min-w-[90px] shrink-0 text-center"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center text-primary">
                {btn.icon}
              </div>
              <span className="text-[11px] font-medium text-foreground leading-tight">
                {btn.label}
                <br />
                {btn.subLabel}
              </span>
            </button>
          ))}
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
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="AI相談に質問する、またはプロンプトを入力..."
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
            onClick={handleSend}
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
