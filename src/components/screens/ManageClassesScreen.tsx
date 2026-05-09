"use client";

import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Plus, School, Trash2, X, Users, GraduationCap, Calendar, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { useApp, STANDARD_GRADES, ClassRoom, AttendanceRecord } from "@/context/AppContext";

type View = "grades" | "sections" | "section_students" | "section_attendance";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function getTwelveMonths(startYear: number, startMonth: number): { year: number; month: number }[] {
  const out: { year: number; month: number }[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(startYear, startMonth + i, 1);
    out.push({ year: d.getFullYear(), month: d.getMonth() });
  }
  return out;
}

export default function ManageClassesScreen() {
  const {
    classes, students, addClass, deleteClass,
    attendance, usersList, markAttendance,
    setActiveTab, studentDetailReturnTab, setStudentDetailReturnTab,
    showConfirm, showAlert, updateStudent, setSelectedStudent,
  } = useApp();

  const [view, setView] = useState<View>("grades");
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<ClassRoom | null>(null);
  const [attendanceStartYear, setAttendanceStartYear] = useState(() => new Date().getFullYear());
  const [attendanceStartMonth, setAttendanceStartMonth] = useState(() => new Date().getMonth());
  const [attendanceSelectedMonthIdx, setAttendanceSelectedMonthIdx] = useState(0);
  const [attendanceSelectedDate, setAttendanceSelectedDate] = useState<string | null>(null);
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [tempAtt, setTempAtt] = useState<Record<string, "present" | "absent">>({});
  const [showEditAttendance, setShowEditAttendance] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [selectedExistingStudentId, setSelectedExistingStudentId] = useState("");
  const [showAddClass, setShowAddClass] = useState(false);
  const [cData, setCData] = useState({
    grade: STANDARD_GRADES[0],
    section: "A",
    customSection: "",
  });

  const portalTarget = useMemo(
    () => (typeof document !== "undefined" ? document.body : null),
    []
  );

  // Group classes by grade name
  const gradesMap: Record<string, typeof classes> = {};
  classes.forEach(c => {
    if (!gradesMap[c.name]) gradesMap[c.name] = [];
    gradesMap[c.name].push(c);
  });
  const uniqueGrades = Object.keys(gradesMap).sort((a, b) => {
    const ai = STANDARD_GRADES.indexOf(a);
    const bi = STANDARD_GRADES.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const handleAddClass = async () => {
    const finalSection = cData.section === "custom" ? cData.customSection.trim() : cData.section;
    if (!cData.grade || !finalSection) {
      showAlert("Missing Info", "Grade and section are required.", "error");
      return;
    }
    await addClass({ name: cData.grade, section: finalSection });
    setCData({ grade: STANDARD_GRADES[0], section: "A", customSection: "" });
    setShowAddClass(false);
  };

  const sectionAttendanceByDate = useMemo<Record<string, AttendanceRecord>>(() => {
    const map: Record<string, AttendanceRecord> = {};
    if (!selectedSection) return map;
    (attendance || []).forEach((doc) => {
      if (doc.classId === selectedSection.id) map[doc.date] = doc;
    });
    return map;
  }, [attendance, selectedSection]);

  const openAttendanceEditForDate = (dateStr: string, sectionStudents: typeof students) => {
    if (!selectedSection) return;
    const existing = sectionAttendanceByDate[dateStr];
    const init: Record<string, "present" | "absent"> = {};
    sectionStudents.forEach((s) => {
      const r = existing?.records.find((rr) => rr.studentId === s.id);
      init[s.id] = r?.status === "absent" ? "absent" : "present";
    });
    setTempAtt(init);
    setAttendanceDate(dateStr);
    setShowEditAttendance(true);
  };

  const handleSubmitAttendance = async (sectionStudents: typeof students) => {
    if (!selectedSection) return;
    const records = Object.entries(tempAtt).map(([studentId, status]) => ({ studentId, status }));
    await markAttendance(selectedSection.id, attendanceDate, records);
    setShowEditAttendance(false);
    showAlert("Saved", "Attendance updated successfully.", "success");
  };

  const handleDeleteClass = (classId: string) => {
    showConfirm(
      "Delete Section?",
      "This will remove the section. Students will become unassigned.",
      () => deleteClass(classId)
    );
  };

  const handleRemoveFromSection = (student: any) => {
    showConfirm(
      "Remove From Section?",
      `Remove ${student.name} from this section? The student account will stay active and can be reassigned later.`,
      async () => {
        await updateStudent(student.id, { classId: "" });
        showAlert("Updated", `${student.name} is now unassigned.`, "success");
      }
    );
  };

  const handleAssignExistingStudent = async () => {
    if (!selectedSection || !selectedExistingStudentId) return;
    await updateStudent(selectedExistingStudentId, { classId: selectedSection.id });
    setSelectedExistingStudentId("");
    setShowAddStudent(false);
    showAlert("Assigned", "Student assigned to section successfully.", "success");
  };

  // ── Sections View ──────────────────────────────────────────────────────────
  if (view === "sections" && selectedGrade) {
    const sections = gradesMap[selectedGrade] || [];
    return (
      <>
        <div className="pb-36 px-5 pt-6 animate-fade-slide-up">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => setView("grades")}
              className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm active:scale-90 transition-transform"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex-1">
              <h2 className="text-2xl font-black text-gray-900">{selectedGrade} Class</h2>
              <p className="text-sm text-gray-400 mt-0.5">Sections · {sections.length} total</p>
            </div>
            <button
              onClick={() => { setCData(p => ({ ...p, grade: selectedGrade })); setShowAddClass(true); }}
              className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 active:scale-90 transition-transform"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            {sections.map(s => {
              const count = students.filter(st => st.classId === s.id).length;
              return (
                <div key={s.id} className="flex gap-2 group">
                  <button
                    onClick={() => { setSelectedSection(s); setView("section_students"); }}
                    className="flex-1 bg-white rounded-[28px] p-5 border border-gray-100 shadow-sm flex items-center justify-between hover:border-indigo-100 active:scale-95 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center font-black text-emerald-600 text-lg">
                        {s.section}
                      </div>
                      <div>
                        <p className="font-black text-gray-900">Section {s.section}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-0.5">
                          {count} student{count !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <Users className="w-5 h-5 text-gray-300 group-hover:text-indigo-400 transition-colors" />
                  </button>
                  <button
                    onClick={() => handleDeleteClass(s.id)}
                    className="w-14 bg-white border border-gray-100 rounded-[28px] flex items-center justify-center text-gray-300 hover:text-rose-500 hover:border-rose-100 transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              );
            })}

            {sections.length === 0 && (
              <div className="bg-white border border-dashed border-gray-200 rounded-[32px] p-12 text-center">
                <School className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="font-black text-gray-900">No sections yet</p>
                <p className="text-sm text-gray-400 mt-1">Tap + to add the first section</p>
              </div>
            )}
          </div>
        </div>

        {showAddClass && portalTarget && createPortal(
          <AddClassModal
            cData={cData}
            setCData={setCData}
            onClose={() => setShowAddClass(false)}
            onAdd={handleAddClass}
          />,
          portalTarget
        )}
      </>
    );
  }

  // ── Section Students View ─────────────────────────────────────────────────────
  if (view === "section_students" && selectedSection) {
    const sectionStudents = students.filter(s => s.classId === selectedSection.id);
    const unassignedStudents = students.filter(s => !s.classId?.trim());
    
    return (
      <div className="pb-36 px-5 pt-6 animate-fade-slide-up">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setView("sections")}
            className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm active:scale-90 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1">
            <h2 className="text-2xl font-black text-gray-900">
              {selectedSection.name} - Section {selectedSection.section}
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {sectionStudents.length} student{sectionStudents.length !== 1 ? "s" : ""} enrolled
            </p>
          </div>
              <button
                onClick={() => {
                  setShowAddStudent(true);
                }}
            className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 active:scale-90 transition-transform"
            aria-label="Add Student"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              const now = new Date();
              const months = getTwelveMonths(attendanceStartYear, attendanceStartMonth);
              const idx = months.findIndex((m) => m.year === now.getFullYear() && m.month === now.getMonth());
              setAttendanceSelectedMonthIdx(idx === -1 ? 0 : idx);
              setAttendanceSelectedDate(null);
              setView("section_attendance");
            }}
            className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 active:scale-90 transition-transform"
            aria-label="Attendance History"
          >
            <Calendar className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {sectionStudents.map(student => (
            <div
              key={student.id}
              className="bg-white rounded-[28px] p-5 border border-gray-100 shadow-sm flex items-center gap-4 group hover:border-indigo-100 transition-all"
            >
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                <span className="text-sm font-black text-emerald-700 uppercase">{student.name[0]}</span>
              </div>
              <button
                onClick={() => {
                  setStudentDetailReturnTab("manage_classes");
                  setSelectedStudent(student);
                  setActiveTab("student_detail");
                }}
                className="flex-1 text-left min-w-0"
              >
                <h4 className="text-[15px] font-black text-gray-900 truncate">{student.name}</h4>
                <p className="text-[11px] font-bold text-gray-400 mt-0.5">ID: {student.id.slice(0, 8)}</p>
                <p className="text-[11px] font-bold text-gray-400 mt-0.5">Username: {student.username}</p>
              </button>
              <button
                onClick={() => handleRemoveFromSection(student)}
                className="w-9 h-9 bg-rose-50 text-rose-400 rounded-xl flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          {sectionStudents.length === 0 && (
            <div className="bg-white border border-dashed border-gray-200 rounded-[32px] p-16 text-center">
              <GraduationCap className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="font-black text-gray-900">No students enrolled</p>
              <p className="text-sm text-gray-400 mt-1">Students will appear here once enrolled</p>
            </div>
          )}
        </div>

        {showAddStudent && portalTarget && createPortal(
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-end">
            <div className="bg-white w-full rounded-t-[40px] max-h-[90vh] flex flex-col">
              <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-100 shrink-0">
                <div>
                  <h3 className="text-xl font-black text-gray-900">Add Student</h3>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                    {selectedSection.name} - Section {selectedSection.section}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddStudent(false)}
                  className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center active:scale-90 transition-transform"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  Assign Existing Unassigned Student
                </p>
                <select
                  value={selectedExistingStudentId}
                  onChange={(e) => setSelectedExistingStudentId(e.target.value)}
                  className="w-full bg-gray-50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-200"
                >
                  <option value="">Select student</option>
                  {unassignedStudents.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.username || "No username"})
                    </option>
                  ))}
                </select>

                {unassignedStudents.length === 0 && (
                  <div className="mt-4 bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-4 text-center">
                    <p className="text-sm font-semibold text-gray-500">
                      No unassigned students available.
                    </p>
                  </div>
                )}
              </div>

              <div className="px-6 pb-8 pt-4 shrink-0 bg-white border-t border-gray-100">
                <button
                  onClick={handleAssignExistingStudent}
                  disabled={!selectedExistingStudentId}
                  className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-emerald-200 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Assign Selected Student
                </button>
              </div>
            </div>
          </div>,
          portalTarget
        )}
      </div>
    );
  }

  // ── Section Attendance View ─────────────────────────────────────────────────
  if (view === "section_attendance" && selectedSection) {
    const sectionStudents = students.filter(s => s.classId === selectedSection.id);
    const months = getTwelveMonths(attendanceStartYear, attendanceStartMonth);
    const end = months[months.length - 1];
    const rangeLabel = `${MONTH_NAMES[attendanceStartMonth]} ${attendanceStartYear} – ${MONTH_NAMES[end.month]} ${end.year}`;
    const selectedMonth = months[attendanceSelectedMonthIdx] ?? months[0];
    const y = selectedMonth.year;
    const m = selectedMonth.month;
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const firstDayOfWeek = new Date(y, m, 1).getDay();
    const todayStr = new Date().toISOString().split("T")[0];

    const getCellStyle = (dateStr: string) => {
      const doc = sectionAttendanceByDate[dateStr];
      const isFuture = dateStr > todayStr;
      const isToday = dateStr === todayStr;
      if (isFuture) return { cls: "bg-gray-50 text-gray-300", isToday, isFuture };
      if (!doc) return { cls: "bg-gray-50 text-gray-400", isToday, isFuture };
      const total = doc.records.length || sectionStudents.length;
      const present = doc.records.filter((r) => r.status === "present").length;
      const pct = total === 0 ? 0 : Math.round((present / total) * 100);
      if (pct >= 90) return { cls: "bg-emerald-100 text-emerald-700", isToday, isFuture };
      if (pct >= 75) return { cls: "bg-amber-100 text-amber-700", isToday, isFuture };
      return { cls: "bg-rose-100 text-rose-700", isToday, isFuture };
    };

    return (
      <>
        <div className="pb-36 px-5 pt-6 animate-fade-slide-up">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => {
                setActiveTab("manage_classes");
                setView("section_students");
              }}
              className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm active:scale-90 transition-transform"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex-1">
              <h2 className="text-2xl font-black text-gray-900">Attendance</h2>
              <p className="text-sm text-gray-400 mt-0.5">{selectedSection.name}-{selectedSection.section} · {rangeLabel}</p>
            </div>
          </div>

          <div className="bg-white rounded-[24px] p-4 border border-gray-100 shadow-sm mb-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Start Month</p>
                <select
                  value={attendanceStartMonth}
                  onChange={(e) => setAttendanceStartMonth(parseInt(e.target.value, 10))}
                  className="w-full bg-gray-50 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  {MONTH_NAMES.map((mm, idx) => (
                    <option key={mm} value={idx}>{mm}</option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Start Year</p>
                <select
                  value={attendanceStartYear}
                  onChange={(e) => setAttendanceStartYear(parseInt(e.target.value, 10))}
                  className="w-full bg-gray-50 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  {Array.from({ length: 7 }).map((_, i) => {
                    const yy = new Date().getFullYear() - 3 + i;
                    return <option key={yy} value={yy}>{yy}</option>;
                  })}
                </select>
              </div>
            </div>
          </div>

          <div className="-mx-5 px-5 overflow-x-auto no-scrollbar">
            <div className="flex gap-2 pb-1 flex-nowrap">
              {months.map((mm, idx) => (
                <button
                  key={`${mm.year}-${mm.month}`}
                  onClick={() => setAttendanceSelectedMonthIdx(idx)}
                  className={`shrink-0 px-4 py-2 rounded-2xl text-xs font-black transition-all ${
                    attendanceSelectedMonthIdx === idx
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                      : "bg-white text-gray-500 border border-gray-100 hover:border-indigo-200 hover:text-indigo-500"
                  }`}
                >
                  {MONTH_NAMES[mm.month].slice(0, 3)}
                  <span className="ml-1 opacity-60">'{String(mm.year).slice(2)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={() => setAttendanceSelectedMonthIdx((i) => Math.max(0, i - 1))}
                disabled={attendanceSelectedMonthIdx === 0}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-50 active:scale-95 disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <div className="text-center">
                <p className="font-black text-gray-900">{MONTH_NAMES[m]} {y}</p>
                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">Tap a day to view</p>
              </div>
              <button
                onClick={() => setAttendanceSelectedMonthIdx((i) => Math.min(months.length - 1, i + 1))}
                disabled={attendanceSelectedMonthIdx === months.length - 1}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-50 active:scale-95 disabled:opacity-30 transition-all"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="grid grid-cols-7 mb-2">
              {DAY_LABELS.map((d) => (
                <div key={d} className="text-center text-[10px] font-black uppercase text-gray-400 py-1">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const { cls, isToday, isFuture } = getCellStyle(dateStr);
                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => !isFuture && setAttendanceSelectedDate(dateStr)}
                    className={`aspect-square flex items-center justify-center rounded-xl text-xs font-black transition-all select-none ${cls} ${
                      isToday ? "ring-2 ring-indigo-500 ring-offset-1" : ""
                    } ${isFuture ? "cursor-not-allowed" : "hover:brightness-[0.98] active:scale-95"}`}
                    aria-label={`Attendance for ${dateStr}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {attendanceSelectedDate && portalTarget && createPortal(
          <div className="fixed inset-0 bg-black/60 z-[120] flex items-end">
            <button
              type="button"
              onClick={() => setAttendanceSelectedDate(null)}
              className="absolute inset-0"
              aria-label="Close"
            />
            <div className="relative bg-white w-full rounded-t-[40px] max-h-[90vh] flex flex-col">
              <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-100 shrink-0">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Attendance Details</p>
                  <p className="text-xl font-black text-gray-900">{attendanceSelectedDate}</p>
                </div>
                <button
                  onClick={() => setAttendanceSelectedDate(null)}
                  className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                {(() => {
                  const doc = sectionAttendanceByDate[attendanceSelectedDate];
                  const markedBy = doc?.markedBy ? usersList.find((u) => u.id === doc.markedBy) : null;
                  if (!doc) {
                    return (
                      <div className="bg-gray-50 border border-gray-100 rounded-[24px] p-5">
                        <div className="flex items-center gap-3">
                          <Info className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">No Record</p>
                            <p className="text-sm font-black text-gray-900">Attendance not marked on this day</p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  const recordMap = new Map(doc.records.map((r) => [r.studentId, r.status] as const));
                  const present = doc.records.filter((r) => r.status === "present").length;
                  const absent = doc.records.filter((r) => r.status === "absent").length;
                  const late = doc.records.filter((r) => r.status === "late").length;
                  return (
                    <>
                      <div className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm mb-4">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-emerald-50 rounded-2xl p-4 text-center">
                            <p className="text-2xl font-black text-emerald-600">{present}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Present</p>
                          </div>
                          <div className="bg-rose-50 rounded-2xl p-4 text-center">
                            <p className="text-2xl font-black text-rose-600">{absent}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Absent</p>
                          </div>
                          <div className="bg-amber-50 rounded-2xl p-4 text-center">
                            <p className="text-2xl font-black text-amber-600">{late}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Late</p>
                          </div>
                        </div>
                        {markedBy && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Marked By</p>
                            <p className="text-sm font-black text-gray-900">{markedBy.name}</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        {sectionStudents.map((s) => {
                          const st = recordMap.get(s.id) ?? "absent";
                          return (
                            <div key={s.id} className="bg-white rounded-[20px] p-4 border border-gray-100 shadow-sm flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm uppercase shrink-0 ${
                                st === "present" ? "bg-emerald-600 text-white" : st === "late" ? "bg-amber-500 text-white" : "bg-rose-500 text-white"
                              }`}>
                                {s.name[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-gray-900 truncate">{s.name}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{st}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="px-6 pb-8 pt-4 shrink-0 bg-white border-t border-gray-100">
                <button
                  onClick={() => {
                    if (!attendanceSelectedDate) return;
                    const d = attendanceSelectedDate;
                    setAttendanceSelectedDate(null);
                    openAttendanceEditForDate(d, sectionStudents);
                  }}
                  className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-emerald-200 active:scale-95 transition-transform"
                >
                  Edit Attendance
                </button>
              </div>
            </div>
          </div>,
          portalTarget
        )}

        {showEditAttendance && portalTarget && createPortal(
          <div className="fixed inset-0 bg-black/60 z-[130] flex items-end">
            <div className="bg-white w-full rounded-t-[40px] max-h-[90vh] flex flex-col">
              <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-100 shrink-0">
                <div>
                  <h3 className="text-xl font-black text-gray-900">Mark Attendance</h3>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                    {selectedSection.name}-{selectedSection.section} · {sectionStudents.length} students · {attendanceDate}
                  </p>
                </div>
                <button
                  onClick={() => setShowEditAttendance(false)}
                  className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 px-4 py-4 space-y-2">
                {sectionStudents.map(s => {
                  const isPresent = tempAtt[s.id] === "present";
                  return (
                    <button
                      key={s.id}
                      onClick={() => setTempAtt(p => ({ ...p, [s.id]: isPresent ? "absent" : "present" }))}
                      className={`w-full flex items-center gap-4 p-4 rounded-[20px] border-2 transition-all ${
                        isPresent
                          ? "border-emerald-300 bg-emerald-50"
                          : "border-rose-200 bg-rose-50"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm uppercase shrink-0 ${
                        isPresent ? "bg-emerald-600 text-white" : "bg-rose-500 text-white"
                      }`}>
                        {s.name[0]}
                      </div>
                      <span className="flex-1 text-sm font-black text-gray-900 text-left">{s.name}</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${
                        isPresent ? "text-emerald-600" : "text-rose-500"
                      }`}>
                        {isPresent ? "Present" : "Absent"}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="px-4 pb-6 pt-3 shrink-0">
                <button
                  onClick={() => handleSubmitAttendance(sectionStudents)}
                  className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-emerald-200 active:scale-95 transition-transform"
                >
                  Save Attendance
                </button>
              </div>
            </div>
          </div>,
          portalTarget
        )}
      </>
    );
  }

  // ── Grades View ────────────────────────────────────────────────────────────
  return (
    <>
      <div className="pb-36 px-5 pt-6 animate-fade-slide-up">
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1">
            <h2 className="text-2xl font-black text-gray-900">Classes</h2>
            <p className="text-sm text-gray-400 mt-0.5">Grade & Section Management</p>
          </div>
          <button
            onClick={() => setShowAddClass(true)}
            className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 active:scale-90 transition-transform"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {uniqueGrades.map(gName => (
            <button
              key={gName}
              onClick={() => { setSelectedGrade(gName); setView("sections"); }}
              className="bg-white rounded-[32px] p-6 border border-gray-100 text-left hover:border-indigo-100 active:scale-95 transition-all shadow-sm group"
            >
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                <School className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-black text-gray-900">{gName}</h4>
              <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-widest">
                {gradesMap[gName].length} section{gradesMap[gName].length !== 1 ? "s" : ""}
              </p>
            </button>
          ))}

          {uniqueGrades.length === 0 && (
            <div className="col-span-2 bg-white border border-dashed border-gray-200 rounded-[32px] p-16 text-center">
              <School className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="font-black text-gray-900">No classes created yet</p>
              <p className="text-sm text-gray-400 mt-1">Tap + to create your first class</p>
            </div>
          )}
        </div>
      </div>

      {showAddClass && portalTarget && createPortal(
        <AddClassModal
          cData={cData}
          setCData={setCData}
          onClose={() => setShowAddClass(false)}
          onAdd={handleAddClass}
        />,
        portalTarget
      )}
    </>
  );
}

// ─── Add Class Modal ──────────────────────────────────────────────────────────

type CData = { grade: string; section: string; customSection: string };

function AddClassModal({
  cData, setCData, onClose, onAdd,
}: {
  cData: CData;
  setCData: React.Dispatch<React.SetStateAction<CData>>;
  onClose: () => void;
  onAdd: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-end">
      <div className="bg-white w-full rounded-t-[40px] p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-gray-900">Add Class</h3>
          <button onClick={onClose} className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Grade</p>
            <select
              value={cData.grade}
              onChange={e => setCData(p => ({ ...p, grade: e.target.value }))}
              className="w-full bg-gray-50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              {STANDARD_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Section</p>
            <div className="flex gap-2 flex-wrap">
              {["A", "B", "C", "D", "custom"].map(s => (
                <button
                  key={s}
                  onClick={() => setCData(p => ({ ...p, section: s }))}
                  className={`px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                    cData.section === s ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {s === "custom" ? "Custom" : s}
                </button>
              ))}
            </div>
          </div>

          {cData.section === "custom" && (
            <input
              type="text"
              placeholder="Enter section name"
              value={cData.customSection}
              onChange={e => setCData(p => ({ ...p, customSection: e.target.value }))}
              className="w-full bg-gray-50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          )}
        </div>

        <button
          onClick={onAdd}
          className="w-full mt-6 bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-indigo-200 active:scale-95 transition-transform"
        >
          Create Class
        </button>
      </div>
    </div>
  );
}
