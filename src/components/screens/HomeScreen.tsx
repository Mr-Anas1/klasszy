"use client";

import React from "react";
import {
  Calendar,
  FileText,
  Info,
  ChevronRight,
  Zap,
  MessageSquare,
} from "lucide-react";
import { useApp, StudentPersonalDetails, Remark } from "@/context/AppContext";

export default function HomeScreen() {
  const { user, circulars, homework, attendance, setActiveTab, showAlert, setSelectedCircular, students, studentDetails, remarks, notifications } = useApp();

  // Calculate attendance from the new model (one doc per class per day)
  // For a parent/student, we look at their own records. For simplicity in demo:
  const latestAttendance = attendance[0]?.records || [];
  const presentCount = latestAttendance.filter((r) => r.status === "present").length;
  const attendancePct = latestAttendance.length > 0 
    ? Math.round((presentCount / latestAttendance.length) * 100)
    : 0;
    
  const pendingTasks = homework.length;

  // Get student and their remarks for parent
  const currentStudent = students.find(s => s.parentId === user?.id);
  const studentRemarks = currentStudent ? remarks.filter(r => r.studentId === currentStudent.id) : [];
  const studentNotifications = currentStudent ? notifications.filter((n) =>
    (n.targetType === "student" && n.targetId === currentStudent.id) ||
    (n.targetType === "class" && n.targetId === currentStudent.classId)
  ) : [];

  const [dateStr, setDateStr] = React.useState<string>("");
  const [selectedRemark, setSelectedRemark] = React.useState<Remark | null>(null);
  const [showRemarkDetail, setShowRemarkDetail] = React.useState(false);

  React.useEffect(() => {
    setDateStr(new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }));
  }, []);

  return (
    <div className="pb-36 px-5">
      {/* Greeting */}
      <div className="mt-2 animate-fade-slide-up">
        <h2 className="text-2xl font-black text-gray-900 leading-tight">
          What would you<br />like to check?
        </h2>
        <p className="text-sm text-gray-400 mt-1 font-medium">
          {dateStr}
        </p>
      </div>

      {/* Quick Cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 animate-fade-slide-up delay-100">
        <button
          onClick={() => setActiveTab("attendance")}
          className="bg-[#8BB0FE] p-6 rounded-[36px] aspect-square flex flex-col justify-between text-white relative overflow-hidden group cursor-pointer active:scale-95 transition-transform text-left"
        >
          <Calendar className="w-7 h-7 opacity-50" />
          <div>
            <h3 className="font-black text-base leading-tight">Daily<br />Attendance</h3>
            <p className="text-[11px] text-white/70 mt-1 font-medium">{attendancePct}% Present</p>
          </div>
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-500" />
          <div className="absolute -right-1 -bottom-2 w-12 h-12 bg-white/5 rounded-full" />
        </button>

        <button
          onClick={() => setActiveTab("diary")}
          className="bg-[#FF9B85] p-6 rounded-[36px] aspect-square flex flex-col justify-between text-white relative overflow-hidden group cursor-pointer active:scale-95 transition-transform text-left"
        >
          <FileText className="w-7 h-7 opacity-50" />
          <div>
            <h3 className="font-black text-base leading-tight">Homework<br />Diary</h3>
            <p className="text-[11px] text-white/70 mt-1 font-medium">{pendingTasks} Tasks pending</p>
          </div>
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-500" />
          <div className="absolute -right-1 -bottom-2 w-12 h-12 bg-white/5 rounded-full" />
        </button>
      </div>

      {/* Today's Highlight */}
      <div className="mt-6 animate-fade-slide-up delay-200">
        <div className="bg-[#1E1E26] rounded-[32px] p-6 flex items-center gap-5">
          <div className="w-14 h-14 bg-[#BA94FF]/20 rounded-2xl flex items-center justify-center shrink-0">
            <Zap className="w-7 h-7 text-[#BA94FF]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Daily XP</p>
            <h3 className="text-lg font-black text-white">You&apos;re on a 5-day streak! 🔥</h3>
            <p className="text-xs text-white/40 font-medium mt-0.5">Keep it up to reach Level 15</p>
          </div>
        </div>
      </div>

      {/* Latest Circulars */}
      <div className="mt-8 animate-fade-slide-up delay-300">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-gray-900">Official Circulars</h3>
          <button 
            onClick={() => setActiveTab("circulars")}
            className="text-[10px] font-black uppercase text-indigo-500 tracking-widest"
          >
            View All
          </button>
        </div>

        <div className="space-y-4">
          {circulars.filter(c => c.targetAudience !== "teachers").slice(0, 3).map((c) => (
            <div
              key={c.id}
              onClick={() => { setSelectedCircular(c); setActiveTab("view_circular"); }}
              className="bg-white border border-gray-100 rounded-[32px] p-5 flex items-center gap-5 shadow-sm active:scale-[0.99] transition-all cursor-pointer group hover:shadow-md hover:border-indigo-100"
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover:scale-110 ${c.targetAudience === 'both' ? 'bg-indigo-500 shadow-indigo-100' : 'bg-rose-500 shadow-rose-100'}`}
              >
                <Info className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Circular</p>
                  <span className="text-[10px] font-bold text-gray-400">{new Date(c.createdAt.seconds * 1000).toLocaleDateString()}</span>
                </div>
                <h4 className="text-[15px] font-black text-gray-900 truncate mt-0.5">{c.title}</h4>
                <p className="text-[11px] text-gray-400 font-medium line-clamp-1">{c.content}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-200 shrink-0 group-hover:text-indigo-300 transition-colors" />
            </div>
          ))}
          {circulars.filter(c => c.targetAudience !== "teachers").length === 0 && (
            <div className="bg-white border border-dashed border-gray-200 rounded-[32px] p-10 text-center">
              <Info className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-xs text-gray-400 font-medium">No official circulars yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Latest Notifications */}
      <div className="mt-8 animate-fade-slide-up delay-350">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-gray-900">Notifications</h3>
          <button
            onClick={() => setActiveTab("notifications")}
            className="text-[10px] font-black uppercase text-indigo-500 tracking-widest"
          >
            View All
          </button>
        </div>

        <div className="space-y-3">
          {studentNotifications.length > 0 ? (
            studentNotifications
              .slice()
              .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
              .slice(0, 3)
              .map((n) => (
                <button
                  key={n.id}
                  onClick={() => setActiveTab("notifications")}
                  className="w-full text-left bg-white border border-gray-100 rounded-[20px] p-4 shadow-sm cursor-pointer active:scale-[0.99] transition-all hover:shadow-md hover:border-indigo-100"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        n.type === "fee"
                          ? "bg-amber-100"
                          : n.type === "instruction"
                            ? "bg-violet-100"
                            : "bg-indigo-100"
                      }`}
                    >
                      <MessageSquare
                        className={`w-4 h-4 ${
                          n.type === "fee"
                            ? "text-amber-700"
                            : n.type === "instruction"
                              ? "text-violet-700"
                              : "text-indigo-700"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{n.type}</p>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {new Date(n.createdAt.seconds * 1000).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-gray-900 line-clamp-2">{n.title}</p>
                      <p className="text-[10px] text-gray-400 font-medium mt-1 line-clamp-1">{n.message}</p>
                    </div>
                  </div>
                </button>
              ))
          ) : (
            <div className="bg-white border border-dashed border-gray-200 rounded-[32px] p-10 text-center">
              <MessageSquare className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-xs text-gray-400 font-medium">No notifications yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Latest Remarks */}
      <div className="mt-8 animate-fade-slide-up delay-400">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-gray-900">Teacher Remarks</h3>
          <button 
            onClick={() => setActiveTab("remarks_history")}
            className="text-[10px] font-black uppercase text-indigo-500 tracking-widest"
          >
            View All
          </button>
        </div>
        
        <div className="space-y-3">
          {studentRemarks.length > 0 ? (
            studentRemarks.slice(0, 3).map((remark) => (
              <div
                key={remark.id}
                onClick={() => {
                  setSelectedRemark(remark);
                  setShowRemarkDetail(true);
                }}
                className="bg-white border border-gray-100 rounded-[20px] p-4 shadow-sm cursor-pointer active:scale-[0.99] transition-all hover:shadow-md hover:border-indigo-100"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    remark.type === 'academic' ? 'bg-blue-100' :
                    remark.type === 'behavior' ? 'bg-rose-100' : 'bg-green-100'
                  }`}>
                    <MessageSquare className={`w-4 h-4 ${
                      remark.type === 'academic' ? 'text-blue-600' :
                        remark.type === 'behavior' ? 'text-rose-600' : 'text-green-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        {remark.type}
                      </p>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {new Date(remark.createdAt.seconds * 1000).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-gray-900 line-clamp-2">{remark.message}</p>
                    <p className="text-[10px] text-gray-400 font-medium mt-1">
                      by {remark.teacherName}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border border-dashed border-gray-200 rounded-[32px] p-10 text-center">
              <MessageSquare className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-xs text-gray-400 font-medium">No remarks from teachers yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Homework Entries */}
      <div className="mt-8 animate-fade-slide-up delay-500">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-gray-900">Upcoming Tasks</h3>
          <button onClick={() => setActiveTab("diary")} className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">
            See All
          </button>
        </div>
        <div className="space-y-3">
          {homework
            .slice(0, 2)
            .map((d) => (
              <div
                key={d.id}
                className="flex items-center gap-4 bg-white rounded-[20px] p-4 border border-gray-100"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0 bg-indigo-500"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black uppercase tracking-wider text-gray-400">{d.subject}</p>
                  <p className="text-sm font-bold text-gray-800 truncate">{d.task}</p>
                </div>
                <span className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-orange-50 text-orange-500 shrink-0">
                  Soon
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
