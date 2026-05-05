"use client";

import React, { useState } from "react";
import { CheckCircle2, Clock, Calendar } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Timestamp } from "firebase/firestore";

const SUBJECTS = ["All", "Mathematics", "English", "Science", "History"];

// Helper function to calculate color brightness and return a "dark" or "light" theme
const getContrastTheme = (hexcolor?: string) => {
  if (!hexcolor || !hexcolor.startsWith("#")) return "dark"; // Default to dark text
  
  let hex = hexcolor.replace("#", "");
  if (hex.length === 3) hex = hex.split("").map(x => x + x).join("");
  if (hex.length !== 6) return "dark";
  
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // YIQ equation to calculate perceived lightness
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  
  // If brightness is high (>= 128), return 'dark' (meaning dark text is needed)
  return yiq >= 128 ? "dark" : "light";
};

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
          
          // --- Dynamic Color Logic ---
          const theme = getContrastTheme(work.color);
          const isDarkText = theme === "dark";
          
          const textMain = isDarkText ? "text-gray-900" : "text-white";
          const textMuted = isDarkText ? "text-gray-700" : "text-white/80";
          const glassBg = isDarkText ? "bg-white/40 border-white/40" : "bg-black/20 border-black/10";
          const primaryBtnBg = isDarkText ? "bg-gray-900 text-white border-transparent" : "bg-white text-gray-900 border-transparent";
          const secondaryBtnBg = isDarkText ? "bg-white/50 text-gray-900 border-white/50" : "bg-black/20 text-white border-black/10";

          return (
            <div
              key={work.id}
              onClick={() => {
                setSelectedHomework(homeworkData);
                setActiveTab("homework_detail");
              }}
              className="w-full rounded-3xl p-6 flex flex-col relative shadow-lg cursor-pointer group overflow-hidden active:scale-[0.98] transition-all hover:-translate-y-0.5"
              style={{
                backgroundColor: work.color || '#f3f4f6',
                animationDelay: `${i * 50}ms`,
                opacity: work.status === "Completed" ? 0.85 : 1,
              }}
            >
              {/* Abstract Glass Shapes */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full translate-x-1/3 -translate-y-1/3 blur-2xl pointer-events-none transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/5 rounded-full -translate-x-1/3 translate-y-1/3 blur-xl pointer-events-none" />

              {/* Top Row: Status Only */}
              <div className="flex items-start justify-between mb-5 relative z-10">
                <div className="flex flex-col gap-2 items-start">
                  {work.priority === "High" && (
                     <span className="text-[9px] font-bold uppercase tracking-wider bg-rose-500/90 text-white backdrop-blur-md px-2 py-1 rounded-md shadow-sm">
                       High Priority
                     </span>
                  )}
                </div>

                <div className={`flex items-center gap-1.5 backdrop-blur-md border px-3 py-1.5 rounded-xl ${glassBg} ${textMain}`}>
                  {work.status === "Completed" ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 opacity-80" />
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {work.status}
                  </span>
                </div>
              </div>

              {/* Task Title */}
              <div className="relative z-10 flex-1 mb-6">
                <h4 className={`text-xl font-black leading-snug pr-4 ${textMain}`}>
                  {work.task}
                </h4>
              </div>

              {/* Footer Row: Due Date & Action */}
              <div className={`flex items-end justify-between relative z-10 pt-4 border-t ${isDarkText ? 'border-black/10' : 'border-white/20'}`}>
                <div className={`flex items-center gap-2 backdrop-blur-sm px-3 py-2 rounded-xl border ${glassBg}`}>
                  <Calendar className={`w-4 h-4 ${textMuted}`} />
                  <div className="flex flex-col">
                    <span className={`text-[8px] font-black uppercase tracking-widest opacity-80 ${textMuted}`}>Due Date</span>
                    <span className={`text-[11px] font-bold ${textMain}`}>{work.dueDate}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDiaryEntry(work.id);
                  }}
                  className={`px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all active:scale-90 shadow-sm flex items-center gap-1.5 border backdrop-blur-md ${
                    work.status === "Completed" ? secondaryBtnBg : primaryBtnBg
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

