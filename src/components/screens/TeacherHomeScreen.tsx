"use client";

import React from "react";
import { BookOpen, Bell, Activity } from "lucide-react";
import { useApp, UserProfile } from "@/context/AppContext";
import { isNavItemEnabled } from "@/lib/feature-registry";

export default function TeacherHomeScreen() {
  const { user, classes, circulars, leaveApplications, setActiveTab, school } = useApp();
  const teacher = user as UserProfile;

  const myClasses = classes.filter(c => teacher.classIds?.includes(c.id));
  const classTeacherLabel = myClasses.length
    ? myClasses.map((c) => `${c.name} ${c.section}`).slice(0, 3).join(", ") +
      (myClasses.length > 3 ? ` +${myClasses.length - 3}` : "")
    : null;
  const pendingLeaves = leaveApplications.filter(l => l.status === "pending_teacher").length;

  const cards = [
    {
      id: "teacher_classes",
      Icon: BookOpen,
      title: "My Classes",
      subtitle: myClasses.length > 0
        ? `${myClasses.length} class${myClasses.length !== 1 ? "es" : ""} assigned`
        : "No classes yet — contact admin",
      bg: "bg-indigo-600",
      shadow: "shadow-indigo-200",
      wide: true,
      badge: null as number | null,
    },
    {
      id: "circulars",
      Icon: Bell,
      title: "Circulars",
      subtitle: `${circulars.filter(c => c.targetAudience !== "parents").length} notices`,
      bg: "bg-amber-500",
      shadow: "shadow-amber-200",
      wide: false,
      badge: null as number | null,
    },
    {
      id: "teacher_activities",
      Icon: Activity,
      title: "Activities",
      subtitle: `${pendingLeaves} pending leaves`,
      bg: "bg-rose-500",
      shadow: "shadow-rose-200",
      wide: false,
      badge: pendingLeaves > 0 ? pendingLeaves : null,
    },
  ];

  const firstName = teacher.name?.split(" ")[0] || "Teacher";

  return (
    <div className="pb-36 px-5 pt-6 animate-fade-slide-up">
      {/* Greeting */}
      <div className="mb-8">
        <p className="text-sm text-gray-400 font-medium">Teacher Dashboard</p>
        <h2 className="text-2xl font-black text-gray-900 leading-tight mt-0.5">
          Hello, {firstName}!
        </h2>
        <p className="text-sm text-gray-400 font-medium mt-0.5">
          What would you like to do today?
        </p>
        {classTeacherLabel && (
          <div className="mt-3 inline-flex max-w-full flex-wrap items-center gap-2">
            <span className="rounded-2xl bg-indigo-50 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-indigo-700 ring-1 ring-indigo-100">
              Class teacher · {classTeacherLabel}
            </span>
          </div>
        )}
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "Classes", val: myClasses.length, color: "text-indigo-600" },
          { label: "Pending", val: pendingLeaves, color: "text-rose-500" },
          { label: "Notices", val: circulars.filter(c => c.targetAudience !== "parents").length, color: "text-amber-500" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
            <div className={`text-2xl font-black ${s.color}`}>{s.val}</div>
            <div className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Section label */}
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Quick Access</p>

      {/* Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cards
          .filter((c) => isNavItemEnabled(c.id, school?.features))
          .map(card => (
          <button
            key={card.id}
            onClick={() => setActiveTab(card.id)}
            className={`${card.bg} ${card.shadow} ${card.wide ? "col-span-2 lg:col-span-3 xl:col-span-4 flex-row items-center gap-6" : "flex-col justify-between aspect-square lg:aspect-auto lg:h-44"} p-6 lg:p-4 rounded-[32px] lg:rounded-xl flex text-white relative overflow-hidden group active:scale-95 transition-transform text-left shadow-lg`}
          >
            {/* Icon + badge */}
            <div className="relative w-fit shrink-0">
              <div className="bg-white/20 w-12 h-12 lg:w-10 lg:h-10 rounded-2xl flex items-center justify-center">
                <card.Icon className="w-6 h-6 lg:w-5 lg:h-5 text-white" />
              </div>
              {card.badge != null && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow">
                  <span className="text-[9px] font-black text-rose-600">{card.badge}</span>
                </div>
              )}
            </div>

            {/* Text */}
            <div>
              <h3 className={`font-black leading-tight ${card.wide ? "text-xl" : "text-base"}`}>
                {card.title}
              </h3>
              <p className="text-[11px] text-white/70 mt-1 font-medium leading-snug">{card.subtitle}</p>
            </div>

            {/* Decorative circle */}
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
          </button>
        ))}
      </div>
    </div>
  );
}
