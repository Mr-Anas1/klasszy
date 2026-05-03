"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useApp, Student, ClassRoom, UserProfile, Circular } from "@/context/AppContext";
import { 
  Users, 
  ChevronRight, 
  ChevronDown, 
  CheckCircle2, 
  FileEdit, 
  MessageSquare,
  Plus,
  ArrowLeft,
  X,
  Check,
  Info,
  BookOpen,
  Bell
} from "lucide-react";

export default function TeacherHomeScreen() {
  const { user, classes, students, circulars, homework, addStudent, markAttendance, assignHomework, showAlert, setSelectedCircular, setActiveTab, setSelectedStudent, sendNotification } = useApp();
  const teacher = user as UserProfile;

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [showHomework, setShowHomework] = useState(false);
  const [showSendNotification, setShowSendNotification] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [tempAttendance, setTempAttendance] = useState<Record<string, "present" | "absent">>({});
  const [hwForm, setHwForm] = useState({ subject: "", task: "", dueDate: "", priority: "Medium" as "High" | "Medium" | "Low" });
  const [sData, setSData] = useState({ name: "", username: "", password: "" });
  const [nData, setNData] = useState({
    title: "",
    message: "",
    type: "general" as "fee" | "general" | "instruction",
    targetType: "class" as "student" | "class",
    targetId: ""
  });
  const [notifStudentQuery, setNotifStudentQuery] = useState("");

  const portalTarget = useMemo(() => {
    if (typeof document === "undefined") return null;
    return document.body;
  }, []);

  const anyTeacherOverlayOpen = showAddStudent || showHomework || showAttendance || showSendNotification;

  useEffect(() => {
    if (!anyTeacherOverlayOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [anyTeacherOverlayOpen]);

  const handleSendNotification = async () => {
    if (!nData.title || !nData.message || !nData.targetId) {
      showAlert("Missing Info", "Please fill in Title, Message, and Target.", "error");
      return;
    }
    await sendNotification(nData);
    setShowSendNotification(false);
    setNData({ title: "", message: "", type: "general", targetType: "class", targetId: "" });
    setNotifStudentQuery("");
    triggerSuccess("Notification sent!");
  };

  const teacherClasses = classes.filter(c => teacher.classIds?.includes(c.id));
  const selectedClass = classes.find(c => c.id === selectedClassId);
  const filteredStudents = students.filter(s => s.classId === selectedClassId);

  const filteredNotifStudents = filteredStudents.filter((s) =>
    s.name.toLowerCase().includes(notifStudentQuery.trim().toLowerCase())
  );

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const startAttendance = () => {
    const initial: Record<string, "present" | "absent"> = {};
    filteredStudents.forEach(s => initial[s.id] = "present");
    setTempAttendance(initial);
    setShowAttendance(true);
  };

  const handleSaveAttendance = async () => {
    if (selectedClassId) {
      const date = new Date().toISOString().split('T')[0];
      const records = Object.entries(tempAttendance).map(([studentId, status]) => ({ studentId, status }));
      await markAttendance(selectedClassId, date, records);
      setShowAttendance(false);
      triggerSuccess("Attendance saved!");
    }
  };

  const setAllPresent = () => {
    const updated = { ...tempAttendance };
    Object.keys(updated).forEach(id => updated[id] = "present");
    setTempAttendance(updated);
  };

  const handleSaveHomework = async () => {
    if (selectedClassId && selectedClass) {
      const { subject, task, dueDate, priority } = hwForm;
      
      const colors = ["#8BB0FE", "#FF9B85", "#BA94FF", "#FFD580", "#6EE7B7"];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      if (subject && task && dueDate) {
        try {
          await assignHomework({
            classId: selectedClassId,
            className: `${selectedClass.name}-${selectedClass.section}`,
            subject,
            task,
            dueDate,
            priority,
            color: randomColor
          });
          setShowHomework(false);
          setHwForm({ subject: "", task: "", dueDate: "", priority: "Medium" });
          triggerSuccess("Homework assigned!");
        } catch (err: any) {
          showAlert("Error", "Failed to assign homework. Please try again.", "error");
        }
      } else {
        showAlert("Missing Info", "Please fill in all fields (Subject, Task, and Due Date).", "error");
      }
    }
  };

  if (!selectedClassId) {
    return (
      <div className="pb-36 px-5 pt-4 animate-fade-slide-up">
        <h2 className="text-2xl font-black text-gray-900 leading-tight">My Classes</h2>
        <p className="text-sm text-gray-400 mt-1 font-medium">Select a class to start your session</p>

        <div className="mt-8 grid grid-cols-2 gap-4">
          {teacherClasses.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedClassId(c.id)}
              className="bg-white border border-gray-100 rounded-[32px] p-6 text-left shadow-sm active:scale-95 transition-all group hover:border-indigo-200"
            >
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-gray-900">{c.name}-{c.section}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 mt-1">Manage Class</p>
            </button>
          ))}
          {teacherClasses.length === 0 && (
            <div className="col-span-2 py-20 text-center text-gray-300 font-medium italic bg-white rounded-[32px] border border-dashed border-gray-200">
              No classes assigned to you.
            </div>
          )}
        </div>

        {/* Circulars for Teachers */}
        <div className="mt-12">
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
            {circulars.filter(c => c.targetAudience !== "parents").slice(0, 3).map((c) => (
              <div 
                key={c.id} 
                onClick={() => { setSelectedCircular(c); setActiveTab("view_circular"); }}
                className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm flex items-center gap-5 group hover:border-indigo-100 transition-all cursor-pointer active:scale-[0.98]"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform ${c.targetAudience === 'both' ? 'bg-indigo-500 shadow-indigo-100' : 'bg-amber-500 shadow-amber-100'}`}>
                  <Info className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Admin Notice</span>
                    <span className="text-[10px] font-bold text-gray-400">{new Date(c.createdAt.seconds * 1000).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-[15px] font-black text-gray-900 mt-1 truncate">{c.title}</h4>
                  <p className="text-xs text-gray-400 font-medium line-clamp-1 mt-0.5">{c.content}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-indigo-400" />
              </div>
            ))}
            {circulars.filter(c => c.targetAudience !== "parents").length === 0 && (
              <div className="py-10 text-center text-gray-300 font-medium italic bg-white rounded-[32px] border border-dashed border-gray-100">
                No recent circulars for staff.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (showAttendance && selectedClassId) {
    if (!portalTarget) return null;
    return createPortal(
      <div className="fixed inset-0 z-[1000] bg-[#f5f5f7] flex flex-col animate-fade-in overflow-x-hidden">
        <div className="bg-white px-5 pt-8 pb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setShowAttendance(false)} className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-black text-gray-900">Mark Attendance</h3>
            <div className="w-10" />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{filteredStudents.length} Students</p>
            <button onClick={setAllPresent} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Mark All Present</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-3">
          {filteredStudents.map((s) => (
            <div key={s.id} className="bg-white rounded-[28px] p-5 flex items-center justify-between border border-gray-50 shadow-sm">
              <span className="font-black text-gray-900">{s.name}</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setTempAttendance({ ...tempAttendance, [s.id]: "present" })}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${tempAttendance[s.id] === "present" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100" : "bg-gray-50 text-gray-300"}`}
                >
                  <Check className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => setTempAttendance({ ...tempAttendance, [s.id]: "absent" })}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${tempAttendance[s.id] === "absent" ? "bg-rose-500 text-white shadow-lg shadow-rose-100" : "bg-gray-50 text-gray-300"}`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-white border-t border-gray-100">
          <button 
            onClick={handleSaveAttendance}
            className="w-full bg-[#1E1E26] text-white font-black py-5 rounded-[28px] text-xs uppercase tracking-widest shadow-xl shadow-gray-200 active:scale-95 transition-all"
          >
            Confirm & Save
          </button>
        </div>
      </div>,
      portalTarget
    );
  }

  return (
    <div className="pb-36 px-5 pt-4 min-h-full bg-[#f5f5f7]">
      {/* Success Toast */}
      {successMsg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-[#1E1E26] text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-2xl animate-fade-slide-up">
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-black uppercase tracking-widest">{successMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => setSelectedClassId(null)}
          className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm active:scale-90"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-black text-gray-900 leading-none">{selectedClass?.name}-{selectedClass?.section}</h2>
          <p className="text-sm text-gray-400 font-medium mt-1">Class Management</p>
        </div>
      </div>

      <div className="animate-fade-slide-up">
        <div className="grid grid-cols-2 gap-3 mb-8">
          <button 
            onClick={startAttendance}
            className="bg-[#1E1E26] text-white p-5 rounded-[28px] flex flex-col items-center gap-2 active:scale-95 transition-all shadow-xl"
          >
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">Attendance</span>
          </button>
          <button 
            onClick={() => setShowHomework(true)}
            className="bg-indigo-600 text-white p-5 rounded-[28px] flex flex-col items-center gap-2 active:scale-95 transition-all shadow-xl"
          >
            <FileEdit className="w-6 h-6 text-indigo-200" />
            <span className="text-[10px] font-black uppercase tracking-widest">Homework</span>
          </button>
        </div>

        <button
          onClick={() => {
            setNData({ ...nData, targetType: "class", targetId: selectedClassId || "" });
            setShowSendNotification(true);
          }}
          className="w-full mb-8 bg-white border border-gray-100 rounded-[28px] p-5 flex items-center justify-between shadow-sm active:scale-[0.99] transition-all hover:shadow-md hover:border-indigo-100"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Reminders</p>
              <p className="text-sm font-black text-gray-900">Send Notification</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-200" />
        </button>

        {/* Homework History for this class */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Class Homework History</h3>
            <button 
              onClick={() => setActiveTab("homework_history")}
              className="text-[10px] font-black uppercase text-indigo-500 tracking-widest"
            >
              View All History
            </button>
          </div>
          <div className="space-y-3">
            {homework.filter(h => h.classId === selectedClassId).length > 0 ? (
              homework.filter(h => h.classId === selectedClassId).slice(0, 5).map((h) => (
                <div key={h.id} className="bg-white rounded-[24px] p-4 border border-gray-100 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: h.color }}>
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-gray-900">{h.subject}</h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Due: {h.dueDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-900">{h.priority}</p>
                    <p className="text-[8px] font-bold text-gray-300 uppercase">Priority</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-gray-300 font-medium italic border border-dashed border-gray-200 rounded-[24px]">
                No homework history for this class.
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Students ({filteredStudents.length})</h3>
          <button 
            onClick={() => setShowAddStudent(true)}
            className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add Student
          </button>
        </div>

        <div className="space-y-3">
          {filteredStudents.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSelectedStudent(s);
                setActiveTab("student_detail");
              }}
              className="w-full bg-white rounded-[24px] p-4 border border-gray-100 flex items-center gap-4 shadow-sm active:scale-[0.98] transition-all cursor-pointer group text-left"
            >
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 uppercase font-black text-gray-400">
                {s.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[15px] font-black text-gray-900 truncate">{s.name}</h4>
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-wider mt-0.5">ID: {s.id.slice(0, 8)}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-200" />
            </button>
          ))}
          {filteredStudents.length === 0 && (
            <div className="py-20 text-center text-gray-300 font-medium italic">No students in this class.</div>
          )}
        </div>
      </div>

      {/* Add Student Modal */}
      {portalTarget && showAddStudent ? createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 overflow-x-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddStudent(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[40px] p-8 animate-scale-in shadow-2xl">
            <h3 className="text-xl font-black text-gray-900 mb-6 text-center">New Student Account</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-2 block">Student Name</label>
                <input type="text" value={sData.name} onChange={(e) => setSData({ ...sData, name: e.target.value })} placeholder="Full Name" className="w-full bg-gray-50 border-transparent border-2 focus:border-indigo-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-2 block">Login Username (for Parent)</label>
                <input type="text" value={sData.username} onChange={(e) => setSData({ ...sData, username: e.target.value })} placeholder="e.g. mark_parent" className="w-full bg-gray-50 border-transparent border-2 focus:border-indigo-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-2 block">Login Password</label>
                <input type="text" value={sData.password} onChange={(e) => setSData({ ...sData, password: e.target.value })} placeholder="Default: password123" className="w-full bg-gray-50 border-transparent border-2 focus:border-indigo-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none transition-all" />
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button onClick={() => setShowAddStudent(false)} className="flex-1 bg-gray-50 text-gray-400 font-black py-4 rounded-2xl text-xs uppercase tracking-widest">Cancel</button>
              <button 
                onClick={async () => {
                  const { name, username, password } = sData;
                  if (name && username && selectedClassId) {
                    await addStudent({ name, classId: selectedClassId, username, password });
                    setShowAddStudent(false);
                    setSData({ name: "", username: "", password: "" });
                    triggerSuccess("Student & Parent added!");
                  } else {
                    showAlert("Missing Info", "Please provide at least a name and username.", "error");
                  }
                }}
                className="flex-1 bg-indigo-600 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-indigo-100"
              >
                Add Student
              </button>
            </div>
          </div>
        </div>,
        portalTarget
      ) : null}

      {/* Notification Modal */}
      {portalTarget && showSendNotification ? createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 overflow-x-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSendNotification(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[40px] p-8 animate-scale-in shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
            <h3 className="text-xl font-black text-gray-900 mb-6 text-center">Send Notification</h3>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-2 block">Type</label>
                <div className="relative">
                  <select
                    value={nData.type}
                    onChange={(e) => setNData({ ...nData, type: e.target.value as any })}
                    className="appearance-none w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-black text-gray-900 focus:outline-none focus:bg-white focus:border-indigo-100 transition-all"
                  >
                    <option value="general">General</option>
                    <option value="instruction">Instruction</option>
                    <option value="fee">Fee</option>
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-2 block">Target</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setNData({ ...nData, targetType: "class", targetId: selectedClassId || "" })}
                    className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${nData.targetType === "class" ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-gray-100 text-gray-400"}`}
                  >
                    Class
                  </button>
                  <button
                    onClick={() => {
                      setNData({ ...nData, targetType: "student", targetId: "" });
                      setNotifStudentQuery("");
                    }}
                    className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${nData.targetType === "student" ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-gray-100 text-gray-400"}`}
                  >
                    Student
                  </button>
                </div>
              </div>

              {nData.targetType === "student" && (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-2 block">Select Student</label>
                  <input
                    value={notifStudentQuery}
                    onChange={(e) => setNotifStudentQuery(e.target.value)}
                    placeholder="Search student..."
                    className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all"
                  />

                  <div className="mt-3 space-y-2 max-h-44 overflow-y-auto bg-gray-50 rounded-2xl p-2 no-scrollbar">
                    {filteredNotifStudents.map((s) => {
                      const active = nData.targetId === s.id;
                      return (
                        <button
                          key={s.id}
                          onClick={() => setNData({ ...nData, targetId: s.id })}
                          className={`w-full text-left px-4 py-3 rounded-2xl border transition-all ${active ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-gray-100 text-gray-700 hover:border-indigo-100"}`}
                        >
                          <p className={`text-sm font-black ${active ? "text-white" : "text-gray-900"}`}>{s.name}</p>
                          <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${active ? "text-white/70" : "text-gray-400"}`}>ID: {s.id.slice(0, 8)}</p>
                        </button>
                      );
                    })}
                    {filteredNotifStudents.length === 0 && (
                      <p className="text-center py-4 text-[10px] text-gray-400 italic">No students found.</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-2 block">Title</label>
                <input
                  value={nData.title}
                  onChange={(e) => setNData({ ...nData, title: e.target.value })}
                  placeholder="e.g. Fee Reminder"
                  className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-2 block">Message</label>
                <textarea
                  value={nData.message}
                  onChange={(e) => setNData({ ...nData, message: e.target.value })}
                  placeholder="Write the notification message..."
                  className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all min-h-[120px]"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button onClick={() => setShowSendNotification(false)} className="flex-1 bg-gray-50 text-gray-400 font-black py-4 rounded-2xl text-xs uppercase tracking-widest">Cancel</button>
              <button onClick={handleSendNotification} className="flex-1 bg-indigo-600 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-indigo-100">Send</button>
            </div>
          </div>
        </div>,
        portalTarget
      ) : null}

      {/* Homework Modal */}
      {portalTarget && showHomework ? createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 overflow-x-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowHomework(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[40px] p-8 animate-scale-in shadow-2xl">
            <h3 className="text-xl font-black text-gray-900 mb-6 text-center">Assign Homework</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-2 block">Subject</label>
                <input type="text" value={hwForm.subject} onChange={(e) => setHwForm({ ...hwForm, subject: e.target.value })} placeholder="e.g. Mathematics" className="w-full bg-gray-50 border-transparent border-2 focus:border-indigo-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-2 block">Task Description</label>
                <textarea rows={3} value={hwForm.task} onChange={(e) => setHwForm({ ...hwForm, task: e.target.value })} placeholder="Describe the task..." className="w-full bg-gray-50 border-transparent border-2 focus:border-indigo-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none transition-all resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-2 block">Due Date</label>
                  <input type="text" value={hwForm.dueDate} onChange={(e) => setHwForm({ ...hwForm, dueDate: e.target.value })} placeholder="e.g. 5 May" className="w-full bg-gray-50 border-transparent border-2 focus:border-indigo-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-2 block">Priority</label>
                  <select value={hwForm.priority} onChange={(e) => setHwForm({ ...hwForm, priority: e.target.value as any })} className="w-full bg-gray-50 border-transparent border-2 focus:border-indigo-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none transition-all appearance-none">
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button onClick={() => setShowHomework(false)} className="flex-1 bg-gray-50 text-gray-400 font-black py-4 rounded-2xl text-xs uppercase tracking-widest">Cancel</button>
              <button 
                onClick={handleSaveHomework}
                className="flex-1 bg-indigo-600 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-indigo-100"
              >
                Assign Task
              </button>
            </div>
          </div>
        </div>,
        portalTarget
      ) : null}
    </div>
  );
}
