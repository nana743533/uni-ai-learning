// ============================================================
// AppLayout — 共通レイアウト
// Design: Academic Clarity
// - 左サイドバー (240px固定): 講義リスト + ロール切替
// - メインコンテンツ: タブ付きパネル
// ============================================================
import { useState } from "react";
import { lectures, type Lecture, type UserRole } from "@/lib/mockData";
import {
  CheckCircle2,
  Circle,
  PlayCircle,
  BookOpen,
  GraduationCap,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  selectedLectureId: number;
  onSelectLecture: (id: number) => void;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  children: React.ReactNode;
}

function LectureStatusIcon({ status }: { status: Lecture["status"] }) {
  if (status === "completed")
    return <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />;
  if (status === "current")
    return <PlayCircle className="w-4 h-4 text-primary shrink-0" />;
  return <Circle className="w-4 h-4 text-muted-foreground shrink-0" />;
}

export default function AppLayout({
  selectedLectureId,
  onSelectLecture,
  userRole,
  onRoleChange,
  children,
}: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside
        className="flex flex-col shrink-0 border-r border-border bg-sidebar"
        style={{ width: "var(--sidebar-width, 240px)" }}
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

        {/* Course Title */}
        <div className="px-4 pt-4 pb-2">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            講義リスト
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">現代社会と心理学</p>
        </div>

        {/* Lecture List */}
        <nav className="flex-1 overflow-y-auto px-2 pb-4">
          {lectures.map((lecture) => {
            const isActive = lecture.id === selectedLectureId;
            return (
              <button
                key={lecture.id}
                onClick={() => onSelectLecture(lecture.id)}
                className={cn(
                  "lecture-item w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-left mb-0.5",
                  isActive
                    ? "active bg-sidebar-accent"
                    : "hover:bg-sidebar-accent/60"
                )}
              >
                <LectureStatusIcon status={lecture.status} />
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-xs font-semibold leading-tight",
                      isActive ? "text-primary" : "text-sidebar-foreground"
                    )}
                  >
                    {lecture.number} 回
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">
                    {lecture.subtitle}
                  </p>
                </div>
                {lecture.status === "current" && (
                  <ChevronRight className="w-3 h-3 text-primary shrink-0" />
                )}
                {lecture.status === "completed" && (
                  <span className="w-3 h-3 shrink-0" />
                )}
              </button>
            );
          })}
        </nav>

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
