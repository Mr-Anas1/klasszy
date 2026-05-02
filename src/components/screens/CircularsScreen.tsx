"use client";

import React, { useState } from "react";
import { Info, ChevronRight, ArrowLeft, BookOpen, Search, Filter } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function CircularsScreen() {
  const { userRole, circulars, setActiveTab, setSelectedCircular } = useApp();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "teachers" | "parents">("all");

  const filteredCirculars = circulars.filter(c => {
    // Role based visibility
    if (userRole === "teacher" && c.targetAudience === "parents") return false;
    if (userRole === "parent" && c.targetAudience === "teachers") return false;
    
    // Search
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.content.toLowerCase().includes(search.toLowerCase());
    
    // Category filter
    const matchesFilter = filter === "all" || c.targetAudience === filter || c.targetAudience === "both";
    
    return matchesSearch && matchesFilter;
  });

  const handleViewCircular = (c: any) => {
    setSelectedCircular(c);
    setActiveTab("view_circular");
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
          <h2 className="text-2xl font-black text-gray-900 leading-none">Official Circulars</h2>
          <p className="text-sm text-gray-400 font-medium mt-1">School Notices & Updates</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="space-y-4 mb-8">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
          <input 
            type="text" 
            placeholder="Search circulars..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-3xl px-14 py-4 text-sm font-bold focus:outline-none focus:border-indigo-100 transition-all shadow-sm"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {(["all", "teachers", "parents"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === f 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                  : "bg-white text-gray-400 border border-gray-100"
              }`}
            >
              {f === "all" ? "All Notices" : f === "teachers" ? "For Staff" : "For Parents"}
            </button>
          ))}
        </div>
      </div>

      {/* Circulars List */}
      <div className="space-y-4">
        {filteredCirculars.map((c) => (
          <div
            key={c.id}
            onClick={() => handleViewCircular(c)}
            className="bg-white border border-gray-100 rounded-[32px] p-6 flex items-start gap-5 shadow-sm active:scale-[0.99] transition-all cursor-pointer group hover:shadow-md hover:border-indigo-100"
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover:scale-110 ${
                c.targetAudience === 'both' ? 'bg-indigo-500 shadow-indigo-100' : 
                c.targetAudience === 'teachers' ? 'bg-amber-500 shadow-amber-100' : 
                'bg-rose-500 shadow-rose-100'
              }`}
            >
              <Info className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                  c.targetAudience === 'both' ? 'bg-indigo-50 text-indigo-600' : 
                  c.targetAudience === 'teachers' ? 'bg-amber-50 text-amber-600' : 
                  'bg-rose-50 text-rose-600'
                }`}>
                  {c.targetAudience}
                </span>
                <span className="text-[10px] font-bold text-gray-400">{new Date(c.createdAt.seconds * 1000).toLocaleDateString()}</span>
              </div>
              <h4 className="text-[15px] font-black text-gray-900 mt-2 leading-tight">{c.title}</h4>
              <p className="text-xs text-gray-400 font-medium line-clamp-2 mt-1 leading-relaxed">{c.content}</p>
              
              <div className="flex items-center gap-2 mt-4 text-indigo-500">
                <BookOpen className="w-3 h-3" />
                <span className="text-[10px] font-black uppercase tracking-widest">Read Full Message</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-200 mt-1 shrink-0 group-hover:text-indigo-300 transition-colors" />
          </div>
        ))}

        {filteredCirculars.length === 0 && (
          <div className="bg-white border border-dashed border-gray-200 rounded-[40px] p-16 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="font-black text-gray-900">No circulars found</h3>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
