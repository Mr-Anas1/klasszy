"use client";

import React from "react";
import { Users, Megaphone, Activity, School, ShieldCheck, CalendarCheck } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { isNavItemEnabled } from "@/lib/feature-registry";

export default function AdminDashboardScreen() {
  const { user, students, classes, usersList, leaveApplications, circulars, setActiveTab, school } = useApp();

  const teachers = usersList.filter(u => u.role === "teacher");
  const pendingLeaves = leaveApplications.filter(l => l.status === "pending_admin").length;

  const admins = usersList.filter(u => u.role === "admin");
  const cards = [
    {
      id: "manage_users",
      Icon: Users,
      title: "Manage Users",
      subtitle: `${students.length} students · ${teachers.length} teachers`,
      bg: "bg-indigo-600",
      shadow: "shadow-indigo-200",
    },
    {
      id: "manage_admins",
      Icon: ShieldCheck,
      title: "Manage Admins",
      subtitle: `${admins.length} admin${admins.length !== 1 ? "s" : ""} configured`,
      bg: "bg-purple-600",
      shadow: "shadow-purple-200",
    },
    {
      id: "admin_announcements",
      Icon: Megaphone,
      title: "Announcements",
      subtitle: `${circulars.length} circulars posted`,
      bg: "bg-amber-500",
      shadow: "shadow-amber-200",
    },
    {
      id: "admin_activities",
      Icon: Activity,
      title: "Leave Management",
      subtitle: `${pendingLeaves} pending leaves`,
      bg: "bg-rose-500",
      shadow: "shadow-rose-200",
      badge: pendingLeaves > 0 ? pendingLeaves : null,
    },
    {
      id: "exams",
      Icon: CalendarCheck,
      title: "Exams",
      subtitle: "Publish exam schedules",
      bg: "bg-indigo-600",
      shadow: "shadow-indigo-200",
    },
    {
      id: "manage_classes",
      Icon: School,
      title: "Classes",
      subtitle: `${classes.length} sections set up`,
      bg: "bg-emerald-600",
      shadow: "shadow-emerald-200",
    },
  ];

  const firstName = user?.name?.split(" ")[0] || "Principal";

  return (
    <div className="pb-36 px-5 pt-6 animate-fade-slide-up">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm text-gray-400 font-medium">School Panel</p>
        <h2 className="text-2xl font-black text-gray-900 leading-tight mt-0.5">
          Welcome, {firstName}
        </h2>
      </div>

      {/* Insights */}
      <button
        onClick={() => setActiveTab("analysis")}
        className="w-full mb-8 bg-gray-900 text-white rounded-[32px] p-6 shadow-lg shadow-gray-900/20 text-left relative overflow-hidden active:scale-[0.99] transition-transform"
      >
        <div className="absolute -right-8 -top-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -left-10 -bottom-12 w-44 h-44 bg-white/5 rounded-full" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/60">School Insights</p>
            <p className="text-xl font-black mt-2">Analytics overview</p>
            <p className="text-sm text-white/70 mt-1">
              {students.length} students · {teachers.length} teachers · {classes.length} classes
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-white/80" />
          </div>
        </div>
      </button>

      {/* Section label */}
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Quick Access</p>

      {/* Main Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cards.filter(c => isNavItemEnabled(c.id, school?.features)).map((card) => (
          <button
            key={card.id}
            onClick={() => setActiveTab(card.id)}
            className={`${card.bg} p-6 lg:p-4 rounded-[32px] lg:rounded-xl aspect-square lg:aspect-auto lg:h-44 flex flex-col justify-between text-white relative overflow-hidden group active:scale-95 transition-transform text-left shadow-lg ${card.shadow}`}
          >
            {/* Icon block */}
            <div className="relative w-fit">
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
              <h3 className="font-black text-base leading-tight">{card.title}</h3>
              <p className="text-[11px] text-white/70 mt-1 font-medium leading-snug">{card.subtitle}</p>
            </div>

            {/* Decorative circles */}
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-500" />
            <div className="absolute -right-2 -bottom-4 w-14 h-14 bg-white/5 rounded-full" />
          </button>
        ))}
      </div>
    </div>
  );
}
