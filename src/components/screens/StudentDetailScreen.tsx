"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ArrowLeft, User, Phone, MapPin, Calendar, Droplet, MessageSquare, Send, Plus, Check, X, Trash2 } from "lucide-react";
import { createPortal } from "react-dom";
import { useApp, Student, StudentPersonalDetails, Remark } from "@/context/AppContext";
import { computeStudentAttendanceStats } from "@/lib/attendance-utils";
import MobileSelect from "@/components/ui/MobileSelect";

export default function StudentDetailScreen() {
  const { 
    selectedStudent, 
    setSelectedStudent, 
    setActiveTab, 
    studentDetailReturnTab,
    setStudentDetailReturnTab,
    studentDetails, 
    remarks, 
    sendRemark, 
    getStudentRemarks,
    classes,
    usersList,
    attendance,
    showAlert,
    showConfirm,
    updateStudentPersonalDetails,
    addStudent,
    updateStudent,
  } = useApp();

  const [showAddRemark, setShowAddRemark] = useState(false);
  const [remarkMessage, setRemarkMessage] = useState("");
  const [remarkType, setRemarkType] = useState<"academic" | "behavior" | "general">("general");
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [detailsForm, setDetailsForm] = useState({
    gender: "",
    fatherName: "",
    motherName: "",
    bloodGroup: "",
    dateOfBirth: "",
    parentPhone: "",
    address: ""
  });
  const [newStudentForm, setNewStudentForm] = useState({
    name: "",
    username: "",
    password: ""
  });
  const [isEditingCredentials, setIsEditingCredentials] = useState(false);
  const [credentialsForm, setCredentialsForm] = useState({
    username: "",
    password: ""
  });

  const portalTarget = useMemo(
    () => (typeof document !== "undefined" ? document.body : null),
    []
  );

  const studentClass = classes.find(c => c.id === selectedStudent?.classId);
  const studentRemarks = selectedStudent ? getStudentRemarks(selectedStudent.id) : [];
  const studentPersonalDetails = studentDetails.find(d => d.studentId === selectedStudent?.id);
  const parent = usersList.find(u => u.id === selectedStudent?.parentId);
  
  // Check if we're in "add student" mode (no selected student)
  const isAddStudentMode = !selectedStudent && isAddingStudent;

  const attendancePct = React.useMemo(() => {
    if (!selectedStudent) return 0;
    return computeStudentAttendanceStats(
      selectedStudent.id,
      selectedStudent.classId,
      attendance
    ).ratePct;
  }, [attendance, selectedStudent]);

  // Handle deleting a remark
  const handleDeleteRemark = async (remarkId: string) => {
    try {
      await showConfirm(
        "Delete Remark",
        "Are you sure you want to delete this remark? This action cannot be undone.",
        () => {
          // The actual deletion logic would go here
          // For now, this is just a placeholder
          console.log("Deleting remark:", remarkId);
        }
      );
      // The actual deletion would be handled in the context
    } catch (error: any) {
      showAlert("Error", "Failed to delete remark", "error");
    }
  };

  // Initialize form with existing data
  useEffect(() => {
    if (studentPersonalDetails) {
      setDetailsForm({
        gender: (studentPersonalDetails as any).gender || "",
        fatherName: studentPersonalDetails.fatherName,
        motherName: studentPersonalDetails.motherName,
        bloodGroup: studentPersonalDetails.bloodGroup,
        dateOfBirth: studentPersonalDetails.dateOfBirth,
        parentPhone: studentPersonalDetails.parentPhone,
        address: studentPersonalDetails.address
      });
    }
  }, [studentPersonalDetails]);

  useEffect(() => {
    if (!selectedStudent) return;
    setCredentialsForm({
      username: selectedStudent.username || "",
      password: selectedStudent.password || ""
    });
  }, [selectedStudent]);

  // FIXED: Added !isAddingStudent check so the Add Student view isn't blocked
  if (!selectedStudent && !isAddingStudent) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400">No student selected</p>
          <button 
            onClick={() => setActiveTab("manage_students")}
            className="mt-4 text-indigo-600 text-sm font-medium"
          >
            Go back to students
          </button>
        </div>
      </div>
    );
  }

  const handleSendRemark = async () => {
    if (!remarkMessage.trim()) {
      showAlert("Error", "Please enter a remark message", "error");
      return;
    }

    try {
      await sendRemark(selectedStudent!.id, remarkMessage, remarkType);
      setRemarkMessage("");
      setShowAddRemark(false);
      showAlert("Success", "Remark sent successfully", "success");
    } catch (error: any) {
      showAlert("Error", error.message, "error");
    }
  };

  const handleSaveDetails = async () => {
    if (!detailsForm.gender || !detailsForm.fatherName || !detailsForm.motherName || !detailsForm.parentPhone || !detailsForm.address) {
      showAlert("Error", "Gender, father name, mother name, parent phone and address are required.", "error");
      return;
    }

    try {
      await updateStudentPersonalDetails(selectedStudent!.id, {
        gender: detailsForm.gender as "male" | "female",
        fatherName: detailsForm.fatherName,
        motherName: detailsForm.motherName,
        bloodGroup: detailsForm.bloodGroup,
        dateOfBirth: detailsForm.dateOfBirth,
        parentPhone: detailsForm.parentPhone,
        address: detailsForm.address
      });
      showAlert("Success", "Personal details updated successfully", "success");
      setIsEditingDetails(false);
    } catch (error: any) {
      showAlert("Error", error.message, "error");
    }
  };

  const handleSaveCredentials = async () => {
    if (!selectedStudent) return;
    if (!credentialsForm.username.trim()) {
      showAlert("Error", "Username is required", "error");
      return;
    }
    if (!credentialsForm.password.trim()) {
      showAlert("Error", "Password is required", "error");
      return;
    }

    try {
      await updateStudent(selectedStudent.id, {
        username: credentialsForm.username.trim(),
        password: credentialsForm.password
      });
      showAlert("Success", "Student credentials updated successfully", "success");
      setIsEditingCredentials(false);
      setSelectedStudent({
        ...selectedStudent,
        username: credentialsForm.username.trim(),
        password: credentialsForm.password
      });
    } catch (error: any) {
      showAlert("Error", error.message, "error");
    }
  };

  // Handle adding new student to specific section
  const handleAddStudent = async () => {
    if (!newStudentForm.name.trim()) {
      showAlert("Error", "Student name is required", "error");
      return;
    }
    
    try {
      // Get the target class from studentDetailReturnTab or use first class
      let targetClassId = null;
      if (studentDetailReturnTab && studentDetailReturnTab.includes('section')) {
        // Extract class info from the return tab context
        const classMatch = studentDetailReturnTab.match(/manage_classes/);
        if (classMatch) {
          // Use the first class as fallback
          const firstClass = classes[0];
          targetClassId = firstClass?.id || null;
        }
      }
      
      if (!targetClassId) {
        showAlert("Error", "No class available for adding student", "error");
        return;
      }
      
      await addStudent({
        name: newStudentForm.name.trim(),
        classId: targetClassId,
        username: newStudentForm.username.trim() || newStudentForm.name.toLowerCase().replace(/\s+/g, ''),
        password: newStudentForm.password || 'password123'
      });
      
      setNewStudentForm({ name: '', username: '', password: '' });
      setIsAddingStudent(false);
      setSelectedStudent(null);
      setActiveTab(studentDetailReturnTab || 'manage_classes');
      showAlert("Success", "Student added successfully", "success");
    } catch (error: any) {
      showAlert("Error", error.message, "error");
    }
  };

  const getRemarkTypeColor = (type: string) => {
    switch (type) {
      case "academic": return "bg-blue-50 text-blue-600 border-blue-100";
      case "behavior": return "bg-amber-50 text-amber-600 border-amber-100";
      case "general": return "bg-gray-50 text-gray-600 border-gray-100";
      default: return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  return (
    <div className="pb-36 px-5 pt-4 min-h-full bg-[#f5f5f7] animate-fade-slide-up">
      {/* If we're in add student mode, show add student form */}
      {isAddStudentMode ? (
        <div>
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => {
                setIsAddingStudent(false);
                setActiveTab(studentDetailReturnTab || 'manage_classes');
              }}
              className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm active:scale-90 transition-transform"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex-1">
              <h2 className="text-2xl font-black text-gray-900 leading-none">Add New Student</h2>
              <p className="text-sm text-gray-400 font-medium mt-1">
                {studentDetailReturnTab?.includes('section') ? 'Add to Section' : 'Add New Student'}
              </p>
            </div>
          </div>

          {/* Add Student Form */}
          <div className="bg-white rounded-[32px] p-6 mb-6 shadow-sm border border-gray-100">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Student Name</label>
                <input
                  type="text"
                  value={newStudentForm.name}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
                  className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all"
                  placeholder="Enter student name"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Username (optional)</label>
                <input
                  type="text"
                  value={newStudentForm.username}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, username: e.target.value })}
                  className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all"
                  placeholder="Auto-generated if empty"
                />
              </div>
              
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Password (optional)</label>
                <input
                  type="password"
                  value={newStudentForm.password}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, password: e.target.value })}
                  className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all"
                  placeholder="Default: password123"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddStudent}
                className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-200 active:scale-95 transition-all hover:bg-indigo-700"
              >
                Add Student
              </button>
              <button
                onClick={() => {
                  setIsAddingStudent(false);
                  setActiveTab(studentDetailReturnTab || 'manage_classes');
                }}
                className="px-6 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : selectedStudent ? (
        /* Show existing student details */
        <>
          {/* Student Basic Info Card */}
          <div className="bg-white rounded-[32px] p-6 mb-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center">
                <User className="w-8 h-8 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-gray-900">{selectedStudent.name}</h3>
                <p className="text-sm text-gray-400">ID: {selectedStudent.id.slice(0, 8)}</p>
                <p className="text-sm font-medium text-indigo-600 mt-1">
                  {studentClass?.name}-{studentClass?.section}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Login Credentials</p>
                <button
                  onClick={() => setIsEditingCredentials(!isEditingCredentials)}
                  className="text-indigo-600 text-sm font-medium"
                >
                  {isEditingCredentials ? "Cancel" : "Edit"}
                </button>
              </div>
              {isEditingCredentials ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Username</label>
                    <input
                      type="text"
                      value={credentialsForm.username}
                      onChange={(e) => setCredentialsForm({ ...credentialsForm, username: e.target.value })}
                      className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Password</label>
                    <input
                      type="text"
                      value={credentialsForm.password}
                      onChange={(e) => setCredentialsForm({ ...credentialsForm, password: e.target.value })}
                      className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all"
                    />
                  </div>
                  <button
                    onClick={handleSaveCredentials}
                    className="col-span-2 bg-indigo-600 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-200 active:scale-95 transition-all hover:bg-indigo-700"
                  >
                    Save Credentials
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Username</p>
                    <p className="text-sm font-bold text-gray-900">{selectedStudent.username || "N/A"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Password</p>
                    <p className="text-sm font-bold text-gray-900">{selectedStudent.password || "password123"}</p>
                  </div>
                </div>
              )}
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Attendance</p>
                <p className="text-sm font-bold text-gray-900">{attendancePct}%</p>
              </div>
            </div>
          </div>

          {/* Personal Details */}
          <div className="bg-white rounded-[32px] p-6 mb-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-gray-900">Personal Details</h3>
              <button 
                onClick={() => setIsEditingDetails(!isEditingDetails)}
                className="text-indigo-600 text-sm font-medium"
              >
                {isEditingDetails ? "Cancel" : "Edit"}
              </button>
            </div>

            {isEditingDetails ? (
              <div>
                <div className="space-y-4">
                  <div>
                    <MobileSelect
                      label="Gender *"
                      placeholder="Select"
                      value={detailsForm.gender}
                      onChange={(v) => setDetailsForm({ ...detailsForm, gender: v })}
                      options={[
                        { value: "male", label: "Male" },
                        { value: "female", label: "Female" },
                      ]}
                      searchable={false}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Father's Name</label>
                      <input 
                        type="text" 
                        value={detailsForm.fatherName}
                        onChange={(e) => setDetailsForm({ ...detailsForm, fatherName: e.target.value })}
                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Mother's Name</label>
                      <input 
                        type="text" 
                        value={detailsForm.motherName}
                        onChange={(e) => setDetailsForm({ ...detailsForm, motherName: e.target.value })}
                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <MobileSelect
                        label="Blood Group"
                        placeholder="Select"
                        value={detailsForm.bloodGroup}
                        onChange={(v) => setDetailsForm({ ...detailsForm, bloodGroup: v })}
                        options={[
                          { value: "", label: "—" },
                          { value: "A+", label: "A+" },
                          { value: "A", label: "A" },
                          { value: "B+", label: "B+" },
                          { value: "B", label: "B" },
                          { value: "O+", label: "O+" },
                          { value: "O", label: "O" },
                          { value: "AB+", label: "AB+" },
                          { value: "AB", label: "AB" },
                        ]}
                        searchable={false}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Date of Birth</label>
                      <input 
                        type="date" 
                        value={detailsForm.dateOfBirth}
                        onChange={(e) => setDetailsForm({ ...detailsForm, dateOfBirth: e.target.value })}
                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Parent Phone</label>
                    <input 
                      type="tel" 
                      value={detailsForm.parentPhone}
                      onChange={(e) => setDetailsForm({ ...detailsForm, parentPhone: e.target.value })}
                      className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all" 
                      placeholder="Enter parent phone number"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Address</label>
                    <textarea 
                      value={detailsForm.address}
                      onChange={(e) => setDetailsForm({ ...detailsForm, address: e.target.value })}
                      className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all resize-none" 
                      rows={3}
                      placeholder="Enter complete address"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSaveDetails}
                    className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-200 active:scale-95 transition-all hover:bg-indigo-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-sm font-black text-gray-900">{detailsForm.fatherName || "N/A"}</p>
                  <p className="text-[11px] font-bold text-gray-400 mt-0.5">Father's Name</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-sm font-black text-gray-900">{detailsForm.motherName || "N/A"}</p>
                  <p className="text-[11px] font-bold text-gray-400 mt-0.5">Mother's Name</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-sm font-black text-gray-900">{detailsForm.bloodGroup || "N/A"}</p>
                  <p className="text-[11px] font-bold text-gray-400 mt-0.5">Blood Group</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-sm font-black text-gray-900">{detailsForm.dateOfBirth || "N/A"}</p>
                  <p className="text-[11px] font-bold text-gray-400 mt-0.5">Date of Birth</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-sm font-black text-gray-900">{detailsForm.parentPhone || "N/A"}</p>
                  <p className="text-[11px] font-bold text-gray-400 mt-0.5">Parent Phone</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 col-span-2">
                  <p className="text-sm font-black text-gray-900">{detailsForm.address || "N/A"}</p>
                  <p className="text-[11px] font-bold text-gray-400 mt-0.5">Address</p>
                </div>
              </div>
            )}
          </div>

          {/* Remarks Section */}
          <div className="bg-white rounded-[32px] p-6 mb-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-gray-900">Remarks</h3>
              <button
                onClick={() => setShowAddRemark(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-200 active:scale-95 transition-all hover:bg-indigo-700"
              >
                Add Remark
              </button>
            </div>

            <div className="space-y-3">
              {studentRemarks.map(remark => (
                <div
                  key={remark.id}
                  className={`p-4 rounded-2xl border ${getRemarkTypeColor(remark.type)}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-black text-gray-900 mb-1">{remark.message}</p>
                      <p className="text-[10px] font-bold text-gray-400 mt-1">
                        {new Date(remark.createdAt.seconds * 1000).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteRemark(remark.id)}
                      className="w-8 h-8 bg-rose-50 text-rose-400 rounded-xl flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {studentRemarks.length === 0 && (
                <div className="bg-gray-50 rounded-2xl p-8 text-center">
                  <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="font-black text-gray-900">No remarks yet</p>
                  <p className="text-sm text-gray-400 mt-1">Remarks will appear here once added</p>
                </div>
              )}
            </div>
          </div>

          {/* Add Remark Modal */}
          {showAddRemark && portalTarget && createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-[32px] p-6 w-full max-w-md mx-4 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black text-gray-900">Add Remark</h3>
                  <button
                    onClick={() => setShowAddRemark(false)}
                    className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Message</label>
                    <textarea
                      value={remarkMessage}
                      onChange={(e) => setRemarkMessage(e.target.value)}
                      className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all resize-none"
                      rows={4}
                      placeholder="Enter remark message"
                    />
                  </div>

                  <div>
                    <MobileSelect
                      label="Type"
                      placeholder="Remark type"
                      value={remarkType}
                      onChange={(v) => setRemarkType(v as "academic" | "behavior" | "general")}
                      options={[
                        { value: "general", label: "General" },
                        { value: "academic", label: "Academic" },
                        { value: "behavior", label: "Behavior" },
                      ]}
                      searchable={false}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSendRemark}
                    className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-200 active:scale-95 transition-all hover:bg-indigo-700"
                  >
                    Send Remark
                  </button>
                </div>
              </div>
            </div>,
            portalTarget
          )}
        {/* FIXED: Added missing closing fragment tag here */}
        </>
      ) : null}
    </div>
  );
}