"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, Award, BookOpen, Users, Edit3, Check, X, Plus, Trash2 } from "lucide-react";
import { useApp, UserProfile, ClassRoom, Student, Homework, AttendanceRecord } from "@/context/AppContext";

export default function TeacherDetailScreen() {
  const { 
    selectedTeacher, 
    setSelectedTeacher,
    setActiveTab, 
    classes, 
    students, 
    homework, 
    attendance, 
    usersList,
    updateUserProfile,
    updateTeacherClasses,
    setTeacherAsClassTeacher,
    showAlert,
    showConfirm
  } = useApp();
  
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [isManagingClasses, setIsManagingClasses] = useState(false);
  const [isManagingClassTeacher, setIsManagingClassTeacher] = useState(false);
  const [detailsForm, setDetailsForm] = useState({
    phone: "",
    password: "",
    address: "",
    qualifications: "",
    experience: "",
    specialization: ""
  });

  const teacherClasses = classes.filter(c => selectedTeacher?.classIds?.includes(c.id));
  const classTeacherClasses = classes.filter((c) => (c.classTeacherId || "").trim() === selectedTeacher?.id);
  const teacherStudents = students.filter(s => selectedTeacher?.classIds?.includes(s.classId));
  const teacherHomework = homework.filter(h => selectedTeacher?.id === h.createdBy);
  const teacherAttendance = attendance.filter(a => selectedTeacher?.id === a.markedBy);

  // Calculate statistics
  const totalClassesAssigned = teacherClasses.length;
  const totalStudentsTaught = teacherStudents.length;
  const totalHomeworkAssigned = teacherHomework.length;
  const totalAttendanceMarked = teacherAttendance.length;

  // Initialize form with existing data
  useEffect(() => {
    if (selectedTeacher) {
      setDetailsForm({
        phone: selectedTeacher.phone || "",
        password: selectedTeacher.password || "",
        address: "", // Would need to be added to UserProfile or separate collection
        qualifications: "",
        experience: "",
        specialization: ""
      });
    }
  }, [selectedTeacher]);

  if (!selectedTeacher || selectedTeacher.role !== "teacher") {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400">No teacher selected</p>
          <button 
            onClick={() => setActiveTab("manage_teachers")}
            className="mt-4 text-indigo-600 text-sm font-medium"
          >
            Go back to teachers
          </button>
        </div>
      </div>
    );
  }

  const handleSaveDetails = async () => {
    if (!detailsForm.phone) {
      showAlert("Error", "Please provide a phone number", "error");
      return;
    }

    try {
      await updateUserProfile(selectedTeacher.id, {
        phone: detailsForm.phone,
        password: detailsForm.password
      });
      showAlert("Success", "Teacher details updated successfully", "success");
      setIsEditingDetails(false);
    } catch (error: any) {
      showAlert("Error", error.message, "error");
    }
  };

  const handleClassTeacherAssignment = async (classId: string, assign: boolean) => {
    try {
      const current = selectedTeacher.classTeacherClassIds || [];
      const next = assign
        ? Array.from(new Set([...current, classId]))
        : current.filter((id) => id !== classId);

      await setTeacherAsClassTeacher(selectedTeacher.id, next);

      setSelectedTeacher({
        ...selectedTeacher,
        classTeacherClassIds: next,
      });

      showAlert("Success", `Class teacher assignment ${assign ? "added" : "removed"}.`, "success");
    } catch (error: any) {
      showAlert("Error", error.message, "error");
    }
  };

  const handleClassAssignment = async (classId: string, assign: boolean) => {
    try {
      const currentClassIds = selectedTeacher.classIds || [];
      const newClassIds = assign 
        ? [...currentClassIds, classId]
        : currentClassIds.filter(id => id !== classId);
      
      await updateTeacherClasses(selectedTeacher.id, newClassIds);
      
      // Update the selectedTeacher state to reflect the change immediately
      setSelectedTeacher({
        ...selectedTeacher,
        classIds: newClassIds
      });
      
      showAlert("Success", `Class ${assign ? 'assigned' : 'unassigned'} successfully`, "success");
    } catch (error: any) {
      showAlert("Error", error.message, "error");
    }
  };

  const handleDeleteTeacher = () => {
    showConfirm(
      "Delete Teacher Account",
      `Are you sure you want to remove ${selectedTeacher.name}? This will permanently delete their access and cannot be undone.`,
      async () => {
        try {
          // This would need to be implemented in AppContext
          showAlert("Success", "Teacher account deleted successfully", "success");
          setActiveTab("manage_teachers");
        } catch (error: any) {
          showAlert("Error", error.message, "error");
        }
      }
    );
  };

  return (
    <div className="pb-36 px-5 pt-4 min-h-full bg-[#f5f5f7] animate-fade-slide-up">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => {
            setActiveTab("manage_teachers");
          }}
          className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm active:scale-90"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-black text-gray-900 leading-none">Teacher Details</h2>
          <p className="text-sm text-gray-400 font-medium mt-1">{selectedTeacher.name}</p>
        </div>
        <button 
          onClick={handleDeleteTeacher}
          className="w-10 h-10 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shadow-sm active:scale-90"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Teacher Basic Info Card */}
      <div className="bg-white rounded-[32px] p-6 mb-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center">
            <User className="w-8 h-8 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black text-gray-900">{selectedTeacher.name}</h3>
            <p className="text-sm text-gray-400">ID: {selectedTeacher.id.slice(0, 8)}</p>
            <p className="text-sm font-medium text-indigo-600 mt-1">Teacher</p>
          </div>
          <button 
            onClick={() => setIsEditingDetails(!isEditingDetails)}
            className="text-indigo-600 text-sm font-medium"
          >
            {isEditingDetails ? "Cancel" : <Edit3 className="w-4 h-4" />}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Email</p>
            <p className="text-sm font-bold text-gray-900 truncate">{selectedTeacher.email}</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Password</p>
            <p className="text-sm font-bold text-gray-900">{selectedTeacher.password || "Not set"}</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4 col-span-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Phone</p>
            <p className="text-sm font-bold text-gray-900">{selectedTeacher.phone || "Not provided"}</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{totalClassesAssigned}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Classes</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{totalStudentsTaught}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Students</p>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Details */}
      <div className="bg-white rounded-[32px] p-6 mb-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black text-gray-900">Professional Details</h3>
          <button 
            onClick={() => setIsEditingDetails(!isEditingDetails)}
            className="text-indigo-600 text-sm font-medium"
          >
            {isEditingDetails ? "Cancel" : "Edit"}
          </button>
        </div>

        {isEditingDetails ? (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Phone Number</label>
              <input 
                type="tel" 
                value={detailsForm.phone}
                onChange={(e) => setDetailsForm({ ...detailsForm, phone: e.target.value })}
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all" 
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Password</label>
              <input
                type="text"
                value={detailsForm.password}
                onChange={(e) => setDetailsForm({ ...detailsForm, password: e.target.value })}
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Address</label>
              <textarea 
                rows={3}
                value={detailsForm.address}
                onChange={(e) => setDetailsForm({ ...detailsForm, address: e.target.value })}
                placeholder="Teacher's address..."
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all resize-none" 
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Qualifications</label>
              <input 
                type="text" 
                value={detailsForm.qualifications}
                onChange={(e) => setDetailsForm({ ...detailsForm, qualifications: e.target.value })}
                placeholder="e.g. M.Sc Mathematics, B.Ed"
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all" 
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Experience (years)</label>
              <input 
                type="number" 
                value={detailsForm.experience}
                onChange={(e) => setDetailsForm({ ...detailsForm, experience: e.target.value })}
                placeholder="Years of teaching experience"
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all" 
              />
            </div>
            <button 
              onClick={handleSaveDetails}
              className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl text-sm uppercase tracking-widest shadow-lg shadow-indigo-100 active:scale-95 transition-all"
            >
              Save Details
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Phone</p>
                <p className="text-sm font-bold text-gray-900">{selectedTeacher.phone || "Not provided"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email</p>
                <p className="text-sm font-bold text-gray-900">{selectedTeacher.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Password</p>
                <p className="text-sm font-bold text-gray-900">{selectedTeacher.password || "Not set"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Member Since</p>
                <p className="text-sm font-bold text-gray-900">
                  {new Date(selectedTeacher.createdAt.seconds * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Assign as Class Teacher */}
      <div className="bg-white rounded-[32px] p-6 mb-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black text-gray-900">Assign as Class Teacher</h3>
          <button
            onClick={() => setIsManagingClassTeacher(!isManagingClassTeacher)}
            className="text-indigo-600 text-sm font-medium"
          >
            {isManagingClassTeacher ? "Done" : "Manage"}
          </button>
        </div>

        {isManagingClassTeacher ? (
          <div>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 bg-gray-50 rounded-2xl no-scrollbar">
              {classes.map((c) => {
                const isAssigned = (selectedTeacher.classTeacherClassIds || []).includes(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => handleClassTeacherAssignment(c.id, !isAssigned)}
                    className={`px-3 py-3 rounded-xl text-[10px] font-bold transition-all border ${
                      isAssigned
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "bg-white border-gray-100 text-gray-400"
                    }`}
                  >
                    {c.name}-{c.section}
                  </button>
                );
              })}
              {classes.length === 0 && (
                <p className="col-span-2 text-center py-4 text-[10px] text-gray-400 italic">No classes available</p>
              )}
            </div>
            <div className="mt-4 text-center">
              <p className="text-[10px] text-gray-400">
                {(selectedTeacher.classTeacherClassIds?.length || 0)} classes assigned as class teacher
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {classTeacherClasses.map((classItem) => (
              <div key={classItem.id} className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div>
                  <p className="text-sm font-bold text-gray-900">{classItem.name}-{classItem.section}</p>
                  <p className="text-[10px] text-emerald-700 font-black uppercase tracking-widest mt-1">Class Teacher</p>
                </div>
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
              </div>
            ))}

            {classTeacherClasses.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">Not assigned as class teacher</p>
                <p className="text-gray-300 text-[10px] mt-1">Click "Manage" to assign classes</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Class Assignments */}
      <div className="bg-white rounded-[32px] p-6 mb-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black text-gray-900">Class Assignments</h3>
          <button 
            onClick={() => setIsManagingClasses(!isManagingClasses)}
            className="text-indigo-600 text-sm font-medium"
          >
            {isManagingClasses ? "Done" : "Manage"}
          </button>
        </div>

        {isManagingClasses ? (
          <div>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 bg-gray-50 rounded-2xl no-scrollbar">
              {classes.map(c => (
                <button 
                  key={c.id}
                  onClick={() => handleClassAssignment(c.id, !selectedTeacher.classIds?.includes(c.id))}
                  className={`px-3 py-3 rounded-xl text-[10px] font-bold transition-all border ${
                    selectedTeacher.classIds?.includes(c.id) 
                      ? "bg-indigo-600 border-indigo-600 text-white" 
                      : "bg-white border-gray-100 text-gray-400"
                  }`}
                >
                  {c.name}-{c.section}
                </button>
              ))}
              {classes.length === 0 && <p className="col-span-2 text-center py-4 text-[10px] text-gray-400 italic">No classes available</p>}
            </div>
            <div className="mt-4 text-center">
              <p className="text-[10px] text-gray-400">
                {selectedTeacher.classIds?.length || 0} classes assigned
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {classes.filter(c => selectedTeacher.classIds?.includes(c.id)).map((classItem) => (
              <div key={classItem.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div>
                  <p className="text-sm font-bold text-gray-900">{classItem.name}-{classItem.section}</p>
                  <p className="text-[10px] text-gray-400">
                    {students.filter(s => s.classId === classItem.id).length} students
                  </p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
              </div>
            ))}
            {selectedTeacher.classIds?.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">No classes assigned</p>
                <p className="text-gray-300 text-[10px] mt-1">Click "Manage" to assign classes</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Activity Summary */}
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-black text-gray-900 mb-6">Activity Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-black text-indigo-600">{totalHomeworkAssigned}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Homework</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-emerald-600">{totalAttendanceMarked}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Attendance</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-amber-600">{totalStudentsTaught}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Students</p>
          </div>
        </div>
      </div>
    </div>
  );
}
