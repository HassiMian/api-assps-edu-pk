export const ATTENDANCE_STATUSES = [
  "PRESENT",
  "ABSENT",
  "LEAVE",
  "LATE",
] as const;

export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export function normalizeAttendanceStatus(status: string): AttendanceStatus {
  const value = status.toUpperCase();

  if (!ATTENDANCE_STATUSES.includes(value as AttendanceStatus)) {
    throw new Error("Invalid attendance status");
  }

  return value as AttendanceStatus;
}
