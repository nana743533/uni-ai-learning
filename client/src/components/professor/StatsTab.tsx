// ============================================================
// StatsTab — 統計・分析タブ（教授向け）
// Design: Academic Clarity
// Features:
//   - アクセス学生数・AI質問数
//   - よくある質問TOP3
//   - 履修状況グラフ
// ============================================================
import { Users, MessageSquare, TrendingUp, BarChart2 } from "lucide-react";
import { lectureStats } from "@/lib/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const weeklyData = [
  { day: "月", questions: 18 },
  { day: "火", questions: 32 },
  { day: "水", questions: 45 },
  { day: "木", questions: 28 },
  { day: "金", questions: 55 },
  { day: "土", questions: 12 },
  { day: "日", questions: 8 },
];

const topicData = lectureStats.topQuestions.map((q) => ({
  name: q.topic,
  count: q.count,
}));

function StatCard({
  icon,
  label,
  value,
  sub,
  color = "primary",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground font-['Inter']">{value}</p>
      <p className="text-xs font-medium text-foreground mt-0.5">{label}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

export default function StatsTab() {
  const attendanceRate = Math.round(
    (lectureStats.accessStudents / lectureStats.totalEnrolled) * 100
  );

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <h2 className="text-base font-bold text-foreground mb-4">統計・分析</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard
          icon={<Users className="w-4.5 h-4.5" />}
          label="アクセス学生数"
          value={lectureStats.accessStudents}
          sub={`履修者の${attendanceRate}%`}
        />
        <StatCard
          icon={<MessageSquare className="w-4.5 h-4.5" />}
          label="AI質問数"
          value={lectureStats.aiQuestions}
          sub="今回の講義"
        />
        <StatCard
          icon={<TrendingUp className="w-4.5 h-4.5" />}
          label="履修登録者数"
          value={lectureStats.totalEnrolled}
          sub="名"
        />
        <StatCard
          icon={<BarChart2 className="w-4.5 h-4.5" />}
          label="出席率"
          value={`${attendanceRate}%`}
          sub="今回の講義"
        />
      </div>

      {/* Weekly Questions Chart */}
      <div className="bg-card border border-border rounded-xl p-4 mb-4">
        <h3 className="text-sm font-bold text-foreground mb-3">今週のAI質問数推移</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={weeklyData} barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.005 265)" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "oklch(0.55 0.015 265)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "oklch(0.55 0.015 265)" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: "white",
                border: "1px solid oklch(0.9 0.005 265)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="questions" radius={[4, 4, 0, 0]}>
              {weeklyData.map((_, i) => (
                <Cell
                  key={i}
                  fill={i === 4 ? "oklch(0.48 0.22 265)" : "oklch(0.78 0.12 265)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Questions */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-sm font-bold text-foreground mb-3">よくある質問 TOP 3</h3>
        <div className="space-y-3">
          {lectureStats.topQuestions.map((q, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0 font-['Inter']">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{q.topic}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${(q.count / 45) * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-muted-foreground font-['Inter'] shrink-0">
                    {q.count}件
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
