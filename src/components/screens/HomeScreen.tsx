"use client";

import React from "react";
import { Calendar, FileText, Bell, MessageSquare } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function HomeScreen() {
  const {
    user, circulars, homework, attendance,
    setActiveTab, students, remarks, notifications,
  } = useApp();

  const dateStr = React.useMemo(
    () => new Date().toLocaleDateString("en-IN", {
      weekday: "long", day: "numeric", month: "long",
    }),
    []
  );

  // Find this parent's student
  const currentStudent = students.find(s => s.parentId === user?.id);

  // Attendance percentage: look through all records for this student's entries
  const studentRecords = attendance.flatMap(a =>
    a.records.filter(r => r.studentId === currentStudent?.id)
  );
  const presentCount = studentRecords.filter(r => r.status === "present").length;
  const attendancePct = studentRecords.length > 0
    ? Math.round((presentCount / studentRecords.length) * 100)
    : 0;

  // Homework count — scoped to student's class
  const classHomework = currentStudent
    ? homework.filter(h => h.classId === currentStudent.classId)
    : homework;

  // Remarks for this student
  const studentRemarks = currentStudent
    ? remarks.filter(r => r.studentId === currentStudent.id)
    : [];

  // Notifications for this student
  const studentNotifs = currentStudent
    ? notifications.filter(n =>
        (n.targetType === "student" && n.targetId === currentStudent.id) ||
        (n.targetType === "class" && n.targetId === currentStudent.classId)
      )
    : [];

  const firstName = user?.name?.split(" ")[0] || "there";

  const cards = [
    {
      id: "attendance",
      Icon: Calendar,
      title: "Attendance",
      stat: `${attendancePct}%`,
      meta: "of days present",
      bg: "bg-[#5B6EF5]",     // indigo-blue
    },
    {
      id: "diary",
      Icon: FileText,
      title: "Homework",
      stat: String(classHomework.length),
      meta: classHomework.length === 1 ? "task pending" : "tasks pending",
      bg: "bg-[#FF7B61]",     // coral
    },
    {
      id: "circulars",
      Icon: Bell,
      title: "Circulars",
      stat: String(circulars.filter(c => c.targetAudience !== "teachers").length),
      meta: "school notices",
      bg: "bg-[#3DBAA2]",     // teal
    },
    {
      id: "remarks_history",
      Icon: MessageSquare,
      title: "Remarks",
      stat: String(studentRemarks.length),
      meta: "from teachers",
      bg: "bg-[#9B72CF]",     // purple
    },
  ];

  return (
    <div className="pb-36 px-5 pt-6 animate-fade-slide-up">
      {/* Greeting */}
      <div className="mb-8">
        <p className="text-sm text-gray-400 font-medium">{dateStr}</p>
        <h2 className="text-2xl font-black text-gray-900 leading-tight mt-1">
          Hello, {firstName}!
        </h2>
        <p className="text-sm text-gray-400 font-medium mt-0.5">
          {currentStudent ? `Viewing: ${currentStudent.name}` : "What would you like to check?"}
        </p>
      </div>

      {/* Section label */}
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Overview</p>

      {/* 2×2 Card Grid */}
      <div className="grid grid-cols-2 gap-4">
        {cards.map(card => (
          <button
            key={card.id}
            onClick={() => setActiveTab(card.id)}
            className={`${card.bg} p-6 rounded-[32px] aspect-square flex flex-col justify-between text-white relative overflow-hidden group active:scale-95 transition-transform text-left`}
          >
            {/* Icon */}
            <card.Icon className="w-7 h-7 text-white/60" />

            {/* Stats + Label */}
            <div>
              <p className="text-3xl font-black leading-none">{card.stat}</p>
              <h3 className="text-sm font-black mt-1 leading-tight">{card.title}</h3>
              <p className="text-[10px] text-white/60 font-medium mt-0.5">{card.meta}</p>
            </div>

            {/* Decorative circles */}
            <div className="absolute -right-5 -top-5 w-20 h-20 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
            <div className="absolute -right-2 -bottom-4 w-12 h-12 bg-white/5 rounded-full pointer-events-none" />
          </button>
        ))}
      </div>

      {/* Notifications strip */}
      {studentNotifs.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Recent Notifications
            </p>
            <button
              onClick={() => setActiveTab("notifications")}
              className="text-[10px] font-black uppercase tracking-widest text-indigo-500"
            >
              View All
            </button>
          </div>
          <div className="space-y-2">
            {studentNotifs.slice(0, 3).map(n => (
              <div
                key={n.id}
                className="bg-white rounded-[20px] p-4 border border-gray-100 shadow-sm flex items-start gap-3"
              >
                <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-gray-900 truncate">{n.title}</p>
                  <p className="text-xs text-gray-400 font-medium line-clamp-1 mt-0.5">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
