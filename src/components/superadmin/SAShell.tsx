"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Building2,
  Plus,
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

type Tab = "overview" | "schools" | "add_school" | "school_detail";

const NAV = [
  { id: "overview" as Tab, label: "Overview", icon: LayoutDashboard },
  { id: "schools" as Tab, label: "Schools", icon: Building2 },
  { id: "add_school" as Tab, label: "Add School", icon: Plus },
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
    if (tab === "add_school") return "Add New School";
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
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-72 bg-slate-900 flex flex-col transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center gap-4 px-6 border-b border-white/10">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-white font-bold text-lg leading-tight">Klasszy</h1>
            <p className="text-slate-400 text-xs uppercase tracking-wider font-medium">Super Admin Portal</p>
          </div>
          <button
            className="ml-2 text-slate-400 hover:text-white transition-colors lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">Main</p>
            {NAV.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleTabChange(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  tab === id || (tab === "school_detail" && id === "schools")
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="font-medium">{label}</span>
                {tab === id && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full" />
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* User + logout */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 shadow">
              {superAdmin?.name?.[0]?.toUpperCase() ?? "S"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{superAdmin?.name}</p>
              <p className="text-slate-400 text-xs truncate">{superAdmin?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 lg:h-20 bg-white border-b border-slate-200 flex items-center gap-4 px-4 lg:px-6 shrink-0">
          <button
            className="lg:hidden text-slate-500 hover:text-slate-700 transition-colors p-2 rounded-lg hover:bg-slate-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            {getBreadcrumb() ?? (
              <div>
                <h1 className="text-slate-800 font-bold text-xl lg:text-2xl">{getTitle()}</h1>
                <p className="text-slate-500 text-sm mt-1">
                  {tab === "overview" && "Platform-wide overview and statistics"}
                  {tab === "schools" && "Manage all registered schools"}
                  {tab === "add_school" && "Create a new school and set up its initial admin"}
                  {tab === "school_detail" && `Manage ${selectedSchool?.name}`}
                </p>
              </div>
            )}
          </div>
          {/* Quick actions could go here */}
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto bg-slate-50/50">
          <div className="p-4 lg:p-6 max-w-7xl mx-auto">
            {tab === "overview" && <SAOverview onViewSchool={handleViewSchool} />}
            {tab === "schools" && <SASchools onViewSchool={handleViewSchool} />}
            {tab === "add_school" && <SASchools onViewSchool={handleViewSchool} showCreateModal={true} />}
            {tab === "school_detail" && selectedSchool && (
              <SASchoolDetail
                school={selectedSchool}
                onBack={() => handleTabChange("schools")}
              />
            )}
          </div>
        </main>
      </div>

      {/* Alert toast */}
      {alert && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-start gap-4 px-6 py-4 rounded-2xl shadow-xl text-sm font-medium max-w-md animate-in slide-in-from-bottom-4 ${
            alert.type === "success"
              ? "bg-emerald-600 text-white border border-emerald-500"
              : "bg-red-600 text-white border border-red-500"
          }`}
        >
          <div className="flex-1">
            <p className="font-semibold text-base">{alert.title}</p>
            <p className="font-normal opacity-90 mt-1 text-sm">{alert.message}</p>
          </div>
          <button 
            onClick={hideAlert} 
            className="opacity-70 hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
