"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import AppHeader from "@/components/layout/AppHeader";
import BottomNav from "@/components/layout/BottomNav";
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, School, Megaphone,
  Activity, Bell, User, Calendar, FileText, BarChart3, ClipboardList,
  Newspaper, ChevronRight, ShieldCheck,
} from "lucide-react";
import { isNavItemEnabled } from "@/lib/feature-registry";
import { appConfig } from "@/configs/appConfig";

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
import ManageAdminsScreen from "@/components/screens/ManageAdminsScreen";
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
import DiaryHistoryScreen from "@/components/screens/DiaryHistoryScreen";
import AnalysisScreen from "@/components/screens/AnalysisScreen";
import RemarksScreen from "@/components/screens/RemarksScreen";
import HomeworkDetailScreen from "@/components/screens/HomeworkDetailScreen";

// ─── Sidebar nav definitions ───────────────────────────────────────────────

interface NavItem {
  id: string;
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const ADMIN_NAV: NavItem[] = [
  { id: "home",                Icon: LayoutDashboard, label: "Dashboard" },
  { id: "manage_users",        Icon: Users,           label: "Users" },
  { id: "manage_admins",       Icon: ShieldCheck,     label: "Admins" },
  { id: "manage_students",     Icon: GraduationCap,   label: "Students" },
  { id: "manage_teachers",     Icon: BookOpen,        label: "Teachers" },
  { id: "manage_classes",      Icon: School,          label: "Classes" },
  { id: "admin_announcements", Icon: Megaphone,       label: "Announcements" },
  { id: "admin_activities",    Icon: Activity,        label: "Activities" },
  { id: "circulars",           Icon: Newspaper,       label: "Circulars" },
  { id: "profile",             Icon: User,            label: "Profile" },
];

const TEACHER_NAV: NavItem[] = [
  { id: "home",               Icon: LayoutDashboard, label: "Dashboard" },
  { id: "teacher_classes",    Icon: School,          label: "My Classes" },
  { id: "students",           Icon: Users,           label: "Students" },
  { id: "teacher_activities", Icon: ClipboardList,   label: "Activities" },
  { id: "circulars",          Icon: Newspaper,       label: "Circulars" },
  { id: "profile",            Icon: User,            label: "Profile" },
];

const PARENT_NAV: NavItem[] = [
  { id: "home",          Icon: LayoutDashboard, label: "Home" },
  { id: "attendance",    Icon: Calendar,        label: "Attendance" },
  { id: "diary",         Icon: FileText,        label: "Diary" },
  { id: "circulars",     Icon: Newspaper,       label: "Circulars" },
  { id: "notifications", Icon: Bell,            label: "Notifications" },
  { id: "profile",       Icon: User,            label: "Profile" },
];

const STUDENT_NAV: NavItem[] = [
  { id: "home",       Icon: LayoutDashboard, label: "Home" },
  { id: "attendance", Icon: Calendar,        label: "Attendance" },
  { id: "diary",      Icon: FileText,        label: "Diary" },
  { id: "analysis",   Icon: BarChart3,       label: "Analysis" },
  { id: "circulars",  Icon: Newspaper,       label: "Circulars" },
  { id: "profile",    Icon: User,            label: "Profile" },
];

// Map detail/sub screens back to their parent nav item
function getEffectiveTab(activeTab: string, userRole: string): string {
  const maps: Record<string, Record<string, string>> = {
    admin: {
      student_detail:  "manage_students",
      teacher_detail:  "manage_teachers",
      view_circular:   "circulars",
      homework_detail: "home",
      homework_history:"home",
    },
    teacher: {
      student_detail:  "students",
      view_circular:   "circulars",
      homework_detail: "teacher_classes",
      homework_history:"teacher_classes",
    },
    parent: {
      view_circular:   "circulars",
      diary_history:   "diary",
      remarks_history: "home",
      homework_detail: "home",
      homework_history:"home",
      student_detail:  "home",
    },
    student: {
      view_circular:   "circulars",
      diary_history:   "diary",
      remarks_history: "home",
      homework_detail: "home",
    },
  };
  return maps[userRole]?.[activeTab] ?? activeTab;
}

// ─── Desktop Sidebar ────────────────────────────────────────────────────────

function DesktopSidebar() {
  const { activeTab, setActiveTab, userRole, user, school } = useApp();

  const mergedFeatures = {
    ...(school?.features ?? {}),
    ...Object.fromEntries(Object.entries(appConfig.features).filter(([, v]) => v === false)),
  };

  const navItems =
    userRole === "admin"   ? ADMIN_NAV   :
    userRole === "teacher" ? TEACHER_NAV :
    userRole === "parent"  ? PARENT_NAV  :
                             STUDENT_NAV;

  const filtered = navItems.filter(n => isNavItemEnabled(n.id, mergedFeatures));
  const effectiveTab = getEffectiveTab(activeTab, userRole ?? "student");

  const roleLabel =
    userRole === "admin"   ? "Super Admin"    :
    userRole === "teacher" ? "Teacher Portal" :
                             "Student Portal";

  const initials = user?.name
    .split(" ").filter(Boolean)
    .map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "?";

  return (
    <aside className="hidden md:flex flex-col w-64 xl:w-72 border-r border-gray-100 h-full bg-white shrink-0">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ backgroundColor: "var(--theme-primary)", boxShadow: "0 12px 24px rgba(0,0,0,0.12)" }}
          >
            <span className="text-white font-black text-sm">K</span>
          </div>
          <div>
            <p className="font-black text-gray-900 text-sm">{appConfig.appName}</p>
            <p className="text-[9px] font-black uppercase tracking-[2.5px] text-gray-400 mt-0.5">{roleLabel}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto no-scrollbar">
        {filtered.map(({ id, Icon, label }) => {
          const isActive = effectiveTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-left ${
                isActive
                  ? "text-white shadow-lg"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
              style={isActive ? { backgroundColor: "var(--theme-primary)", boxShadow: "0 12px 24px rgba(0,0,0,0.10)" } : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="font-bold text-sm">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* User profile */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={() => setActiveTab("profile")}
          className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center active:scale-95 transition-transform shadow-sm lg:hidden"
        >
          <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-sm font-black text-indigo-700">{initials}</span>
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="font-bold text-gray-900 text-sm truncate">{user?.name}</p>
            <p className="text-[10px] text-gray-400 font-medium truncate">{user?.email}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
        </button>
      </div>
    </aside>
  );
}

// ─── App Shell ──────────────────────────────────────────────────────────────

export default function AppShell() {
  const { activeTab, userRole } = useApp();
  const mobileRootTabs =
    userRole === "admin"
      ? ["home", "circulars", "profile"]
      : userRole === "teacher"
        ? ["home", "circulars", "profile"]
        : userRole === "parent"
          ? ["home", "attendance", "diary", "circulars", "notifications", "profile"]
          : ["home", "attendance", "diary", "analysis", "circulars", "profile"];
  const showBottomNav = mobileRootTabs.includes(activeTab);

  const getScreen = () => {
    // ── Admin ──────────────────────────────────────────────────────────────
    if (userRole === "admin") {
      switch (activeTab) {
        case "manage_users":         return <ManageUsersScreen />;
        case "manage_admins":        return <ManageAdminsScreen />;
        case "manage_students":      return <ManageStudentsScreen />;
        case "manage_teachers":      return <ManageTeachersScreen />;
        case "manage_classes":       return <ManageClassesScreen />;
        case "admin_announcements":  return <AdminAnnouncementsScreen />;
        case "admin_activities":     return <AdminActivitiesScreen />;
        case "circulars":            return <CircularsScreen />;
        case "view_circular":        return <CircularDetailScreen />;
        case "homework_history":     return <HomeworkHistoryScreen />;
        case "homework_detail":      return <HomeworkDetailScreen />;
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
        case "homework_detail":      return <HomeworkDetailScreen />;
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
        case "diary_history":        return <DiaryHistoryScreen />;
        case "circulars":            return <CircularsScreen />;
        case "view_circular":        return <CircularDetailScreen />;
        case "homework_history":     return <HomeworkHistoryScreen />;
        case "homework_detail":      return <HomeworkDetailScreen />;
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
      case "diary_history":          return <DiaryHistoryScreen />;
      case "circulars":              return <CircularsScreen />;
      case "view_circular":          return <CircularDetailScreen />;
      case "analysis":               return <AnalysisScreen />;
      case "remarks_history":        return <RemarksScreen />;
      case "homework_detail":        return <HomeworkDetailScreen />;
      case "profile":                return <ProfileScreen />;
      default:                       return <HomeScreen />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white md:flex-row">
      {/* Desktop sidebar — hidden on mobile/tablet */}
      <DesktopSidebar />

      {/* Main content column */}
      <div className="flex flex-col flex-1 min-h-0">
        <AppHeader />
        <main
          key={`${userRole}-${activeTab}`}
          className="flex-1 overflow-y-auto overscroll-none no-scrollbar animate-fade-slide-up bg-[#f5f5f7]"
        >
          {getScreen()}
        </main>
      </div>

      {/* Bottom nav stays on root tabs only */}
      {showBottomNav && <BottomNav />}
    </div>
  );
}
