"use client";

import React, { useState } from "react";
import { ArrowLeft, MessageSquare, X } from "lucide-react";
import { useApp, Remark } from "@/context/AppContext";

export default function RemarksScreen() {
  const { user, students, remarks, setActiveTab } = useApp();
  const [selectedRemark, setSelectedRemark] = useState<Remark | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  if (!user) return null;

  // Get student for parent
  const currentStudent = user.role === "parent" ? students.find(s => s.parentId === user.id) : null;
  const studentRemarks = currentStudent ? remarks.filter(r => r.studentId === currentStudent.id) : [];

  return (
    <div className="pb-36 px-5 pt-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => setActiveTab("home")}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-black text-gray-900 flex-1">
          Remarks History
        </h1>
      </div>

      {/* Remarks List */}
      <div className="space-y-4">
        {studentRemarks.length > 0 ? (
          studentRemarks
            .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
            .map((remark) => (
              <div
                key={remark.id}
                onClick={() => {
                  setSelectedRemark(remark);
                  setShowDetailModal(true);
                }}
                className="bg-white border border-gray-100 rounded-[20px] p-4 shadow-sm cursor-pointer active:scale-[0.99] transition-all hover:shadow-md hover:border-indigo-100"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    remark.type === 'academic' ? 'bg-blue-100' :
                    remark.type === 'behavior' ? 'bg-rose-100' : 'bg-green-100'
                  }`}>
                    <MessageSquare className={`w-4 h-4 ${
                      remark.type === 'academic' ? 'text-blue-600' :
                        remark.type === 'behavior' ? 'text-rose-600' : 'text-green-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        {remark.type}
                      </p>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {new Date(remark.createdAt.seconds * 1000).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-gray-900 line-clamp-2">{remark.message}</p>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium mt-1">
                    by {remark.teacherName}
                  </p>
                </div>
              </div>
            ))
        ) : (
          <div className="bg-white border border-dashed border-gray-200 rounded-[32px] p-10 text-center">
            <MessageSquare className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-xs text-gray-400 font-medium">No remarks from teachers yet.</p>
          </div>
        )}
      </div>

      {/* Remark Detail Modal */}
      {showDetailModal && selectedRemark && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 overflow-x-hidden bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-[40px] p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-gray-900">Remark Details</h3>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  selectedRemark.type === 'academic' ? 'bg-blue-100' :
                  selectedRemark.type === 'behavior' ? 'bg-rose-100' : 'bg-green-100'
                }`}>
                  <MessageSquare className={`w-5 h-5 ${
                    selectedRemark.type === 'academic' ? 'text-blue-600' :
                      selectedRemark.type === 'behavior' ? 'text-rose-600' : 'text-green-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      {selectedRemark.type}
                    </p>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {new Date(selectedRemark.createdAt.seconds * 1000).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {new Date(selectedRemark.createdAt.seconds * 1000).toLocaleTimeString()}
                  </span>
                </div>
                </div>
                <p className="text-base font-bold text-gray-900 leading-relaxed mb-3">{selectedRemark.message}</p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-[10px] font-black text-gray-600">👤</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sent By</p>
                    <p className="text-sm font-bold text-gray-800">{selectedRemark.teacherName}</p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Note</p>
                  <p className="text-sm font-semibold text-gray-700 mt-1">
                    Remarks are shared by school staff for parent awareness.
                  </p>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
