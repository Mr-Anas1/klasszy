"use client";

import React from "react";
import { ArrowLeft, Clock, User, Image as ImageIcon } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function CircularDetailScreen() {
  const { selectedCircular, setActiveTab, setSelectedCircular } = useApp();

  const handleBack = () => {
    setSelectedCircular(null);
    setActiveTab("circulars"); // Or go back to whatever the previous tab was, but circulars is a safe default
  };

  if (!selectedCircular) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-5 text-center">
        <p className="text-gray-400 font-bold mb-4">No circular selected.</p>
        <button 
          onClick={() => setActiveTab("home")}
          className="px-6 py-3 bg-indigo-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest"
        >
          Go Home
        </button>
      </div>
    );
  }

  const date = new Date(selectedCircular.createdAt.seconds * 1000).toLocaleDateString(undefined, { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="pb-36 px-5 pt-4 animate-fade-slide-up min-h-full bg-[#f5f5f7]">
      {/* Header Controls */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1"></div>
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
          selectedCircular.targetAudience === 'both' ? 'bg-indigo-100 text-indigo-700' : 
          selectedCircular.targetAudience === 'teachers' ? 'bg-amber-100 text-amber-700' : 
          'bg-rose-100 text-rose-700'
        }`}>
          Audience: {selectedCircular.targetAudience}
        </span>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight mb-4">
            {selectedCircular.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-gray-50">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{date}</span>
            </div>
            {/* If we had author names, we'd show it here. For now, just a generic icon */}
            <div className="flex items-center gap-1.5 text-gray-400">
              <User className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Admin</span>
            </div>
          </div>

          {selectedCircular.imageUrl && (
            <div className="mb-8 rounded-3xl overflow-hidden border border-gray-100 bg-gray-50 shadow-inner group relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={selectedCircular.imageUrl} 
                alt={selectedCircular.title} 
                className="w-full h-auto object-cover max-h-[400px] transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-3xl pointer-events-none" />
            </div>
          )}

          <div className="prose prose-sm prose-p:leading-relaxed prose-p:text-gray-600 font-medium">
            {selectedCircular.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
