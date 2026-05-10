"use client";

import React, { useMemo, useState } from "react";
import { Calendar, CheckCircle2, Clock } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { useApp } from "@/context/AppContext";
import { getLocalISODate, isExpiredAfter } from "@/lib/date-window";

const SUBJECTS = ["All", "Mathematics", "English", "Science", "History"];

const getContrastTheme = (hexcolor?: string) => {
  if (!hexcolor || !hexcolor.startsWith("#")) return "dark";

  let hex = hexcolor.replace("#", "");
  if (hex.length === 3) hex = hex.split("").map((x) => x + x).join("");
  if (hex.length !== 6) return "dark";

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "dark" : "light";
};

export default function DiaryHistoryScreen() {
  const { diaryEntries, toggleDiaryEntry, setSelectedHomework, setActiveTab } = useApp();
  const [filter, setFilter] = useState("All");

  const today = useMemo(() => getLocalISODate(new Date()), []);

  const pastEntries = useMemo(() => {
    const items = diaryEntries.filter((d) => d.dueDate < today);
    return filter === "All" ? items : items.filter((d) => d.subject === filter);
  }, [diaryEntries, filter, today]);

  const grouped = useMemo(() => {
    const m = new Map<string, typeof pastEntries>();
    const sorted = [...pastEntries].sort((a, b) => b.dueDate.localeCompare(a.dueDate));
    for (const item of sorted) {
      const arr = m.get(item.dueDate) ?? [];
      arr.push(item);
      m.set(item.dueDate, arr);
    }
    return Array.from(m.entries());
  }, [pastEntries]);

  return (
    <div className="pb-36 px-5 pt-6 animate-fade-slide-up">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 leading-none">Past Homework</h2>
          <p className="text-sm text-gray-500 font-medium mt-1.5">Browse previous homework date-wise</p>
        </div>
        <button
          onClick={() => setActiveTab("diary")}
          className="px-4 py-2 rounded-xl bg-gray-900 text-white text-[11px] font-black uppercase tracking-widest active:scale-95"
        >
          Today
        </button>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-2 mb-6 no-scrollbar -mx-5 px-5">
        {SUBJECTS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-5 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-widest whitespace-nowrap transition-all active:scale-95 ${
              filter === s
                ? "bg-gray-900 text-white shadow-md shadow-gray-900/20"
                : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {grouped.map(([date, items]) => (
          <div key={date} className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-500">{date}</h3>
            </div>

            <div className="space-y-4">
              {items.map((work, i) => {
                const isExpired = isExpiredAfter(today, work.dueDate);
                const homeworkData = {
                  id: work.id,
                  subject: work.subject,
                  task: work.task,
                  issueDate: (work as any).issueDate || work.dueDate,
                  dueDate: work.dueDate,
                  priority: work.priority,
                  classId: "",
                  className: "Class",
                  createdBy: "teacher",
                  createdAt: Timestamp.now(),
                  schoolId: work.schoolId,
                  color: work.color,
                };

                const theme = getContrastTheme(work.color);
                const isDarkText = theme === "dark";

                const textMain = isDarkText ? "text-gray-900" : "text-white";
                const textMuted = isDarkText ? "text-gray-700" : "text-white/80";
                const glassBg = isDarkText ? "bg-white/40 border-white/40" : "bg-black/20 border-black/10";
                const primaryBtnBg = isDarkText
                  ? "bg-gray-900 text-white border-transparent"
                  : "bg-white text-gray-900 border-transparent";
                const secondaryBtnBg = isDarkText
                  ? "bg-white/50 text-gray-900 border-white/50"
                  : "bg-black/20 text-white border-black/10";

                return (
                  <div
                    key={work.id}
                    onClick={() => {
                      setSelectedHomework(homeworkData);
                      setActiveTab("homework_detail");
                    }}
                    className="w-full rounded-3xl p-6 flex flex-col relative shadow-lg cursor-pointer group overflow-hidden active:scale-[0.98] transition-all hover:-translate-y-0.5"
                    style={{
                      backgroundColor: work.color || "#f3f4f6",
                      animationDelay: `${i * 30}ms`,
                      opacity: work.status === "Completed" ? 0.85 : 1,
                    }}
                  >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full translate-x-1/3 -translate-y-1/3 blur-2xl pointer-events-none transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/5 rounded-full -translate-x-1/3 translate-y-1/3 blur-xl pointer-events-none" />

                    <div className="flex items-start justify-between mb-5 relative z-10">
                      <div className="flex flex-col gap-2 items-start">
                        <span
                          className={`text-[10px] font-black uppercase tracking-widest backdrop-blur-md border px-3 py-1.5 rounded-lg ${glassBg} ${textMain}`}
                        >
                          {work.subject}
                        </span>
                        {work.priority === "High" && (
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-rose-500/90 text-white backdrop-blur-md px-2 py-1 rounded-md shadow-sm">
                            High Priority
                          </span>
                        )}
                      </div>

                      <div className={`flex items-center gap-1.5 backdrop-blur-md border px-3 py-1.5 rounded-xl ${glassBg} ${textMain}`}>
                        {isExpired ? (
                          <Clock className="w-3.5 h-3.5 opacity-80" />
                        ) : work.status === "Completed" ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 opacity-80" />
                        )}
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          {isExpired ? "Expired" : work.status}
                        </span>
                      </div>
                    </div>

                    <div className="relative z-10 flex-1 mb-6">
                      <h4 className={`text-xl font-black leading-snug pr-4 ${textMain}`}>{work.task}</h4>
                    </div>

                    <div className={`flex items-end justify-between relative z-10 pt-4 border-t ${isDarkText ? "border-black/10" : "border-white/20"}`}>
                      <div className={`flex items-center gap-2 backdrop-blur-sm px-3 py-2 rounded-xl border ${glassBg}`}>
                        <Calendar className={`w-4 h-4 ${textMuted}`} />
                        <div className="flex flex-col">
                          <span className={`text-[8px] font-black uppercase tracking-widest opacity-80 ${textMuted}`}>
                            Due Date
                          </span>
                          <span className={`text-[11px] font-bold ${textMain}`}>{work.dueDate}</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isExpired) toggleDiaryEntry(work.id);
                        }}
                        disabled={isExpired}
                        className={`px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all active:scale-90 shadow-sm flex items-center gap-1.5 border backdrop-blur-md ${
                          isExpired ? "bg-white/40 text-gray-600 border-white/30 cursor-not-allowed" : work.status === "Completed" ? secondaryBtnBg : primaryBtnBg
                        }`}
                      >
                        {isExpired ? "Expired" : work.status === "Completed" ? "Revert" : "Mark Done"}
                        {!isExpired && work.status !== "Completed" && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {pastEntries.length === 0 && (
          <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center mt-6">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-indigo-500" />
            </div>
            <p className="font-black text-gray-900 text-lg">No past homework</p>
            <p className="text-sm text-gray-500 mt-1">Previous homework will appear here date-wise.</p>
          </div>
        )}
      </div>
    </div>
  );
}
