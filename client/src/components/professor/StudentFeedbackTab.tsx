// ============================================================
// StudentFeedbackTab — 学生フィードバックタブ（教授向け）
// Design: Academic Clarity
// ============================================================
import { Star, User } from "lucide-react";
import { studentFeedbacks } from "@/lib/mockData";
import { cn } from "@/lib/utils";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            "w-3.5 h-3.5",
            s <= rating ? "text-amber-400 fill-amber-400" : "text-muted stroke-muted-foreground"
          )}
        />
      ))}
    </div>
  );
}

export default function StudentFeedbackTab() {
  const avgRating =
    studentFeedbacks.reduce((sum, f) => sum + f.rating, 0) / studentFeedbacks.length;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-foreground">学生フィードバック</h2>
        <button className="text-xs text-primary hover:underline">全感想を見る</button>
      </div>

      {/* Average Rating */}
      <div className="bg-card border border-border rounded-xl p-4 mb-4 flex items-center gap-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-foreground font-['Inter']">
            {avgRating.toFixed(1)}
          </p>
          <StarRating rating={Math.round(avgRating)} />
          <p className="text-[11px] text-muted-foreground mt-1">{studentFeedbacks.length}件の評価</p>
        </div>
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = studentFeedbacks.filter((f) => f.rating === star).length;
            const pct = (count / studentFeedbacks.length) * 100;
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground w-3 font-['Inter']">{star}</span>
                <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[11px] text-muted-foreground w-4 font-['Inter']">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-3">
        {studentFeedbacks.map((fb) => (
          <div key={fb.id} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-muted-foreground">{fb.studentId}</p>
                  <StarRating rating={fb.rating} />
                </div>
                <p className="text-sm text-foreground leading-relaxed">{fb.comment}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
