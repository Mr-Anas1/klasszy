"use client";

import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Activity, X } from "lucide-react";
import { useApp, LeaveApplication } from "@/context/AppContext";

export default function AdminActivitiesScreen() {
  const {
    leaveApplications, students, classes,
    adminReviewLeave, showAlert, setActiveTab,
  } = useApp();

  const [review, setReview] = useState<{
    leaveId: string;
    decision: "approve" | "reject";
    remark: string;
  } | null>(null);

  const portalTarget = useMemo(
    () => (typeof document !== "undefined" ? document.body : null),
    []
  );

  const pending = leaveApplications.filter(l => l.status === "pending_admin");
  const processed = leaveApplications.filter(
    l => l.status !== "pending_admin" && l.status !== "pending_teacher" && l.status !== "rejected_by_teacher"
  );

  const submitReview = async () => {
    if (!review) return;
    await adminReviewLeave(review.leaveId, { decision: review.decision, remark: review.remark });
    showAlert(
      "Done",
      review.decision === "approve" ? "Leave approved." : "Leave rejected.",
      "success"
    );
    setReview(null);
  };

  const getStudentName = (id: string) => students.find(s => s.id === id)?.name ?? "Student";
  const getClassLabel = (studentId: string) => {
    const s = students.find(st => st.id === studentId);
    if (!s) return "";
    const cls = classes.find(c => c.id === s.classId);
    return cls ? `${cls.name}-${cls.section}` : "";
  };

  return (
    <>
      <div className="pb-36 px-5 pt-6 animate-fade-slide-up">
        {/* Header */}
        <div className="mb-8">
          <div className="flex-1">
            <h2 className="text-2xl font-black text-gray-900 leading-none">Activities</h2>
            <p className="text-sm text-gray-400 mt-0.5">Leave requests & more</p>
          </div>
        </div>
        {pending.length > 0 && (
          <div className="bg-rose-100 px-3 py-1.5 rounded-xl">
            <span className="text-xs font-black text-rose-600">{pending.length} pending</span>
          </div>
        )}
        {/* Pending leaves */}
        {pending.length > 0 && (
          <section className="mb-8">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">
              Awaiting Your Decision
            </p>
            <div className="space-y-3">
              {pending.map(l => (
                <LeaveCard
                  key={l.id}
                  leave={l}
                  studentName={getStudentName(l.studentId)}
                  classLabel={getClassLabel(l.studentId)}
                  onApprove={() => setReview({ leaveId: l.id, decision: "approve", remark: "" })}
                  onReject={() => setReview({ leaveId: l.id, decision: "reject", remark: "" })}
                />
              ))}
            </div>
          </section>
        )}

        {/* Processed */}
        {processed.length > 0 && (
          <section>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">History</p>
            <div className="space-y-3">
              {processed.slice(0, 15).map(l => (
                <div
                  key={l.id}
                  className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-black text-gray-900">{getStudentName(l.studentId)}</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-widest">
                      {l.fromDate} → {l.toDate}
                    </p>
                  </div>
                  <StatusBadge status={l.status} />
                </div>
              ))}
            </div>
          </section>
        )}

        {leaveApplications.length === 0 && (
          <div className="bg-white border border-dashed border-gray-200 rounded-[32px] p-16 text-center mt-4">
            <Activity className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="font-black text-gray-900">No leave applications yet</p>
          </div>
        )}
      </div>

      {/* Decision Modal */}
      {review && portalTarget && createPortal(
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-end">
          <div className="bg-white w-full rounded-t-[40px] p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-gray-900">
                {review.decision === "approve" ? "Approve Leave" : "Reject Leave"}
              </h3>
              <button
                onClick={() => setReview(null)}
                className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <textarea
              placeholder="Add a remark (optional)"
              value={review.remark}
              onChange={e => setReview(p => p ? { ...p, remark: e.target.value } : null)}
              rows={3}
              className="w-full bg-gray-50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none mb-5"
            />
            <button
              onClick={submitReview}
              className={`w-full py-4 rounded-2xl font-black text-sm active:scale-95 transition-transform shadow-lg ${
                review.decision === "approve"
                  ? "bg-emerald-600 text-white shadow-emerald-200"
                  : "bg-rose-600 text-white shadow-rose-200"
              }`}
            >
              {review.decision === "approve" ? "Approve Leave" : "Reject Leave"}
            </button>
          </div>
        </div>,
        portalTarget
      )}
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LeaveCard({
  leave, studentName, classLabel, onApprove, onReject,
}: {
  leave: LeaveApplication;
  studentName: string;
  classLabel: string;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="bg-white rounded-[24px] p-5 border border-amber-100 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-gray-900">{studentName}</p>
          {classLabel && (
            <p className="text-[11px] font-bold text-indigo-500 mt-0.5">{classLabel}</p>
          )}
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
            {leave.fromDate} → {leave.toDate}
          </p>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 shrink-0">
          Pending
        </span>
      </div>

      <p className="text-sm text-gray-700 font-medium leading-relaxed">{leave.reason}</p>

      {(leave as any).teacherRemark && (
        <div className="mt-3 bg-indigo-50 rounded-2xl p-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-1">
            Teacher's Note
          </p>
          <p className="text-xs font-bold text-indigo-700">{(leave as any).teacherRemark}</p>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={onReject}
          className="bg-gray-100 text-gray-600 font-black py-3 rounded-2xl text-[10px] uppercase tracking-widest active:scale-95 transition-transform"
        >
          Reject
        </button>
        <button
          onClick={onApprove}
          className="bg-emerald-600 text-white font-black py-3 rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-200 active:scale-95 transition-transform"
        >
          Approve
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    approved: "bg-emerald-50 text-emerald-600",
    rejected_by_admin: "bg-rose-50 text-rose-600",
    rejected_by_teacher: "bg-rose-50 text-rose-500",
    pending_admin: "bg-amber-50 text-amber-600",
  };
  const label: Record<string, string> = {
    approved: "Approved",
    rejected_by_admin: "Rejected",
    rejected_by_teacher: "Rejected",
    pending_admin: "Pending",
  };
  return (
    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${map[status] ?? "bg-gray-50 text-gray-500"}`}>
      {label[status] ?? status}
    </span>
  );
}
