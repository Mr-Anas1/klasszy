"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  RefreshCw,
  Users,
  GraduationCap,
  LayoutGrid,
  ShieldCheck,
  UserCheck,
  UserRound,
  Loader2,
  Building2,
  Plus,
  Sliders,
  Settings,
  Info,
} from "lucide-react";
import { useSuperAdmin } from "@/context/SuperAdminContext";
import { School, UserProfile, Student, ClassRoom } from "@/context/AppContext";
import AdminCreationForm from "./AdminCreationForm";
import SAFeatureManager from "./SAFeatureManager";

type DetailTab = "users" | "students" | "classes" | "features";

interface Props {
  school: School;
  onBack: () => void;
}

const ROLE_META = {
  admin: { label: "Admin", icon: ShieldCheck, color: "text-indigo-600", bg: "bg-indigo-50" },
  teacher: { label: "Teacher", icon: UserCheck, color: "text-violet-600", bg: "bg-violet-50" },
  parent: { label: "Parent", icon: UserRound, color: "text-amber-600", bg: "bg-amber-50" },
};

export default function SASchoolDetail({ school, onBack }: Props) {
  const { loadSchoolDetail, schoolDetail, schoolStats, loadSchoolStats } = useSuperAdmin();
  const [activeTab, setActiveTab] = useState<DetailTab>("users");
  const [loading, setLoading] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);

  const stats = schoolStats[school.id];
  const detail = schoolDetail?.school.id === school.id ? schoolDetail : null;

  const load = async () => {
    setLoading(true);
    await Promise.all([
      loadSchoolDetail(school),
      !stats ? loadSchoolStats(school.id) : Promise.resolve(),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [school.id]);

  const tabs: { id: DetailTab; label: string; icon: React.ElementType; count?: number }[] = [
    {
      id: "users",
      label: "Users",
      icon: Users,
      count: detail ? detail.users.length : undefined,
    },
    {
      id: "students",
      label: "Students",
      icon: GraduationCap,
      count: detail ? detail.students.length : undefined,
    },
    {
      id: "classes",
      label: "Classes",
      icon: LayoutGrid,
      count: detail ? detail.classes.length : undefined,
    },
    {
      id: "features",
      label: "Features",
      icon: Sliders,
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
        <div className="p-6 lg:p-8">
          <div className="flex items-start gap-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-lg"
              style={{ backgroundColor: school.themeColor ?? "#4F46E5" }}
            >
              {school.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">{school.name}</h1>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-slate-100 text-slate-700">
                      <Building2 className="w-4 h-4 mr-2" />
                      {school.code}
                    </span>
                    <span className="text-slate-500 text-sm flex items-center gap-1">
                      ID: {school.id}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowAdminForm(true)}
                    className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition flex items-center gap-2 shadow-lg shadow-indigo-500/25"
                  >
                    <Plus className="w-4 h-4" />
                    Add Admin
                  </button>
                  <button
                    onClick={load}
                    disabled={loading}
                    className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
                    title="Refresh"
                  >
                    <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        {stats && (
          <div className="px-6 lg:px-8 py-5 bg-slate-50 border-t border-slate-100">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Students", value: stats.studentCount, icon: GraduationCap, color: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "Teachers", value: stats.teacherCount, icon: UserCheck, color: "text-violet-600", bg: "bg-violet-50" },
                { label: "Parents", value: stats.parentCount, icon: UserRound, color: "text-amber-600", bg: "bg-amber-50" },
                { label: "Classes", value: stats.classCount, icon: LayoutGrid, color: "text-indigo-600", bg: "bg-indigo-50" },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="text-center">
                  <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <p className="text-2xl font-bold text-slate-800">{value}</p>
                  <p className="text-slate-500 text-sm mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 p-1.5">
        <div className="flex gap-1">
          {tabs.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === id
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{label}</span>
              {count !== undefined && (
                <span
                  className={`text-xs font-semibold rounded-full px-2 py-0.5 ${
                    activeTab === id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
        {loading && !detail ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-sm font-medium">Loading school data…</span>
          </div>
        ) : (
          <>
            {activeTab === "users" && <UsersTab users={detail?.users ?? []} />}
            {activeTab === "students" && (
              <StudentsTab students={detail?.students ?? []} classes={detail?.classes ?? []} />
            )}
            {activeTab === "classes" && (
              <ClassesTab classes={detail?.classes ?? []} students={detail?.students ?? []} />
            )}
            {activeTab === "features" && <SAFeatureManager school={school} />}
          </>
        )}
      </div>

      {/* Admin Creation Modal */}
      {showAdminForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAdminForm(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Add School Admin</h3>
                <p className="text-sm text-slate-500 mt-0.5">Create admin account for {school.name}</p>
              </div>
              <button
                onClick={() => setShowAdminForm(false)}
                className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 transition"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <AdminCreationForm 
              schoolId={school.id}
              onSuccess={() => {
                setShowAdminForm(false);
                load(); // Refresh school data
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function UsersTab({ users }: { users: UserProfile[] }) {
  if (users.length === 0) {
    return <EmptyState icon={Users} message="No users in this school" />;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">User</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Role</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Phone</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((u) => {
            const meta = ROLE_META[u.role];
            const Icon = meta.icon;
            return (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${meta.bg} rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${meta.color}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{u.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">ID: {u.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-slate-600">{u.email}</p>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${meta.bg} ${meta.color}`}
                  >
                    <Icon className="w-3 h-3" />
                    {meta.label}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-slate-600">{u.phone || "—"}</p>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function StudentsTab({ students, classes }: { students: Student[]; classes: ClassRoom[] }) {
  const classMap = Object.fromEntries(classes.map((c) => [c.id, c]));
  if (students.length === 0) {
    return <EmptyState icon={GraduationCap} message="No students in this school" />;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Student</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Username</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Class</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {students.map((s) => {
            const cls = classMap[s.classId];
            return (
              <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{s.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">ID: {s.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-mono text-sm text-slate-600">{s.username ?? "—"}</p>
                </td>
                <td className="px-6 py-4">
                  {cls ? (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700">
                      {cls.name} – {cls.section}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ClassesTab({ classes, students }: { classes: ClassRoom[]; students: Student[] }) {
  if (classes.length === 0) {
    return <EmptyState icon={LayoutGrid} message="No classes in this school" />;
  }
  const countByClass = students.reduce<Record<string, number>>((acc, s) => {
    acc[s.classId] = (acc[s.classId] ?? 0) + 1;
    return acc;
  }, {});
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Class</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Section</th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Students</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {classes.map((c) => (
            <tr key={c.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                    <LayoutGrid className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{c.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">ID: {c.id}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-700">
                  {c.section}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold bg-amber-50 text-amber-700">
                    <GraduationCap className="w-4 h-4" />
                    {countByClass[c.id] ?? 0}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="py-20 text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-slate-300" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-2">No data available</h3>
      <p className="text-slate-500">{message}</p>
    </div>
  );
}
