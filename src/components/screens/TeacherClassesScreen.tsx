"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft, BookOpen, Calendar, CalendarClock, Users, CheckCircle2, Check, X, Plus, ChevronLeft, ChevronRight, Info,
  Paperclip, Loader2, Trash2,
} from "lucide-react";
import { useApp, UserProfile, ClassRoom, AttendanceRecord } from "@/context/AppContext";
import MobileSelect from "@/components/ui/MobileSelect";
import MobileMultiSelect from "@/components/ui/MobileMultiSelect";
import {
  attachmentTypeFromFile,
  isCloudinaryConfigured,
  uploadToCloudinary,
} from "@/lib/cloudinary";

type Action = "none" | "attendance" | "homework" | "notification";
type Priority = "High" | "Medium" | "Low";
type ClassMessageAction = "none" | "notification" | "fee_reminder";

type ViewMode = "manage" | "attendance_history";

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

export default function TeacherClassesScreen() {
  const {
    user,
    classes,
    students,
    homework,
    markAttendance,
    assignHomework,
    sendNotification,
    addStudent,
    updateStudent,
    setActiveTab,
    setSelectedStudent,
    setStudentDetailReturnTab,
    showAlert,
    showConfirm,
    attendance,
    usersList,
    timetables,
    upsertClassTimetable,
    deleteClassTimetable,
  } = useApp();
  const teacher = user as UserProfile;

  const myClasses = classes.filter(c => teacher.classIds?.includes(c.id));

  const [selectedClass, setSelectedClass] = useState<ClassRoom | null>(null);
  const [action, setAction] = useState<Action>("none");
  const [messageAction, setMessageAction] = useState<ClassMessageAction>("none");
  const [successMsg, setSuccessMsg] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("manage");

  // Attendance state
  const [tempAtt, setTempAtt] = useState<Record<string, "present" | "absent">>({});
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split("T")[0]);

  // Attendance history state (per class)
  const [startYear, setStartYear] = useState(() => new Date().getFullYear());
  const [startMonth, setStartMonth] = useState(() => new Date().getMonth());
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Homework state
  const [hwForm, setHwForm] = useState({
    subject: "", task: "", issueDate: "", dueDate: "", priority: "Medium" as Priority,
  });

  // Notification state
  const [notifForm, setNotifForm] = useState({
    title: "", message: "", type: "general" as "fee" | "general" | "instruction"
  });

  // Fee reminder state (reuses notifications collection/type="fee")
  const [feeForm, setFeeForm] = useState({
    title: "",
    description: "",
    feeAmount: "",
    dueDate: "",
    paymentNote: "",
    audience: "all" as "all" | "selected",
  });
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Add student state
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [sData, setSData] = useState({ name: "", username: "", password: "", gender: "" as "" | "male" | "female" });
  const [selectedExistingStudentId, setSelectedExistingStudentId] = useState("");
  const [ttFile, setTtFile] = useState<File | null>(null);
  const [ttUploading, setTtUploading] = useState(false);

  const portalTarget = useMemo(
    () => (typeof document !== "undefined" ? document.body : null),
    []
  );

  const classStudents = selectedClass
    ? students.filter(s => s.classId === selectedClass.id)
    : [];
  const unassignedStudents = students.filter(s => !s.classId?.trim());

  useEffect(() => {
    if (!selectedClass) return;
    try {
      const key = `teacherAttendanceCalendarStart_${selectedClass.id}`;
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as { startYear?: number; startMonth?: number };
        if (typeof parsed.startYear === "number") setStartYear(parsed.startYear);
        if (typeof parsed.startMonth === "number") setStartMonth(parsed.startMonth);
      } else {
        const now = new Date();
        setStartYear(now.getFullYear());
        setStartMonth(now.getMonth());
      }
    } catch {
      // ignore
    }
  }, [selectedClass]);

  useEffect(() => {
    if (!selectedClass) return;
    try {
      const key = `teacherAttendanceCalendarStart_${selectedClass.id}`;
      if (typeof window === "undefined") return;
      window.localStorage.setItem(key, JSON.stringify({ startYear, startMonth }));
    } catch {
      // ignore
    }
  }, [selectedClass, startMonth, startYear]);

  const months = useMemo(() => getTwelveMonths(startYear, startMonth), [startMonth, startYear]);
  const end = months[months.length - 1];
  const rangeLabel = `${MONTH_NAMES[startMonth]} ${startYear} – ${MONTH_NAMES[end.month]} ${end.year}`;

  useEffect(() => {
    const now = new Date();
    const idx = months.findIndex((m) => m.year === now.getFullYear() && m.month === now.getMonth());
    setSelectedMonthIdx(idx === -1 ? 0 : idx);
  }, [months]);

  const classAttendanceByDate = useMemo<Record<string, AttendanceRecord>>(() => {
    const map: Record<string, AttendanceRecord> = {};
    if (!selectedClass) return map;
    (attendance || []).forEach((doc) => {
      if (doc.classId === selectedClass.id) map[doc.date] = doc;
    });
    return map;
  }, [attendance, selectedClass]);

  const openAttendanceForDate = (dateStr: string) => {
    if (!selectedClass) return;
    const init: Record<string, "present" | "absent"> = {};
    const existing = classAttendanceByDate[dateStr];
    classStudents.forEach((s) => {
      const r = existing?.records.find((rr) => rr.studentId === s.id);
      init[s.id] = r?.status === "absent" ? "absent" : "present";
    });
    setTempAtt(init);
    setAttendanceDate(dateStr);
    setAction("attendance");
  };

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const openAttendance = () => {
    const today = new Date().toISOString().split("T")[0];
    const init: Record<string, "present" | "absent"> = {};
    classStudents.forEach(s => { init[s.id] = "present"; });
    setTempAtt(init);
    setAttendanceDate(today);
    setAction("attendance");
  };

  const markAllPresent = () => {
    const all: Record<string, "present" | "absent"> = {};
    classStudents.forEach(s => { all[s.id] = "present"; });
    setTempAtt(all);
  };

  const handleSubmitAttendance = async () => {
    if (!selectedClass) return;
    const records = Object.entries(tempAtt).map(([studentId, status]) => ({ studentId, status }));
    await markAttendance(selectedClass.id, attendanceDate, records);
    setAction("none");
    triggerSuccess("Attendance saved!");
  };

  const handleAssignHomework = async () => {
    if (!hwForm.subject || !hwForm.task || !hwForm.issueDate || !hwForm.dueDate || !selectedClass) {
      showAlert("Missing Info", "Subject, task description, issue date, and due date are required.", "error");
      return;
    }
    const colors = ["#8BB0FE", "#FF9B85", "#BA94FF", "#FFD580", "#6EE7B7"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    await assignHomework({
      classId: selectedClass.id,
      className: `${selectedClass.name}-${selectedClass.section}`,
      subject: hwForm.subject,
      task: hwForm.task,
      issueDate: hwForm.issueDate,
      dueDate: hwForm.dueDate,
      priority: hwForm.priority,
      color,
    });
    setHwForm({ subject: "", task: "", issueDate: "", dueDate: "", priority: "Medium" });
    setAction("none");
  };

  const handleSendNotification = async () => {
    if (!notifForm.title || !notifForm.message || !selectedClass) {
      showAlert("Missing Info", "Title, message, and class selection are required.", "error");
      return;
    }
    
    // Send notification to all students in this class (their parents will see it)
    for (const student of classStudents) {
      await sendNotification({
        title: notifForm.title,
        message: notifForm.message,
        type: notifForm.type,
        targetType: "student",
        targetId: student.id
      });
    }
    
    setNotifForm({ title: "", message: "", type: "general" });
    setAction("none");
    triggerSuccess("Notification sent to all parents!");
  };

  const handleSendFeeReminder = async () => {
    if (!selectedClass) return;
    if (!feeForm.title.trim() || !feeForm.description.trim()) {
      showAlert("Missing Info", "Title and description are required.", "error");
      return;
    }
    const targets =
      feeForm.audience === "all"
        ? classStudents.map((s) => s.id)
        : selectedStudentIds;
    if (targets.length === 0) {
      showAlert("Pick students", "Select at least one student.", "error");
      return;
    }

    const amt = feeForm.feeAmount.trim() ? Number(feeForm.feeAmount) : undefined;
    if (feeForm.feeAmount.trim() && (Number.isNaN(amt) || amt! < 0)) {
      showAlert("Invalid amount", "Fee amount must be a valid number.", "error");
      return;
    }

    for (const studentId of targets) {
      const notificationData: any = {
        title: feeForm.title.trim(),
        message: feeForm.description.trim(),
        type: "fee",
        targetType: "student",
        targetId: studentId,
        feeAmount: amt,
        dueDate: feeForm.dueDate || undefined,
        audienceScope: feeForm.audience,
        targetStudentIds: feeForm.audience === "selected" ? targets : undefined,
      };
      
      // Only include paymentNote if it has content
      if (feeForm.paymentNote.trim()) {
        notificationData.paymentNote = feeForm.paymentNote.trim();
      }
      
      await sendNotification(notificationData);
    }

    setFeeForm({ title: "", description: "", feeAmount: "", dueDate: "", paymentNote: "", audience: "all" });
    setSelectedStudentIds([]);
    setMessageAction("none");
    triggerSuccess("Fee reminder sent!");
  };

  const handleAddStudent = async () => {
    if (!selectedClass) return;
    if (!sData.name || !sData.username || !sData.gender) {
      showAlert("Missing Info", "Student name, username and gender are required.", "error");
      return;
    }

    await addStudent({
      name: sData.name,
      classId: selectedClass.id,
      username: sData.username,
      gender: sData.gender,
      password: sData.password || undefined,
    });

    setSData({ name: "", username: "", password: "", gender: "" });
    setShowAddStudent(false);
    triggerSuccess("Student added!");
  };

  const handleAssignExistingStudent = async () => {
    if (!selectedClass || !selectedExistingStudentId) return;
    await updateStudent(selectedExistingStudentId, { classId: selectedClass.id });
    setSelectedExistingStudentId("");
    setShowAddStudent(false);
    triggerSuccess("Student assigned to class!");
  };

  const handleUploadTimetable = async () => {
    if (!selectedClass || !ttFile) {
      showAlert("Pick a file", "Choose an image or PDF timetable.", "error");
      return;
    }
    if (!isCloudinaryConfigured()) {
      showAlert(
        "Cloudinary required",
        "Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.",
        "error"
      );
      return;
    }
    setTtUploading(true);
    try {
      const up = await uploadToCloudinary(ttFile);
      const attachmentType = attachmentTypeFromFile(ttFile);
      await upsertClassTimetable(selectedClass.id, {
        attachmentUrl: up.secureUrl,
        attachmentType,
      });
      setTtFile(null);
    } catch (e: unknown) {
      showAlert("Upload failed", e instanceof Error ? e.message : "Try again.", "error");
    } finally {
      setTtUploading(false);
    }
  };

  const handleDeleteTimetable = () => {
    if (!selectedClass) return;
    showConfirm(
      "Delete Timetable?",
      "This will remove the current timetable for this class. You can upload a new one anytime.",
      () => deleteClassTimetable(selectedClass.id)
    );
  };

  const presentCount = Object.values(tempAtt).filter(v => v === "present").length;
  const classTimetable = selectedClass ? timetables.find((t) => t.classId === selectedClass.id) : undefined;

  // ── Class List ─────────────────────────────────────────────────────────────
  if (!selectedClass) {
    return (
      <div className="pb-36 px-5 pt-6 animate-fade-slide-up lg:pb-10 lg:px-8 lg:max-w-6xl lg:mx-auto">
        <div className="mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900">My Classes</h2>
            <p className="text-sm text-gray-400 mt-0.5">Select a class to manage</p>
          </div>
        </div>

        {myClasses.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-[32px] p-16 text-center">
            <BookOpen className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="font-black text-gray-900">No classes assigned</p>
            <p className="text-sm text-gray-400 mt-1">Contact your administrator to get classes assigned</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {myClasses.map(cls => {
              const clsStudents = students.filter(s => s.classId === cls.id);
              const clsHw = homework.filter(h => h.classId === cls.id);
              return (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClass(cls)}
                  className="bg-white rounded-[32px] p-6 border border-gray-100 text-left hover:border-indigo-100 active:scale-95 transition-all shadow-sm group"
                >
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center font-black text-indigo-600 text-xl mb-4 group-hover:scale-110 transition-transform">
                    {cls.section}
                  </div>
                  <h4 className="text-lg font-black text-gray-900">{cls.name}</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                    Section {cls.section}
                  </p>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-gray-300" />
                      <span className="text-[11px] font-black text-gray-400">{clsStudents.length}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-300" />
                      <span className="text-[11px] font-black text-indigo-400">{clsHw.length} hw</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── In-Class View ──────────────────────────────────────────────────────────
  return (
    <>
      {successMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-2xl text-sm font-black shadow-xl z-50 flex items-center gap-2 animate-fade-slide-up">
          <CheckCircle2 className="w-4 h-4" />
          {successMsg}
        </div>
      )}

      <div className="pb-36 px-5 pt-6 animate-fade-slide-up lg:pb-10 lg:px-8 lg:max-w-6xl lg:mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex-1">
            <h2 className="text-2xl font-black text-gray-900">
              {selectedClass.name} — {selectedClass.section}
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {classStudents.length} student{classStudents.length !== 1 ? "s" : ""} enrolled
            </p>
          </div>
        </div>

        {viewMode === "attendance_history" ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Attendance History</p>
                <p className="text-sm font-black text-gray-900 mt-1">{rangeLabel}</p>
              </div>
              <button
                onClick={() => setViewMode("manage")}
                className="px-4 py-2 bg-white border border-gray-100 rounded-2xl text-xs font-black text-gray-600 hover:border-indigo-100 hover:text-indigo-600 transition-all"
              >
                Back
              </button>
            </div>

            <div className="bg-white rounded-[24px] p-4 border border-gray-100 shadow-sm mb-4">
              <div className="grid grid-cols-2 gap-3">
                <MobileSelect
                  label="Start Month"
                  placeholder="Month"
                  value={String(startMonth)}
                  onChange={(v) => setStartMonth(parseInt(v, 10))}
                  options={MONTH_NAMES.map((m, idx) => ({ value: String(idx), label: m }))}
                  searchable
                />
                <MobileSelect
                  label="Start Year"
                  placeholder="Year"
                  value={String(startYear)}
                  onChange={(v) => setStartYear(parseInt(v, 10))}
                  options={Array.from({ length: 7 }).map((_, i) => {
                    const y = new Date().getFullYear() - 3 + i;
                    return { value: String(y), label: String(y) };
                  })}
                  searchable={false}
                />
              </div>
            </div>

            <div className="-mx-5 lg:mx-0 px-5 lg:px-0 overflow-x-auto no-scrollbar">
              <div className="flex gap-2 pb-1 lg:flex-wrap">
                {months.map((m, idx) => (
                  <button
                    key={`${m.year}-${m.month}`}
                    onClick={() => setSelectedMonthIdx(idx)}
                    className={`shrink-0 px-4 py-2 rounded-2xl text-xs font-black transition-all ${
                      selectedMonthIdx === idx
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                        : "bg-white text-gray-500 border border-gray-100 hover:border-indigo-200 hover:text-indigo-500"
                    }`}
                  >
                    {MONTH_NAMES[m.month].slice(0, 3)}
                    <span className="ml-1 opacity-60">'{String(m.year).slice(2)}</span>
                  </button>
                ))}
              </div>
            </div>

            {(() => {
              const selectedMonth = months[selectedMonthIdx] ?? months[0];
              const y = selectedMonth.year;
              const m = selectedMonth.month;
              const daysInMonth = new Date(y, m + 1, 0).getDate();
              const firstDayOfWeek = new Date(y, m, 1).getDay();
              const todayStr = new Date().toISOString().split("T")[0];

              const getCellStyle = (dateStr: string) => {
                const doc = classAttendanceByDate[dateStr];
                const isFuture = dateStr > todayStr;
                const isToday = dateStr === todayStr;
                if (isFuture) return { cls: "bg-gray-50 text-gray-300", isToday, isFuture };
                if (!doc) return { cls: "bg-gray-50 text-gray-400", isToday, isFuture };
                const total = doc.records.length || classStudents.length;
                const present = doc.records.filter((r) => r.status === "present").length;
                const pct = total === 0 ? 0 : Math.round((present / total) * 100);
                if (pct >= 90) return { cls: "bg-emerald-100 text-emerald-700", isToday, isFuture };
                if (pct >= 75) return { cls: "bg-amber-100 text-amber-700", isToday, isFuture };
                return { cls: "bg-rose-100 text-rose-700", isToday, isFuture };
              };

              return (
                <div className="mt-4 bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <button
                      onClick={() => setSelectedMonthIdx((i) => Math.max(0, i - 1))}
                      disabled={selectedMonthIdx === 0}
                      className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-50 active:scale-95 disabled:opacity-30 transition-all"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <div className="text-center">
                      <p className="font-black text-gray-900">{MONTH_NAMES[m]} {y}</p>
                      <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">Tap a day to view</p>
                    </div>
                    <button
                      onClick={() => setSelectedMonthIdx((i) => Math.min(months.length - 1, i + 1))}
                      disabled={selectedMonthIdx === months.length - 1}
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
                          onClick={() => !isFuture && setSelectedDate(dateStr)}
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
              );
            })()}

            {selectedDate && portalTarget && createPortal(
              <div className="fixed inset-0 bg-black/60 z-120 flex items-end">
                <button
                  type="button"
                  onClick={() => setSelectedDate(null)}
                  className="absolute inset-0"
                  aria-label="Close"
                />
                <div className="relative bg-white w-full rounded-t-[40px] max-h-[90vh] flex flex-col">
                  <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-100 shrink-0">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Attendance Details</p>
                      <p className="text-xl font-black text-gray-900">{selectedDate}</p>
                    </div>
                    <button
                      onClick={() => setSelectedDate(null)}
                      className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    {(() => {
                      const doc = classAttendanceByDate[selectedDate];
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
                            {classStudents.map((s) => {
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
                        if (!selectedDate) return;
                        const d = selectedDate;
                        setSelectedDate(null);
                        openAttendanceForDate(d);
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
          </>
        ) : (
          <>
            {/* Action Cards Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                onClick={openAttendance}
                className="bg-emerald-600 text-white p-5 lg:p-4 rounded-[28px] lg:rounded-xl flex flex-col gap-3 lg:gap-2 active:scale-95 transition-transform shadow-lg shadow-emerald-200 text-left"
              >
                <div className="bg-white/20 w-10 h-10 lg:w-8 lg:h-8 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 lg:w-4 lg:h-4" />
                </div>
                <div>
                  <p className="text-sm font-black">Mark Attendance</p>
                  <p className="text-[10px] text-white/70 mt-0.5">Today's roll call</p>
                </div>
              </button>
              <button
                onClick={() => setAction("homework")}
                className="bg-indigo-600 text-white p-5 lg:p-4 rounded-[28px] lg:rounded-xl flex flex-col gap-3 lg:gap-2 active:scale-95 transition-transform shadow-lg shadow-indigo-200 text-left"
              >
                <div className="bg-white/20 w-10 h-10 lg:w-8 lg:h-8 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 lg:w-4 lg:h-4" />
                </div>
                <div>
                  <p className="text-sm font-black">Assign Homework</p>
                  <p className="text-[10px] text-white/70 mt-0.5">Set a new task</p>
                </div>
              </button>
              <button
                onClick={() => setViewMode("attendance_history")}
                className="bg-purple-600 text-white p-5 lg:p-4 rounded-[28px] lg:rounded-xl flex flex-col gap-3 lg:gap-2 active:scale-95 transition-transform shadow-lg shadow-purple-200 text-left"
              >
                <div className="bg-white/20 w-10 h-10 lg:w-8 lg:h-8 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 lg:w-4 lg:h-4" />
                </div>
                <div>
                  <p className="text-sm font-black">Attendance History</p>
                  <p className="text-[10px] text-white/70 mt-0.5">Calendar view</p>
                </div>
              </button>
              <button
                onClick={() => setAction("notification")}
                className="bg-amber-500 text-white p-5 lg:p-4 rounded-[28px] lg:rounded-xl flex flex-col gap-3 lg:gap-2 active:scale-95 transition-transform shadow-lg shadow-amber-200 text-left"
              >
                <div className="bg-white/20 w-10 h-10 lg:w-8 lg:h-8 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 lg:w-4 lg:h-4" />
                </div>
                <div>
                  <p className="text-sm font-black">Send Notification</p>
                  <p className="text-[10px] text-white/70 mt-0.5">Message all parents</p>
                </div>
              </button>
              <button
                onClick={() => setMessageAction("fee_reminder")}
                className="bg-emerald-600 text-white p-5 lg:p-4 rounded-[28px] lg:rounded-xl flex flex-col gap-3 lg:gap-2 active:scale-95 transition-transform shadow-lg shadow-emerald-200 text-left"
              >
                <div className="bg-white/20 w-10 h-10 lg:w-8 lg:h-8 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 lg:w-4 lg:h-4" />
                </div>
                <div>
                  <p className="text-sm font-black">Fee Reminder</p>
                  <p className="text-[10px] text-white/70 mt-0.5">Notify parents about fees</p>
                </div>
              </button>
            </div>

            {/* Class timetable — Cloudinary + Firestore */}
            <div className="mb-8 rounded-[28px] border border-sky-100 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                  <CalendarClock className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-black text-gray-900">Class timetable</p>
                    {classTimetable && (
                      <button
                        onClick={handleDeleteTimetable}
                        className="w-8 h-8 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-100 transition-colors"
                        aria-label="Delete timetable"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] font-medium text-gray-400">
                    {classTimetable
                      ? `Last updated ${classTimetable.updatedAt?.seconds ? new Date(classTimetable.updatedAt.seconds * 1000).toLocaleDateString() : "recently"}`
                      : "No file uploaded yet for this class."}
                  </p>
                  <label className="mt-3 flex cursor-pointer items-center gap-2 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-3 py-3">
                    <Paperclip className="h-4 w-4 shrink-0 text-sky-500" />
                    <span className="truncate text-[11px] font-bold text-gray-600">
                      {ttFile ? ttFile.name : "Choose image or PDF"}
                    </span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => setTtFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  <button
                    type="button"
                    disabled={ttUploading || !ttFile}
                    onClick={handleUploadTimetable}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-sky-100 disabled:opacity-50"
                  >
                    {ttUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {ttUploading ? "Uploading…" : "Save timetable"}
                  </button>
                </div>
              </div>
            </div>

            {/* Student List */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Students ({classStudents.length})
              </p>
              <button
                onClick={() => setShowAddStudent(true)}
                className="w-9 h-9 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 active:scale-90 transition-transform"
                aria-label="Add Student"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {classStudents.map(s => (
                <div
                  key={s.id}
                  className="bg-white rounded-[24px] p-4 border border-gray-100 shadow-sm flex items-center gap-4"
                >
                  <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center font-black text-gray-400 text-sm uppercase shrink-0">
                    {s.name[0]}
                  </div>
                  <button
                    onClick={() => {
                      setStudentDetailReturnTab("teacher_classes");
                      setSelectedStudent(s);
                      setActiveTab("student_detail");
                    }}
                    className="flex-1 text-left"
                  >
                    <h4 className="text-sm font-black text-gray-900">{s.name}</h4>
                    <p className="text-[10px] text-gray-400 font-medium">ID: {s.id.slice(0, 8)}</p>
                  </button>
                </div>
              ))}
              {classStudents.length === 0 && (
                <div className="py-10 text-center text-gray-300 font-medium italic">
                  No students enrolled yet.
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Attendance Modal ───────────────────────────────────────────────── */}
      {action === "attendance" && portalTarget && createPortal(
        <div className="fixed inset-0 bg-black/60 z-100 flex items-end">
          <div className="bg-white w-full rounded-t-[40px] max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-100 shrink-0">
              <div>
                <h3 className="text-xl font-black text-gray-900">Mark Attendance</h3>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                  {selectedClass.name}-{selectedClass.section} · {classStudents.length} students · {attendanceDate}
                </p>
              </div>
              <button
                onClick={() => setAction("none")}
                className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Mark All Present */}
            <div className="px-4 py-3 border-b border-gray-50 shrink-0">
              <button
                onClick={markAllPresent}
                className="w-full bg-emerald-600 text-white py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest active:scale-95 transition-transform"
              >
                Mark All Present
              </button>
            </div>

            {/* Student Toggles */}
            <div className="overflow-y-auto flex-1 px-4 py-4 space-y-2">
              {classStudents.map(s => {
                const isPresent = tempAtt[s.id] === "present";
                return (
                  <div
                    key={s.id}
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
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setTempAtt((p) => ({ ...p, [s.id]: "present" }))}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all active:scale-95 ${
                          isPresent
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "bg-white border-gray-200 text-gray-500 hover:border-emerald-300 hover:text-emerald-600"
                        }`}
                        aria-label={`Mark ${s.name} present`}
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setTempAtt((p) => ({ ...p, [s.id]: "absent" }))}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all active:scale-95 ${
                          !isPresent
                            ? "bg-rose-500 border-rose-500 text-white"
                            : "bg-white border-gray-200 text-gray-500 hover:border-rose-200 hover:text-rose-500"
                        }`}
                        aria-label={`Mark ${s.name} absent`}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Submit */}
            <div className="px-4 pb-6 pt-3 shrink-0">
              <button
                onClick={handleSubmitAttendance}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-emerald-200 active:scale-95 transition-transform"
              >
                Save Attendance · {presentCount} Present, {classStudents.length - presentCount} Absent
              </button>
            </div>
          </div>
        </div>,
        portalTarget
      )}

      {/* ── Homework Modal ─────────────────────────────────────────────────── */}
      {action === "homework" && portalTarget && createPortal(
        <div className="fixed inset-0 bg-black/60 z-100 flex items-end">
          <div className="bg-white w-full rounded-t-[40px] p-8 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-gray-900">Assign Homework</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {selectedClass.name}-{selectedClass.section}
                </p>
              </div>
              <button
                onClick={() => setAction("none")}
                className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Subject *"
                value={hwForm.subject}
                onChange={e => setHwForm(p => ({ ...p, subject: e.target.value }))}
                className="w-full bg-gray-50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <textarea
                placeholder="Task description *"
                value={hwForm.task}
                onChange={e => setHwForm(p => ({ ...p, task: e.target.value }))}
                rows={3}
                className="w-full bg-gray-50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
              />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Issue Date *</p>
                <input
                  type="date"
                  value={hwForm.issueDate}
                  onChange={e => setHwForm(p => ({ ...p, issueDate: e.target.value }))}
                  className="w-full bg-gray-50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Due Date *</p>
                <input
                  type="date"
                  value={hwForm.dueDate}
                  onChange={e => setHwForm(p => ({ ...p, dueDate: e.target.value }))}
                  className="w-full bg-gray-50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Priority</p>
                <div className="flex gap-2">
                  {(["High", "Medium", "Low"] as Priority[]).map(p => (
                    <button
                      key={p}
                      onClick={() => setHwForm(prev => ({ ...prev, priority: p }))}
                      className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        hwForm.priority === p
                          ? p === "High"
                            ? "bg-rose-500 text-white"
                            : p === "Medium"
                            ? "bg-amber-500 text-white"
                            : "bg-emerald-600 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleAssignHomework}
              className="w-full mt-6 bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-indigo-200 active:scale-95 transition-transform"
            >
              Assign Homework
            </button>
          </div>
        </div>,
        portalTarget
      )}

      {/* ── Notification Modal ───────────────────────────────────────────────── */}
      {action === "notification" && portalTarget && createPortal(
        <div className="fixed inset-0 bg-black/60 z-100 flex items-end">
          <div className="bg-white w-full rounded-t-[40px] max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-100 shrink-0">
              <div>
                <h3 className="text-xl font-black text-gray-900">Send Notification</h3>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                  Message all parents of {selectedClass.name} — {selectedClass.section}
                </p>
              </div>
              <button
                onClick={() => setAction("none")}
                className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center active:scale-90 transition-transform"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Title *</p>
                <input
                  type="text"
                  value={notifForm.title}
                  onChange={e => setNotifForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Enter notification title"
                  className="w-full bg-gray-50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Message *</p>
                <textarea
                  value={notifForm.message}
                  onChange={e => setNotifForm(p => ({ ...p, message: e.target.value }))}
                  placeholder="Enter your message to parents"
                  rows={4}
                  className="w-full bg-gray-50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-200 resize-none"
                />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Type</p>
                <div className="flex gap-2">
                  {(["general", "instruction", "fee"] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setNotifForm(prev => ({ ...prev, type }))}
                      className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        notifForm.type === type
                          ? type === "general"
                            ? "bg-amber-500 text-white"
                            : type === "instruction"
                            ? "bg-blue-500 text-white"
                            : "bg-emerald-500 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleSendNotification}
              className="w-full mx-6 mb-6 max-w-xs bg-amber-500 text-white py-3 px-6 rounded-2xl font-black text-sm shadow-lg shadow-amber-200 active:scale-95 transition-transform self-center"
            >
              Send Notification
            </button>
          </div>
        </div>,
        portalTarget
      )}

      {/* ── Fee Reminder Modal ─────────────────────────────────────────────── */}
      {messageAction === "fee_reminder" && portalTarget && selectedClass && createPortal(
        <div className="fixed inset-0 bg-black/60 z-100 flex items-end">
          <div className="bg-white w-full rounded-t-[40px] max-h-[90vh] flex flex-col">
            <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-100 shrink-0">
              <div>
                <h3 className="text-xl font-black text-gray-900">Fee Reminder</h3>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                  {selectedClass.name} — {selectedClass.section}
                </p>
              </div>
              <button
                onClick={() => setMessageAction("none")}
                className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center active:scale-90 transition-transform"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Title *</p>
                <input
                  type="text"
                  value={feeForm.title}
                  onChange={(e) => setFeeForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Term 1 Fee Reminder"
                  className="w-full bg-gray-50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Description *</p>
                <textarea
                  value={feeForm.description}
                  onChange={(e) => setFeeForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Add fee details and instructions…"
                  rows={4}
                  className="w-full bg-gray-50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-200 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Fee Amount (optional)</p>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={feeForm.feeAmount}
                    onChange={(e) => setFeeForm((p) => ({ ...p, feeAmount: e.target.value }))}
                    placeholder="e.g. 2500"
                    className="w-full bg-gray-50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Due Date (optional)</p>
                  <input
                    type="date"
                    value={feeForm.dueDate}
                    onChange={(e) => setFeeForm((p) => ({ ...p, dueDate: e.target.value }))}
                    className="w-full bg-gray-50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Payment Note (optional)</p>
                <input
                  type="text"
                  value={feeForm.paymentNote}
                  onChange={(e) => setFeeForm((p) => ({ ...p, paymentNote: e.target.value }))}
                  placeholder="e.g. Pay via office / UPI / bank transfer"
                  className="w-full bg-gray-50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Send To</p>
                <div className="flex gap-2">
                  {(["all", "selected"] as const).map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setFeeForm((p) => ({ ...p, audience: a }))}
                      className={`flex-1 rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                        feeForm.audience === a ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {a === "all" ? "All Students" : "Select Students"}
                    </button>
                  ))}
                </div>
              </div>

              {feeForm.audience === "selected" && (
                <MobileMultiSelect
                  label="Students"
                  placeholder="Select students…"
                  value={selectedStudentIds}
                  onChange={setSelectedStudentIds}
                  options={classStudents.map((s) => ({ value: s.id, label: s.name, subtitle: s.username || "" }))}
                  searchable
                />
              )}
            </div>

            <button
              onClick={handleSendFeeReminder}
              className="w-full mx-6 mb-6 max-w-xs bg-emerald-600 text-white py-3 px-6 rounded-2xl font-black text-sm shadow-lg shadow-emerald-200 active:scale-95 transition-transform self-center"
            >
              Send Fee Reminder
            </button>
          </div>
        </div>,
        portalTarget
      )}

      {/* ── Add Student Modal ──────────────────────────────────────────────── */}
{showAddStudent && portalTarget && selectedClass && createPortal(
        <div className="fixed inset-0 bg-black/60 z-100 flex items-end">
          <div className="bg-white w-full rounded-t-[40px] max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-100 shrink-0">
              <div>
                <h3 className="text-xl font-black text-gray-900">Add Student</h3>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                  {selectedClass.name} — {selectedClass.section}
                </p>
              </div>
              <button
                onClick={() => setShowAddStudent(false)}
                className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center active:scale-90 transition-transform"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div className="border border-gray-100 rounded-2xl p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Assign Existing Unassigned Student</p>
                <MobileSelect
                  placeholder="Select student"
                  value={selectedExistingStudentId}
                  onChange={setSelectedExistingStudentId}
                  options={unassignedStudents.map((student) => ({
                    value: student.id,
                    label: student.name,
                    subtitle: student.username || "No username",
                  }))}
                  searchable
                />
                <button
                  onClick={handleAssignExistingStudent}
                  disabled={!selectedExistingStudentId}
                  className="w-full mt-3 bg-emerald-600 text-white py-3 rounded-2xl font-black text-xs shadow-lg shadow-emerald-200 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Assign Selected Student
                </button>
              </div>

              <div className="pt-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Or Create New Student</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Student Name *</p>
                <input
                  type="text"
                  value={sData.name}
                  onChange={e => setSData(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-gray-50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Gender *</p>
                <div className="flex gap-2">
                  {(["male", "female"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setSData((p) => ({ ...p, gender: g }))}
                      className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        sData.gender === g ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {g === "male" ? "Male" : "Female"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Username *</p>
                <input
                  type="text"
                  value={sData.username}
                  onChange={e => setSData(p => ({ ...p, username: e.target.value }))}
                  className="w-full bg-gray-50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Password (optional)</p>
                <input
                  type="password"
                  value={sData.password}
                  onChange={e => setSData(p => ({ ...p, password: e.target.value }))}
                  className="w-full bg-gray-50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>

            {/* Fixed Footer for Button */}
            <div className="px-6 pb-8 pt-4 shrink-0 bg-white">
              <button
                onClick={handleAddStudent}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-indigo-200 active:scale-95 transition-transform"
              >
                Add Student
              </button>
            </div>
          </div>
        </div>,
        portalTarget
      )}
    </>
  );
}
