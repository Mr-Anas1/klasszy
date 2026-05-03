"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
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
  FileEdit,
  Bell
} from "lucide-react";
import { useApp, STANDARD_GRADES, Student, ClassRoom, UserProfile, UserRole } from "@/context/AppContext";

export default function AdminDashboardScreen() {
  const { students, classes, usersList, circulars, school, addStudent, addClass, updateTeacherClasses, onboardUser, updateStudent, deleteStudent, updateClass, deleteClass, deleteUser, sendCircular, deleteCircular, showAlert, showConfirm, activeTab, setActiveTab, setSelectedCircular, updateUserProfile, setSelectedStudent, selectedTeacher, setSelectedTeacher, updateStudentPersonalDetails, sendNotification } = useApp();

  const [view, setView] = useState<"main" | "grade_details" | "section_details" | "teacher_management">("main");
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const [showAddClass, setShowAddClass] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [showAddCircular, setShowAddCircular] = useState(false);
  const [showSendNotification, setShowSendNotification] = useState(false);

  const portalTarget = useMemo(() => {
    if (typeof document === "undefined") return null;
    return document.body;
  }, []);

  const anyDashboardModalOpen = showAddClass || showAddStudent || showAddTeacher || showAddCircular || showSendNotification;

  useEffect(() => {
    if (!anyDashboardModalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [anyDashboardModalOpen]);

  // Form states
  const [cData, setCData] = useState({ grade: STANDARD_GRADES[0], section: "A", customSection: "" });
  const [sData, setSData] = useState({ 
    name: "", 
    classId: "", 
    username: "", 
    password: "", 
    email: "",
    fatherName: "",
    motherName: "",
    dateOfBirth: "",
    bloodGroup: "",
    address: ""
  });
  const [tData, setTData] = useState({ name: "", email: "", password: "", classIds: [] as string[] });
  const [circData, setCircData] = useState({ title: "", content: "", imageUrl: "", targetAudience: "both" as "teachers" | "parents" | "both" });
  const [nData, setNData] = useState({
    title: "",
    message: "",
    type: "general" as "fee" | "general" | "instruction",
    targetType: "class" as "student" | "class",
    targetId: ""
  });
  const [notifClassId, setNotifClassId] = useState<string>("");
  const [notifClassQuery, setNotifClassQuery] = useState("");
  const [notifStudentQuery, setNotifStudentQuery] = useState("");

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
    setShowSendNotification(false);
    setSData({ 
      name: "", 
      classId: "", 
      username: "", 
      password: "", 
      email: "",
      fatherName: "",
      motherName: "",
      dateOfBirth: "",
      bloodGroup: "",
      address: ""
    });
    setTData({ name: "", email: "", password: "", classIds: [] });
    setCData({ grade: STANDARD_GRADES[0], section: "A", customSection: "" });
    setCircData({ title: "", content: "", imageUrl: "", targetAudience: "both" });
    setNData({ title: "", message: "", type: "general", targetType: "class", targetId: "" });
    setNotifClassId("");
    setNotifClassQuery("");
    setNotifStudentQuery("");
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

  const handleAddStudentWithCreds = async (name: string, classId: string, username: string, password?: string, personalDetails?: {
    fatherName: string;
    motherName: string;
    dateOfBirth: string;
    bloodGroup: string;
    address: string;
  }) => {
    if (name && classId) {
      try {
        // First create the student
        await addStudent({
          name,
          classId,
          username,
          password
        });
        
        // Then save personal details if provided
        if (personalDetails && (personalDetails.fatherName || personalDetails.motherName || personalDetails.dateOfBirth || personalDetails.bloodGroup || personalDetails.address)) {
          // Find the newly created student to get their ID
          const newStudent = students.find(s => s.name === name && s.classId === classId && s.username === username);
          if (newStudent) {
            await updateStudentPersonalDetails(newStudent.id, {
              fatherName: personalDetails.fatherName,
              motherName: personalDetails.motherName,
              bloodGroup: personalDetails.bloodGroup,
              dateOfBirth: personalDetails.dateOfBirth,
              parentPhone: "", // Will be updated later
              address: personalDetails.address
            });
          }
        }
        
        resetModals();
      } catch (error) {
        console.error("Error adding student:", error);
      }
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

  const handleSendNotification = async () => {
    if (!nData.title || !nData.message || !nData.targetId) {
      showAlert("Missing Info", "Please fill in Title, Message, and Target.", "error");
      return;
    }
    await sendNotification(nData);
    showAlert("Notification Sent", "The notification has been sent successfully.", "success");
    resetModals();
  };

  const filteredNotifClasses = classes.filter((c) => {
    const label = `${c.name}-${c.section}`.toLowerCase();
    return label.includes(notifClassQuery.trim().toLowerCase());
  });

  const filteredNotifStudents = students
    .filter((s) => (notifClassId ? s.classId === notifClassId : true))
    .filter((s) => s.name.toLowerCase().includes(notifStudentQuery.trim().toLowerCase()));

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
              onClick={() => t && toggleTeacherClass(t, c.id)}
              className={`w-full rounded-[24px] p-5 border flex items-center justify-between transition-all ${t?.classIds?.includes(c.id) ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-white border-gray-100 text-gray-900"}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${t?.classIds?.includes(c.id) ? "bg-white/20" : "bg-indigo-50 text-indigo-600"}`}>
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
              <button 
                onClick={() => {
                  setSelectedStudent(s);
                  setActiveTab("student_detail");
                }}
                className="flex-1 text-left"
              >
                <h4 className="text-sm font-black text-gray-900">{s.name}</h4>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">ID: {s.id.slice(0, 8)}</p>
              </button>
              <button 
                onClick={() => handleDelete("student", s.id)} 
                className="w-8 h-8 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
              >
                <Trash2 className="w-4 h-4" />
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSendNotification(true)}
              className="px-4 py-2.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-100 active:scale-95 transition-all"
            >
              <Bell className="w-3.5 h-3.5" />
              Notify
            </button>
            <button
              onClick={() => setShowAddCircular(true)}
              className="px-4 py-2.5 bg-white border border-gray-100 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm active:scale-95 transition-all hover:border-indigo-100"
            >
              <Plus className="w-3.5 h-3.5" />
              Circular
            </button>
          </div>
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
                onClick={() => { 
                setSelectedTeacher(t); 
                setActiveTab("teacher_detail");
              }}
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
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete("teacher", t.id); }} 
                  className="w-8 h-8 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white active:scale-90"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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
                <button 
                  onClick={() => {
                    setSelectedStudent(s);
                    setActiveTab("student_detail");
                  }}
                  className="flex-1 text-left"
                >
                  <h4 className="text-sm font-black text-gray-900">{s.name}</h4>
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                    Class: {classes.find(c => c.id === s.classId)?.name}-{classes.find(c => c.id === s.classId)?.section || "Unassigned"}
                  </p>
                </button>
                <button 
                  onClick={() => handleDelete("student", s.id)} 
                  className="w-8 h-8 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white active:scale-90"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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
      {portalTarget && showAddClass ? createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 overflow-x-hidden">
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
        </div>,
        portalTarget
      ) : null}

      {portalTarget && showAddTeacher ? createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 overflow-x-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetModals} />
          <div className="relative w-full max-w-md bg-white rounded-[40px] p-8 animate-scale-in shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
            <h3 className="text-2xl font-black text-gray-900 mb-8 text-center">
              Register Teacher
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
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Login Password</label>
                <input type="text" value={tData.password} onChange={(e) => setTData({ ...tData, password: e.target.value })} placeholder="Default: password123" className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all" />
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
                onClick={() => handleAddUser("teacher")}
                className="flex-1 bg-indigo-600 text-white font-black py-5 rounded-[24px] text-xs uppercase tracking-widest shadow-xl"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>,
        portalTarget
      ) : null}

      {portalTarget && showAddStudent ? createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 overflow-x-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetModals} />
          <div className="relative w-full max-w-md bg-white rounded-[40px] p-8 animate-scale-in shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
            <h3 className="text-2xl font-black text-gray-900 mb-8 text-center">
              New Student Entry
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

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Login Password</label>
                <input type="text" value={sData.password} onChange={(e) => setSData({ ...sData, password: e.target.value })} placeholder="Default: password123" className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all" />
              </div>
              
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
              
              <div className="border-t pt-6 mt-6">
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">Personal Details</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Father's Name</label>
                    <input 
                      type="text" 
                      value={sData.fatherName} 
                      onChange={(e) => setSData({ ...sData, fatherName: e.target.value })} 
                      placeholder="Father's Full Name" 
                      className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all" 
                    />
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Mother's Name</label>
                    <input 
                      type="text" 
                      value={sData.motherName} 
                      onChange={(e) => setSData({ ...sData, motherName: e.target.value })} 
                      placeholder="Mother's Full Name" 
                      className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all" 
                    />
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Date of Birth</label>
                    <input 
                      type="date" 
                      value={sData.dateOfBirth} 
                      onChange={(e) => setSData({ ...sData, dateOfBirth: e.target.value })} 
                      className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all" 
                    />
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Blood Group</label>
                    <select 
                      value={sData.bloodGroup} 
                      onChange={(e) => setSData({ ...sData, bloodGroup: e.target.value })} 
                      className="appearance-none w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-black text-gray-900 focus:outline-none focus:bg-white focus:border-indigo-100 transition-all"
                    >
                      <option value="">Select Blood Group...</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Address</label>
                    <textarea 
                      value={sData.address} 
                      onChange={(e) => setSData({ ...sData, address: e.target.value })} 
                      placeholder="Complete Address" 
                      rows={3}
                      className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all resize-none" 
                    />
                  </div>
                </div>
              </div>
              <div className="mt-10 flex gap-4">
                <button onClick={resetModals} className="flex-1 bg-gray-50 text-gray-400 font-black py-5 rounded-[24px] text-xs uppercase tracking-widest">Cancel</button>
                <button 
                  onClick={() => {
                    if (sData.name && sData.username && sData.classId) {
                      handleAddStudentWithCreds(sData.name, sData.classId, sData.username, sData.password, {
                        fatherName: sData.fatherName,
                        motherName: sData.motherName,
                        dateOfBirth: sData.dateOfBirth,
                        bloodGroup: sData.bloodGroup,
                        address: sData.address
                      });
                    }
                  }} 
                  className="flex-1 bg-indigo-600 text-white font-black py-5 rounded-[24px] text-xs uppercase tracking-widest shadow-xl"
                >
                  Create Account
                </button>
              </div>
            </div>
          </div>
        </div>,
        portalTarget
      ) : null}

      {portalTarget && showAddCircular ? createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 overflow-x-hidden">
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
        </div>,
        portalTarget
      ) : null}

      {portalTarget && showSendNotification ? createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 overflow-x-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetModals} />
          <div className="relative w-full max-w-md bg-white rounded-[40px] p-8 animate-scale-in shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
            <h3 className="text-2xl font-black text-gray-900 mb-8 text-center">Send Notification</h3>

            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Type</label>
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
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Target</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setNData({ ...nData, targetType: "class", targetId: "" });
                      setNotifStudentQuery("");
                    }}
                    className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${nData.targetType === "class" ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-gray-100 text-gray-400"}`}
                  >
                    Class
                  </button>
                  <button
                    onClick={() => {
                      setNData({ ...nData, targetType: "student", targetId: "" });
                    }}
                    className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${nData.targetType === "student" ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-gray-100 text-gray-400"}`}
                  >
                    Student
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Select Class</label>
                <input
                  value={notifClassQuery}
                  onChange={(e) => setNotifClassQuery(e.target.value)}
                  placeholder="Search class..."
                  className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all"
                />

                <div className="mt-3 grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-2xl no-scrollbar">
                  {filteredNotifClasses.map((c) => {
                    const id = c.id;
                    const active = notifClassId === id;
                    return (
                      <button
                        key={id}
                        onClick={() => {
                          setNotifClassId(id);
                          setNotifStudentQuery("");
                          if (nData.targetType === "class") {
                            setNData({ ...nData, targetId: id });
                          } else {
                            setNData({ ...nData, targetId: "" });
                          }
                        }}
                        className={`px-3 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${active ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-gray-100 text-gray-400"}`}
                      >
                        {c.name}-{c.section}
                      </button>
                    );
                  })}
                  {filteredNotifClasses.length === 0 && (
                    <p className="col-span-2 text-center py-4 text-[10px] text-gray-400 italic">No classes found</p>
                  )}
                </div>
              </div>

              {nData.targetType === "student" && (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Select Student</label>
                  <input
                    value={notifStudentQuery}
                    onChange={(e) => setNotifStudentQuery(e.target.value)}
                    placeholder={notifClassId ? "Search student in class..." : "Search student..."}
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
                      <p className="text-center py-4 text-[10px] text-gray-400 italic">
                        {notifClassId ? "No students found in this class." : "Select a class to filter students."}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Title</label>
                <input
                  type="text"
                  value={nData.title}
                  onChange={(e) => setNData({ ...nData, title: e.target.value })}
                  placeholder="e.g. Fee Reminder"
                  className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Message</label>
                <textarea
                  value={nData.message}
                  onChange={(e) => setNData({ ...nData, message: e.target.value })}
                  placeholder="Write the notification message..."
                  className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all min-h-[120px]"
                />
              </div>
            </div>

            <div className="mt-10 flex gap-4">
              <button onClick={resetModals} className="flex-1 bg-gray-50 text-gray-400 font-black py-5 rounded-[24px] text-xs uppercase tracking-widest">Cancel</button>
              <button onClick={handleSendNotification} className="flex-1 bg-indigo-600 text-white font-black py-5 rounded-[24px] text-xs uppercase tracking-widest shadow-xl">Send</button>
            </div>
          </div>
        </div>,
        portalTarget
      ) : null}
    </>
  );
}
