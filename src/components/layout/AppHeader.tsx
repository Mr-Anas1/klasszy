"use client";

import React from "react";
import { Bell, ChevronLeft, User, ShieldCheck, GraduationCap, Users } from "lucide-react";
import { useApp } from "@/context/AppContext";

const TITLES: Record<string, string> = {
  home: "Dashboard",
  attendance: "Attendance",
  diary: "My Tasks",
  analysis: "Analysis",
  profile: "Profile",
  students: "My Students",
  classes: "My Classes",
  schools: "Schools",
  users: "Users",
  settings: "Settings",
};

export default function AppHeader() {
  const { user, userRole, activeTab, setActiveTab } = useApp();
  const isHome = activeTab === "home";

  const getRoleBadge = () => {
    switch (userRole) {
      case "admin": return <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />;
      case "teacher": return <Users className="w-3.5 h-3.5 text-violet-500" />;
      default: return <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />;
    }
  };

  const getSubTitle = () => {
    if (userRole === "admin") return "Super Admin";
    if (userRole === "teacher") return "Teacher Portal";
    return "Student Portal";
  };

  return (
    <div className="flex items-center justify-between px-6 py-5 sticky top-0 z-20 glass">
      <div className="flex items-center gap-4">
        {!isHome ? (
          <button
            onClick={() => setActiveTab("home")}
            className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </button>
        ) : (
          <button
            onClick={() => setActiveTab("profile")}
            className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center active:scale-95 transition-transform shadow-sm"
          >
            {user ? (
              <span className="text-sm font-black text-indigo-700">{user.avatar}</span>
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
            {TITLES[activeTab] || "EduTrack"}
          </h1>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center relative">
          <Bell className="w-5 h-5 text-gray-500" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white" />
        </button>
      </div>
    </div>
  );
}
