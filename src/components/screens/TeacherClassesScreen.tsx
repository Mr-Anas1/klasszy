"use client";

import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft, BookOpen, Calendar, Users, CheckCircle2, Check, X, Plus,
} from "lucide-react";
import { useApp, UserProfile, ClassRoom } from "@/context/AppContext";

type Action = "none" | "attendance" | "homework" | "notification";
type Priority = "High" | "Medium" | "Low";

export default function TeacherClassesScreen() {
  const {
    user, classes, students, homework,
    markAttendance, assignHomework, sendNotification, addStudent,
    setActiveTab, setSelectedStudent, showAlert,
  } = useApp();
  const teacher = user as UserProfile;

  const myClasses = classes.filter(c => teacher.classIds?.includes(c.id));

  const [selectedClass, setSelectedClass] = useState<ClassRoom | null>(null);
  const [action, setAction] = useState<Action>("none");
  const [successMsg, setSuccessMsg] = useState("");

  // Attendance state
  const [tempAtt, setTempAtt] = useState<Record<string, "present" | "absent">>({});

  // Homework state
  const [hwForm, setHwForm] = useState({
    subject: "", task: "", dueDate: "", priority: "Medium" as Priority,
  });

  // Notification state
  const [notifForm, setNotifForm] = useState({
    title: "", message: "", type: "general" as "fee" | "general" | "instruction"
  });

  // Add student state
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [sData, setSData] = useState({ name: "", username: "", password: "" });

  const portalTarget = useMemo(
    () => (typeof document !== "undefined" ? document.body : null),
    []
  );

  const classStudents = selectedClass
    ? students.filter(s => s.classId === selectedClass.id)
    : [];

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const openAttendance = () => {
    const init: Record<string, "present" | "absent"> = {};
    classStudents.forEach(s => { init[s.id] = "present"; });
    setTempAtt(init);
    setAction("attendance");
  };

  const markAllPresent = () => {
    const all: Record<string, "present" | "absent"> = {};
    classStudents.forEach(s => { all[s.id] = "present"; });
    setTempAtt(all);
  };

  const handleSubmitAttendance = async () => {
    if (!selectedClass) return;
    const today = new Date().toISOString().split("T")[0];
    const records = Object.entries(tempAtt).map(([studentId, status]) => ({ studentId, status }));
    await markAttendance(selectedClass.id, today, records);
    setAction("none");
    triggerSuccess("Attendance saved!");
  };

  const handleAssignHomework = async () => {
    if (!hwForm.subject || !hwForm.task || !hwForm.dueDate || !selectedClass) {
      showAlert("Missing Info", "Subject, task description, and due date are required.", "error");
      return;
    }
    const colors = ["#8BB0FE", "#FF9B85", "#BA94FF", "#FFD580", "#6EE7B7"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    await assignHomework({
      classId: selectedClass.id,
      className: `${selectedClass.name}-${selectedClass.section}`,
      subject: hwForm.subject,
      task: hwForm.task,
      dueDate: hwForm.dueDate,
      priority: hwForm.priority,
      color,
    });
    setHwForm({ subject: "", task: "", dueDate: "", priority: "Medium" });
    setAction("none");
    triggerSuccess("Homework assigned!");
  };

  const handleSendNotification = async () => {
    if (!notifForm.title || !notifForm.message || !selectedClass) {
      showAlert("Missing Info", "Title, message, and class selection are required.", "error");
      return;
    }
    
    // Send notification to all students in this class (their parents will see it)
    for (const student of classStudents) {
      await sendNotification({
        title: notifForm.title,
        message: notifForm.message,
        type: notifForm.type,
        targetType: "student",
        targetId: student.id
      });
    }
    
    setNotifForm({ title: "", message: "", type: "general" });
    setAction("none");
    triggerSuccess("Notification sent to all parents!");
  };

  const handleAddStudent = async () => {
    if (!selectedClass) return;
    if (!sData.name || !sData.username) {
      showAlert("Missing Info", "Student name and username are required.", "error");
      return;
    }

    await addStudent({
      name: sData.name,
      classId: selectedClass.id,
      username: sData.username,
      password: sData.password || undefined,
    });

    setSData({ name: "", username: "", password: "" });
    setShowAddStudent(false);
    triggerSuccess("Student added!");
  };

  const presentCount = Object.values(tempAtt).filter(v => v === "present").length;

  // ── Class List ─────────────────────────────────────────────────────────────
  if (!selectedClass) {
    return (
      <div className="pb-36 px-5 pt-6 animate-fade-slide-up">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab("home")}
            className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm active:scale-90 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-gray-900">My Classes</h2>
            <p className="text-sm text-gray-400 mt-0.5">Select a class to manage</p>
          </div>
        </div>

        {myClasses.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-[32px] p-16 text-center">
            <BookOpen className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="font-black text-gray-900">No classes assigned</p>
            <p className="text-sm text-gray-400 mt-1">Contact your administrator to get classes assigned</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {myClasses.map(cls => {
              const clsStudents = students.filter(s => s.classId === cls.id);
              const clsHw = homework.filter(h => h.classId === cls.id);
              return (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClass(cls)}
                  className="bg-white rounded-[32px] p-6 border border-gray-100 text-left hover:border-indigo-100 active:scale-95 transition-all shadow-sm group"
                >
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center font-black text-indigo-600 text-xl mb-4 group-hover:scale-110 transition-transform">
                    {cls.section}
                  </div>
                  <h4 className="text-lg font-black text-gray-900">{cls.name}</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                    Section {cls.section}
                  </p>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-gray-300" />
                      <span className="text-[11px] font-black text-gray-400">{clsStudents.length}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-300" />
                      <span className="text-[11px] font-black text-indigo-400">{clsHw.length} hw</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── In-Class View ──────────────────────────────────────────────────────────
  return (
    <>
      {successMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-2xl text-sm font-black shadow-xl z-50 flex items-center gap-2 animate-fade-slide-up">
          <CheckCircle2 className="w-4 h-4" />
          {successMsg}
        </div>
      )}

      <div className="pb-36 px-5 pt-6 animate-fade-slide-up">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setSelectedClass(null)}
            className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm active:scale-90 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1">
            <h2 className="text-2xl font-black text-gray-900">
              {selectedClass.name} — {selectedClass.section}
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {classStudents.length} student{classStudents.length !== 1 ? "s" : ""} enrolled
            </p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={openAttendance}
            className="bg-emerald-600 text-white p-5 rounded-[28px] flex flex-col gap-3 active:scale-95 transition-transform shadow-lg shadow-emerald-200 text-left"
          >
            <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-black">Mark Attendance</p>
              <p className="text-[10px] text-white/70 mt-0.5">Today's roll call</p>
            </div>
          </button>
          <button
            onClick={() => setAction("homework")}
            className="bg-indigo-600 text-white p-5 rounded-[28px] flex flex-col gap-3 active:scale-95 transition-transform shadow-lg shadow-indigo-200 text-left"
          >
            <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-black">Assign Homework</p>
              <p className="text-[10px] text-white/70 mt-0.5">Set a new task</p>
            </div>
          </button>
        </div>

        {/* Notification Card */}
        <div className="mb-8">
          <button
            onClick={() => setAction("notification")}
            className="w-full bg-amber-500 text-white p-5 rounded-[28px] flex flex-col gap-3 active:scale-95 transition-transform shadow-lg shadow-amber-200 text-left"
          >
            <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-black">Send Notification</p>
              <p className="text-[10px] text-white/70 mt-0.5">Message all parents</p>
            </div>
          </button>
        </div>

        {/* Student List */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Students ({classStudents.length})
          </p>
          <button
            onClick={() => setShowAddStudent(true)}
            className="w-9 h-9 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 active:scale-90 transition-transform"
            aria-label="Add Student"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2">
          {classStudents.map(s => (
            <div
              key={s.id}
              className="bg-white rounded-[24px] p-4 border border-gray-100 shadow-sm flex items-center gap-4"
            >
              <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center font-black text-gray-400 text-sm uppercase shrink-0">
                {s.name[0]}
              </div>
              <button
                onClick={() => { setSelectedStudent(s); setActiveTab("student_detail"); }}
                className="flex-1 text-left"
              >
                <h4 className="text-sm font-black text-gray-900">{s.name}</h4>
                <p className="text-[10px] text-gray-400 font-medium">ID: {s.id.slice(0, 8)}</p>
              </button>
            </div>
          ))}
          {classStudents.length === 0 && (
            <div className="py-10 text-center text-gray-300 font-medium italic">
              No students enrolled yet.
            </div>
          )}
        </div>
      </div>

      {/* ── Attendance Modal ───────────────────────────────────────────────── */}
      {action === "attendance" && portalTarget && createPortal(
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-end">
          <div className="bg-white w-full rounded-t-[40px] max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-100 shrink-0">
              <div>
                <h3 className="text-xl font-black text-gray-900">Mark Attendance</h3>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                  {selectedClass.name}-{selectedClass.section} · {classStudents.length} students
                </p>
              </div>
              <button
                onClick={() => setAction("none")}
                className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Mark All Present */}
            <div className="px-4 py-3 border-b border-gray-50 shrink-0">
              <button
                onClick={markAllPresent}
                className="w-full bg-emerald-600 text-white py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest active:scale-95 transition-transform"
              >
                Mark All Present
              </button>
            </div>

            {/* Student Toggles */}
            <div className="overflow-y-auto flex-1 px-4 py-4 space-y-2">
              {classStudents.map(s => {
                const isPresent = tempAtt[s.id] === "present";
                return (
                  <button
                    key={s.id}
                    onClick={() => setTempAtt(p => ({ ...p, [s.id]: isPresent ? "absent" : "present" }))}
                    className={`w-full flex items-center gap-4 p-4 rounded-[20px] border-2 transition-all ${
                      isPresent
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-rose-200 bg-rose-50"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm uppercase shrink-0 ${
                      isPresent ? "bg-emerald-600 text-white" : "bg-rose-500 text-white"
                    }`}>
                      {s.name[0]}
                    </div>
                    <span className="flex-1 text-sm font-black text-gray-900 text-left">{s.name}</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      isPresent ? "text-emerald-600" : "text-rose-500"
                    }`}>
                      {isPresent ? "Present" : "Absent"}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Submit */}
            <div className="px-4 pb-6 pt-3 shrink-0">
              <button
                onClick={handleSubmitAttendance}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-emerald-200 active:scale-95 transition-transform"
              >
                Save Attendance · {presentCount} Present, {classStudents.length - presentCount} Absent
              </button>
            </div>
          </div>
        </div>,
        portalTarget
      )}

      {/* ── Homework Modal ─────────────────────────────────────────────────── */}
      {action === "homework" && portalTarget && createPortal(
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-end">
          <div className="bg-white w-full rounded-t-[40px] p-8 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-gray-900">Assign Homework</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {selectedClass.name}-{selectedClass.section}
                </p>
              </div>
              <button
                onClick={() => setAction("none")}
                className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Subject *"
                value={hwForm.subject}
                onChange={e => setHwForm(p => ({ ...p, subject: e.target.value }))}
                className="w-full bg-gray-50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <textarea
                placeholder="Task description *"
                value={hwForm.task}
                onChange={e => setHwForm(p => ({ ...p, task: e.target.value }))}
                rows={3}
                className="w-full bg-gray-50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
              />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Due Date *</p>
                <input
                  type="date"
                  value={hwForm.dueDate}
                  onChange={e => setHwForm(p => ({ ...p, dueDate: e.target.value }))}
                  className="w-full bg-gray-50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Priority</p>
                <div className="flex gap-2">
                  {(["High", "Medium", "Low"] as Priority[]).map(p => (
                    <button
                      key={p}
                      onClick={() => setHwForm(prev => ({ ...prev, priority: p }))}
                      className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        hwForm.priority === p
                          ? p === "High"
                            ? "bg-rose-500 text-white"
                            : p === "Medium"
                            ? "bg-amber-500 text-white"
                            : "bg-emerald-600 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleAssignHomework}
              className="w-full mt-6 bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-indigo-200 active:scale-95 transition-transform"
            >
              Assign Homework
            </button>
          </div>
        </div>,
        portalTarget
      )}

      {/* ── Notification Modal ───────────────────────────────────────────────── */}
      {action === "notification" && portalTarget && createPortal(
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-end">
          <div className="bg-white w-full rounded-t-[40px] max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-100 shrink-0">
              <div>
                <h3 className="text-xl font-black text-gray-900">Send Notification</h3>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                  Message all parents of {selectedClass.name} — {selectedClass.section}
                </p>
              </div>
              <button
                onClick={() => setAction("none")}
                className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center active:scale-90 transition-transform"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Title *</p>
                <input
                  type="text"
                  value={notifForm.title}
                  onChange={e => setNotifForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Enter notification title"
                  className="w-full bg-gray-50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Message *</p>
                <textarea
                  value={notifForm.message}
                  onChange={e => setNotifForm(p => ({ ...p, message: e.target.value }))}
                  placeholder="Enter your message to parents"
                  rows={4}
                  className="w-full bg-gray-50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-200 resize-none"
                />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Type</p>
                <div className="flex gap-2">
                  {(["general", "instruction", "fee"] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setNotifForm(prev => ({ ...prev, type }))}
                      className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        notifForm.type === type
                          ? type === "general"
                            ? "bg-amber-500 text-white"
                            : type === "instruction"
                            ? "bg-blue-500 text-white"
                            : "bg-emerald-500 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleSendNotification}
              className="w-full mx-6 mb-6 max-w-xs bg-amber-500 text-white py-3 px-6 rounded-2xl font-black text-sm shadow-lg shadow-amber-200 active:scale-95 transition-transform self-center"
            >
              Send Notification
            </button>
          </div>
        </div>,
        portalTarget
      )}

      {/* ── Add Student Modal ──────────────────────────────────────────────── */}
{showAddStudent && portalTarget && selectedClass && createPortal(
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-end">
          <div className="bg-white w-full rounded-t-[40px] max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-100 shrink-0">
              <div>
                <h3 className="text-xl font-black text-gray-900">Add Student</h3>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                  {selectedClass.name} — {selectedClass.section}
                </p>
              </div>
              <button
                onClick={() => setShowAddStudent(false)}
                className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center active:scale-90 transition-transform"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Student Name *</p>
                <input
                  type="text"
                  value={sData.name}
                  onChange={e => setSData(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-gray-50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Username *</p>
                <input
                  type="text"
                  value={sData.username}
                  onChange={e => setSData(p => ({ ...p, username: e.target.value }))}
                  className="w-full bg-gray-50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Password (optional)</p>
                <input
                  type="password"
                  value={sData.password}
                  onChange={e => setSData(p => ({ ...p, password: e.target.value }))}
                  className="w-full bg-gray-50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>

            {/* Fixed Footer for Button */}
            <div className="px-6 pb-8 pt-4 shrink-0 bg-white">
              <button
                onClick={handleAddStudent}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-indigo-200 active:scale-95 transition-transform"
              >
                Add Student
              </button>
            </div>
          </div>
        </div>,
        portalTarget
      )}
    </>
  );
}
