// ============================================================
// FeedbackTab — 感想・要望タブ（学生向け・全授業共通）
// Design: Academic Clarity
// Features:
//   - 授業回選択なし（全授業共通フォーム）
//   - 星評価・コメント・クイックタグ
//   - 匿名送信
// ============================================================
import { useState } from "react";
import { Star, Send } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function FeedbackTab() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error("評価を選択してください");
      return;
    }
    setSubmitted(true);
    toast.success("フィードバックを送信しました！ありがとうございます。");
  };

  if (submitted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Star className="w-8 h-8 text-primary fill-primary" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2">フィードバックを送信しました！</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          ご意見ありがとうございます。教授に匿名で共有されます。
        </p>
        <button
          onClick={() => { setSubmitted(false); setRating(0); setComment(""); }}
          className="mt-6 px-4 py-2 text-sm font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
        >
          別の感想を送る
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-lg mx-auto">
        <h3 className="text-base font-bold text-foreground mb-1">感想・要望</h3>
        <p className="text-xs text-muted-foreground mb-6">
          匿名で教授に送信されます。
        </p>

        {/* Rating */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-foreground mb-3">満足度</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={cn(
                    "w-8 h-8 transition-colors",
                    (hoverRating || rating) >= star
                      ? "text-amber-400 fill-amber-400"
                      : "text-muted stroke-muted-foreground"
                  )}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              {["", "もう少し改善が必要", "普通", "良かった", "とても良かった", "素晴らしかった"][rating]}
            </p>
          )}
        </div>

        {/* Comment */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-foreground mb-2">コメント（任意）</p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="授業の感想、改善してほしい点、次回扱ってほしいトピックなど..."
            rows={5}
            className="w-full px-3 py-2.5 text-sm bg-card border border-border rounded-lg outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all resize-none placeholder:text-muted-foreground"
          />
        </div>

        {/* Quick Tags */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-foreground mb-2">よく使われるタグ</p>
          <div className="flex flex-wrap gap-2">
            {[
              "分かりやすかった",
              "もっとゆっくり話してほしい",
              "資料が充実していた",
              "演習が欲しい",
              "AIが役立った",
              "質問しやすかった",
            ].map((tag) => (
              <button
                key={tag}
                onClick={() => setComment((prev) => prev ? `${prev}\n${tag}` : tag)}
                className="text-xs px-3 py-1.5 rounded-full border border-border bg-card hover:border-primary/40 hover:bg-accent/50 text-foreground transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          <Send className="w-4 h-4" />
          匿名で送信する
        </button>
      </div>
    </div>
  );
}
