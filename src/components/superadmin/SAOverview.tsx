"use client";

import { useEffect } from "react";
import {
  Building2,
  Users,
  GraduationCap,
  UserCheck,
  ArrowRight,
  TrendingUp,
  Activity,
  Calendar,
  BarChart3,
} from "lucide-react";
import { useSuperAdmin } from "@/context/SuperAdminContext";
import { School } from "@/context/AppContext";

interface Props {
  onViewSchool: (school: School) => void;
}

export default function SAOverview({ onViewSchool }: Props) {
  const { schools, schoolStats, loadSchoolStats } = useSuperAdmin();

  useEffect(() => {
    schools.forEach((s) => {
      if (!schoolStats[s.id]) loadSchoolStats(s.id);
    });
  }, [schools]);

  const totalStudents = Object.values(schoolStats).reduce((s, v) => s + v.studentCount, 0);
  const totalTeachers = Object.values(schoolStats).reduce((s, v) => s + v.teacherCount, 0);
  const totalParents = Object.values(schoolStats).reduce((s, v) => s + v.parentCount, 0);

  const summaryCards = [
    {
      label: "Total Schools",
      value: schools.length,
      icon: Building2,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      ring: "ring-indigo-100",
    },
    {
      label: "Total Students",
      value: totalStudents,
      icon: GraduationCap,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      ring: "ring-emerald-100",
    },
    {
      label: "Total Teachers",
      value: totalTeachers,
      icon: UserCheck,
      color: "text-violet-600",
      bg: "bg-violet-50",
      ring: "ring-violet-100",
    },
    {
      label: "Total Parents",
      value: totalParents,
      icon: Users,
      color: "text-amber-600",
      bg: "bg-amber-50",
      ring: "ring-amber-100",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Super Admin Dashboard</h1>
        <p className="text-slate-500">Manage all schools and platform-wide settings</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {summaryCards.map(({ label, value, icon: Icon, color, bg, ring }) => (
          <div
            key={label}
            className={`bg-white rounded-2xl p-6 shadow-sm ring-1 ${ring} hover:shadow-md transition-shadow`}
          >
            <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <p className="text-3xl font-bold text-slate-800">{value}</p>
            <p className="text-slate-500 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Schools Table */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 text-lg">All Schools</h2>
              <p className="text-sm text-slate-500">{schools.length} school{schools.length !== 1 ? "s" : ""} registered</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Activity className="w-4 h-4" />
            <span>Live</span>
          </div>
        </div>

        {schools.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No schools yet</h3>
            <p className="text-slate-500 mb-6">Create your first school to get started with the platform</p>
            <button
              onClick={() => {/* Navigate to schools tab */}}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
            >
              Create School
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">School</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Students</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Teachers</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Classes</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schools.map((school) => {
                  const stats = schoolStats[school.id];
                  return (
                    <tr key={school.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                            style={{ backgroundColor: school.themeColor ?? "#4F46E5" }}
                          >
                            {school.name[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{school.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">ID: {school.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                          {school.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <GraduationCap className="w-4 h-4 text-emerald-500" />
                          <span className="font-semibold text-slate-700">
                            {stats ? stats.studentCount : "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <UserCheck className="w-4 h-4 text-violet-500" />
                          <span className="font-semibold text-slate-700">
                            {stats ? stats.teacherCount : "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Calendar className="w-4 h-4 text-amber-500" />
                          <span className="font-semibold text-slate-700">
                            {stats ? stats.classCount : "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onViewSchool(school)}
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-all"
                          >
                            View Details
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
