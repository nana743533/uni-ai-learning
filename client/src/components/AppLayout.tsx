// ============================================================
// AppLayout — 共通レイアウト
// Design: Academic Clarity
// - 左サイドバー: コース情報 + ロール切替（授業回リストは廃止）
// - メインコンテンツ: タブ付きパネル
// ============================================================
import { BookOpen, GraduationCap, BookMarked, Users, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/mockData";
import { lectures } from "@/lib/mockData";

interface AppLayoutProps {
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  children: React.ReactNode;
}

export default function AppLayout({ userRole, onRoleChange, children }: AppLayoutProps) {
  const completedCount = lectures.filter((l) => l.status === "completed").length;
  const currentLecture = lectures.find((l) => l.status === "current");

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside
        className="flex flex-col shrink-0 border-r border-border bg-sidebar"
        style={{ width: "240px" }}
      >
        {/* Logo / App Title */}
        <div className="px-4 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-bold text-sidebar-foreground leading-tight">UniAI</p>
              <p className="text-[10px] text-muted-foreground leading-tight">学習支援AIアプリ</p>
            </div>
          </div>
        </div>

        {/* Role Toggle */}
        <div className="px-3 py-3 border-b border-sidebar-border">
          <div className="flex rounded-md overflow-hidden border border-sidebar-border text-xs">
            <button
              onClick={() => onRoleChange("student")}
              className={cn(
                "flex-1 py-1.5 font-medium transition-colors",
                userRole === "student"
                  ? "bg-primary text-primary-foreground"
                  : "bg-sidebar text-muted-foreground hover:bg-sidebar-accent"
              )}
            >
              学生
            </button>
            <button
              onClick={() => onRoleChange("professor")}
              className={cn(
                "flex-1 py-1.5 font-medium transition-colors",
                userRole === "professor"
                  ? "bg-primary text-primary-foreground"
                  : "bg-sidebar text-muted-foreground hover:bg-sidebar-accent"
              )}
            >
              教授
            </button>
          </div>
        </div>

        {/* Course Info */}
        <div className="px-4 pt-5 pb-3 border-b border-sidebar-border">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            受講中のコース
          </p>
          <div className="flex items-start gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <BookMarked className="w-4.5 h-4.5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-sidebar-foreground leading-snug">
                現代社会と心理学
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">全10回</p>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">進捗</span>
            <span className="text-[11px] font-semibold text-primary font-['Inter']">
              {completedCount} / {lectures.length} 回
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(completedCount / lectures.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Lecture */}
        {currentLecture && (
          <div className="px-4 py-4 border-b border-sidebar-border">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              現在の授業回
            </p>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-primary/8 border border-primary/20">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-primary-foreground font-['Inter']">
                  {currentLecture.number}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-primary leading-tight">
                  第{currentLecture.number}回
                </p>
                <p className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">
                  {currentLecture.title}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="px-4 py-4">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            コース統計
          </p>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="w-3.5 h-3.5" />
                受講生数
              </div>
              <span className="text-xs font-semibold text-foreground font-['Inter']">97名</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="w-3.5 h-3.5" />
                AI質問数
              </div>
              <span className="text-xs font-semibold text-foreground font-['Inter']">120件</span>
            </div>
          </div>
        </div>

        <div className="flex-1" />

        {/* Footer */}
        <div className="px-4 py-3 border-t border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">
                {userRole === "student" ? "山田 太郎" : "○○ 教授"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {userRole === "student" ? "学生" : "教授"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────── */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  );
}
