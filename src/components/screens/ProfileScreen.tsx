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
  BookOpen,
  Edit3,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function ProfileScreen() {
  const { student, logout } = useApp();
  if (!student) return null;

  const MENU_ITEMS = [
    { icon: Bell, label: "Notifications", sub: "Manage alerts" },
    { icon: Shield, label: "Privacy & Security", sub: "Change password" },
    { icon: BookOpen, label: "My Subjects", sub: `Grade ${student.grade}${student.section}` },
    { icon: HelpCircle, label: "Help & Support", sub: "FAQ, contact us" },
  ];

  return (
    <div className="pb-36 px-5">
      {/* Profile hero */}
      <div className="animate-scale-in mt-4 glass-dark rounded-[40px] p-7 flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 bg-indigo-600/20 blur-2xl rounded-full" />

        <div className="relative z-10 w-20 h-20 bg-indigo-600 rounded-[28px] flex items-center justify-center text-white text-2xl font-black shadow-2xl shadow-indigo-900/50 mb-4">
          {student.avatar}
        </div>
        <h2 className="text-xl font-black text-white">{student.name}</h2>
        <p className="text-sm text-white/50 font-medium mt-0.5">
          Grade {student.grade}{student.section} · Roll #{student.rollNo}
        </p>
        <p className="text-xs text-white/30 mt-1">{student.school}</p>

        <div className="mt-5 flex gap-6">
          {[
            { label: "Student ID", val: student.id },
            { label: "Section", val: student.section },
            { label: "Grade", val: student.grade },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-sm font-black text-white">{s.val}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <button className="mt-5 relative z-10 flex items-center gap-2 px-5 py-2.5 bg-white/10 rounded-2xl text-white text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all">
          <Edit3 className="w-3.5 h-3.5" />
          Edit Profile
        </button>
      </div>

      {/* Contact info */}
      <div className="animate-fade-slide-up delay-100 mt-5 bg-white rounded-[28px] p-5 border border-gray-100 space-y-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Contact</p>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400">Email</p>
            <p className="text-sm font-bold text-gray-800">{student.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400">Phone</p>
            <p className="text-sm font-bold text-gray-800">{student.phone}</p>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="animate-fade-slide-up delay-200 mt-4 bg-white rounded-[28px] border border-gray-100 overflow-hidden">
        {MENU_ITEMS.map((item, i) => {
          const Icon = item.icon;
          return (
            <button
              key={i}
              className="w-full flex items-center gap-4 px-5 py-4 text-left active:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
            >
              <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-400 font-medium">{item.sub}</p>
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
          className="w-full flex items-center justify-center gap-2 bg-red-50 border-2 border-red-100 text-red-500 font-black rounded-[24px] py-4 text-sm uppercase tracking-widest active:scale-[0.98] transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      <p className="text-center text-xs text-gray-300 mt-5 font-medium">EduTrack v1.0.0</p>
    </div>
  );
}
