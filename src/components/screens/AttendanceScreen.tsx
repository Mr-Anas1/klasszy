"use client";

import React from "react";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function AttendanceScreen() {
  const { attendanceRecords } = useApp();

  const presentCount = attendanceRecords.filter((r) => r.status === "present").length;
  const absentCount = attendanceRecords.filter((r) => r.status === "absent").length;
  const lateCount = attendanceRecords.filter((r) => r.status === "late").length;
  const total = attendanceRecords.length;
  const pct = Math.round((presentCount / total) * 100);
  const circumference = 2 * Math.PI * 44;

  const statusColor = {
    present: { dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-600", icon: CheckCircle2 },
    absent: { dot: "bg-red-400", badge: "bg-red-50 text-red-500", icon: XCircle },
    late: { dot: "bg-amber-400", badge: "bg-amber-50 text-amber-600", icon: Clock },
  };

  return (
    <div className="pb-36 px-5">
      {/* Big hero circle */}
      <div className="animate-scale-in mt-4 flex flex-col items-center justify-center bg-indigo-600 rounded-[48px] px-8 py-10 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -translate-x-1/3 translate-y-1/3" />

        <div className="w-28 h-28 relative flex items-center justify-center mb-4">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="5" fill="transparent" className="text-white/20" />
            <circle
              cx="48"
              cy="48"
              r="44"
              stroke="white"
              strokeWidth="5"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - pct / 100)}
              strokeLinecap="round"
            />
          </svg>
          <span className="text-3xl font-black">{pct}%</span>
        </div>

        <h3 className="text-2xl font-black">{pct >= 90 ? "Doing Great! 🎉" : pct >= 75 ? "Keep Going!" : "Need Improvement"}</h3>
        <p className="text-indigo-100/70 text-sm mt-1 font-medium">
          {absentCount} {absentCount === 1 ? "day" : "days"} absent this month
        </p>

        <div className="mt-6 flex gap-8 w-full justify-center">
          {[
            { label: "Present", val: presentCount, color: "text-emerald-300" },
            { label: "Absent", val: absentCount, color: "text-red-300" },
            { label: "Late", val: lateCount, color: "text-amber-300" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/50">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Month summary bar */}
      <div className="animate-fade-slide-up delay-100 mt-6 bg-white rounded-[24px] p-5 border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Monthly Overview</p>
          <span className="text-xs font-bold text-indigo-500">April 2024</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex gap-0.5">
          {attendanceRecords.map((r, i) => (
            <div
              key={i}
              className={`flex-1 rounded-sm transition-all ${
                r.status === "present" ? "bg-emerald-400" : r.status === "absent" ? "bg-red-400" : "bg-amber-400"
              }`}
            />
          ))}
        </div>
        <div className="mt-3 flex gap-4">
          {[
            { color: "bg-emerald-400", label: "Present" },
            { color: "bg-red-400", label: "Absent" },
            { color: "bg-amber-400", label: "Late" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-sm ${l.color}`} />
              <span className="text-[10px] font-bold text-gray-400">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* History list */}
      <div className="mt-6 animate-fade-slide-up delay-200">
        <h3 className="text-lg font-black text-gray-900 mb-4">Recent History</h3>
        <div className="space-y-3">
          {attendanceRecords.map((h, i) => {
            const s = statusColor[h.status];
            const Icon = s.icon;
            return (
              <div
                key={i}
                className="bg-white px-5 py-4 rounded-[20px] border border-gray-100 flex items-center justify-between"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
                  <span className="font-bold text-gray-800 text-sm">{h.date}</span>
                </div>
                <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase px-3 py-1.5 rounded-xl ${s.badge}`}>
                  <Icon className="w-3 h-3" />
                  {h.status}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
