import { NextResponse } from "next/server";
import { getPool } from "@/lib/server/db";
import { withTenant } from "@/lib/server/tenant-guard";
import { normalizeAttendanceStatus } from "@/lib/constants/attendance";

export const runtime = "nodejs";

function parseDate(value: string | null, fallback: Date) {
  if (!value) return fallback;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  return date;
}

function dateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function defaultRange() {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 30);

  return {
    from: dateOnly(start),
    to: dateOnly(today),
  };
}

function summarizeAttendance(records: Array<{ status?: string }>) {
  const summary = {
    present: 0,
    absent: 0,
    leave: 0,
    late: 0,
    totalMarked: records.length,
    attendancePercentage: 0,
  };

  for (const record of records) {
    const status = String(record.status || "").toLowerCase();
    if (status === "present") summary.present++;
    if (status === "absent") summary.absent++;
    if (status === "leave") summary.leave++;
    if (status === "late") summary.late++;
  }

  summary.attendancePercentage =
    summary.totalMarked > 0
      ? Math.round((summary.present / summary.totalMarked) * 100)
      : 0;

  return summary;
}

export async function GET(req: Request) {
  return withTenant(async ({ tenantId, user }) => {
    const { searchParams } = new URL(req.url);
    const range = defaultRange();

    const studentId = searchParams.get("studentId") || searchParams.get("student_id");
    const classId = searchParams.get("classId") || searchParams.get("class");
    const sectionId = searchParams.get("sectionId") || searchParams.get("section");
    const status = searchParams.get("status");

    const fromDate = dateOnly(parseDate(searchParams.get("from"), new Date(range.from)));
    const toDate = dateOnly(parseDate(searchParams.get("to"), new Date(range.to)));

    const params: unknown[] = [fromDate, toDate];
    let where = "WHERE a.date >= $1 AND a.date <= $2";

    if (user.role !== "SAAS_ADMIN") {
      params.push(tenantId);
      where += ` AND (s.tenant_id = $${params.length} OR CAST(s.school_id AS TEXT) = $${params.length})`;
    }

    if (studentId) {
      params.push(studentId);
      where += ` AND a.student_id = $${params.length}`;
    }

    if (classId) {
      params.push(classId);
      where += ` AND s.class = $${params.length}`;
    }

    if (sectionId) {
      params.push(sectionId);
      where += ` AND s.section = $${params.length}`;
    }

    if (status) {
      params.push(normalizeAttendanceStatus(status).toLowerCase());
      where += ` AND a.status = $${params.length}`;
    }

    const result = await getPool().query(
      `SELECT
         a.id,
         a.student_id,
         a.date,
         a.status,
         a.marked_by,
         a.note,
         a.created_at,
         s.name,
         s.gr_number,
         s.roll_number,
         s.class,
         s.section
       FROM attendance a
       JOIN students s ON a.student_id = s.id
       ${where}
       ORDER BY a.date DESC, s.class ASC, s.section ASC, s.roll_number ASC, s.name ASC`,
      params
    );

    const records = result.rows.map((record) => ({
      ...record,
      remarks: record.note || null,
      student: {
        id: record.student_id,
        name: record.name,
        firstName: record.name,
        grNumber: record.gr_number,
        rollNumber: record.roll_number,
        class: record.class,
        section: record.section,
      },
    }));

    return NextResponse.json({
      success: true,
      data: {
        filters: {
          studentId,
          classId,
          sectionId,
          from: fromDate,
          to: toDate,
        },
        summary: summarizeAttendance(records),
        records,
      },
    });
  });
}
