"use client";

import DashboardLayout from "@/components/DashboardLayout";
import OnlineTestPlayer from "@/components/OnlineExam/OnlineTestPlayer";
import { use } from "react";

export default function StudentOnlineTestPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const { examId } = use(params);

  return (
    <DashboardLayout role="student" title="Online Exam">
      <OnlineTestPlayer examId={examId} backHref="/student/exams" />
    </DashboardLayout>
  );
}
