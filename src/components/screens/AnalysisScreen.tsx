"use client";

import React from "react";
import { BarChart3, ChevronRight, Trophy, TrendingUp, Star } from "lucide-react";
import { useApp } from "@/context/AppContext";

const SUBJECT_GRADES = [
  { subject: "Mathematics", grade: "A+", score: 92, color: "#8BB0FE" },
  { subject: "English", grade: "A", score: 85, color: "#FF9B85" },
  { subject: "Science", grade: "A+", score: 94, color: "#BA94FF" },
  { subject: "History", grade: "B+", score: 78, color: "#FFD580" },
  { subject: "Computer Science", grade: "A+", score: 97, color: "#6EE7B7" },
];

const ACHIEVEMENTS = [
  { title: "Top Scorer", subtitle: "Science Exam", icon: Trophy, color: "bg-amber-400" },
  { title: "Perfect Week", subtitle: "7-day streak", icon: Star, color: "bg-violet-500" },
  { title: "Fast Learner", subtitle: "Completed 10 tasks", icon: TrendingUp, color: "bg-indigo-500" },
];

export default function AnalysisScreen() {
  const { skillStats } = useApp();

  const xp = 750;
  const xpMax = 1000;
  const level = 14;

  return (
    <div className="pb-36 px-5">
      {/* XP Level Card */}
      <div className="animate-scale-in mt-4 bg-[#BA94FF] rounded-[48px] px-8 py-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -translate-x-1/2 translate-y-1/2" />

        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Current Level</p>
            <div className="flex items-end gap-2 mt-1">
              <h3 className="text-5xl font-black">Lv.{level}</h3>
              <div className="mb-2 px-3 py-1 bg-white/20 rounded-xl">
                <span className="text-[10px] font-black uppercase tracking-widest">Top 5%</span>
              </div>
            </div>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-[20px] flex items-center justify-center">
            <BarChart3 className="w-8 h-8" />
          </div>
        </div>

        <div className="mt-6 relative z-10">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">
            <span>XP Progress</span>
            <span>{xp} / {xpMax}</span>
          </div>
          <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-700"
              style={{ width: `${(xp / xpMax) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-white/50 font-medium mt-2">{xpMax - xp} XP needed for Level {level + 1}</p>
        </div>
      </div>

      {/* Skill Stats */}
      <div className="mt-8 animate-fade-slide-up delay-100">
        <h3 className="text-lg font-black text-gray-900 mb-4">Skill Breakdown</h3>
        <div className="space-y-4">
          {skillStats.map((s, i) => (
            <div
              key={i}
              className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${s.bgColor.replace('bg-', 'bg-').replace('-50', '-500')}`} />
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">{s.label}</p>
                </div>
                <span className={`text-lg font-black ${s.color}`}>{s.value}%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${s.value}%`,
                    backgroundColor: s.color.includes("indigo")
                      ? "#6366f1"
                      : s.color.includes("violet")
                      ? "#8b5cf6"
                      : s.color.includes("blue")
                      ? "#3b82f6"
                      : "#10b981",
                    boxShadow: '0 0 12px rgba(99, 102, 241, 0.3)'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subject Grades */}
      <div className="mt-10 animate-fade-slide-up delay-200">
        <h3 className="text-lg font-black text-gray-900 mb-4">Subject Grades</h3>
        <div className="space-y-4">
          {SUBJECT_GRADES.map((sg, i) => (
            <div
              key={i}
              className="bg-white rounded-[28px] px-6 py-5 border border-gray-100 flex items-center gap-5 shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
            >
              <div
                className="w-1.5 h-12 rounded-full shrink-0"
                style={{ backgroundColor: sg.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-end mb-1.5">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">{sg.subject}</p>
                  <p className="text-[10px] font-bold text-gray-300">{sg.score}%</p>
                </div>
                <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${sg.score}%`, backgroundColor: sg.color }}
                  />
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0">
                <p className="text-xl font-black text-gray-900">{sg.grade}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="mt-6 animate-fade-slide-up delay-300">
        <h3 className="text-lg font-black text-gray-900 mb-4">Achievements</h3>
        <div className="grid grid-cols-3 gap-3">
          {ACHIEVEMENTS.map((a, i) => {
            const Icon = a.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-[20px] p-4 border border-gray-100 flex flex-col items-center text-center gap-2"
              >
                <div className={`w-10 h-10 ${a.color} rounded-2xl flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-[11px] font-black text-gray-900 leading-tight">{a.title}</p>
                <p className="text-[10px] text-gray-400 font-medium">{a.subtitle}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
