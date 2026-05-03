"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import AppHeader from "@/components/layout/AppHeader";
import BottomNav from "@/components/layout/BottomNav";

// Shared screens
import ProfileScreen from "@/components/screens/ProfileScreen";
import CircularsScreen from "@/components/screens/CircularsScreen";
import CircularDetailScreen from "@/components/screens/CircularDetailScreen";
import HomeworkHistoryScreen from "@/components/screens/HomeworkHistoryScreen";
import StudentDetailScreen from "@/components/screens/StudentDetailScreen";
import TeacherDetailScreen from "@/components/screens/TeacherDetailScreen";
import NotificationsScreen from "@/components/screens/NotificationsScreen";

// Admin screens
import AdminDashboardScreen from "@/components/screens/AdminDashboardScreen";
import ManageUsersScreen from "@/components/screens/ManageUsersScreen";
import ManageStudentsScreen from "@/components/screens/ManageStudentsScreen";
import ManageTeachersScreen from "@/components/screens/ManageTeachersScreen";
import ManageClassesScreen from "@/components/screens/ManageClassesScreen";
import AdminAnnouncementsScreen from "@/components/screens/AdminAnnouncementsScreen";
import AdminActivitiesScreen from "@/components/screens/AdminActivitiesScreen";

// Teacher screens
import TeacherHomeScreen from "@/components/screens/TeacherHomeScreen";
import TeacherClassesScreen from "@/components/screens/TeacherClassesScreen";
import TeacherActivitiesScreen from "@/components/screens/TeacherActivitiesScreen";
import TeacherStudentsScreen from "@/components/screens/TeacherStudentsScreen";

// Student / Parent screens
import HomeScreen from "@/components/screens/HomeScreen";
import AttendanceScreen from "@/components/screens/AttendanceScreen";
import DiaryScreen from "@/components/screens/DiaryScreen";
import AnalysisScreen from "@/components/screens/AnalysisScreen";
import RemarksScreen from "@/components/screens/RemarksScreen";

export default function AppShell() {
  const { activeTab, userRole } = useApp();

  const getScreen = () => {
    // ── Admin ──────────────────────────────────────────────────────────────
    if (userRole === "admin") {
      switch (activeTab) {
        case "manage_users":         return <ManageUsersScreen />;
        case "manage_students":      return <ManageStudentsScreen />;
        case "manage_teachers":      return <ManageTeachersScreen />;
        case "manage_classes":       return <ManageClassesScreen />;
        case "admin_announcements":  return <AdminAnnouncementsScreen />;
        case "admin_activities":     return <AdminActivitiesScreen />;
        case "circulars":            return <CircularsScreen />;
        case "view_circular":        return <CircularDetailScreen />;
        case "homework_history":     return <HomeworkHistoryScreen />;
        case "student_detail":       return <StudentDetailScreen />;
        case "teacher_detail":       return <TeacherDetailScreen />;
        case "profile":              return <ProfileScreen />;
        default:                     return <AdminDashboardScreen />;
      }
    }

    // ── Teacher ────────────────────────────────────────────────────────────
    if (userRole === "teacher") {
      switch (activeTab) {
        case "teacher_classes":      return <TeacherClassesScreen />;
        case "teacher_activities":   return <TeacherActivitiesScreen />;
        case "students":             return <TeacherStudentsScreen />;
        case "circulars":            return <CircularsScreen />;
        case "view_circular":        return <CircularDetailScreen />;
        case "homework_history":     return <HomeworkHistoryScreen />;
        case "student_detail":       return <StudentDetailScreen />;
        case "teacher_detail":       return <TeacherDetailScreen />;
        case "profile":              return <ProfileScreen />;
        default:                     return <TeacherHomeScreen />;
      }
    }

    // ── Parent ─────────────────────────────────────────────────────────────
    if (userRole === "parent") {
      switch (activeTab) {
        case "notifications":        return <NotificationsScreen />;
        case "attendance":           return <AttendanceScreen />;
        case "diary":                return <DiaryScreen />;
        case "circulars":            return <CircularsScreen />;
        case "view_circular":        return <CircularDetailScreen />;
        case "homework_history":     return <HomeworkHistoryScreen />;
        case "remarks_history":      return <RemarksScreen />;
        case "student_detail":       return <StudentDetailScreen />;
        case "teacher_detail":       return <TeacherDetailScreen />;
        case "profile":              return <ProfileScreen />;
        default:                     return <HomeScreen />;
      }
    }

    // ── Student ────────────────────────────────────────────────────────────
    switch (activeTab) {
      case "attendance":             return <AttendanceScreen />;
      case "diary":                  return <DiaryScreen />;
      case "circulars":              return <CircularsScreen />;
      case "view_circular":          return <CircularDetailScreen />;
      case "analysis":               return <AnalysisScreen />;
      case "remarks_history":        return <RemarksScreen />;
      case "profile":                return <ProfileScreen />;
      default:                       return <HomeScreen />;
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
