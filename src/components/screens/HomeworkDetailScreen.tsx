"use client";

import React, { useState } from "react";
import { ArrowLeft, Calendar, BookOpen, Clock, User, CheckCircle2, AlertCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { getLocalISODate, isExpiredAfter } from "@/lib/date-window";

export default function HomeworkDetailScreen() {
  const { selectedHomework, setSelectedHomework, setActiveTab, homeworkStatus, toggleDiaryEntry, user } = useApp();
  const [isCompleting, setIsCompleting] = useState(false);

  if (!selectedHomework) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400">No homework selected</p>
          <button 
            onClick={() => setActiveTab("diary")}
            className="mt-4 text-indigo-600 text-sm font-medium"
          >
            Go back to homework
          </button>
        </div>
      </div>
    );
  }

  const currentStatus = homeworkStatus[selectedHomework.id] || "Pending";
  const isCompleted = currentStatus === "Completed";
  const today = getLocalISODate(new Date());
  const isExpired = isExpiredAfter(today, selectedHomework.dueDate);
  const effectiveStatus = isExpired ? "Expired" : currentStatus;

  const handleStatusToggle = async () => {
    if (isExpired) return;
    setIsCompleting(true);
    try {
      await toggleDiaryEntry(selectedHomework.id);
    } catch (error) {
      console.error("Error toggling homework status:", error);
    } finally {
      setIsCompleting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-rose-50 text-rose-500 border-rose-100";
      case "Medium": return "bg-amber-50 text-amber-600 border-amber-100";
      case "Low": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      default: return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Expired": return "bg-rose-50 text-rose-600 border-rose-100";
      case "Completed": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "Pending": return "bg-amber-50 text-amber-600 border-amber-100";
      default: return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  return (
    <div className="pb-36 px-5 pt-4 min-h-full bg-[#f5f5f7] animate-fade-slide-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex-1">
          <h2 className="text-2xl font-black text-gray-900 leading-none">Homework Details</h2>
          <p className="text-sm text-gray-400 mt-0.5">View task information</p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-[32px] p-6 mb-6 shadow-sm border border-gray-100">
        {/* Subject and Priority */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">
            {selectedHomework.subject}
          </span>
          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${getPriorityColor(selectedHomework.priority)}`}>
            {selectedHomework.priority} Priority
          </span>
          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${getStatusColor(effectiveStatus)}`}>
            {effectiveStatus}
          </span>
        </div>

        {/* Task Title */}
        <h3 className="text-2xl font-black text-gray-900 mb-4 leading-tight">
          {selectedHomework.task}
        </h3>

        {/* Task Details */}
        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-400 mt-1" />
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Due Date</p>
              <p className="text-sm font-bold text-gray-900">{selectedHomework.dueDate}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-400 mt-1" />
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Issue Date</p>
              <p className="text-sm font-bold text-gray-900">{(selectedHomework as any).issueDate || selectedHomework.dueDate}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-gray-400 mt-1" />
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Class</p>
              <p className="text-sm font-bold text-gray-900">{selectedHomework.className}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-gray-400 mt-1" />
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Assigned Date</p>
              <p className="text-sm font-bold text-gray-900">
                {new Date(selectedHomework.createdAt.seconds * 1000).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-gray-400 mt-1" />
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Assigned By</p>
              <p className="text-sm font-bold text-gray-900">Teacher</p>
            </div>
          </div>
        </div>

        {/* Status Toggle Button */}
        <button
          onClick={handleStatusToggle}
          disabled={isCompleting || isExpired}
          className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-lg ${
            isCompleted
              ? "bg-gray-50 text-gray-400 border-2 border-gray-200"
              : "bg-emerald-600 text-white shadow-emerald-100"
          } ${isCompleting || isExpired ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isCompleting ? (
            "Updating..."
          ) : isExpired ? (
            "Expired"
          ) : isCompleted ? (
            "Mark as Pending"
          ) : (
            "Mark as Completed ✓"
          )}
        </button>
      </div>

      {/* Additional Information */}
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
        <h4 className="text-lg font-black text-gray-900 mb-4">Task Information</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-sm text-gray-400">Task ID</span>
            <span className="text-sm font-bold text-gray-900">{selectedHomework.id.slice(0, 8)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-sm text-gray-400">Subject</span>
            <span className="text-sm font-bold text-gray-900">{selectedHomework.subject}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-400">Priority Level</span>
            <span className="text-sm font-bold text-gray-900">{selectedHomework.priority}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
