"use client";

import React, { useState } from "react";
import { ArrowLeft, Search, Calendar, BookOpen, Clock, FileText, Filter } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function HomeworkHistoryScreen() {
  const { user, userRole, homework, setActiveTab } = useApp();
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");

  const filteredHomework = homework.filter(h => {
    // Role based filtering
    const isOwner = h.createdBy === user?.id;
    const isAdmin = userRole === "admin";
    const isRelevant = isOwner || isAdmin;
    if (!isRelevant) return false;

    // Search
    const matchesSearch = h.subject.toLowerCase().includes(search.toLowerCase()) || h.task.toLowerCase().includes(search.toLowerCase());
    
    // Subject filter
    const matchesSubject = subjectFilter === "All" || h.subject === subjectFilter;
    
    return matchesSearch && matchesSubject;
  });

  const subjects = ["All", ...Array.from(new Set(homework.map(h => h.subject)))];

  return (
    <div className="pb-36 px-5 pt-4 animate-fade-slide-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex-1">
          <h2 className="text-2xl font-black text-gray-900 leading-none">Homework History</h2>
          <p className="text-sm text-gray-400 mt-0.5">View past assignments</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="space-y-4 mb-8">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-3xl px-14 py-4 text-sm font-bold focus:outline-none focus:border-indigo-100 transition-all shadow-sm"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {subjects.map((s) => (
            <button
              key={s}
              onClick={() => setSubjectFilter(s)}
              className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                subjectFilter === s 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                  : "bg-white text-gray-400 border border-gray-100"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Homework List */}
      <div className="space-y-6">
        {filteredHomework.map((h) => (
          <div
            key={h.id}
            className="bg-white border border-gray-100 rounded-[40px] p-6 shadow-sm relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">
                  {h.subject}
                </span>
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                  h.priority === 'High' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'
                }`}>
                  {h.priority}
                </span>
              </div>
              <span className="text-[10px] font-bold text-gray-300">{new Date(h.createdAt.seconds * 1000).toLocaleDateString()}</span>
            </div>

            <h4 className="text-xl font-black text-gray-900 mb-2 leading-tight">{h.task}</h4>
            
            <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-50">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-300" />
                <div migrant-className="flex flex-col">
                  <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Due Date</p>
                  <p className="text-xs font-bold text-gray-900">{h.dueDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-300" />
                <div migrant-className="flex flex-col">
                  <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Class</p>
                  <p className="text-xs font-bold text-gray-900">{h.className}</p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredHomework.length === 0 && (
          <div className="bg-white border border-dashed border-gray-200 rounded-[40px] p-16 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="font-black text-gray-900">No tasks found</h3>
            <p className="text-sm text-gray-400 mt-1">Check your filters or post a new task</p>
          </div>
        )}
      </div>
    </div>
  );
}
