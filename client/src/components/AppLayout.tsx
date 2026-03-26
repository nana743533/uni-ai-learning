// ============================================================
// AppLayout — 共通レイアウト（サイドバーなし・トップヘッダー構成）
// Design: Academic Clarity
// - トップヘッダー: ロゴ + 授業名 + デモ版バッジ + ロール切替 + ユーザー名
// - メインコンテンツ: タブ付きパネル（全幅）
// ============================================================
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/mockData";

interface AppLayoutProps {
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  children: React.ReactNode;
}

export default function AppLayout({ userRole, onRoleChange, children }: AppLayoutProps) {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* ── Top Header Bar ───────────────────────────────── */}
      <header className="shrink-0 h-12 border-b border-border bg-sidebar flex items-center px-4 gap-3">
        {/* Logo + Course Name + Demo Badge */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">UniAI</span>
            <span className="text-muted-foreground text-xs select-none">/</span>
            <span className="text-sm font-semibold text-foreground">情報社会と倫理</span>
          </div>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide bg-amber-100 text-amber-700 border border-amber-200 uppercase leading-none select-none">
            Demo
          </span>
        </div>

        <div className="flex-1" />

        {/* Role Toggle */}
        <div className="flex rounded-md overflow-hidden border border-border text-xs shrink-0">
          <button
            onClick={() => onRoleChange("student")}
            className={cn(
              "px-3 py-1.5 font-medium transition-colors",
              userRole === "student"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-muted"
            )}
          >
            学生
          </button>
          <button
            onClick={() => onRoleChange("professor")}
            className={cn(
              "px-3 py-1.5 font-medium transition-colors",
              userRole === "professor"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-muted"
            )}
          >
            教授
          </button>
        </div>

        {/* User Name */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-[11px] font-bold text-primary">
              {userRole === "student" ? "山" : "教"}
            </span>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:block">
            {userRole === "student" ? "山田 太郎" : "○○ 教授"}
          </span>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────── */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  );
}
