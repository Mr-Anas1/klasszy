"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import AppHeader from "@/components/layout/AppHeader";
import BottomNav from "@/components/layout/BottomNav";
import HomeScreen from "@/components/screens/HomeScreen";
import AttendanceScreen from "@/components/screens/AttendanceScreen";
import DiaryScreen from "@/components/screens/DiaryScreen";
import AnalysisScreen from "@/components/screens/AnalysisScreen";
import ProfileScreen from "@/components/screens/ProfileScreen";
import TeacherHomeScreen from "@/components/screens/TeacherHomeScreen";
import TeacherStudentsScreen from "@/components/screens/TeacherStudentsScreen";
import AdminDashboardScreen from "@/components/screens/AdminDashboardScreen";

export default function AppShell() {
  const { activeTab, userRole } = useApp();

  // Screen mapping based on role and active tab
  const getScreen = () => {
    // If user is admin, show admin dashboard for home, otherwise fallback to specific admin tools if needed
    if (userRole === "admin") {
      if (activeTab === "profile") return <ProfileScreen />;
      return <AdminDashboardScreen />;
    }

    // If user is teacher
    if (userRole === "teacher") {
      if (activeTab === "home") return <TeacherHomeScreen />;
      if (activeTab === "students") return <TeacherStudentsScreen />;
      if (activeTab === "profile") return <ProfileScreen />;
      // Fallback for other teacher tabs
      return <TeacherHomeScreen />;
    }

    // Default: Student role screens
    switch (activeTab) {
      case "attendance": return <AttendanceScreen />;
      case "diary": return <DiaryScreen />;
      case "analysis": return <AnalysisScreen />;
      case "profile": return <ProfileScreen />;
      default: return <HomeScreen />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <AppHeader />
      <main
        key={`${userRole}-${activeTab}`}
        className="flex-1 overflow-y-auto overscroll-none no-scrollbar animate-fade-slide-up bg-[#f5f5f7]"
      >
        {getScreen()}
      </main>
      <BottomNav />
    </div>
  );
}
