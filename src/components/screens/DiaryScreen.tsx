"use client";

import React, { useMemo, useState } from "react";
import { CheckCircle2, Clock, Calendar, BookOpen } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Timestamp } from "firebase/firestore";
import { getLocalISODate, isExpiredAfter } from "@/lib/date-window";

type HomeworkFilter = "total" | "pending" | "completed";

export default function DiaryScreen() {
  const { diaryEntries, toggleDiaryEntry, setSelectedHomework, setActiveTab } = useApp();

  const [selectedDate, setSelectedDate] = useState(getLocalISODate(new Date()));
  const [filter, setFilter] = useState<HomeworkFilter>("pending");

  const today = useMemo(() => getLocalISODate(new Date()), []);
  const entriesForDate = useMemo(
    () => diaryEntries.filter((d) => d.dueDate === selectedDate),
    [diaryEntries, selectedDate]
  );

  const counts = useMemo(() => {
    const total = entriesForDate.length;
    const pending = entriesForDate.filter((d) => d.status !== "Completed" && !isExpiredAfter(today, d.dueDate)).length;
    const completed = entriesForDate.filter((d) => d.status === "Completed" || isExpiredAfter(today, d.dueDate)).length;
    return { total, pending, completed };
  }, [entriesForDate, today]);

  const filtered = useMemo(() => {
    if (filter === "total") return entriesForDate;
    if (filter === "pending") return entriesForDate.filter((d) => d.status !== "Completed" && !isExpiredAfter(today, d.dueDate));
    return entriesForDate.filter((d) => d.status === "Completed" || isExpiredAfter(today, d.dueDate));
  }, [entriesForDate, filter, today]);

  return (
    <div className="pb-36 px-5 pt-6 animate-fade-slide-up">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 leading-none">Student Diary</h2>
          <p className="text-sm text-gray-500 font-medium mt-1.5">
            {selectedDate === getLocalISODate(new Date()) ? "Today's homework" : `Homework for ${selectedDate}`}
          </p>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="px-4 py-2 rounded-xl bg-gray-900 text-white text-[11px] font-bold uppercase tracking-widest active:scale-95 border-0 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      {/* Filters */}
      <div className="mb-8">
        <div className="bg-white border border-gray-100 rounded-3xl p-2 shadow-sm flex gap-2">
          {(
            [
              { id: "total", label: "Total", count: counts.total },
              { id: "pending", label: "Pending", count: counts.pending },
              { id: "completed", label: "Completed", count: counts.completed },
            ] as const
          ).map((t) => {
            const active = filter === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setFilter(t.id)}
                className={`flex-1 rounded-2xl px-4 py-3 transition-all active:scale-[0.99] ${
                  active ? "bg-gray-900 text-white shadow-md" : "bg-transparent text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest">{t.label}</span>
                  <span
                    className={`min-w-7 px-2 py-0.5 rounded-full text-[10px] font-black tabular-nums ${
                      active ? "bg-white/15 text-white" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {t.count}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] font-medium text-gray-400 px-1">
          {filter === "pending"
            ? "Pending shows not completed before due date."
            : filter === "completed"
              ? "Completed includes marked done and expired homework."
              : "Total shows all homework for the selected day."}
        </p>
      </div>

      {/* Filter Chips - Removed since subjects are no longer displayed */}
      {/* Subject filtering is still available in background but not shown in UI */}

      {/* Task List */}
      <div className="space-y-4">
        {filtered.map((work, i) => {
          const isExpired = isExpiredAfter(today, work.dueDate);
          const homeworkData = {
            id: work.id,
            subject: work.subject,
            task: work.task,
            issueDate: (work as any).issueDate || work.dueDate,
            dueDate: work.dueDate,
            priority: work.priority,
            classId: "",
            className: 'Class',
            createdBy: 'teacher',
            createdAt: Timestamp.now(),
            schoolId: work.schoolId,
            color: work.color
          };
          
          return (
            <div
              key={work.id}
              onClick={() => {
                setSelectedHomework(homeworkData);
                setActiveTab("homework_detail");
              }}
              className="w-full rounded-3xl bg-white border border-gray-100 p-5 flex flex-col relative shadow-sm cursor-pointer group overflow-hidden active:scale-[0.98] transition-all"
              style={{
                animationDelay: `${i * 50}ms`,
                opacity: work.status === "Completed" ? 0.85 : 1,
              }}
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-1.5"
                style={{ backgroundColor: work.color || "#4f46e5" }}
              />

              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-black">Subject</p>
                    <p className="text-base font-black text-gray-900 truncate">{work.subject}</p>
                  </div>
                </div>

                <div
                  className={`flex items-center gap-1.5 border px-3 py-1.5 rounded-xl shrink-0 ${
                    isExpired
                      ? "bg-rose-50 text-rose-700 border-rose-100"
                      : work.status === "Completed"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : "bg-amber-50 text-amber-700 border-amber-100"
                  }`}
                >
                  {isExpired ? (
                    <Clock className="w-3.5 h-3.5" />
                  ) : work.status === "Completed" ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Clock className="w-3.5 h-3.5" />
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {isExpired ? "Expired" : work.status}
                  </span>
                </div>
              </div>

              <div className="flex-1 mb-5">
                <h4 className="text-lg font-black leading-snug text-gray-900">
                  {work.task}
                </h4>
              </div>

              <div className="flex items-end justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-100 bg-gray-50">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Due Date</span>
                    <span className="text-[11px] font-bold text-gray-800">{work.dueDate}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isExpired) toggleDiaryEntry(work.id);
                  }}
                  disabled={isExpired}
                  className={`px-4 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all active:scale-90 shadow-sm flex items-center gap-1.5 ${
                    isExpired
                      ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                      : work.status === "Completed"
                        ? "bg-gray-100 text-gray-700 border border-gray-200"
                        : "bg-indigo-600 text-white"
                  }`}
                >
                  {isExpired ? "Expired" : work.status === "Completed" ? "Revert" : "Mark Done"}
                  {!isExpired && work.status !== "Completed" && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center mt-6">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <p className="font-black text-gray-900 text-lg">All caught up!</p>
            <p className="text-sm text-gray-500 mt-1">No homework for {selectedDate}.</p>
          </div>
        )}
      </div>
    </div>
  );
}

