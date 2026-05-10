"use client";

import React from "react";
import { Bell, ChevronLeft, User, ShieldCheck, GraduationCap, Users } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { appConfig } from "@/configs/appConfig";

const TITLES: Record<string, string> = {
  home:                 "Dashboard",
  attendance:           "Attendance",
  diary:                "My Tasks",
  diary_history:        "Task History",
  analysis:             "School Insights",
  remarks_history:      "Remarks",
  profile:              "Profile",
  circulars:            "Circulars",
  view_circular:        "Circular",
  notifications:        "Notifications",
  homework_detail:      "Homework",
  homework_history:     "Homework History",
  exams:                "Exams",
  exam_detail:          "Exam",
  fee_reminders:        "Fee Reminders",
  student_detail:       "Student",
  teacher_detail:       "Teacher",
  // Admin
  manage_users:         "Users",
  manage_students:      "Students",
  manage_teachers:      "Teachers",
  manage_classes:       "Classes",
  admin_announcements:  "Announcements",
  admin_activities:     "Leave Management",
  // Teacher
  teacher_classes:      "My Classes",
  teacher_activities:   "Leave Management",
  students:             "My Students",
  leave_management:     "Leave Management",
};

export default function AppHeader() {
  const { user, userRole, activeTab, setActiveTab, handleGoBack, school } = useApp();
  const isHome = activeTab === "home";

  const getRoleBadge = () => {
    switch (userRole) {
      case "admin":   return <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />;
      case "teacher": return <Users className="w-3.5 h-3.5 text-violet-500" />;
      default:        return <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />;
    }
  };

  const getSubTitle = () => {
    if (userRole === "admin")   return "Super Admin";
    if (userRole === "teacher") return "Teacher Portal";
    return "Student Portal";
  };

  return (
    <div className="flex items-center justify-between px-6 py-5 lg:px-8 lg:py-4 sticky top-0 z-20 glass">
      <div className="flex items-center gap-4">
        {/* Mobile/tablet: avatar on home, back arrow on sub-screens */}
        {!isHome ? (
          <button
            onClick={handleGoBack}
            className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </button>
        ) : (
          <button
            onClick={() => setActiveTab("profile")}
            className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center active:scale-95 transition-transform shadow-sm lg:hidden"
          >
            {user ? (
              <span className="text-sm font-black text-indigo-700">
                {user.name
                  .split(" ").filter(Boolean)
                  .map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </span>
            ) : (
              <User className="w-5 h-5 text-indigo-600" />
            )}
          </button>
        )}
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-[9px] font-black uppercase tracking-[2.5px] text-gray-400 leading-none">
              {getSubTitle()}
            </p>
            {getRoleBadge()}
          </div>
          <h1 className="text-lg font-black text-gray-900 leading-none mt-1">
            {TITLES[activeTab] || school?.name || "Klasszy"}
          </h1>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => {
            if (userRole === "parent")                          setActiveTab("notifications");
            if (userRole === "teacher" || userRole === "admin") setActiveTab("circulars");
          }}
          className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center relative hover:bg-gray-100 transition-colors"
        >
          <Bell className="w-5 h-5 text-gray-500" />
          <span
            className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full border-2 border-white"
            style={{ backgroundColor: "var(--theme-primary)" }}
          />
        </button>
      </div>
    </div>
  );
}
