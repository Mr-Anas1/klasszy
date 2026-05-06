"use client";

import React from "react";
import { 
  BookOpen, 
  Calendar, 
  FileText, 
  BarChart3, 
  User, 
  Users, 
  ShieldCheck,
  Bell
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { isNavItemEnabled } from "@/lib/feature-registry";

export default function BottomNav() {
  const { activeTab, setActiveTab, userRole, school } = useApp();

  const getTabs = () => {
    if (userRole === "admin") {
      return [
        { id: "home", Icon: ShieldCheck },
        { id: "circulars", Icon: Bell },
        { id: "profile", Icon: User },
      ];
    }
    if (userRole === "teacher") {
      return [
        { id: "home", Icon: BookOpen },
        { id: "circulars", Icon: Bell },
        { id: "profile", Icon: User },
      ];
    }
    // Student / Parent default
    return [
      { id: "home", Icon: BookOpen },
      { id: "circulars", Icon: Bell },
      { id: "attendance", Icon: Calendar },
      { id: "diary", Icon: FileText },
      { id: "profile", Icon: User },
    ];
  };

  const tabs = getTabs().filter(t => isNavItemEnabled(t.id, school?.features));

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] glass-dark rounded-[40px] p-2 flex justify-around items-center shadow-2xl shadow-black/40 z-50 md:hidden">
      {tabs.map(({ id, Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`relative p-4 rounded-[28px] transition-all duration-300 active:scale-90 ${
              isActive ? "bg-white" : "text-gray-500 hover:text-gray-400"
            }`}
          >
            <Icon
              className={`w-6 h-6 transition-colors duration-300 ${
                isActive ? "text-indigo-600" : "text-gray-400"
              }`}
            />
            {isActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
