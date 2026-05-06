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
    <div className="space-y-5 max-w-5xl">
      {/* Header card */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 p-5">
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0"
            style={{ backgroundColor: school.themeColor ?? "#4F46E5" }}
          >
            {school.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-slate-800">{school.name}</h2>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                {school.code}
              </span>
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <Building2 className="w-3 h-3" /> ID: {school.id}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdminForm(true)}
              className="px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Admin
            </button>
            <button
              onClick={load}
              disabled={loading}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Quick stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100">
            {[
              { label: "Students", value: stats.studentCount, color: "text-emerald-600" },
              { label: "Teachers", value: stats.teacherCount, color: "text-violet-600" },
              { label: "Parents", value: stats.parentCount, color: "text-amber-600" },
              { label: "Classes", value: stats.classCount, color: "text-indigo-600" },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-slate-400 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm ring-1 ring-slate-100 w-fit">
        {tabs.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === id
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {count !== undefined && (
              <span
                className={`text-xs font-semibold rounded-full px-1.5 py-0.5 ${
                  activeTab === id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
        {loading && !detail ? (
          <div className="py-20 flex items-center justify-center gap-2 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading…</span>
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
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-left">
            <th className="px-6 py-3 font-medium">Name</th>
            <th className="px-6 py-3 font-medium">Email</th>
            <th className="px-6 py-3 font-medium">Role</th>
            <th className="px-6 py-3 font-medium">Phone</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {users.map((u) => {
            const meta = ROLE_META[u.role];
            const Icon = meta.icon;
            return (
              <tr key={u.id} className="hover:bg-slate-50/60 transition">
                <td className="px-6 py-3.5 font-medium text-slate-700">{u.name}</td>
                <td className="px-6 py-3.5 text-slate-500">{u.email}</td>
                <td className="px-6 py-3.5">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${meta.bg} ${meta.color}`}
                  >
                    <Icon className="w-3 h-3" />
                    {meta.label}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-slate-500">{u.phone || "—"}</td>
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
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-left">
            <th className="px-6 py-3 font-medium">Name</th>
            <th className="px-6 py-3 font-medium">Username</th>
            <th className="px-6 py-3 font-medium">Class</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {students.map((s) => {
            const cls = classMap[s.classId];
            return (
              <tr key={s.id} className="hover:bg-slate-50/60 transition">
                <td className="px-6 py-3.5 font-medium text-slate-700">{s.name}</td>
                <td className="px-6 py-3.5 text-slate-500 font-mono text-xs">{s.username ?? "—"}</td>
                <td className="px-6 py-3.5">
                  {cls ? (
                    <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {cls.name} – {cls.section}
                    </span>
                  ) : (
                    <span className="text-slate-300">—</span>
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
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-left">
            <th className="px-6 py-3 font-medium">Class</th>
            <th className="px-6 py-3 font-medium">Section</th>
            <th className="px-6 py-3 font-medium text-center">Students</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {classes.map((c) => (
            <tr key={c.id} className="hover:bg-slate-50/60 transition">
              <td className="px-6 py-3.5 font-semibold text-slate-700">{c.name}</td>
              <td className="px-6 py-3.5 text-slate-500">{c.section}</td>
              <td className="px-6 py-3.5 text-center font-medium text-slate-700">
                {countByClass[c.id] ?? 0}
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
    <div className="py-16 text-center">
      <Icon className="w-10 h-10 text-slate-200 mx-auto mb-3" />
      <p className="text-slate-400 font-medium">{message}</p>
    </div>
  );
}
