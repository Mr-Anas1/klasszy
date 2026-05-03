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
import CircularsScreen from "@/components/screens/CircularsScreen";
import CircularDetailScreen from "@/components/screens/CircularDetailScreen";
import HomeworkHistoryScreen from "@/components/screens/HomeworkHistoryScreen";
import ManageTeachersScreen from "@/components/screens/ManageTeachersScreen";
import ManageStudentsScreen from "@/components/screens/ManageStudentsScreen";
import StudentDetailScreen from "@/components/screens/StudentDetailScreen";
import TeacherDetailScreen from "@/components/screens/TeacherDetailScreen";
import RemarksScreen from "@/components/screens/RemarksScreen";
import NotificationsScreen from "@/components/screens/NotificationsScreen";

export default function AppShell() {
  const { activeTab, userRole } = useApp();

  // Screen mapping based on role and active tab
  const getScreen = () => {
    // If user is admin, show admin dashboard for home, otherwise fallback to specific admin tools if needed
    if (userRole === "admin") {
      if (activeTab === "profile") return <ProfileScreen />;
      if (activeTab === "circulars") return <CircularsScreen />;
      if (activeTab === "view_circular") return <CircularDetailScreen />;
      if (activeTab === "homework_history") return <HomeworkHistoryScreen />;
      if (activeTab === "manage_teachers") return <ManageTeachersScreen />;
      if (activeTab === "manage_students") return <ManageStudentsScreen />;
      if (activeTab === "student_detail") return <StudentDetailScreen />;
      if (activeTab === "teacher_detail") return <TeacherDetailScreen />;
      return <AdminDashboardScreen />;
    }

    // If user is teacher
    if (userRole === "teacher") {
      if (activeTab === "home") return <TeacherHomeScreen />;
      if (activeTab === "students") return <TeacherStudentsScreen />;
      if (activeTab === "circulars") return <CircularsScreen />;
      if (activeTab === "view_circular") return <CircularDetailScreen />;
      if (activeTab === "homework_history") return <HomeworkHistoryScreen />;
      if (activeTab === "profile") return <ProfileScreen />;
      if (activeTab === "student_detail") return <StudentDetailScreen />;
      if (activeTab === "teacher_detail") return <TeacherDetailScreen />;
      // Fallback for other teacher tabs
      return <TeacherHomeScreen />;
    }

    // If user is parent
    if (userRole === "parent") {
      if (activeTab === "home") return <HomeScreen />;
      if (activeTab === "notifications") return <NotificationsScreen />;
      if (activeTab === "attendance") return <AttendanceScreen />;
      if (activeTab === "diary") return <DiaryScreen />;
      if (activeTab === "circulars") return <CircularsScreen />;
      if (activeTab === "view_circular") return <CircularDetailScreen />;
      if (activeTab === "homework_history") return <HomeworkHistoryScreen />;
      if (activeTab === "profile") return <ProfileScreen />;
      if (activeTab === "student_detail") return <StudentDetailScreen />;
      if (activeTab === "teacher_detail") return <TeacherDetailScreen />;
      if (activeTab === "remarks_history") return <RemarksScreen />;
      // Fallback for other parent tabs
      return <HomeScreen />;
    }

    // Default: Student role screens
    switch (activeTab) {
      case "attendance": return <AttendanceScreen />;
      case "diary": return <DiaryScreen />;
      case "circulars": return <CircularsScreen />;
      case "view_circular": return <CircularDetailScreen />;
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
