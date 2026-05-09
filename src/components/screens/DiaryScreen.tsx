"use client";

import React, { useState } from "react";
import { CheckCircle2, Clock, Calendar, BookOpen } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Timestamp } from "firebase/firestore";


const getLocalISODate = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function DiaryScreen() {
  const { diaryEntries, toggleDiaryEntry, setSelectedHomework, setActiveTab } = useApp();

  const [selectedDate, setSelectedDate] = useState(getLocalISODate(new Date()));
  const entriesForDate = diaryEntries.filter((d) => d.dueDate === selectedDate);
  const filtered = entriesForDate; // No subject filtering since subjects are not displayed
  const pendingCount = diaryEntries.filter((d) => d.status === "Pending").length;
  const doneCount = diaryEntries.filter((d) => d.status === "Completed").length;

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

      {/* Bento Summary Row */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "Total", val: diaryEntries.length, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100/50" },
          { label: "Pending", val: pendingCount, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100/50" },
          { label: "Done", val: doneCount, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100/50" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} ${s.border} rounded-2xl p-4 flex flex-col items-center justify-center border shadow-sm`}>
            <p className={`text-2xl font-black leading-none ${s.color}`}>{s.val}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-1.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Chips - Removed since subjects are no longer displayed */}
      {/* Subject filtering is still available in background but not shown in UI */}

      {/* Task List */}
      <div className="space-y-4">
        {filtered.map((work, i) => {
          const homeworkData = {
            id: work.id,
            subject: work.subject,
            task: work.task,
            dueDate: work.dueDate,
            priority: work.priority,
            classId: work.schoolId,
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

                <div className="flex items-center gap-1.5 border border-gray-200 px-3 py-1.5 rounded-xl bg-gray-50 text-gray-700 shrink-0">
                  {work.status === "Completed" ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-700">
                    {work.status}
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
                    toggleDiaryEntry(work.id);
                  }}
                  className={`px-4 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all active:scale-90 shadow-sm flex items-center gap-1.5 ${
                    work.status === "Completed"
                      ? "bg-gray-100 text-gray-700 border border-gray-200"
                      : "bg-indigo-600 text-white"
                  }`}
                >
                  {work.status === "Completed" ? "Revert" : "Mark Done"}
                  {work.status !== "Completed" && <CheckCircle2 className="w-3.5 h-3.5" />}
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

