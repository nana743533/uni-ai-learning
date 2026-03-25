// ============================================================
// Home — メインページ（全体統合）
// Design: Academic Clarity (Swiss International Style × Modern EdTech)
// ============================================================
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import StudentView from "@/components/student/StudentView";
import ProfessorView from "@/components/professor/ProfessorView";
import type { UserRole } from "@/lib/mockData";

export default function Home() {
  const [selectedLectureId, setSelectedLectureId] = useState(1);
  const [userRole, setUserRole] = useState<UserRole>("student");

  return (
    <AppLayout
      selectedLectureId={selectedLectureId}
      onSelectLecture={setSelectedLectureId}
      userRole={userRole}
      onRoleChange={setUserRole}
    >
      {userRole === "student" ? (
        <StudentView lectureId={selectedLectureId} />
      ) : (
        <ProfessorView lectureId={selectedLectureId} />
      )}
    </AppLayout>
  );
}
