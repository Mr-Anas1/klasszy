"use client";

import React, { useState } from "react";
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
  Check
} from "lucide-react";
import { useApp, Teacher, Student } from "@/context/AppContext";

export default function TeacherHomeScreen() {
  const { user, grades, students, sendRemark, addStudent, markAttendance } = useApp();
  const teacher = user as Teacher;

  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [remarkText, setRemarkText] = useState("");
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [showHomework, setShowHomework] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const filteredStudents = students.filter(
    s => s.grade === selectedGrade && s.section === selectedSection
  );

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleSendRemark = async () => {
    if (activeStudent && remarkText) {
      await sendRemark(activeStudent.id, remarkText, "Class Interaction");
      setRemarkText("");
      setActiveStudent(null);
      triggerSuccess("Remark sent to parents!");
    }
  };

  const handleAllPresent = async () => {
    if (selectedGrade && selectedSection) {
      await markAttendance(selectedGrade, selectedSection, "All Present");
      setShowAttendance(false);
      triggerSuccess("Attendance marked for all!");
    }
  };

  if (!selectedGrade) {
    return (
      <div className="pb-36 px-5 pt-4">
        <h2 className="text-2xl font-black text-gray-900 leading-tight">My Classes</h2>
        <p className="text-sm text-gray-400 mt-1 font-medium">Select a grade to start your session</p>

        <div className="mt-8 grid grid-cols-2 gap-4 animate-fade-slide-up">
          {teacher.allowedGrades.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGrade(g)}
              className="bg-white border border-gray-100 rounded-[32px] p-6 text-left shadow-sm active:scale-95 transition-all group hover:border-indigo-200"
            >
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-gray-900">{g} Class</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 mt-1">Manage Class</p>
            </button>
          ))}
        </div>
      </div>
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
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => { setSelectedGrade(null); setSelectedSection(null); }}
          className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm active:scale-90"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 px-4">
          <h2 className="text-lg font-black text-gray-900 leading-none">{selectedGrade} Class</h2>
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-1">Session Management</p>
        </div>
        
        <div className="relative">
          <select 
            value={selectedSection || ""}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="appearance-none bg-white border border-gray-100 rounded-2xl px-4 py-2 text-sm font-black text-indigo-600 pr-10 focus:outline-none shadow-sm"
          >
            <option value="">Section</option>
            {grades.find(g => g.grade === selectedGrade)?.sections.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 pointer-events-none" />
        </div>
      </div>

      {!selectedSection ? (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
          <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center shadow-sm mb-6">
            <Users className="w-10 h-10 text-gray-200" />
          </div>
          <h3 className="text-lg font-black text-gray-900">Select Section</h3>
          <p className="text-sm text-gray-400 font-medium max-w-[200px] mt-2">Please pick a section to view the students list.</p>
        </div>
      ) : (
        <div className="animate-fade-slide-up">
          <div className="grid grid-cols-2 gap-3 mb-8">
            <button 
              onClick={() => setShowAttendance(true)}
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

          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Students ({filteredStudents.length})</h3>
            <button 
              onClick={() => setShowAddStudent(true)}
              className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add Student
            </button>
          </div>

          <div className="space-y-3">
            {filteredStudents.map((s, i) => (
              <div 
                key={s.id}
                onClick={() => setActiveStudent(s)}
                className="bg-white rounded-[24px] p-4 border border-gray-100 flex items-center gap-4 shadow-sm active:scale-[0.98] transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0">
                  <span className="text-sm font-black text-gray-400">{s.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[15px] font-black text-gray-900 truncate">{s.name}</h4>
                  <p className="text-[10px] font-bold text-gray-300 uppercase tracking-wider mt-0.5">Roll No. {s.rollNo}</p>
                </div>
                <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-200" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Remark Modal */}
      {activeStudent && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center px-4 pb-10 sm:pb-0">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActiveStudent(null)} />
          <div className="relative w-full max-w-md bg-white rounded-[40px] p-8 animate-fade-slide-up shadow-2xl">
            <button onClick={() => setActiveStudent(null)} className="absolute top-6 right-6 w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center">
              <X className="w-5 h-5 text-gray-400" />
            </button>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center">
                <span className="text-xl font-black text-indigo-600">{activeStudent.avatar}</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">{activeStudent.name}</h3>
                <p className="text-sm text-gray-400 font-medium">Class {activeStudent.grade}-{activeStudent.section}</p>
              </div>
            </div>
            <textarea 
              value={remarkText}
              onChange={(e) => setRemarkText(e.target.value)}
              placeholder="Write a remark for the parents..."
              className="w-full h-32 bg-gray-50 border-2 border-transparent rounded-3xl p-5 text-sm font-semibold text-gray-900 focus:outline-none focus:bg-white focus:border-indigo-100 transition-all resize-none"
            />
            <button onClick={handleSendRemark} className="w-full bg-[#1E1E26] text-white font-black py-5 rounded-[24px] mt-6 text-sm uppercase tracking-widest active:scale-95 transition-all">
              Send Remark
            </button>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {showAttendance && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAttendance(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[40px] p-8 animate-scale-in text-center shadow-2xl">
            <div className="w-20 h-20 bg-emerald-50 rounded-[32px] flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-black text-gray-900">Mark Attendance</h3>
            <p className="text-sm text-gray-400 mt-2 font-medium">Class {selectedGrade}-{selectedSection}</p>
            <div className="mt-8 flex gap-3">
              <button onClick={() => setShowAttendance(false)} className="flex-1 bg-gray-50 text-gray-400 font-black py-4 rounded-2xl text-xs uppercase tracking-widest">Manual</button>
              <button onClick={handleAllPresent} className="flex-1 bg-[#1E1E26] text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest">All Present</button>
            </div>
          </div>
        </div>
      )}

      {/* Homework Modal */}
      {showHomework && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowHomework(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[40px] p-8 animate-scale-in shadow-2xl">
            <h3 className="text-xl font-black text-gray-900 mb-6">Assign Homework</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Homework Title" className="w-full bg-gray-50 border-transparent border-2 focus:border-indigo-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none transition-all" />
              <textarea placeholder="Description..." className="w-full h-32 bg-gray-50 border-transparent border-2 focus:border-indigo-100 rounded-2xl p-5 text-sm font-bold focus:outline-none transition-all resize-none" />
            </div>
            <button onClick={() => { setShowHomework(false); triggerSuccess("Homework assigned!"); }} className="w-full bg-indigo-600 text-white font-black py-5 rounded-[24px] mt-6 text-sm uppercase tracking-widest shadow-xl">
              Assign to Class
            </button>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddStudent(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[40px] p-8 animate-scale-in shadow-2xl">
            <h3 className="text-xl font-black text-gray-900 mb-6">New Student</h3>
            <div className="space-y-4">
              <input type="text" id="new-s-name" placeholder="Full Name" className="w-full bg-gray-50 border-transparent border-2 focus:border-indigo-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none transition-all" />
              <input type="text" id="new-s-roll" placeholder="Roll Number" className="w-full bg-gray-50 border-transparent border-2 focus:border-indigo-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none transition-all" />
            </div>
            <div className="mt-8 flex gap-3">
              <button onClick={() => setShowAddStudent(false)} className="flex-1 bg-gray-50 text-gray-400 font-black py-4 rounded-2xl text-xs uppercase tracking-widest">Cancel</button>
              <button 
                onClick={async () => {
                  const name = (document.getElementById('new-s-name') as HTMLInputElement).value;
                  const roll = (document.getElementById('new-s-roll') as HTMLInputElement).value;
                  if (name && roll && selectedGrade && selectedSection) {
                    await addStudent({ name, rollNo: roll, grade: selectedGrade, section: selectedSection, email: "student@school.edu", phone: "+91 00000", avatar: name[0], school: teacher.school });
                    setShowAddStudent(false);
                    triggerSuccess("Student added successfully!");
                  }
                }}
                className="flex-1 bg-indigo-600 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-indigo-100"
              >
                Add Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
