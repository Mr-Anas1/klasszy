"use client";

import React, { useMemo } from "react";
import { BarChart3, GraduationCap, Users, School, ChevronRight, TrendingUp } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function SchoolInsightsScreen() {
  const { students, usersList, classes, setActiveTab, leaveApplications } = useApp();

  const teachers = useMemo(() => usersList.filter((u) => u.role === "teacher"), [usersList]);
  const pendingLeaves = useMemo(() => leaveApplications.filter((l) => l.status === "pending_admin").length, [leaveApplications]);

  const tiles = [
    {
      id: "students",
      title: "Students",
      value: students.length,
      subtitle: "Manage student accounts",
      Icon: GraduationCap,
      onClick: () => setActiveTab("manage_users"),
      bg: "bg-indigo-600",
      shadow: "shadow-indigo-200",
    },
    {
      id: "teachers",
      title: "Teachers",
      value: teachers.length,
      subtitle: "Manage staff accounts",
      Icon: Users,
      onClick: () => setActiveTab("manage_users"),
      bg: "bg-violet-600",
      shadow: "shadow-violet-200",
    },
    {
      id: "classes",
      title: "Classes",
      value: classes.length,
      subtitle: "Sections configured",
      Icon: School,
      onClick: () => setActiveTab("manage_classes"),
      bg: "bg-emerald-600",
      shadow: "shadow-emerald-200",
    },
  ] as const;

  const donutPct = (val: number, max: number) => (max === 0 ? 0 : Math.min(100, Math.round((val / max) * 100)));
  const totalUsers = students.length + teachers.length;
  const studentShare = donutPct(students.length, totalUsers);

  return (
    <div className="pb-36 px-5 pt-6 animate-fade-slide-up">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-gray-900 leading-none">School Insights</h2>
        <p className="text-sm text-gray-400 mt-0.5">Key numbers and shortcuts</p>
      </div>

      {/* Hero chart */}
      <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Distribution</p>
            <p className="text-lg font-black text-gray-900 mt-1">Students vs Teachers</p>
            <p className="text-sm text-gray-400 mt-1">{studentShare}% students of total users</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-6">
          <div className="relative w-24 h-24 shrink-0">
            <svg viewBox="0 0 42 42" className="w-full h-full -rotate-90">
              <circle cx="21" cy="21" r="16" fill="transparent" stroke="rgb(243 244 246)" strokeWidth="6" />
              <circle
                cx="21"
                cy="21"
                r="16"
                fill="transparent"
                stroke="rgb(99 102 241)"
                strokeWidth="6"
                strokeDasharray={`${(studentShare / 100) * 100} 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-black text-gray-900 tabular-nums">{studentShare}%</span>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-3">
            <div className="bg-indigo-50 rounded-2xl p-4">
              <p className="text-2xl font-black text-indigo-600 tabular-nums">{students.length}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mt-1">Students</p>
            </div>
            <div className="bg-violet-50 rounded-2xl p-4">
              <p className="text-2xl font-black text-violet-600 tabular-nums">{teachers.length}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mt-1">Teachers</p>
            </div>
          </div>
        </div>

        {pendingLeaves > 0 && (
          <button
            onClick={() => setActiveTab("admin_activities")}
            className="mt-5 w-full rounded-2xl bg-rose-50 border border-rose-100 px-5 py-4 text-left hover:bg-rose-100/60 transition-colors"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900">{pendingLeaves} leave requests pending</p>
                  <p className="text-[11px] font-medium text-rose-700/80">Review now</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-rose-400" />
            </div>
          </button>
        )}
      </div>

      {/* Clickable tiles */}
      <div className="grid grid-cols-2 gap-4">
        {tiles.map((t) => (
          <button
            key={t.id}
            onClick={t.onClick}
            className={`${t.bg} ${t.shadow} p-6 rounded-[32px] flex flex-col justify-between text-white relative overflow-hidden group active:scale-95 transition-transform text-left shadow-lg`}
          >
            <div className="relative w-fit">
              <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center">
                <t.Icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-3xl font-black leading-none tabular-nums">{t.value}</p>
              <h3 className="text-sm font-black mt-1 leading-tight">{t.title}</h3>
              <p className="text-[10px] text-white/70 font-medium mt-0.5">{t.subtitle}</p>
            </div>
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
          </button>
        ))}
      </div>
    </div>
  );
}

