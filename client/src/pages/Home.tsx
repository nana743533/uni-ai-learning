// ============================================================
// Home.tsx — ルートページ
// Design: Academic Clarity
// ============================================================
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import StudentView from "@/components/student/StudentView";
import ProfessorView from "@/components/professor/ProfessorView";
import type { UserRole } from "@/lib/mockData";

export default function Home() {
  const [userRole, setUserRole] = useState<UserRole>("student");

  return (
    <AppLayout userRole={userRole} onRoleChange={setUserRole}>
      {userRole === "student" ? (
        <StudentView />
      ) : (
        <ProfessorView />
      )}
    </AppLayout>
  );
}
