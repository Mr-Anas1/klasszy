"use client";

import React from "react";
import {
  Calendar,
  FileText,
  Info,
  ChevronRight,
  Zap,
  MessageSquare,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function HomeScreen() {
  const { student, circulars, diaryEntries, attendanceRecords, setActiveTab } = useApp();

  const presentCount = attendanceRecords.filter((r) => r.status === "present").length;
  const attendancePct = Math.round((presentCount / attendanceRecords.length) * 100);
  const pendingTasks = diaryEntries.filter((d) => d.status === "Pending").length;

  const [dateStr, setDateStr] = React.useState<string>("");

  React.useEffect(() => {
    setDateStr(new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }));
  }, []);

  return (
    <div className="pb-36 px-5">
      {/* Greeting */}
      <div className="mt-2 animate-fade-slide-up">
        <h2 className="text-2xl font-black text-gray-900 leading-tight">
          What would you<br />like to check?
        </h2>
        <p className="text-sm text-gray-400 mt-1 font-medium">
          {dateStr}
        </p>
      </div>

      {/* Quick Cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 animate-fade-slide-up delay-100">
        <button
          onClick={() => setActiveTab("attendance")}
          className="bg-[#8BB0FE] p-6 rounded-[36px] aspect-square flex flex-col justify-between text-white relative overflow-hidden group cursor-pointer active:scale-95 transition-transform text-left"
        >
          <Calendar className="w-7 h-7 opacity-50" />
          <div>
            <h3 className="font-black text-base leading-tight">Daily<br />Attendance</h3>
            <p className="text-[11px] text-white/70 mt-1 font-medium">{attendancePct}% Present</p>
          </div>
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-500" />
          <div className="absolute -right-1 -bottom-2 w-12 h-12 bg-white/5 rounded-full" />
        </button>

        <button
          onClick={() => setActiveTab("diary")}
          className="bg-[#FF9B85] p-6 rounded-[36px] aspect-square flex flex-col justify-between text-white relative overflow-hidden group cursor-pointer active:scale-95 transition-transform text-left"
        >
          <FileText className="w-7 h-7 opacity-50" />
          <div>
            <h3 className="font-black text-base leading-tight">Homework<br />Diary</h3>
            <p className="text-[11px] text-white/70 mt-1 font-medium">{pendingTasks} Tasks pending</p>
          </div>
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-500" />
          <div className="absolute -right-1 -bottom-2 w-12 h-12 bg-white/5 rounded-full" />
        </button>
      </div>

      {/* Today's Highlight */}
      <div className="mt-6 animate-fade-slide-up delay-200">
        <div className="bg-[#1E1E26] rounded-[32px] p-6 flex items-center gap-5">
          <div className="w-14 h-14 bg-[#BA94FF]/20 rounded-2xl flex items-center justify-center shrink-0">
            <Zap className="w-7 h-7 text-[#BA94FF]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Daily XP</p>
            <h3 className="text-lg font-black text-white">You&apos;re on a 5-day streak! 🔥</h3>
            <p className="text-xs text-white/40 font-medium mt-0.5">Keep it up to reach Level 15</p>
          </div>
        </div>
      </div>

      {/* Latest Circulars */}
      <div className="mt-8 animate-fade-slide-up delay-300">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-gray-900">Latest Circulars</h3>
          <button className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">
            View All
          </button>
        </div>

        <div className="space-y-4">
          {circulars.slice(0, 2).map((c) => (
            <div
              key={c.id}
              className="bg-white border border-gray-100 rounded-[32px] p-5 flex items-center gap-5 shadow-sm active:scale-[0.99] transition-all cursor-pointer group hover:shadow-md hover:border-indigo-100"
            >
              <div
                className={`${c.color} w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform`}
              >
                <Info className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{c.category}</p>
                  <span className="text-[10px] font-bold text-indigo-400">{c.date}</span>
                </div>
                <h4 className="text-[15px] font-black text-gray-900 truncate mt-0.5">{c.title}</h4>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-200 shrink-0 group-hover:text-indigo-300 transition-colors" />
            </div>
          ))}
        </div>
      </div>

      {/* Latest Remarks */}
      <div className="mt-8 animate-fade-slide-up delay-400">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-gray-900">Teacher Remarks</h3>
          <span className="text-[10px] font-black uppercase text-gray-300 tracking-widest">Recent</span>
        </div>
        
        {student?.remarks && student.remarks.length > 0 ? (
          <div className="space-y-4">
            {student.remarks.slice(0, 2).map((r, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center shrink-0">
                    <span className="text-sm font-black text-violet-700">
                      {r.teacher.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-black text-gray-900">{r.teacher}</h4>
                      <span className="text-[9px] font-bold text-gray-300">{r.date}</span>
                    </div>
                    <p className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">{r.subject}</p>
                    <p className="text-xs text-gray-500 font-medium mt-2 leading-relaxed italic">
                      &quot;{r.content}&quot;
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-gray-200 rounded-[32px] p-10 text-center">
            <MessageSquare className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-xs text-gray-400 font-medium">No remarks from teachers yet.</p>
          </div>
        )}
      </div>

      {/* Recent Diary Entries */}
      <div className="mt-8 animate-fade-slide-up delay-500">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-gray-900">Upcoming Tasks</h3>
          <button onClick={() => setActiveTab("diary")} className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">
            See All
          </button>
        </div>
        <div className="space-y-3">
          {diaryEntries
            .filter((d) => d.status === "Pending")
            .slice(0, 2)
            .map((d) => (
              <div
                key={d.id}
                className="flex items-center gap-4 bg-white rounded-[20px] p-4 border border-gray-100"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: d.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black uppercase tracking-wider text-gray-400">{d.subject}</p>
                  <p className="text-sm font-bold text-gray-800 truncate">{d.task}</p>
                </div>
                <span className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-orange-50 text-orange-500 shrink-0">
                  {d.dueDate}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
