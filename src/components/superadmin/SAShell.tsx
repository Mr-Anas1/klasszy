"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Building2,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useSuperAdmin } from "@/context/SuperAdminContext";
import SAOverview from "./SAOverview";
import SASchools from "./SASchools";
import SASchoolDetail from "./SASchoolDetail";

type Tab = "overview" | "schools" | "school_detail";

const NAV = [
  { id: "overview" as Tab, label: "Overview", icon: LayoutDashboard },
  { id: "schools" as Tab, label: "Schools", icon: Building2 },
];

export default function SAShell() {
  const { superAdmin, selectedSchool, setSelectedSchool, logout, alert, hideAlert } =
    useSuperAdmin();
  const [tab, setTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleViewSchool = (school: Parameters<typeof setSelectedSchool>[0]) => {
    setSelectedSchool(school);
    setTab("school_detail");
  };

  const handleTabChange = (t: Tab) => {
    setTab(t);
    setSidebarOpen(false);
    if (t !== "school_detail") setSelectedSchool(null);
  };

  const handleLogout = async () => {
    await logout();
  };

  const getTitle = () => {
    if (tab === "overview") return "Overview";
    if (tab === "schools") return "Schools";
    if (tab === "school_detail") return selectedSchool?.name ?? "School Detail";
    return "";
  };

  const getBreadcrumb = () => {
    if (tab === "school_detail") {
      return (
        <span className="flex items-center gap-1 text-slate-400">
          <button
            onClick={() => handleTabChange("schools")}
            className="hover:text-slate-600 transition"
          >
            Schools
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-700 font-medium">{selectedSchool?.name}</span>
        </span>
      );
    }
    return null;
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-900 flex flex-col transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-white/10">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Klasszy</p>
            <p className="text-slate-400 text-[10px] uppercase tracking-widest">Super Admin</p>
          </div>
          <button
            className="ml-auto text-slate-400 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                tab === id || (tab === "school_detail" && id === "schools")
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* User + logout */}
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 mb-1">
            <div className="w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
              {superAdmin?.name?.[0]?.toUpperCase() ?? "S"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{superAdmin?.name}</p>
              <p className="text-slate-400 text-[11px] truncate">{superAdmin?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center gap-4 px-4 lg:px-6 shrink-0">
          <button
            className="lg:hidden text-slate-500 hover:text-slate-700 transition"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            {getBreadcrumb() ?? (
              <h1 className="text-slate-800 font-semibold text-lg">{getTitle()}</h1>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {tab === "overview" && <SAOverview onViewSchool={handleViewSchool} />}
          {tab === "schools" && <SASchools onViewSchool={handleViewSchool} />}
          {tab === "school_detail" && selectedSchool && (
            <SASchoolDetail
              school={selectedSchool}
              onBack={() => handleTabChange("schools")}
            />
          )}
        </main>
      </div>

      {/* Alert toast */}
      {alert && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl text-sm font-medium max-w-sm animate-in slide-in-from-bottom-4 ${
            alert.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          <div className="flex-1">
            <p className="font-semibold">{alert.title}</p>
            <p className="font-normal opacity-90 mt-0.5">{alert.message}</p>
          </div>
          <button onClick={hideAlert} className="opacity-70 hover:opacity-100 transition mt-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
