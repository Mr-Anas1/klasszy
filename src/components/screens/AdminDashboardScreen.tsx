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
  MoreVertical,
  BookOpen,
  FileEdit
} from "lucide-react";
import { useApp, STANDARD_GRADES, Student, ClassRoom, UserProfile, UserRole } from "@/context/AppContext";

export default function AdminDashboardScreen() {
  const { students, classes, usersList, circulars, school, addStudent, addClass, updateTeacherClasses, onboardUser, updateStudent, deleteStudent, updateClass, deleteClass, deleteUser, sendCircular, deleteCircular, showAlert, showConfirm, setActiveTab, setSelectedCircular, updateUserProfile } = useApp();

  const [view, setView] = useState<"main" | "grade_details" | "section_details" | "teacher_management">("main");
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<UserProfile | null>(null);

  const [showAddClass, setShowAddClass] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [showAddCircular, setShowAddCircular] = useState(false);

  // Edit states
  const [editingItem, setEditingItem] = useState<{ type: "teacher" | "student" | "class"; id: string } | null>(null);
  const [studentSearch, setStudentSearch] = useState("");

  // Form states
  const [sData, setSData] = useState({ name: "", parentId: "", email: "", password: "", classId: "" });
  const [cData, setCData] = useState({ grade: STANDARD_GRADES[0], section: "A", customSection: "" });
  const [tData, setTData] = useState({ name: "", email: "", password: "", classIds: [] as string[] });
  const [circData, setCircData] = useState({ title: "", content: "", imageUrl: "", targetAudience: "both" as "teachers" | "parents" | "both" });

  const teachers = usersList.filter(u => u.role === "teacher");

  // Group classes by name (grade)
  const gradesMap: Record<string, ClassRoom[]> = {};
  classes.forEach(c => {
    if (!gradesMap[c.name]) gradesMap[c.name] = [];
    gradesMap[c.name].push(c);
  });
  const uniqueGrades = Object.keys(gradesMap).sort();

  const resetModals = () => {
    setShowAddClass(false);
    setShowAddStudent(false);
    setShowAddTeacher(false);
    setShowAddCircular(false);
    setEditingItem(null);
    setSelectedTeacher(null);
    setSData({ name: "", parentId: "", email: "", password: "", classId: "" });
    setTData({ name: "", email: "", password: "", classIds: [] });
    setCircData({ title: "", content: "", imageUrl: "", targetAudience: "both" });
  };

  const handleAddUser = async (role: UserRole) => {
    if (tData.name && tData.email) {
      try {
        await onboardUser(tData.name, tData.email, role, tData.password, tData.classIds);
        const passMsg = tData.password ? `Password: ${tData.password}` : "Password: password123 (Default)";
        showAlert("Registration Successful", `${role.charAt(0).toUpperCase() + role.slice(1)} registered!\nLogin: ${tData.email}\n${passMsg}`, "success");
        resetModals();
      } catch (err: any) {
        showAlert("Registration Failed", err.message, "error");
      }
    }
  };

  const handleAddClass = async () => {
    const finalSection = cData.section === "custom" ? cData.customSection : cData.section;
    if (cData.grade && finalSection) {
      await addClass({ name: cData.grade, section: finalSection });
      resetModals();
    }
  };

  const parents = usersList.filter(u => u.role === "parent");

  const handleAddStudentWithCreds = async (name: string, classId: string, username: string, password?: string) => {
    if (name && classId) {
      await addStudent({
        name,
        classId,
        username,
        password
      });
      resetModals();
    }
  };

  const handleDelete = async (type: "teacher" | "student" | "class", id: string) => {
    showConfirm(
      `Delete ${type.charAt(0).toUpperCase() + type.slice(1)}?`,
      `Are you sure you want to permanently remove this ${type}? This action cannot be undone.`,
      async () => {
        if (type === "teacher") await deleteUser(id);
        if (type === "student") await deleteStudent(id);
        if (type === "class") await deleteClass(id);
        if (type === "class") setView("main");
        showAlert("Deleted", `The ${type} has been removed successfully.`, "success");
      }
    );
  };

  const handleUpdate = async () => {
    if (!editingItem) return;
    const { type, id } = editingItem;
    
    const performUpdate = async () => {
      if (type === "student") {
        await updateStudent(id, { name: sData.name, parentId: sData.parentId });
        await updateUserProfile(sData.parentId, { email: sData.email }); // Update parent/user email
      } else if (type === "teacher") {
        await updateUserProfile(id, { name: tData.name, email: tData.email, classIds: tData.classIds });
      } else if (type === "class") {
        const finalSection = cData.section === "custom" ? cData.customSection : cData.section;
        await updateClass(id, { name: cData.grade, section: finalSection });
      }
      resetModals();
      showAlert("Updated", "Profile has been updated successfully.", "success");
    };

    // Sensitive change confirmation
    const original = type === "teacher" ? teachers.find(t => t.id === id) : type === "student" ? students.find(s => s.id === id) : null;
    const emailChanged = (type === "teacher" && (original as UserProfile)?.email !== tData.email) || (type === "student" && parents.find(p => p.id === (original as Student)?.parentId)?.email !== sData.email);
    
    if (emailChanged || (type === "teacher" && tData.password)) {
      showConfirm(
        "Sensitive Changes Detected",
        "You are changing login credentials (email or password). This may affect the user's ability to login. Proceed?",
        performUpdate
      );
    } else {
      performUpdate();
    }
  };

  const toggleTeacherClass = async (teacher: UserProfile, classId: string) => {
    const currentIds = teacher.classIds || [];
    const newIds = currentIds.includes(classId) 
      ? currentIds.filter(id => id !== classId)
      : [...currentIds, classId];
    await updateTeacherClasses(teacher.id, newIds);
  };

  const handleSendCircular = async () => {
    if (circData.title && circData.content) {
      await sendCircular(circData);
      showAlert("Circular Sent", "The circular has been posted successfully.", "success");
      resetModals();
    }
  };

  const renderContent = () => {
    if (view === "teacher_management" && selectedTeacher) {
    const t = usersList.find(u => u.id === selectedTeacher.id) || selectedTeacher;
    return (
      <div className="pb-36 px-5 pt-4 animate-fade-slide-up">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setView("main")} className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-gray-900 leading-none">Assign Classes</h2>
            <p className="text-sm text-gray-400 font-medium mt-1">Teacher: {t.name}</p>
          </div>
        </div>

        <div className="space-y-3">
          {classes.map((c) => (
            <button 
              key={c.id} 
              onClick={() => toggleTeacherClass(t, c.id)}
              className={`w-full rounded-[24px] p-5 border flex items-center justify-between transition-all ${t.classIds?.includes(c.id) ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-white border-gray-100 text-gray-900"}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${t.classIds?.includes(c.id) ? "bg-white/20" : "bg-indigo-50 text-indigo-600"}`}>
                  {c.section}
                </div>
                <p className="font-black">{c.name}-{c.section}</p>
              </div>
              {t.classIds?.includes(c.id) ? <Check className="w-5 h-5" /> : <div className="w-5 h-5 rounded-full border-2 border-gray-100" />}
            </button>
          ))}
          {classes.length === 0 && (
            <div className="py-20 text-center text-gray-300 font-medium italic">Create some classes first.</div>
          )}
        </div>
      </div>
    );
  }

  if (view === "grade_details" && selectedGrade) {
    const gradeSections = gradesMap[selectedGrade] || [];
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
          {gradeSections.map((s, i) => (
            <div key={i} className="flex gap-2 group">
              <button 
                onClick={() => { setSelectedSection(s.section); setView("section_details"); }}
                className="flex-1 bg-white rounded-[32px] p-6 border border-gray-100 flex items-center justify-between shadow-sm active:scale-[0.98] transition-all group-hover:border-indigo-100"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black">
                    {s.section}
                  </div>
                  <div className="text-left">
                    <p className="text-base font-black text-gray-900">Section {s.section}</p>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                      {students.filter(x => x.classId === s.id).length} Students
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-gray-200 group-hover:text-indigo-400 transition-colors" />
              </button>
              <button 
                onClick={() => handleDelete("class", s.id)}
                className="w-16 bg-white border border-gray-100 rounded-[32px] flex items-center justify-center text-gray-300 hover:text-rose-600 transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-6 h-6" />
              </button>
            </div>
          ))}
          <button 
            onClick={() => { 
              setCData({ grade: selectedGrade, section: "A", customSection: "" }); 
              setShowAddClass(true); 
            }}
            className="w-full bg-dashed border-2 border-gray-200 border-dashed rounded-[32px] p-6 flex items-center justify-center gap-2 text-gray-400 hover:border-indigo-200 hover:text-indigo-400 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm font-black uppercase tracking-widest">Add Section to {selectedGrade}</span>
          </button>
        </div>
      </div>
    );
  }

  if (view === "section_details" && selectedGrade && selectedSection) {
    const targetClass = classes.find(c => c.name === selectedGrade && c.section === selectedSection);
    const sectionStudents = students.filter(s => s.classId === targetClass?.id);
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
            onClick={() => {
              if (targetClass) {
                setSData({ ...sData, classId: targetClass.id });
                setShowAddStudent(true);
              }
            }}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-100 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Add Student</span>
          </button>
        </div>

        <div className="space-y-3">
          {sectionStudents.map((s, i) => (
            <div key={i} className="bg-white rounded-[24px] p-4 border border-gray-100 flex items-center gap-4 shadow-sm group">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 uppercase font-black text-gray-400">
                {s.name[0]}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-black text-gray-900">{s.name}</h4>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">ID: {s.id.slice(0, 8)}</p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => { 
                    const parent = parents.find(p => p.id === s.parentId);
                    setSData({ name: s.name, parentId: s.parentId, email: parent?.email || "", classId: s.classId, password: "" });
                    setEditingItem({ type: "student", id: s.id });
                    setShowAddStudent(true); 
                  }} 
                  className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-indigo-600"
                >
                  <FileEdit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete("student", s.id)} 
                  className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
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
          { label: "Teachers", val: teachers.length, icon: BookOpen, color: "bg-violet-600" },
          { label: "Classes", val: classes.length, icon: School, color: "bg-emerald-600" },
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

      {/* Classes & Sections */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-gray-900">Classes & Sections</h3>
          <button 
            onClick={() => setShowAddClass(true)}
            className="text-[10px] font-black uppercase text-indigo-500 tracking-widest flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> New Class
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {uniqueGrades.map((gName, i) => (
            <button 
              key={i} 
              onClick={() => { setSelectedGrade(gName); setView("grade_details"); }}
              className="bg-white rounded-[32px] p-6 border border-gray-100 text-left hover:border-indigo-100 active:scale-95 transition-all shadow-sm group"
            >
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                <School className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-black text-gray-900 leading-none">{gName}</h4>
              <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">{gradesMap[gName].length} Sections</p>
            </button>
          ))}
        </div>
      </div>

      {/* Circulars Section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-gray-900">School Circulars</h3>
          <button 
            onClick={() => setShowAddCircular(true)}
            className="text-[10px] font-black uppercase text-indigo-500 tracking-widest flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> New Circular
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {circulars.slice(0, 3).map((c) => (
            <div 
              key={c.id} 
              onClick={() => { setSelectedCircular(c); setActiveTab("view_circular"); }}
              className="min-w-[280px] bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm relative group cursor-pointer hover:border-indigo-100 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${c.targetAudience === 'both' ? 'bg-indigo-50 text-indigo-600' : c.targetAudience === 'teachers' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                  To: {c.targetAudience}
                </span>
                <button 
                  onClick={() => deleteCircular(c.id)}
                  className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h4 className="text-sm font-black text-gray-900 mb-2 line-clamp-1">{c.title}</h4>
              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">{c.content}</p>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{new Date(c.createdAt.seconds * 1000).toLocaleDateString()}</span>
                <BookOpen className="w-4 h-4 text-gray-200" />
              </div>
            </div>
          ))}
          {circulars.length === 0 && (
            <div className="w-full py-10 text-center text-gray-300 font-medium italic bg-white rounded-[32px] border border-dashed border-gray-100">
              No circulars posted.
            </div>
          )}
        </div>
        {circulars.length > 3 && (
          <button 
            onClick={() => setActiveTab("circulars")}
            className="w-full mt-4 py-4 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-indigo-500 active:scale-95 transition-all shadow-sm"
          >
            View More Circulars
          </button>
        )}
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
          {teachers.slice(0, 3).map((t) => (
            <div key={t.id} className="group relative">
              <div 
                onClick={() => { setSelectedTeacher(t); setView("teacher_management"); }}
                className="w-full bg-white rounded-[28px] p-5 border border-gray-100 flex items-center gap-4 shadow-sm active:scale-[0.98] transition-all cursor-pointer hover:border-indigo-100"
              >
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0">
                  <span className="text-sm font-black text-indigo-700 uppercase">{t.name[0]}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-gray-900">{t.name}</h4>
                    {(!t.classIds || t.classIds.length === 0) && (
                      <div className="w-4 h-4 bg-amber-100 rounded-full flex items-center justify-center" title="No classes assigned">
                        <Settings className="w-2.5 h-2.5 text-amber-600 animate-pulse" />
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                    {t.classIds?.length || 0} Assigned Classes
                  </p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setTData({ name: t.name, email: t.email, password: "", classIds: t.classIds || [] });
                      setEditingItem({ type: "teacher", id: t.id });
                      setShowAddTeacher(true);
                    }} 
                    className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-indigo-600 active:scale-90 transition-all"
                  >
                    <FileEdit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete("teacher", t.id); }} 
                    className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-rose-600 active:scale-90 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-200" />
              </div>
            </div>
          ))}
          {teachers.length === 0 && (
            <div className="py-10 text-center text-gray-300 font-medium italic bg-white rounded-[28px] border border-dashed border-gray-100">
              No teachers registered.
            </div>
          )}
        </div>
        {teachers.length > 3 && (
          <button 
            onClick={() => setActiveTab("manage_teachers")}
            className="w-full mt-4 py-4 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-indigo-500 active:scale-95 transition-all shadow-sm"
          >
            Manage All Teachers
          </button>
        )}
      </div>

      {/* Manage Students */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-gray-900">Manage Students</h3>
          <button 
            onClick={() => setShowAddStudent(true)}
            className="text-[10px] font-black uppercase text-indigo-500 tracking-widest flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add Student
          </button>
        </div>
        
        <div className="space-y-3">
          {students.slice(0, 3).map((s) => (
            <div key={s.id} className="group relative">
              <div 
                className="w-full bg-white rounded-[28px] p-5 border border-gray-100 flex items-center gap-4 shadow-sm hover:border-indigo-100 transition-all"
              >
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                  <span className="text-sm font-black text-emerald-700 uppercase">{s.name[0]}</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-black text-gray-900">{s.name}</h4>
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                    Class: {classes.find(c => c.id === s.classId)?.name}-{classes.find(c => c.id === s.classId)?.section || "Unassigned"}
                  </p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => { 
                      const parent = parents.find(p => p.id === s.parentId);
                      setSData({ name: s.name, parentId: s.parentId, email: parent?.email || "", classId: s.classId, password: "" });
                      setEditingItem({ type: "student", id: s.id });
                      setShowAddStudent(true);
                    }} 
                    className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-indigo-600 active:scale-90 transition-all"
                  >
                    <FileEdit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete("student", s.id)} 
                    className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-rose-600 active:scale-90 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {students.length === 0 && (
            <div className="py-10 text-center text-gray-300 font-medium italic bg-white rounded-[28px] border border-dashed border-gray-100">
              No students registered.
            </div>
          )}
        </div>
        {students.length > 3 && (
          <button 
            onClick={() => setActiveTab("manage_students")}
            className="w-full mt-4 py-4 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-indigo-500 active:scale-95 transition-all shadow-sm"
          >
            Manage All Students
          </button>
        )}
      </div>
    </div>
  );
};

  return (
    <>
      {renderContent()}

      {/* Modals */}
      {showAddClass && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetModals} />
          <div className="relative w-full max-w-md bg-white rounded-[40px] p-8 animate-scale-in shadow-2xl">
            <h3 className="text-2xl font-black text-gray-900 mb-8 text-center">
              {view === "grade_details" ? `Add Section to ${selectedGrade}` : "Create New Class"}
            </h3>
            <div className="space-y-6">
              {view !== "grade_details" ? (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Select Grade</label>
                  <div className="relative">
                    <select value={cData.grade} onChange={(e) => setCData({ ...cData, grade: e.target.value })} className="appearance-none w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-black text-gray-900 focus:outline-none focus:bg-white focus:border-indigo-100 transition-all">
                      {STANDARD_GRADES.map(g => <option key={g} value={g}>{g} Class</option>)}
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              ) : (
                <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Target Class</p>
                  <p className="text-lg font-black text-indigo-900">{selectedGrade} Grade</p>
                </div>
              )}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Select Section</label>
                <div className="relative">
                  <select value={cData.section} onChange={(e) => setCData({ ...cData, section: e.target.value })} className="appearance-none w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-black text-gray-900 focus:outline-none focus:bg-white focus:border-indigo-100 transition-all">
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                    <option value="D">Section D</option>
                    <option value="custom">Custom...</option>
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              {cData.section === "custom" && (
                <div className="animate-fade-in">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Enter Section Name</label>
                  <input type="text" value={cData.customSection} onChange={(e) => setCData({ ...cData, customSection: e.target.value })} placeholder="e.g. E" className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all" />
                </div>
              )}
            </div>
            <div className="mt-10 flex gap-4">
              <button onClick={resetModals} className="flex-1 bg-gray-50 text-gray-400 font-black py-5 rounded-[24px] text-xs uppercase tracking-widest">Cancel</button>
              <button onClick={handleAddClass} className="flex-1 bg-emerald-600 text-white font-black py-5 rounded-[24px] text-xs uppercase tracking-widest shadow-xl shadow-emerald-100">Create</button>
            </div>
          </div>
        </div>
      )}

      {showAddTeacher && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetModals} />
          <div className="relative w-full max-w-md bg-white rounded-[40px] p-8 animate-scale-in shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
            <h3 className="text-2xl font-black text-gray-900 mb-8 text-center">
              {editingItem ? "Edit Teacher" : "Register Teacher"}
            </h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Full Name</label>
                <input type="text" value={tData.name} onChange={(e) => setTData({ ...tData, name: e.target.value })} placeholder="Full Name" className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Login Email</label>
                <input type="email" value={tData.email} onChange={(e) => setTData({ ...tData, email: e.target.value })} placeholder="email@school.edu" className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">{editingItem ? "Change Password (optional)" : "Login Password"}</label>
                <input type="text" value={tData.password} onChange={(e) => setTData({ ...tData, password: e.target.value })} placeholder={editingItem ? "Leave empty to keep current" : "Default: password123"} className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all" />
              </div>
              
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Assign Classes (Optional)</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-2xl no-scrollbar">
                  {classes.map(c => (
                    <button 
                      key={c.id}
                      onClick={() => {
                        const newIds = tData.classIds.includes(c.id) 
                          ? tData.classIds.filter(id => id !== c.id)
                          : [...tData.classIds, c.id];
                        setTData({ ...tData, classIds: newIds });
                      }}
                      className={`px-3 py-3 rounded-xl text-[10px] font-bold transition-all border ${tData.classIds.includes(c.id) ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-gray-100 text-gray-400"}`}
                    >
                      {c.name}-{c.section}
                    </button>
                  ))}
                  {classes.length === 0 && <p className="col-span-2 text-center py-4 text-[10px] text-gray-400 italic">No classes available</p>}
                </div>
              </div>
            </div>
            <div className="mt-10 flex gap-4">
              <button onClick={resetModals} className="flex-1 bg-gray-50 text-gray-400 font-black py-5 rounded-[24px] text-xs uppercase tracking-widest">Cancel</button>
              <button 
                onClick={() => {
                  if (editingItem) handleUpdate();
                  else handleAddUser("teacher");
                }} 
                className="flex-1 bg-indigo-600 text-white font-black py-5 rounded-[24px] text-xs uppercase tracking-widest shadow-xl"
              >
                {editingItem ? "Update" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetModals} />
          <div className="relative w-full max-w-md bg-white rounded-[40px] p-8 animate-scale-in shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
            <h3 className="text-2xl font-black text-gray-900 mb-8 text-center">
              {editingItem ? "Edit Student" : `New Student Entry`}
            </h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Student Name</label>
                <input type="text" value={sData.name} onChange={(e) => setSData({ ...sData, name: e.target.value })} placeholder="Full Name" className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all" />
              </div>
              
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Parent Login Email / Username</label>
                <input type="text" value={sData.email} onChange={(e) => setSData({ ...sData, email: e.target.value })} placeholder="e.g. john_doe_parent" className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all" />
              </div>

              {!editingItem && (
                <>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Login Password</label>
                    <input type="text" value={sData.password} onChange={(e) => setSData({ ...sData, password: e.target.value })} placeholder="Default: password123" className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all" />
                  </div>
                </>
              )}
              
              {view !== "section_details" ? (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Assign to Class</label>
                  <div className="relative">
                    <select 
                      value={sData.classId} 
                      onChange={(e) => setSData({ ...sData, classId: e.target.value })} 
                      className="appearance-none w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-black text-gray-900 focus:outline-none focus:bg-white focus:border-indigo-100 transition-all"
                    >
                      <option value="">Select a Class...</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}-{c.section}</option>)}
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              ) : (
                <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Target Section</p>
                  <p className="text-lg font-black text-indigo-900">{selectedGrade}-{selectedSection}</p>
                </div>
              )}
            </div>
            <div className="mt-10 flex gap-4">
              <button onClick={resetModals} className="flex-1 bg-gray-50 text-gray-400 font-black py-5 rounded-[24px] text-xs uppercase tracking-widest">Cancel</button>
              <button 
                onClick={() => {
                  if (editingItem) handleUpdate();
                  else {
                    if (sData.name && sData.email && sData.classId) {
                      handleAddStudentWithCreds(sData.name, sData.classId, sData.email, sData.password);
                    } else {
                      showAlert("Missing Info", "Please fill in all mandatory fields.", "error");
                    }
                  }
                }} 
                className="flex-1 bg-indigo-600 text-white font-black py-5 rounded-[24px] text-xs uppercase tracking-widest shadow-xl"
              >
                {editingItem ? "Save Changes" : "Create Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddCircular && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetModals} />
          <div className="relative w-full max-w-md bg-white rounded-[40px] p-8 animate-scale-in shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
            <h3 className="text-2xl font-black text-gray-900 mb-8 text-center">Draft Circular</h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Circular Title</label>
                <input type="text" value={circData.title} onChange={(e) => setCircData({ ...circData, title: e.target.value })} placeholder="Subject of Circular" className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Message Content</label>
                <textarea rows={4} value={circData.content} onChange={(e) => setCircData({ ...circData, content: e.target.value })} placeholder="Write your message here..." className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all resize-none" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Target Audience</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "teachers", label: "Teachers" },
                    { id: "parents", label: "Parents" },
                    { id: "both", label: "Both" }
                  ].map((target) => (
                    <button
                      key={target.id}
                      onClick={() => setCircData({ ...circData, targetAudience: target.id as any })}
                      className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${circData.targetAudience === target.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-gray-50 text-gray-400"}`}
                    >
                      {target.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Image URL (Optional)</label>
                <input type="text" value={circData.imageUrl} onChange={(e) => setCircData({ ...circData, imageUrl: e.target.value })} placeholder="https://example.com/image.jpg" className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all" />
              </div>
            </div>
            <div className="mt-10 flex gap-4">
              <button onClick={resetModals} className="flex-1 bg-gray-50 text-gray-400 font-black py-5 rounded-[24px] text-xs uppercase tracking-widest">Cancel</button>
              <button onClick={handleSendCircular} className="flex-1 bg-indigo-600 text-white font-black py-5 rounded-[24px] text-xs uppercase tracking-widest shadow-xl">Post Circular</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
