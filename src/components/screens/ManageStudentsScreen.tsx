"use client";

import React, { useState } from "react";
import { Search, ChevronRight, ArrowLeft, Trash2, GraduationCap, School, User } from "lucide-react";
import { useApp, Student } from "@/context/AppContext";

export default function ManageStudentsScreen() {
  const { students, classes, setActiveTab, deleteStudent, showAlert, showConfirm } = useApp();
  const [search, setSearch] = useState("");

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.id.toLowerCase().includes(search.toLowerCase())
  );

  const getClassName = (classId: string) => {
    const cls = classes.find(c => c.id === classId);
    return cls ? `${cls.name}-${cls.section}` : "Unassigned";
  };

  const handleDelete = (s: Student) => {
    showConfirm(
      "Delete Student Record",
      `Are you sure you want to remove ${s.name}? This will also delete their parent's linked account.`,
      () => deleteStudent(s.id)
    );
  };

  return (
    <div className="pb-36 px-5 pt-4 animate-fade-slide-up">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => setActiveTab("home")}
          className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm active:scale-90"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-black text-gray-900 leading-none">Manage Students</h2>
          <p className="text-sm text-gray-400 font-medium mt-1">Student Directory & Enrollment</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
        <input 
          type="text" 
          placeholder="Search by name or ID..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-gray-100 rounded-3xl px-14 py-4 text-sm font-bold focus:outline-none focus:border-indigo-100 transition-all shadow-sm"
        />
      </div>

      {/* Students List */}
      <div className="space-y-3">
        {filteredStudents.map((s) => (
          <div key={s.id} className="bg-white rounded-[32px] p-5 border border-gray-100 shadow-sm flex items-center gap-4 group hover:border-indigo-100 transition-all">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
              <GraduationCap className="w-7 h-7 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[15px] font-black text-gray-900 truncate">{s.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <School className="w-3 h-3 text-gray-300" />
                <p className="text-[11px] font-bold text-gray-400 truncate">Class: {getClassName(s.classId)}</p>
              </div>
              <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-2">ID: {s.id.slice(0, 8)}</p>
            </div>
            <button 
              onClick={() => handleDelete(s)}
              className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {filteredStudents.length === 0 && (
          <div className="bg-white border border-dashed border-gray-200 rounded-[40px] p-16 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="font-black text-gray-900">No students found</h3>
            <p className="text-sm text-gray-400 mt-1">Try searching for a different name</p>
          </div>
        )}
      </div>
    </div>
  );
}
