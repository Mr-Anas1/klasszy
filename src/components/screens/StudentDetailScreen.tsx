"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, User, Phone, MapPin, Calendar, Droplet, MessageSquare, Send, Plus, Check, X } from "lucide-react";
import { useApp, Student, StudentPersonalDetails, Remark } from "@/context/AppContext";

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
    updateStudentPersonalDetails
  } = useApp();

  const [showAddRemark, setShowAddRemark] = useState(false);
  const [remarkMessage, setRemarkMessage] = useState("");
  const [remarkType, setRemarkType] = useState<"academic" | "behavior" | "general">("general");
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [detailsForm, setDetailsForm] = useState({
    fatherName: "",
    motherName: "",
    bloodGroup: "",
    dateOfBirth: "",
    parentPhone: "",
    address: ""
  });

  const studentClass = classes.find(c => c.id === selectedStudent?.classId);
  const studentRemarks = selectedStudent ? getStudentRemarks(selectedStudent.id) : [];
  const studentPersonalDetails = studentDetails.find(d => d.studentId === selectedStudent?.id);
  const parent = usersList.find(u => u.id === selectedStudent?.parentId);

  const attendancePct = React.useMemo(() => {
    if (!selectedStudent) return 0;
    const statuses: ("present" | "absent" | "late")[] = [];
    (attendance || []).forEach((doc) => {
      const r = doc.records.find((rr) => rr.studentId === selectedStudent.id);
      if (r) statuses.push(r.status);
    });
    const total = statuses.length;
    const presentLike = statuses.filter((s) => s === "present" || s === "late").length;
    return total === 0 ? 0 : Math.round((presentLike / total) * 100);
  }, [attendance, selectedStudent]);

  // Initialize form with existing data
  useEffect(() => {
    if (studentPersonalDetails) {
      setDetailsForm({
        fatherName: studentPersonalDetails.fatherName,
        motherName: studentPersonalDetails.motherName,
        bloodGroup: studentPersonalDetails.bloodGroup,
        dateOfBirth: studentPersonalDetails.dateOfBirth,
        parentPhone: studentPersonalDetails.parentPhone,
        address: studentPersonalDetails.address
      });
    }
  }, [studentPersonalDetails]);

  if (!selectedStudent) {
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
      await sendRemark(selectedStudent.id, remarkMessage, remarkType);
      setRemarkMessage("");
      setShowAddRemark(false);
      showAlert("Success", "Remark sent successfully", "success");
    } catch (error: any) {
      showAlert("Error", error.message, "error");
    }
  };

  const handleSaveDetails = async () => {
    if (!detailsForm.fatherName || !detailsForm.motherName || !detailsForm.parentPhone || !detailsForm.address) {
      showAlert("Error", "Please fill in all required fields", "error");
      return;
    }

    try {
      await updateStudentPersonalDetails(selectedStudent.id, {
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
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => {
            setSelectedStudent(null);
            const backTab = studentDetailReturnTab || "home";
            setActiveTab(backTab);
            setStudentDetailReturnTab("home");
          }}
          className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm active:scale-90"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-black text-gray-900 leading-none">Student Details</h2>
          <p className="text-sm text-gray-400 font-medium mt-1">{selectedStudent.name}</p>
        </div>
      </div>

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

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Username</p>
            <p className="text-sm font-bold text-gray-900">{selectedStudent.username || "N/A"}</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Password</p>
            <p className="text-sm font-bold text-gray-900">{selectedStudent.password || "password123"}</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4 col-span-2">
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
          <div className="space-y-4">
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
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Blood Group</label>
                <select 
                  value={detailsForm.bloodGroup}
                  onChange={(e) => setDetailsForm({ ...detailsForm, bloodGroup: e.target.value })}
                  className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all"
                >
                  <option value="">Select</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
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
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Address</label>
              <textarea 
                rows={3}
                value={detailsForm.address}
                onChange={(e) => setDetailsForm({ ...detailsForm, address: e.target.value })}
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all resize-none" 
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
            {studentPersonalDetails ? (
              <>
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Father's Name</p>
                    <p className="text-sm font-bold text-gray-900">{studentPersonalDetails.fatherName || "Not specified"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Mother's Name</p>
                    <p className="text-sm font-bold text-gray-900">{studentPersonalDetails.motherName || "Not specified"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Droplet className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Blood Group</p>
                    <p className="text-sm font-bold text-gray-900">{studentPersonalDetails.bloodGroup || "Not specified"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Date of Birth</p>
                    <p className="text-sm font-bold text-gray-900">{studentPersonalDetails.dateOfBirth || "Not specified"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Parent Phone</p>
                    <p className="text-sm font-bold text-gray-900">{studentPersonalDetails.parentPhone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Address</p>
                    <p className="text-sm font-bold text-gray-900">{studentPersonalDetails.address}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">No personal details added yet</p>
                <button 
                  onClick={() => setIsEditingDetails(true)}
                  className="mt-2 text-indigo-600 text-sm font-medium"
                >
                  Add Personal Details
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Remarks Section */}
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black text-gray-900">Remarks</h3>
          <button 
            onClick={() => setShowAddRemark(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-2xl flex items-center gap-2 text-sm font-black active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Remark
          </button>
        </div>

        <div className="space-y-3">
          {studentRemarks.length > 0 ? (
            studentRemarks.map((remark) => (
              <div key={remark.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getRemarkTypeColor(remark.type)}`}>
                      {remark.type}
                    </span>
                    <p className="text-xs text-gray-400">
                      by {remark.teacherName} • {new Date(remark.createdAt.seconds * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-900 leading-relaxed">{remark.message}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No remarks yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Remark Modal */}
      {showAddRemark && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddRemark(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[40px] p-8 animate-scale-in shadow-2xl">
            <h3 className="text-xl font-black text-gray-900 mb-6 text-center">Send Remark</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Remark Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "academic", label: "Academic" },
                    { id: "behavior", label: "Behavior" },
                    { id: "general", label: "General" }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setRemarkType(type.id as any)}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${remarkType === type.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-gray-50 text-gray-400"}`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Message</label>
                <textarea 
                  rows={4}
                  value={remarkMessage}
                  onChange={(e) => setRemarkMessage(e.target.value)}
                  placeholder="Type your remark here..."
                  className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all resize-none" 
                />
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => setShowAddRemark(false)} 
                className="flex-1 bg-gray-50 text-gray-400 font-black py-4 rounded-2xl text-xs uppercase tracking-widest"
              >
                Cancel
              </button>
              <button 
                onClick={handleSendRemark}
                className="flex-1 bg-indigo-600 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-indigo-100"
              >
                Send Remark
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
