"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, XCircle, Clock, ChevronLeft, ChevronRight, X, Info } from "lucide-react";
import { useApp } from "@/context/AppContext";
import {
  buildStudentAttendanceDateMap,
  computeStudentAttendanceStats,
  monthStatsFromMap,
} from "@/lib/attendance-utils";
import MobileSelect from "@/components/ui/MobileSelect";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function getDefaultStartMonthAndYear(): { startYear: number; startMonth: number } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const startMonth = 3;
  const startYear = month >= startMonth ? year : year - 1;
  return { startYear, startMonth };
}

function getTwelveMonths(startYear: number, startMonth: number): { year: number; month: number }[] {
  const out: { year: number; month: number }[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(startYear, startMonth + i, 1);
    out.push({ year: d.getFullYear(), month: d.getMonth() });
  }
  return out;
}

export default function AttendanceScreen() {
  const { attendance = [], students, user, usersList } = useApp();

  const portalTarget = useMemo(
    () => (typeof document !== "undefined" ? document.body : null),
    []
  );

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const defaultStart = useMemo(() => getDefaultStartMonthAndYear(), []);
  const [startYear, setStartYear] = useState(defaultStart.startYear);
  const [startMonth, setStartMonth] = useState(defaultStart.startMonth);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem("attendanceCalendarStart") : null;
      if (!raw) return;
      const parsed = JSON.parse(raw) as { startYear?: number; startMonth?: number };
      if (typeof parsed.startYear === "number") setStartYear(parsed.startYear);
      if (typeof parsed.startMonth === "number") setStartMonth(parsed.startMonth);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      window.localStorage.setItem("attendanceCalendarStart", JSON.stringify({ startYear, startMonth }));
    } catch {
      // ignore
    }
  }, [startMonth, startYear]);

  const months = useMemo(() => getTwelveMonths(startYear, startMonth), [startMonth, startYear]);

  const end = months[months.length - 1];
  const rangeLabel = `${MONTH_NAMES[startMonth]} ${startYear}  ${MONTH_NAMES[end.month]} ${end.year}`;

  const now = new Date();
  const defaultMonthIdx = months.findIndex(
    (m) => m.year === now.getFullYear() && m.month === now.getMonth()
  );
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(defaultMonthIdx === -1 ? 0 : defaultMonthIdx);

  useEffect(() => {
    setSelectedMonthIdx((idx) => {
      if (idx >= 0 && idx < months.length) return idx;
      return defaultMonthIdx === -1 ? 0 : defaultMonthIdx;
    });
  }, [defaultMonthIdx, months.length]);
  const myStudents = students.filter((s) => s.parentId === user?.id);
  const primaryStudent = myStudents[0];

  const attendanceMap = useMemo<Record<string, "present" | "absent" | "late">>(() => {
    return buildStudentAttendanceDateMap(
      primaryStudent?.id,
      primaryStudent?.classId,
      attendance
    );
  }, [attendance, primaryStudent]);

  const overallStats = useMemo(() => {
    const s = computeStudentAttendanceStats(
      primaryStudent?.id,
      primaryStudent?.classId,
      attendance
    );
    return {
      present: s.present,
      absent: s.absent,
      late: s.late,
      total: s.totalMarked,
      pct: s.ratePct,
    };
  }, [attendance, primaryStudent]);

  const selectedMonth = months[selectedMonthIdx] ?? months[0];
  const { year, month } = selectedMonth;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const monthStats = useMemo(() => {
    return monthStatsFromMap(attendanceMap, year, month, daysInMonth);
  }, [attendanceMap, year, month, daysInMonth]);

  const selectedDayInfo = useMemo(() => {
    if (!selectedDate || !primaryStudent) return null;

    const attDoc = attendance.find((d) => d.date === selectedDate);
    const record = attDoc?.records.find((r) => r.studentId === primaryStudent.id);
    const status = record?.status ?? null;

    const markedByUser = attDoc?.markedBy
      ? usersList.find((u) => u.id === attDoc.markedBy)
      : null;

    return {
      attDoc,
      status,
      markedByUser,
    };
  }, [attendance, primaryStudent, selectedDate, usersList]);

  const circumference = 2 * Math.PI * 44;
  const today = new Date().toISOString().split("T")[0];

  const getCellStyle = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const status = attendanceMap[dateStr];
    const isToday = dateStr === today;
    const isFuture = dateStr > today;
    let bg = "bg-gray-50 text-gray-300";
    if (!isFuture) {
      if (status === "present") bg = "bg-emerald-100 text-emerald-700";
      else if (status === "absent") bg = "bg-red-100 text-red-600";
      else if (status === "late") bg = "bg-amber-100 text-amber-700";
      else bg = "bg-gray-50 text-gray-400";
    }
    return { bg, isToday };
  };

  return (
    <div className="pb-36 px-4 lg:px-8 lg:pb-10 lg:max-w-5xl lg:mx-auto">

      {/* Overall attendance hero */}
      <div className="animate-scale-in mt-4 flex flex-col items-center justify-center bg-indigo-600 rounded-[48px] px-8 py-10 text-white text-center relative overflow-hidden shadow-xl shadow-indigo-100">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -translate-x-1/3 translate-y-1/3" />

        <div className="relative mb-4 flex h-28 w-28 max-w-full items-center justify-center">
          <svg className="absolute inset-0 h-full w-full max-h-28 max-w-28 -rotate-90" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="5" fill="transparent" className="text-white/20" />
            <circle
              cx="48" cy="48" r="44" stroke="white" strokeWidth="5" fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - overallStats.pct / 100)}
              strokeLinecap="round" className="transition-all duration-1000"
            />
          </svg>
          <span className="text-2xl font-black tabular-nums sm:text-3xl">{overallStats.pct}%</span>
        </div>

        <h3 className="text-2xl font-black">
          {overallStats.total === 0
            ? "No records yet"
            : overallStats.pct >= 90 ? "Doing Great! 🎉"
            : overallStats.pct >= 75 ? "Keep Going!"
            : "Need Improvement"}
        </h3>
        <p className="text-indigo-100/70 text-sm mt-1 font-medium">
          {primaryStudent?.name || "Student"}'s Attendance · {rangeLabel}
        </p>

        <div className="mt-6 flex gap-8 w-full justify-center">
          {[
            { label: "Present", val: overallStats.present, color: "text-emerald-300" },
            { label: "Absent",  val: overallStats.absent,  color: "text-red-300" },
            { label: "Late",    val: overallStats.late,    color: "text-amber-300" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/50">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section header */}
      <div className="mt-6 flex items-center justify-between px-1">
        <h3 className="text-lg font-black text-gray-900">Monthly Calendar</h3>
        <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-full">
          {rangeLabel}
        </span>
      </div>

      <div className="mt-3 bg-white rounded-[24px] p-4 border border-gray-100 shadow-sm">
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
              const y = defaultStart.startYear - 3 + i;
              return { value: String(y), label: String(y) };
            })}
            searchable={false}
          />
        </div>
      </div>

      {/* Month tabs — horizontal scroll on mobile, wrap on desktop */}
      <div className="mt-3 -mx-4 lg:mx-0 px-4 lg:px-0 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 pb-1 lg:flex-wrap">
          {months.map((m, idx) => {
            return (
              <button
                key={idx}
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
            );
          })}
        </div>
      </div>

      {/* Calendar + stats — side by side on desktop */}
      <div className="mt-4 lg:grid lg:grid-cols-3 lg:gap-6 lg:items-start">

        {/* Calendar card */}
        <div className="lg:col-span-2 bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm animate-fade-slide-up">
          {/* Month header */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={() => setSelectedMonthIdx((i) => Math.max(0, i - 1))}
              disabled={selectedMonthIdx === 0}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-50 active:scale-95 disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <div className="text-center">
              <p className="font-black text-gray-900">{MONTH_NAMES[month]} {year}</p>
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">
                {monthStats.present} of {monthStats.total} recorded days present
              </p>
            </div>
            <button
              onClick={() => setSelectedMonthIdx((i) => Math.min(months.length - 1, i + 1))}
              disabled={selectedMonthIdx === months.length - 1}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-50 active:scale-95 disabled:opacity-30 transition-all"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Day-of-week labels */}
          <div className="grid grid-cols-7 mb-2">
            {DAY_LABELS.map((d, i) => (
              <div key={i} className="text-center text-[10px] font-black uppercase text-gray-400 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const { bg, isToday } = getCellStyle(day);
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isFuture = dateStr > today;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => !isFuture && setSelectedDate(dateStr)}
                  className={`aspect-square flex items-center justify-center rounded-xl text-xs font-black transition-all select-none ${bg} ${
                    isToday ? "ring-2 ring-indigo-500 ring-offset-1" : ""
                  } ${isFuture ? "cursor-not-allowed" : "hover:brightness-[0.98] active:scale-95"}`}
                  aria-label={`Attendance for ${dateStr}`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center gap-5 pt-3 border-t border-gray-50">
            {[
              { label: "Present",   color: "bg-emerald-400" },
              { label: "Absent",    color: "bg-red-400" },
              { label: "Late",      color: "bg-amber-400" },
              { label: "No Record", color: "bg-gray-200" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${l.color}`} />
                <span className="text-[10px] font-bold text-gray-400">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats column */}
        <div className="mt-4 lg:mt-0 space-y-3">
          {/* Monthly % ring — desktop only */}
          <div className="hidden lg:flex bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm items-center gap-4">
            <div className="w-16 h-16 relative flex items-center justify-center shrink-0">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100" />
                <circle
                  cx="32" cy="32" r="28" stroke="#6366f1" strokeWidth="4" fill="transparent"
                  strokeDasharray={2 * Math.PI * 28}
                  strokeDashoffset={2 * Math.PI * 28 * (1 - monthStats.pct / 100)}
                  strokeLinecap="round" className="transition-all duration-700"
                />
              </svg>
              <span className="text-sm font-black text-gray-900">{monthStats.pct}%</span>
            </div>
            <div>
              <p className="font-black text-gray-900">{MONTH_NAMES[month]}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Monthly Rate</p>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-3 lg:grid-cols-1 gap-3">
            {[
              { label: "Present", val: monthStats.present, bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-400" },
              { label: "Absent",  val: monthStats.absent,  bg: "bg-red-50",     text: "text-red-600",     dot: "bg-red-400" },
              { label: "Late",    val: monthStats.late,    bg: "bg-amber-50",   text: "text-amber-600",   dot: "bg-amber-400" },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} rounded-[20px] p-4 lg:flex lg:items-center lg:gap-4`}>
                <p className={`text-2xl lg:text-3xl font-black ${s.text} text-center lg:text-left`}>{s.val}</p>
                <div className="flex items-center justify-center lg:justify-start gap-1.5 mt-1 lg:mt-0">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDate && portalTarget && createPortal(
        <div className="fixed inset-0 z-200 flex items-end">
          <button
            type="button"
            onClick={() => setSelectedDate(null)}
            className="absolute inset-0 bg-black/60"
            aria-label="Close attendance details"
          />
          <div className="relative bg-white w-full rounded-t-[40px] max-h-[85vh] overflow-y-auto">
            <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-100">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Attendance</p>
                <p className="text-xl font-black text-gray-900">
                  {new Date(selectedDate).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDate(null)}
                className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center active:scale-90 transition-transform"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-3">
              <div className="bg-gray-50 border border-gray-100 rounded-[24px] p-5">
                <div className="flex items-center gap-3">
                  {selectedDayInfo?.status === "present" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : selectedDayInfo?.status === "absent" ? (
                    <XCircle className="w-5 h-5 text-red-600" />
                  ) : selectedDayInfo?.status === "late" ? (
                    <Clock className="w-5 h-5 text-amber-600" />
                  ) : (
                    <Info className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Status</p>
                    <p className="text-sm font-black text-gray-900">
                      {selectedDayInfo?.status
                        ? selectedDayInfo.status.toUpperCase()
                        : (selectedDate > today ? "Future" : "No Record")}
                    </p>
                  </div>
                </div>

                {selectedDayInfo?.markedByUser && (
                  <div className="mt-3 pt-3 border-t border-gray-200/60">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Marked By</p>
                    <p className="text-sm font-bold text-gray-900">{selectedDayInfo.markedByUser.name}</p>
                    <p className="text-[10px] font-bold text-gray-400">{selectedDayInfo.markedByUser.role}</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>,
        portalTarget
      )}

    </div>
  );
}
