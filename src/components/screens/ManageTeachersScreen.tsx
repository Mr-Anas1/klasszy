"use client";

import React, { useState } from "react";
import { User, Plus, Search, ChevronRight, ArrowLeft, Trash2, Mail, Users } from "lucide-react";
import { useApp, UserProfile } from "@/context/AppContext";

export default function ManageTeachersScreen() {
  const { usersList, setActiveTab, deleteUser, showAlert, showConfirm, setSelectedTeacher } = useApp();
  const [search, setSearch] = useState("");

  const teachers = usersList.filter(u => u.role === "teacher");
  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (t: UserProfile) => {
    showConfirm(
      "Delete Teacher Account",
      `Are you sure you want to remove ${t.name}? This will permanently delete their access.`,
      () => deleteUser(t.id)
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
          <h2 className="text-2xl font-black text-gray-900 leading-none">Manage Teachers</h2>
          <p className="text-sm text-gray-400 font-medium mt-1">Staff Directory & Accounts</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
        <input 
          type="text" 
          placeholder="Search by name or email..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-gray-100 rounded-3xl px-14 py-4 text-sm font-bold focus:outline-none focus:border-indigo-100 transition-all shadow-sm"
        />
      </div>

      {/* Teachers List */}
      <div className="space-y-3">
        {filteredTeachers.map((t) => (
          <div key={t.id} className="bg-white rounded-[32px] p-5 border border-gray-100 shadow-sm flex items-center gap-4 group hover:border-indigo-100 transition-all">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0">
              <span className="text-lg font-black text-indigo-600 uppercase">{t.name[0]}</span>
            </div>
            <button 
              onClick={() => {
                setSelectedTeacher(t);
                setActiveTab("teacher_detail");
              }}
              className="flex-1 min-w-0 text-left"
            >
              <h4 className="text-[15px] font-black text-gray-900 truncate">{t.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="w-3 h-3 text-gray-300" />
                <p className="text-[11px] font-bold text-gray-400 truncate">{t.email}</p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Users className="w-3 h-3 text-indigo-400" />
                <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">
                  {t.classIds?.length || 0} Classes Assigned
                </p>
              </div>
            </button>
            <button 
              onClick={() => handleDelete(t)}
              className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {filteredTeachers.length === 0 && (
          <div className="bg-white border border-dashed border-gray-200 rounded-[40px] p-16 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="font-black text-gray-900">No teachers found</h3>
            <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
}
