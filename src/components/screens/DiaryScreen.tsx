"use client";

import React, { useState } from "react";
import { CheckCircle2, Clock, FileText } from "lucide-react";
import { useApp } from "@/context/AppContext";

const SUBJECTS = ["All", "Mathematics", "English", "Science", "History"];

export default function DiaryScreen() {
  const { diaryEntries, toggleDiaryEntry } = useApp();
  const [filter, setFilter] = useState("All");

  const filtered =
    filter === "All" ? diaryEntries : diaryEntries.filter((d) => d.subject === filter);

  const priorityBadge = {
    High: "bg-red-50 text-red-500",
    Medium: "bg-amber-50 text-amber-600",
    Low: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="pb-36 px-5">
      {/* Summary row */}
      <div className="animate-fade-slide-up mt-4 grid grid-cols-3 gap-3">
        {[
          { label: "Total", val: diaryEntries.length, color: "text-gray-900", bg: "bg-white" },
          { label: "Pending", val: diaryEntries.filter((d) => d.status === "Pending").length, color: "text-orange-500", bg: "bg-orange-50" },
          { label: "Done", val: diaryEntries.filter((d) => d.status === "Completed").length, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center border border-gray-100`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter chips */}
      <div className="animate-fade-slide-up delay-100 mt-6 flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-5 px-5">
        {SUBJECTS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-[2px] whitespace-nowrap transition-all active:scale-95 ${
              filter === s 
                ? "bg-[#1E1E26] text-white shadow-lg shadow-gray-200" 
                : "bg-white text-gray-400 border border-gray-100 hover:bg-gray-50"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Tasks */}
      <div className="mt-4 space-y-5">
        {filtered.map((work, i) => (
          <div
            key={work.id}
            className="rounded-[40px] p-8 flex flex-col text-white relative shadow-xl animate-fade-slide-up group overflow-hidden"
            style={{
              backgroundColor: work.color,
              animationDelay: `${i * 100}ms`,
              opacity: work.status === "Completed" ? 0.75 : 1,
            }}
          >
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/5 rounded-full -translate-x-1/3 translate-y-1/3 blur-xl pointer-events-none" />

            {/* Status badge */}
            <div className="absolute top-6 right-8 flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-2 rounded-2xl">
              {work.status === "Completed" ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Clock className="w-4 h-4" />
              )}
              <span className="text-[10px] font-black uppercase tracking-widest">
                {work.status}
              </span>
            </div>

            <div className="w-16 h-16 bg-white/20 rounded-[24px] flex items-center justify-center mb-6 shadow-inner">
              <FileText className="w-8 h-8" />
            </div>

            <div className="flex-1">
              <span className="text-[10px] font-black uppercase tracking-[3px] opacity-60">{work.subject}</span>
              <h4 className="text-2xl font-black mt-1 leading-tight pr-12">{work.task}</h4>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg bg-white/20 tracking-[1.5px] self-start`}>
                  {work.priority} Priority
                </span>
                <span className="text-[10px] font-bold opacity-60">Due {work.dueDate}</span>
              </div>

              <button
                onClick={() => toggleDiaryEntry(work.id)}
                className={`px-7 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg ${
                  work.status === "Completed"
                    ? "bg-white/20 text-white border border-white/30"
                    : "bg-[#1E1E26] text-white hover:bg-black"
                }`}
              >
                {work.status === "Completed" ? "Pending" : "Complete ✓"}
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <p className="font-black text-gray-900">All caught up!</p>
            <p className="text-sm text-gray-400 mt-1">No tasks for this subject.</p>
          </div>
        )}
      </div>
    </div>
  );
}
