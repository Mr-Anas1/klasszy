"use client";

import React from "react";
import { Calendar, FileText, Bell, MessageSquare, Send, BellRing, CalendarClock } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { isNavItemEnabled } from "@/lib/feature-registry";
import { computeStudentAttendanceStats } from "@/lib/attendance-utils";

export default function HomeScreen() {
  const {
    user, circulars, homework, attendance,
    setActiveTab, students, remarks, notifications,
    applyLeave, showAlert, leaveApplications, markNotificationsAsRead,
    school,
    classes,
  } = useApp();

  const [showLeaveForm, setShowLeaveForm] = React.useState(false);
  const [leaveForm, setLeaveForm] = React.useState({ fromDate: "", toDate: "", reason: "" });

  const dateStr = React.useMemo(
    () => new Date().toLocaleDateString("en-IN", {
      weekday: "long", day: "numeric", month: "long",
    }),
    []
  );

  // Find this parent's student(s) - use same logic as AttendanceScreen
  const myStudents = students.filter(s => s.parentId === user?.id);
  const currentStudent = myStudents[0];

  const classLabel = React.useMemo(() => {
    if (!currentStudent?.classId) return null;
    const cls = classes.find((c) => c.id === currentStudent.classId);
    return cls ? `Class ${cls.name} · Section ${cls.section}` : null;
  }, [classes, currentStudent?.classId]);

  const attStats = React.useMemo(
    () =>
      computeStudentAttendanceStats(
        currentStudent?.id,
        currentStudent?.classId,
        attendance
      ),
    [attendance, currentStudent?.classId, currentStudent?.id]
  );
  const attendancePct = attStats.ratePct;

  // Handle leave application
  const handleApplyLeave = async () => {
    if (!currentStudent) {
      showAlert("Error", "No student linked to this account.", "error");
      return;
    }
    if (!leaveForm.fromDate || !leaveForm.toDate || !leaveForm.reason.trim()) {
      showAlert("Missing Info", "Please fill From Date, To Date, and Reason.", "error");
      return;
    }

    await applyLeave({
      studentId: currentStudent.id,
      fromDate: leaveForm.fromDate,
      toDate: leaveForm.toDate,
      reason: leaveForm.reason
    });
    setLeaveForm({ fromDate: "", toDate: "", reason: "" });
    setShowLeaveForm(false);
    showAlert("Submitted", "Leave application submitted to teacher.", "success");
  };

  // Homework count — scoped to student's class
  const classHomework = currentStudent
    ? homework.filter(h => h.classId === currentStudent.classId)
    : homework;

  // Remarks for this student
  const studentRemarks = currentStudent
    ? remarks.filter(r => r.studentId === currentStudent.id)
    : [];

  // Notifications for this student
  const studentNotifs = currentStudent
    ? notifications.filter(n =>
        (n.targetType === "student" && n.targetId === currentStudent.id) ||
        (n.targetType === "class" && n.targetId === currentStudent.classId)
      )
    : [];

  const firstName = user?.name?.split(" ")[0] || "there";

  const cards = [
    {
      id: "attendance",
      Icon: Calendar,
      title: "Attendance",
      stat: attStats.totalMarked > 0 ? `${attendancePct}%` : "--",
      meta: attStats.totalMarked > 0 ? "attendance rate" : "no records",
      bg: "bg-[#5B6EF5]",     // indigo-blue
    },
    {
      id: "diary",
      Icon: FileText,
      title: "Homework",
      stat: String(classHomework.length),
      meta: classHomework.length === 1 ? "task pending" : "tasks pending",
      bg: "bg-[#FF7B61]",     // coral
    },
    {
      id: "circulars",
      Icon: Bell,
      title: "Circulars",
      stat: String(circulars.filter(c => c.targetAudience !== "teachers").length),
      meta: "school notices",
      bg: "bg-[#3DBAA2]",     // teal
    },
    {
      id: "remarks_history",
      Icon: MessageSquare,
      title: "Remarks",
      stat: String(studentRemarks.length),
      meta: "from teachers",
      bg: "bg-[#9B72CF]",     // purple
    },
    {
      id: "apply_leave",
      Icon: Send,
      title: "Apply Leave",
      stat: "+",
      meta: "quick apply",
      bg: "bg-[#10B981]",     // emerald
    },
    {
      id: "notifications",
      Icon: BellRing,
      title: "Notifications",
      stat: String(notifications.filter(n => 
        !n.isRead && (
          (n.targetType === "student" && n.targetId === currentStudent?.id) ||
          (n.targetType === "class" && n.targetId === currentStudent?.classId)
        )
      ).length),
      meta: "new messages",
      bg: "bg-[#F59E0B]",     // amber
      hasUnread: notifications.filter(n => 
        !n.isRead && (
          (n.targetType === "student" && n.targetId === currentStudent?.id) ||
          (n.targetType === "class" && n.targetId === currentStudent?.classId)
        )
      ).length > 0,
    },
    {
      id: "timetable",
      Icon: CalendarClock,
      title: "Timetable",
      stat: "Open",
      meta: "class schedule",
      bg: "bg-[#0EA5E9]",
    },
  ];

  return (
    <div className="pb-36 px-5 pt-6 animate-fade-slide-up">
      {/* Greeting */}
      <div className="mb-8">
        <p className="text-sm text-gray-400 font-medium">{dateStr}</p>
        <h2 className="text-2xl font-black text-gray-900 leading-tight mt-1">
          Hello, {firstName}!
        </h2>
        <p className="text-sm text-gray-400 font-medium mt-0.5">
          {currentStudent ? `Viewing: ${currentStudent.name}` : "What would you like to check?"}
        </p>
        {classLabel && (
          <div className="mt-3 inline-flex items-center rounded-2xl bg-indigo-50 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-indigo-700 ring-1 ring-indigo-100">
            {classLabel}
          </div>
        )}
      </div>

      {/* Section label */}
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Overview</p>

      {/* Card Grid - 6 cards layout */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr">
        {cards
          .filter((c) => isNavItemEnabled(c.id, school?.features))
          .map((card) => (
          <button
            key={card.id}
            onClick={() => {
              if (card.id === "apply_leave") {
                setShowLeaveForm(true);
              } else if (card.id === "notifications") {
                // Mark all notifications as read when opening notifications screen
                markNotificationsAsRead();
                setActiveTab(card.id);
              } else {
                setActiveTab(card.id);
              }
            }}
            className={`${card.bg} p-6 lg:p-4 rounded-[32px] lg:rounded-xl aspect-square lg:aspect-auto lg:h-44 flex flex-col justify-between text-white relative overflow-hidden group active:scale-95 transition-transform text-left`}
          >
            {/* Icon */}
            <div className="relative">
              <card.Icon className="w-7 h-7 lg:w-5 lg:h-5 text-white/60" />
              {/* Red indicator dot for unread notifications */}
              {card.id === "notifications" && (card as any).hasUnread && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
              )}
            </div>

            {/* Stats + Label */}
            <div className="min-w-0">
              <p className="text-2xl font-black leading-none tabular-nums sm:text-3xl truncate max-w-full">
                {card.stat}
              </p>
              <h3 className="text-sm font-black mt-1 leading-tight">{card.title}</h3>
              <p className="text-[10px] text-white/60 font-medium mt-0.5">{card.meta}</p>
            </div>

            {/* Decorative circles */}
            <div className="absolute -right-5 -top-5 w-20 h-20 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
            <div className="absolute -right-2 -bottom-4 w-12 h-12 bg-white/5 rounded-full pointer-events-none" />
          </button>
        ))}
      </div>

      {/* Notifications strip */}
      {studentNotifs.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Recent Notifications
            </p>
            <button
              onClick={() => setActiveTab("notifications")}
              className="text-[10px] font-black uppercase tracking-widest text-indigo-500"
            >
              View All
            </button>
          </div>
          <div className="space-y-2">
            {studentNotifs.slice(0, 3).map(n => (
              <div
                key={n.id}
                className="bg-white rounded-[20px] p-4 border border-gray-100 shadow-sm flex items-start gap-3"
              >
                <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-gray-900 truncate">{n.title}</p>
                  <p className="text-xs text-gray-400 font-medium line-clamp-1 mt-0.5">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leave Application Modal */}
      {showLeaveForm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLeaveForm(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[40px] p-8 animate-scale-in shadow-2xl">
            <h3 className="text-xl font-black text-gray-900 mb-6 text-center">Apply for Leave</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-2 block">From</label>
                  <input
                    value={leaveForm.fromDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, fromDate: e.target.value })}
                    placeholder="YYYY-MM-DD"
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-2 block">To</label>
                  <input
                    value={leaveForm.toDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, toDate: e.target.value })}
                    placeholder="YYYY-MM-DD"
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-2 block">Reason</label>
                <textarea
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  placeholder="Reason for leave..."
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none transition-all min-h-[90px] resize-none"
                />
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => setShowLeaveForm(false)} 
                className="flex-1 bg-gray-50 text-gray-400 font-black py-4 rounded-2xl text-xs uppercase tracking-widest"
              >
                Cancel
              </button>
              <button 
                onClick={handleApplyLeave}
                className="flex-1 bg-emerald-600 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-emerald-100"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
