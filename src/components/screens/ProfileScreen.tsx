"use client";

import React from "react";
import {
  LogOut,
  Mail,
  Phone,
  ChevronRight,
  Shield,
  Bell,
  HelpCircle,
  School as SchoolIcon,
  Edit3,
} from "lucide-react";
import { useApp, StudentPersonalDetails } from "@/context/AppContext";

export default function ProfileScreen() {
  const { user, school, logout, students, studentDetails, classes } = useApp();
  if (!user) return null;

  const MENU_ITEMS = [
    { icon: Bell, label: "Notifications", sub: "Manage alerts" },
    { icon: Shield, label: "Privacy & Security", sub: "Change password" },
    { icon: HelpCircle, label: "Help & Support", sub: "FAQ, contact us" },
  ];

  const avatar = user.name.split(" ").map(n => n[0]).join("");

  // Get student and their personal details for parent
  const currentStudent = user.role === "parent" ? students.find(s => s.parentId === user.id) : null;
  const studentPersonalDetails = currentStudent ? studentDetails.find(d => d.studentId === currentStudent.id) : null;

  const parentClassLabel =
    user.role === "parent" && currentStudent?.classId
      ? (() => {
          const cls = classes.find((c) => c.id === currentStudent.classId);
          return cls ? `Class ${cls.name} · Section ${cls.section}` : null;
        })()
      : null;

  const teacherClassSummary =
    user.role === "teacher"
      ? classes
          .filter((c) => user.classIds?.includes(c.id))
          .map((c) => `${c.name} ${c.section}`)
          .slice(0, 4)
          .join(", ") || null
      : null;

  return (
    <div className="pb-36 px-5 pt-4">
      {/* Profile hero */}
      <div className="animate-scale-in glass-dark rounded-[40px] p-7 flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 bg-indigo-600/20 blur-2xl rounded-full" />

        <div className="relative z-10 w-20 h-20 bg-indigo-600 rounded-[28px] flex items-center justify-center text-white text-2xl font-black shadow-2xl shadow-indigo-900/50 mb-4 uppercase">
          {avatar}
        </div>
        <h2 className="text-xl font-black text-white">{user.name}</h2>
        <p className="text-sm text-white/50 font-bold uppercase tracking-widest mt-1">
          {user.role} Account
        </p>
        <p className="text-xs text-white/30 mt-2 font-medium">{school?.name}</p>

        {parentClassLabel && (
          <p className="mt-3 rounded-xl bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/90 ring-1 ring-white/15">
            {parentClassLabel}
          </p>
        )}
        {teacherClassSummary && (
          <p className="mt-3 max-w-[95%] text-center text-[10px] font-black uppercase leading-snug tracking-widest text-white/85 ring-1 ring-white/10 px-3 py-2 rounded-xl bg-white/5">
            Class teacher · {teacherClassSummary}
          </p>
        )}

        <div className="mt-6 flex gap-8">
          <div className="text-center">
            <p className="text-sm font-black text-white">{school?.code}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mt-0.5">School Code</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-black text-white">{user.role === 'teacher' ? user.classIds?.length || 0 : user.role === 'parent' ? user.studentIds?.length || 0 : 'Full'}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mt-0.5">{user.role === 'teacher' ? 'Classes' : user.role === 'parent' ? 'Students' : 'Access'}</p>
          </div>
        </div>

        <button className="mt-6 relative z-10 flex items-center gap-2 px-6 py-2.5 bg-white/10 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">
          <Edit3 className="w-3.5 h-3.5" />
          Edit Profile
        </button>
      </div>

      {/* Contact info */}
      <div className="animate-fade-slide-up delay-100 mt-5 bg-white rounded-[28px] p-6 border border-gray-100 space-y-5 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Account Details</p>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Email</p>
            <p className="text-sm font-bold text-gray-800">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Phone</p>
            <p className="text-sm font-bold text-gray-800">{user.phone}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0">
            <SchoolIcon className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-gray-400 tracking-wider">School ID</p>
            <p className="text-sm font-bold text-gray-800 uppercase">{user.schoolId}</p>
          </div>
        </div>
      </div>

      {/* Student Personal Details - Only show for parents */}
      {user.role === "parent" && currentStudent && (
        <div className="animate-fade-slide-up delay-150 mt-4 bg-white rounded-[28px] p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Student Personal Details</p>
            <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">
              {currentStudent.name}
            </span>
          </div>
          
          {studentPersonalDetails ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-black text-indigo-600">F</span>
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Father's Name</p>
                  <p className="text-sm font-bold text-gray-800">{studentPersonalDetails.fatherName || "Not specified"}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-rose-100 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-black text-rose-600">M</span>
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Mother's Name</p>
                  <p className="text-sm font-bold text-gray-800">{studentPersonalDetails.motherName || "Not specified"}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-black text-blue-600">D</span>
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Date of Birth</p>
                  <p className="text-sm font-bold text-gray-800">{studentPersonalDetails.dateOfBirth || "Not specified"}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-black text-red-600">B</span>
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Blood Group</p>
                  <p className="text-sm font-bold text-gray-800">{studentPersonalDetails.bloodGroup || "Not specified"}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-black text-green-600">A</span>
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Address</p>
                  <p className="text-sm font-bold text-gray-800">{studentPersonalDetails.address || "Not specified"}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-xs text-gray-400 font-medium">No personal details added yet</p>
            </div>
          )}
        </div>
      )}

      {/* Menu items */}
      <div className="animate-fade-slide-up delay-200 mt-4 bg-white rounded-[28px] border border-gray-100 overflow-hidden shadow-sm">
        {MENU_ITEMS.map((item, i) => {
          const Icon = item.icon;
          return (
            <button
              key={i}
              className="w-full flex items-center gap-4 px-6 py-4 text-left active:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
            >
              <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-gray-900">{item.label}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">{item.sub}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-200 shrink-0" />
            </button>
          );
        })}
      </div>

      {/* Logout */}
      <div className="animate-fade-slide-up delay-300 mt-4">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 bg-rose-50 border-2 border-rose-100 text-rose-500 font-black rounded-[24px] py-4 text-sm uppercase tracking-widest active:scale-[0.98] transition-all shadow-lg shadow-rose-100/20"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      <p className="text-center text-[10px] text-gray-300 mt-8 font-black uppercase tracking-[0.2em]">Klasszy LMS v2.0</p>
    </div>
  );
}
