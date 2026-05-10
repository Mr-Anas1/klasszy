import type { AttendanceRecord } from "@/context/AppContext";

/**
 * Single source of truth for student attendance metrics.
 * Only counts attendance documents for the student's class.
 * A "marked day" is one where this student appears in that day's records.
 * Attendance rate = (present + late) / total marked days — late still counts as attended.
 */
export function computeStudentAttendanceStats(
  studentId: string | undefined,
  classId: string | undefined,
  records: AttendanceRecord[]
): {
  present: number;
  absent: number;
  late: number;
  totalMarked: number;
  ratePct: number;
} {
  if (!studentId || !classId) {
    return { present: 0, absent: 0, late: 0, totalMarked: 0, ratePct: 0 };
  }

  let present = 0;
  let absent = 0;
  let late = 0;

  for (const doc of records) {
    if (doc.classId !== classId) continue;
    const r = doc.records.find((x) => x.studentId === studentId);
    if (!r) continue;
    if (r.status === "present") present++;
    else if (r.status === "absent") absent++;
    else if (r.status === "late") late++;
  }

  const totalMarked = present + absent + late;
  const ratePct =
    totalMarked === 0 ? 0 : Math.round(((present + late) / totalMarked) * 100);

  return { present, absent, late, totalMarked, ratePct };
}

/** Build date → status map for calendar UIs (only class-scoped docs with a record for this student). */
export function buildStudentAttendanceDateMap(
  studentId: string | undefined,
  classId: string | undefined,
  records: AttendanceRecord[]
): Record<string, "present" | "absent" | "late"> {
  const map: Record<string, "present" | "absent" | "late"> = {};
  if (!studentId || !classId) return map;

  for (const doc of records) {
    if (doc.classId !== classId) continue;
    const r = doc.records.find((x) => x.studentId === studentId);
    if (r) map[doc.date] = r.status;
  }
  return map;
}

export function monthStatsFromMap(
  attendanceMap: Record<string, "present" | "absent" | "late">,
  year: number,
  month: number,
  daysInMonth: number
): { present: number; absent: number; late: number; total: number; pct: number } {
  let present = 0;
  let absent = 0;
  let late = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const s = attendanceMap[dateStr];
    if (s === "present") present++;
    else if (s === "absent") absent++;
    else if (s === "late") late++;
  }

  const total = present + absent + late;
  const pct =
    total === 0 ? 0 : Math.round(((present + late) / total) * 100);

  return { present, absent, late, total, pct };
}
