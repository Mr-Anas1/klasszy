"use client";

import React, { useState } from "react";
import { 
  Users, 
  School, 
  UserPlus, 
  Plus, 
  ChevronRight, 
  Settings, 
  X,
  ArrowLeft,
  Check,
  ChevronDown,
  Trash2,
  MoreVertical
} from "lucide-react";
import { useApp, STANDARD_GRADES, Student } from "@/context/AppContext";

export default function AdminDashboardScreen() {
  const { students, teachers, grades, addStudent, addTeacher, addClass } = useApp();
  
  const [view, setView] = useState<"main" | "grade_details" | "section_details">("main");
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [showAddClass, setShowAddClass] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);

  // Form states
  const [tData, setTData] = useState({ name: "", empId: "", allowedGrades: [] as string[] });
  const [sData, setSData] = useState({ name: "", roll: "" });
  const [cData, setCData] = useState({ grade: STANDARD_GRADES[0], section: "" });

  const resetModals = () => {
    setShowAddTeacher(false);
    setShowAddClass(false);
    setShowAddStudent(false);
    setTData({ name: "", empId: "", allowedGrades: [] });
    setSData({ name: "", roll: "" });
  };

  const handleAddTeacher = async () => {
    if (tData.name && tData.empId && tData.allowedGrades.length > 0) {
      await addTeacher({
        name: tData.name,
        empId: tData.empId,
        allowedGrades: tData.allowedGrades,
        email: `${tData.name.toLowerCase().replace(" ", ".")}@school.edu`,
        phone: "+91 00000 00000",
        avatar: tData.name.split(" ").map(n => n[0]).join(""),
        school: "Sunrise International",
      });
      resetModals();
    }
  };

  const handleAddClass = async () => {
    if (cData.grade && cData.section) {
      await addClass(cData.grade, cData.section);
      resetModals();
    }
  };

  const handleAddStudent = async () => {
    if (sData.name && selectedGrade && selectedSection) {
      await addStudent({
        name: sData.name,
        rollNo: sData.roll || "0",
        grade: selectedGrade,
        section: selectedSection,
        email: "student@school.edu",
        phone: "+91 00000",
        avatar: sData.name[0],
        school: "Sunrise International",
      });
      resetModals();
    }
  };

  const toggleGradeSelection = (g: string) => {
    setTData(prev => ({
      ...prev,
      allowedGrades: prev.allowedGrades.includes(g) 
        ? prev.allowedGrades.filter(x => x !== g) 
        : [...prev.allowedGrades, g]
    }));
  };

  if (view === "grade_details" && selectedGrade) {
    const gradeInfo = grades.find(g => g.grade === selectedGrade);
    return (
      <div className="pb-36 px-5 pt-4 animate-fade-slide-up">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setView("main")} className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-gray-900 leading-none">{selectedGrade} Class</h2>
            <p className="text-sm text-gray-400 font-medium mt-1">Manage Sections</p>
          </div>
        </div>

        <div className="space-y-4">
          {gradeInfo?.sections.map((s, i) => (
            <button 
              key={i} 
              onClick={() => { setSelectedSection(s); setView("section_details"); }}
              className="w-full bg-white rounded-[32px] p-6 border border-gray-100 flex items-center justify-between shadow-sm active:scale-[0.98] transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black">
                  {s}
                </div>
                <div className="text-left">
                  <p className="text-base font-black text-gray-900">Section {s}</p>
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                    {students.filter(x => x.grade === selectedGrade && x.section === s).length} Students
                  </p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-200 group-hover:text-indigo-400 transition-colors" />
            </button>
          ))}
          <button 
            onClick={() => { setCData({ ...cData, grade: selectedGrade }); setShowAddClass(true); }}
            className="w-full bg-dashed border-2 border-gray-200 border-dashed rounded-[32px] p-6 flex items-center justify-center gap-2 text-gray-400 hover:border-indigo-200 hover:text-indigo-400 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm font-black uppercase tracking-widest">Add Section</span>
          </button>
        </div>
      </div>
    );
  }

  if (view === "section_details" && selectedGrade && selectedSection) {
    const sectionStudents = students.filter(s => s.grade === selectedGrade && s.section === selectedSection);
    return (
      <div className="pb-36 px-5 pt-4 animate-fade-slide-up">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setView("grade_details")} className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-gray-900 leading-none">{selectedGrade} - {selectedSection}</h2>
            <p className="text-sm text-gray-400 font-medium mt-1">Student Records</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Class List ({sectionStudents.length})</h3>
          <button 
            onClick={() => setShowAddStudent(true)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-100 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Add Student</span>
          </button>
        </div>

        <div className="space-y-3">
          {sectionStudents.map((s, i) => (
            <div key={i} className="bg-white rounded-[24px] p-4 border border-gray-100 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0">
                <span className="text-sm font-black text-gray-400">{s.avatar}</span>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-black text-gray-900">{s.name}</h4>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Roll No. {s.rollNo}</p>
              </div>
              <button className="text-gray-300 hover:text-gray-400">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          ))}
          {sectionStudents.length === 0 && (
            <div className="py-20 text-center text-gray-300 font-medium italic">No students registered yet.</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-36 px-5 pt-4 animate-fade-slide-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900 leading-tight">School Panel</h2>
          <p className="text-sm text-gray-400 font-medium">Principal Dashboard</p>
        </div>
        <button className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 shadow-sm active:scale-90 transition-all">
          <Settings className="w-6 h-6" />
        </button>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        {[
          { label: "Students", val: students.length, icon: Users, color: "bg-indigo-600" },
          { label: "Teachers", val: teachers.length, icon: UserPlus, color: "bg-violet-600" },
          { label: "Classes", val: grades.length, icon: School, color: "bg-emerald-600" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-[24px] p-4 border border-gray-100 flex flex-col items-center text-center shadow-sm">
            <div className={`${s.color} w-10 h-10 rounded-2xl flex items-center justify-center text-white mb-2 shadow-lg`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-xl font-black text-gray-900">{s.val}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Manage Teachers */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-gray-900">Manage Teachers</h3>
          <button 
            onClick={() => setShowAddTeacher(true)}
            className="text-[10px] font-black uppercase text-indigo-500 tracking-widest flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add Teacher
          </button>
        </div>
        <div className="space-y-3">
          {teachers.map((t, i) => (
            <div key={i} className="bg-white rounded-[28px] p-5 border border-gray-100 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0">
                <span className="text-sm font-black text-indigo-700">{t.avatar}</span>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-black text-gray-900">{t.name}</h4>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Emp ID: {t.empId} · {t.allowedGrades.length} Classes</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-200" />
            </div>
          ))}
        </div>
      </div>

      {/* Classes & Students Drill-down */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-gray-900">Classes & Students</h3>
          <button 
            onClick={() => setShowAddClass(true)}
            className="text-[10px] font-black uppercase text-indigo-500 tracking-widest flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> New Class
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {grades.map((g, i) => (
            <button 
              key={i} 
              onClick={() => { setSelectedGrade(g.grade); setView("grade_details"); }}
              className="bg-white rounded-[32px] p-6 border border-gray-100 text-left hover:border-indigo-100 active:scale-95 transition-all shadow-sm group"
            >
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                <School className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-black text-gray-900 leading-none">{g.grade}</h4>
              <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">{g.sections.length} Sections</p>
            </button>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showAddTeacher && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetModals} />
          <div className="relative w-full max-w-md bg-white rounded-[40px] p-8 animate-scale-in shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-2xl font-black text-gray-900 mb-8 text-center">Onboard Teacher</h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Full Name</label>
                <input type="text" value={tData.name} onChange={(e) => setTData({ ...tData, name: e.target.value })} placeholder="Enter teacher name" className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Employee ID</label>
                <input type="text" value={tData.empId} onChange={(e) => setTData({ ...tData, empId: e.target.value })} placeholder="e.g. EMP105" className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block">Allotted Grades</label>
                <div className="grid grid-cols-3 gap-2">
                  {STANDARD_GRADES.map(g => (
                    <button key={g} onClick={() => toggleGradeSelection(g)} className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 transition-all ${tData.allowedGrades.includes(g) ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-gray-100 text-gray-400"}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-10 flex gap-4">
              <button onClick={resetModals} className="flex-1 bg-gray-50 text-gray-400 font-black py-5 rounded-[24px] text-xs uppercase tracking-widest">Cancel</button>
              <button onClick={handleAddTeacher} className="flex-1 bg-[#1E1E26] text-white font-black py-5 rounded-[24px] text-xs uppercase tracking-widest shadow-xl">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {showAddClass && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetModals} />
          <div className="relative w-full max-w-md bg-white rounded-[40px] p-8 animate-scale-in shadow-2xl">
            <h3 className="text-2xl font-black text-gray-900 mb-8 text-center">Create New Class</h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Select Grade</label>
                <div className="relative">
                  <select value={cData.grade} onChange={(e) => setCData({ ...cData, grade: e.target.value })} className="appearance-none w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-black text-gray-900 focus:outline-none focus:bg-white focus:border-indigo-100 transition-all">
                    {STANDARD_GRADES.map(g => <option key={g} value={g}>{g} Class</option>)}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Section Name (Optional)</label>
                <input type="text" value={cData.section} onChange={(e) => setCData({ ...cData, section: e.target.value })} placeholder="e.g. A" className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all" />
              </div>
            </div>
            <div className="mt-10 flex gap-4">
              <button onClick={resetModals} className="flex-1 bg-gray-50 text-gray-400 font-black py-5 rounded-[24px] text-xs uppercase tracking-widest">Cancel</button>
              <button onClick={handleAddClass} className="flex-1 bg-emerald-600 text-white font-black py-5 rounded-[24px] text-xs uppercase tracking-widest shadow-xl shadow-emerald-100">Create</button>
            </div>
          </div>
        </div>
      )}

      {showAddStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetModals} />
          <div className="relative w-full max-w-md bg-white rounded-[40px] p-8 animate-scale-in shadow-2xl">
            <h3 className="text-2xl font-black text-gray-900 mb-8 text-center">New Student for {selectedGrade}-{selectedSection}</h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Full Name</label>
                <input type="text" value={sData.name} onChange={(e) => setSData({ ...sData, name: e.target.value })} placeholder="Enter name" className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Roll Number</label>
                <input type="text" value={sData.roll} onChange={(e) => setSData({ ...sData, roll: e.target.value })} placeholder="e.g. 24" className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all" />
              </div>
            </div>
            <div className="mt-10 flex gap-4">
              <button onClick={resetModals} className="flex-1 bg-gray-50 text-gray-400 font-black py-5 rounded-[24px] text-xs uppercase tracking-widest">Cancel</button>
              <button onClick={handleAddStudent} className="flex-1 bg-indigo-600 text-white font-black py-5 rounded-[24px] text-xs uppercase tracking-widest shadow-xl">Register</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
