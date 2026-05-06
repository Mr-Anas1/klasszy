"use client";

import { useEffect } from "react";
import {
  Building2,
  Users,
  GraduationCap,
  UserCheck,
  ArrowRight,
  TrendingUp,
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
    <div className="space-y-6 max-w-6xl">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map(({ label, value, icon: Icon, color, bg, ring }) => (
          <div
            key={label}
            className={`bg-white rounded-2xl p-5 shadow-sm ring-1 ${ring}`}
          >
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            <p className="text-slate-500 text-sm mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Schools summary table */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <h2 className="font-semibold text-slate-800">Schools at a glance</h2>
          </div>
          <span className="text-sm text-slate-400">{schools.length} school{schools.length !== 1 ? "s" : ""}</span>
        </div>

        {schools.length === 0 ? (
          <div className="py-16 text-center">
            <Building2 className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No schools yet</p>
            <p className="text-slate-400 text-sm mt-1">Go to Schools to create your first school.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-left">
                  <th className="px-6 py-3 font-medium">School</th>
                  <th className="px-6 py-3 font-medium">Code</th>
                  <th className="px-6 py-3 font-medium text-center">Students</th>
                  <th className="px-6 py-3 font-medium text-center">Teachers</th>
                  <th className="px-6 py-3 font-medium text-center">Classes</th>
                  <th className="px-6 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {schools.map((school) => {
                  const stats = schoolStats[school.id];
                  return (
                    <tr key={school.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ backgroundColor: school.themeColor ?? "#4F46E5" }}
                          >
                            {school.name[0]}
                          </div>
                          <span className="font-medium text-slate-700">{school.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                          {school.code}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-center text-slate-700 font-medium">
                        {stats ? stats.studentCount : "—"}
                      </td>
                      <td className="px-6 py-3.5 text-center text-slate-700 font-medium">
                        {stats ? stats.teacherCount : "—"}
                      </td>
                      <td className="px-6 py-3.5 text-center text-slate-700 font-medium">
                        {stats ? stats.classCount : "—"}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={() => onViewSchool(school)}
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium text-sm transition"
                        >
                          View
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
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
