"use client";

import React from "react";
import { BookOpen, Calendar, FileText, User, ShieldCheck, Bell } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { isNavItemEnabled } from "@/lib/feature-registry";
import { appConfig } from "@/configs/appConfig";

export default function BottomNav() {
  const { activeTab, setActiveTab, userRole, school } = useApp();

  const getTabs = () => {
    if (userRole === "admin") {
      return [
        { id: "home", Icon: ShieldCheck, label: "Home" },
        { id: "circulars", Icon: Bell, label: "Circulars" },
        { id: "profile", Icon: User, label: "Profile" },
      ];
    }
    if (userRole === "teacher") {
      return [
        { id: "home", Icon: BookOpen, label: "Home" },
        { id: "circulars", Icon: Bell, label: "Circulars" },
        { id: "profile", Icon: User, label: "Profile" },
      ];
    }
    // Student / Parent default
    return [
      { id: "home", Icon: BookOpen, label: "Home" },
      { id: "circulars", Icon: Bell, label: "Circulars" },
      { id: "attendance", Icon: Calendar, label: "Attendance" },
      { id: "diary", Icon: FileText, label: "Diary" },
      { id: "profile", Icon: User, label: "Profile" },
    ];
  };

  const mergedFeatures = {
    ...(school?.features ?? {}),
    ...Object.fromEntries(Object.entries(appConfig.features).filter(([, v]) => v === false)),
  };

  const tabs = getTabs().filter(t => isNavItemEnabled(t.id, mergedFeatures));

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 flex items-stretch justify-around z-50 md:hidden">
      {tabs.map(({ id, Icon, label }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl transition-all duration-200 active:scale-95 ${
              isActive ? "text-(--theme-primary) bg-indigo-50/60" : "text-gray-500"
            }`}
          >
            <Icon
              className={`w-5 h-5 transition-colors duration-200 ${isActive ? "" : "text-gray-400"}`}
            />
            <span className={`text-[10px] font-bold leading-none ${isActive ? "text-(--theme-primary)" : "text-gray-500"}`}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
