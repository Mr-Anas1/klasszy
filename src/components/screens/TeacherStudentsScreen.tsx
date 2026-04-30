"use client";

import React, { useState } from "react";
import { Search, ChevronRight, User, Filter, MoreHorizontal, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";

const MOCK_STUDENTS_LIST = [
  { id: "1", name: "Aryan Sharma", roll: "24", status: "present", performance: "Excellent", attendance: "95%", avatar: "AS" },
  { id: "2", name: "Ishaan Gupta", roll: "12", status: "absent", performance: "Average", attendance: "78%", avatar: "IG" },
  { id: "3", name: "Meera Reddy", roll: "08", status: "present", performance: "Good", attendance: "88%", avatar: "MR" },
  { id: "4", name: "Rohan Varma", roll: "19", status: "late", performance: "Improving", attendance: "82%", avatar: "RV" },
  { id: "5", name: "Sanya Khan", roll: "05", status: "present", performance: "Excellent", attendance: "92%", avatar: "SK" },
];

export default function TeacherStudentsScreen() {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = MOCK_STUDENTS_LIST.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.roll.includes(searchTerm)
  );

  return (
    <div className="pb-36 px-5">
      <div className="mt-2 animate-fade-slide-up">
        <h2 className="text-2xl font-black text-gray-900 leading-tight">My Students</h2>
        <p className="text-sm text-gray-400 mt-1 font-medium">Class 10-A · 32 Students total</p>
      </div>

      {/* Search Bar */}
      <div className="mt-6 relative animate-fade-slide-up delay-100">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
          <Search className="w-5 h-5" />
        </div>
        <input 
          type="text"
          placeholder="Search by name or roll no..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-gray-100 rounded-[24px] py-4 pl-14 pr-5 text-sm font-semibold text-gray-900 focus:outline-none focus:border-indigo-200 transition-all shadow-sm"
        />
        <button className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Student List */}
      <div className="mt-8 space-y-3 animate-fade-slide-up delay-200">
        {filtered.map((s, i) => (
          <div 
            key={s.id}
            className="bg-white rounded-[28px] p-4 border border-gray-100 flex items-center gap-4 shadow-sm active:scale-[0.98] transition-all cursor-pointer group"
          >
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:bg-indigo-100 transition-colors">
              <span className="text-sm font-black text-indigo-700">{s.avatar}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-[15px] font-black text-gray-900 truncate">{s.name}</h4>
                <span className="text-[9px] font-black px-2 py-1 bg-gray-50 text-gray-400 rounded-lg uppercase tracking-wider">#{s.roll}</span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1">
                  {s.status === 'present' ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : 
                   s.status === 'absent' ? <AlertCircle className="w-3 h-3 text-red-500" /> :
                   <Clock className="w-3 h-3 text-amber-500" />}
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.status}</span>
                </div>
                <div className="w-1 h-1 bg-gray-200 rounded-full" />
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{s.performance}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
               <span className="text-xs font-black text-gray-900">{s.attendance}</span>
               <span className="text-[8px] font-bold text-gray-300 uppercase">Attend.</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-200 ml-1" />
          </div>
        ))}
        
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-200" />
            </div>
            <p className="font-black text-gray-400">No students found</p>
          </div>
        )}
      </div>

      {/* Quick Summary Card */}
      <div className="mt-8 animate-fade-slide-up delay-300">
        <div className="bg-[#BA94FF] rounded-[40px] p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl" />
          <div className="relative z-10">
            <h3 className="text-lg font-black">Class Summary</h3>
            <div className="mt-4 grid grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Average Attendance</p>
                <p className="text-2xl font-black">88.4%</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Pass Rate</p>
                <p className="text-2xl font-black">94%</p>
              </div>
            </div>
            <button className="mt-6 w-full bg-white text-[#BA94FF] font-black py-3 rounded-2xl text-[10px] uppercase tracking-widest active:scale-95 transition-all">
              Download Full Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
