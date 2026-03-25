// ============================================================
// CourseInfoTab — 授業の情報タブ（学生向け）
// Design: Academic Clarity
// Features:
//   - 感想・要望アンケートをもとにした統計情報を表示
//   - 授業全体の満足度・よくある感想・改善要望など
// ============================================================
import { Star, Users, MessageSquare, TrendingUp, ThumbsUp } from "lucide-react";
import { studentFeedbacks, lectureStats, lectures } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// 全授業の統計データ（モック）
const allFeedbacks = [
  ...studentFeedbacks,
  { id: 4, lectureId: 2, studentId: "Student D", rating: 5, comment: "「心理学の歴史が面白かった！」", timestamp: "" },
  { id: 5, lectureId: 2, studentId: "Student E", rating: 3, comment: "「少し難しかったです。」", timestamp: "" },
  { id: 6, lectureId: 3, studentId: "Student F", rating: 4, comment: "「資料が分かりやすかった。」", timestamp: "" },
  { id: 7, lectureId: 4, studentId: "Student G", rating: 5, comment: "「AIのサポートが助かりました！」", timestamp: "" },
];

const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
  star,
  count: allFeedbacks.filter((f) => f.rating === star).length,
}));

const avgRating =
  allFeedbacks.reduce((sum, f) => sum + f.rating, 0) / allFeedbacks.length;

// 授業回ごとの平均満足度
const perLectureRatings = lectures.slice(0, 4).map((lec) => {
  const fbs = allFeedbacks.filter((f) => f.lectureId === lec.id);
  const avg = fbs.length > 0
    ? fbs.reduce((s, f) => s + f.rating, 0) / fbs.length
    : 0;
  return { name: `第${lec.number}回`, avg: parseFloat(avg.toFixed(1)), count: fbs.length };
});

// よく使われたタグ（モック）
const popularTags = [
  { tag: "分かりやすかった", count: 18 },
  { tag: "AIが役立った", count: 14 },
  { tag: "資料が充実していた", count: 11 },
  { tag: "演習が欲しい", count: 8 },
  { tag: "もっとゆっくり話してほしい", count: 6 },
  { tag: "質問しやすかった", count: 5 },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            "w-3.5 h-3.5",
            s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-muted stroke-muted-foreground"
          )}
        />
      ))}
    </div>
  );
}

export default function CourseInfoTab() {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <div className="mb-4">
        <h2 className="text-base font-bold text-foreground">授業の情報</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          受講生の感想・要望アンケートをもとにした統計情報です
        </p>
      </div>

      {/* Overall Rating */}
      <div className="bg-card border border-border rounded-xl p-4 mb-4 flex items-center gap-6">
        <div className="text-center shrink-0">
          <p className="text-4xl font-bold text-foreground font-['Inter']">
            {avgRating.toFixed(1)}
          </p>
          <StarRating rating={avgRating} />
          <p className="text-[11px] text-muted-foreground mt-1">
            {allFeedbacks.length}件の評価
          </p>
        </div>
        <div className="flex-1 space-y-1.5">
          {ratingDistribution.map(({ star, count }) => {
            const pct = allFeedbacks.length > 0 ? (count / allFeedbacks.length) * 100 : 0;
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

      {/* Per-lecture Rating Chart */}
      <div className="bg-card border border-border rounded-xl p-4 mb-4">
        <h3 className="text-sm font-bold text-foreground mb-3">授業回ごとの平均満足度</h3>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={perLectureRatings} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.005 265)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "oklch(0.55 0.015 265)" }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: "oklch(0.55 0.015 265)" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "white", border: "1px solid oklch(0.9 0.005 265)", borderRadius: "8px", fontSize: "12px" }}
              formatter={(v: number) => [`${v} / 5`, "平均満足度"]}
            />
            <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
              {perLectureRatings.map((_, i) => (
                <Cell key={i} fill={i === perLectureRatings.length - 1 ? "oklch(0.48 0.22 265)" : "oklch(0.78 0.12 265)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Popular Tags */}
      <div className="bg-card border border-border rounded-xl p-4 mb-4">
        <h3 className="text-sm font-bold text-foreground mb-3">よく寄せられた感想</h3>
        <div className="space-y-2.5">
          {popularTags.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0 font-['Inter']">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-foreground">{item.tag}</p>
                  <span className="text-[11px] text-muted-foreground font-['Inter'] shrink-0 ml-2">
                    {item.count}件
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary/60 transition-all"
                    style={{ width: `${(item.count / popularTags[0].count) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Comments */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-sm font-bold text-foreground mb-3">最近の感想コメント</h3>
        <div className="space-y-3">
          {allFeedbacks.slice(0, 5).map((fb) => {
            const lec = lectures.find((l) => l.id === fb.lectureId);
            return (
              <div key={fb.id} className="flex items-start gap-3 pb-3 border-b border-border/50 last:border-0 last:pb-0">
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  <Users className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      第{lec?.number}回
                    </span>
                    <StarRating rating={fb.rating} />
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{fb.comment}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
