"use client";

import React, { useMemo, useState } from "react";
import { Activity, Calendar, CheckCircle2, Clock, X, XCircle } from "lucide-react";
import { createPortal } from "react-dom";
import { useApp, LeaveApplication, UserProfile } from "@/context/AppContext";
import { getLocalISODate, type ISODateString } from "@/lib/date-window";

type ParentTab = "pending" | "approved" | "rejected";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    pending_teacher: { cls: "bg-amber-50 text-amber-700", label: "Pending" },
    pending_admin: { cls: "bg-blue-50 text-blue-700", label: "With Admin" },
    approved: { cls: "bg-emerald-50 text-emerald-700", label: "Approved" },
    rejected_by_teacher: { cls: "bg-rose-50 text-rose-700", label: "Rejected" },
    rejected_by_admin: { cls: "bg-rose-50 text-rose-700", label: "Rejected" },
  };
  const v = map[status] ?? { cls: "bg-gray-50 text-gray-600", label: status.replaceAll("_", " ") };
  return (
    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${v.cls}`}>
      {v.label}
    </span>
  );
}

export default function LeaveManagementScreen() {
  const {
    user,
    userRole,
    students,
    classes,
    leaveApplications,
    applyLeave,
    teacherReviewLeave,
    adminReviewLeave,
    showAlert,
  } = useApp();

  const today = useMemo(() => getLocalISODate(new Date()), []);
  const [tab, setTab] = useState<ParentTab>("pending");
  const [form, setForm] = useState<{ date: ISODateString; reason: string }>({ date: today, reason: "" });
  const [submitting, setSubmitting] = useState(false);

  const myStudents = useMemo(() => students.filter((s) => s.parentId === user?.id), [students, user?.id]);
  const currentStudent = myStudents[0];
  const classLabel = useMemo(() => {
    if (!currentStudent?.classId) return null;
    const cls = classes.find((c) => c.id === currentStudent.classId);
    return cls ? `Class ${cls.name} · Section ${cls.section}` : null;
  }, [classes, currentStudent?.classId]);

  const myLeaves = useMemo(() => {
    if (!currentStudent) return [];
    return leaveApplications
      .filter((l) => l.studentId === currentStudent.id)
      .slice()
      .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
  }, [currentStudent, leaveApplications]);

  const buckets = useMemo(() => {
    const pending = myLeaves.filter((l) => l.status === "pending_teacher" || l.status === "pending_admin");
    const approved = myLeaves.filter((l) => l.status === "approved");
    const rejected = myLeaves.filter((l) => l.status.includes("rejected"));
    return { pending, approved, rejected };
  }, [myLeaves]);

  const current = tab === "pending" ? buckets.pending : tab === "approved" ? buckets.approved : buckets.rejected;

  const submit = async () => {
    if (!currentStudent) {
      showAlert("Error", "No student linked to this account.", "error");
      return;
    }
    if (!form.date || !form.reason.trim()) {
      showAlert("Missing Info", "Please select a date and enter a reason.", "error");
      return;
    }
    setSubmitting(true);
    try {
      await applyLeave({
        studentId: currentStudent.id,
        fromDate: form.date,
        toDate: form.date,
        reason: form.reason.trim(),
      });
      setForm({ date: today, reason: "" });
      showAlert("Submitted", "Leave application submitted to teacher.", "success");
      setTab("pending");
    } finally {
      setSubmitting(false);
    }
  };

  const portalTarget = useMemo(() => (typeof document !== "undefined" ? document.body : null), []);

  // ── Teacher/Admin review mode ─────────────────────────────────────────────
  if (userRole === "teacher" || userRole === "admin") {
    const reviewer = user as UserProfile;

    const myLeaves = useMemo(() => {
      if (userRole === "admin") return leaveApplications;
      const myClassIds = reviewer?.classIds ?? [];
      const myStudentIds = students.filter((s) => myClassIds.includes(s.classId)).map((s) => s.id);
      return leaveApplications.filter((l) => myStudentIds.includes(l.studentId));
    }, [leaveApplications, reviewer?.classIds, students, userRole]);

    const pending = useMemo(() => {
      return userRole === "admin"
        ? myLeaves.filter((l) => l.status === "pending_admin")
        : myLeaves.filter((l) => l.status === "pending_teacher");
    }, [myLeaves, userRole]);

    const history = useMemo(() => {
      if (userRole === "admin") {
        return myLeaves.filter(
          (l) => l.status !== "pending_admin" && l.status !== "pending_teacher" && l.status !== "rejected_by_teacher"
        );
      }
      return myLeaves.filter((l) => l.status !== "pending_teacher");
    }, [myLeaves, userRole]);

    const [review, setReview] = useState<{
      leaveId: string;
      decision: "approve" | "reject";
      remark: string;
    } | null>(null);

    const getStudentName = (id: string) => students.find((s) => s.id === id)?.name ?? "Student";
    const getClassLabel = (studentId: string) => {
      const s = students.find((st) => st.id === studentId);
      if (!s) return "";
      const cls = classes.find((c) => c.id === s.classId);
      return cls ? `${cls.name}-${cls.section}` : "";
    };

    const submitReview = async () => {
      if (!review) return;
      if (userRole === "admin") {
        await adminReviewLeave(review.leaveId, { decision: review.decision, remark: review.remark });
        showAlert("Done", review.decision === "approve" ? "Leave approved." : "Leave rejected.", "success");
      } else {
        await teacherReviewLeave(review.leaveId, { decision: review.decision, remark: review.remark || undefined });
        showAlert("Done", review.decision === "approve" ? "Leave forwarded to admin." : "Leave rejected.", "success");
      }
      setReview(null);
    };

    return (
      <>
        <div className="pb-36 px-5 pt-6 animate-fade-slide-up">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-gray-900 leading-none">Leave Management</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {userRole === "admin" ? "Approve or reject leave requests" : "Review student leave requests"}
            </p>
          </div>

          {pending.length > 0 && (
            <section className="mb-8">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">
                {userRole === "admin" ? "Awaiting Your Decision" : "Needs Your Review"}
              </p>
              <div className="space-y-3">
                {pending.map((l) => (
                  <div key={l.id} className="bg-white rounded-[24px] p-5 border border-amber-100 shadow-sm">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-gray-900">{getStudentName(l.studentId)}</p>
                        {getClassLabel(l.studentId) && (
                          <p className="text-[11px] font-bold text-indigo-500 mt-0.5">{getClassLabel(l.studentId)}</p>
                        )}
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                          {l.fromDate} → {l.toDate}
                        </p>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 shrink-0">
                        Pending
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium leading-relaxed">{l.reason}</p>
                    {(l.teacherRemark || l.adminRemark) && (
                      <div className="mt-3 space-y-2">
                        {l.teacherRemark && (
                          <div className="bg-indigo-50 rounded-2xl p-3">
                            <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-1">
                              Teacher's Note
                            </p>
                            <p className="text-xs font-bold text-indigo-700">{l.teacherRemark}</p>
                          </div>
                        )}
                        {l.adminRemark && (
                          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Admin Remark</p>
                            <p className="text-sm font-bold text-gray-800 mt-1">{l.adminRemark}</p>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setReview({ leaveId: l.id, decision: "reject", remark: "" })}
                        className="bg-gray-100 text-gray-600 font-black py-3 rounded-2xl text-[10px] uppercase tracking-widest active:scale-95 transition-transform"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => setReview({ leaveId: l.id, decision: "approve", remark: "" })}
                        className="bg-emerald-600 text-white font-black py-3 rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-200 active:scale-95 transition-transform"
                      >
                        {userRole === "admin" ? "Approve" : "Forward to Admin"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {history.length > 0 && (
            <section>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">History</p>
              <div className="space-y-3">
                {history.slice(0, 20).map((l) => (
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

          {myLeaves.length === 0 && (
            <div className="bg-white border border-dashed border-gray-200 rounded-[32px] p-16 text-center mt-4">
              <Activity className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="font-black text-gray-900">No leave applications yet</p>
            </div>
          )}
        </div>

        {review && portalTarget && createPortal(
          <div className="fixed inset-0 bg-black/60 z-100 flex items-end">
            <div className="bg-white w-full rounded-t-[40px] p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-gray-900">
                  {review.decision === "approve"
                    ? userRole === "admin"
                      ? "Approve Leave"
                      : "Forward to Admin"
                    : "Reject Leave"}
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
                onChange={(e) => setReview((p) => (p ? { ...p, remark: e.target.value } : null))}
                rows={3}
                className="w-full bg-gray-50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none mb-5"
              />
              <button
                onClick={submitReview}
                className={`w-full py-4 rounded-2xl font-black text-sm active:scale-95 transition-transform shadow-lg ${
                  review.decision === "approve"
                    ? userRole === "admin"
                      ? "bg-emerald-600 text-white shadow-emerald-200"
                      : "bg-indigo-600 text-white shadow-indigo-200"
                    : "bg-rose-600 text-white shadow-rose-200"
                }`}
              >
                {review.decision === "approve"
                  ? userRole === "admin"
                    ? "Approve"
                    : "Forward to Admin"
                  : "Reject"}
              </button>
            </div>
          </div>,
          portalTarget
        )}
      </>
    );
  }

  return (
    <div className="pb-36 px-5 pt-6 animate-fade-slide-up">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-gray-900 leading-none">Leave Management</h2>
        <p className="text-sm text-gray-400 mt-0.5">{classLabel ?? "Apply leave and track status"}</p>
      </div>

      {/* Apply form */}
      <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Apply Leave</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-2 block">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value as ISODateString }))}
              className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none transition-all"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="w-full bg-indigo-600 text-white font-black py-3.5 rounded-2xl text-[11px] uppercase tracking-widest shadow-lg shadow-indigo-100 active:scale-95 transition-transform disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit"}
            </button>
          </div>
        </div>
        <div className="mt-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-2 block">Reason</label>
          <textarea
            value={form.reason}
            onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
            placeholder="Reason for leave…"
            className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none transition-all min-h-[90px] resize-none"
          />
        </div>
      </div>

      {/* History */}
      <div className="mt-8">
        <div className="bg-white border border-gray-100 rounded-3xl p-2 shadow-sm grid grid-cols-3 gap-2">
          {(
            [
              { id: "pending", label: "Pending", count: buckets.pending.length, Icon: Clock },
              { id: "approved", label: "Approved", count: buckets.approved.length, Icon: CheckCircle2 },
              { id: "rejected", label: "Rejected", count: buckets.rejected.length, Icon: XCircle },
            ] as const
          ).map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`min-w-0 rounded-2xl px-2 py-3 sm:px-4 transition-all active:scale-[0.99] ${
                  active ? "bg-gray-900 text-white shadow-md" : "bg-transparent text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div className="flex min-w-0 items-center justify-center gap-1.5 sm:gap-2">
                  <t.Icon className={`h-4 w-4 ${active ? "text-white/80" : "text-gray-400"}`} />
                  <span className="min-w-0 truncate text-[10px] font-black uppercase tracking-widest">{t.label}</span>
                  <span
                    className={`shrink-0 min-w-7 px-2 py-0.5 rounded-full text-[10px] font-black tabular-nums ${
                      active ? "bg-white/15 text-white" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {t.count}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 space-y-3">
          {current.map((l: LeaveApplication) => (
            <div key={l.id} className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-black text-gray-900">
                    <Calendar className="inline-block w-4 h-4 text-gray-300 -mt-0.5 mr-2" />
                    {l.fromDate}
                    {l.toDate !== l.fromDate ? ` → ${l.toDate}` : ""}
                  </p>
                  <p className="mt-2 text-sm font-medium text-gray-700 whitespace-pre-wrap">{l.reason}</p>
                </div>
                <StatusBadge status={l.status} />
              </div>

              {(l.teacherRemark || l.adminRemark) && (
                <div className="mt-4 grid grid-cols-1 gap-2">
                  {l.teacherRemark && (
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Teacher Remark</p>
                      <p className="text-sm font-bold text-gray-800 mt-1">{l.teacherRemark}</p>
                    </div>
                  )}
                  {l.adminRemark && (
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Admin Remark</p>
                      <p className="text-sm font-bold text-gray-800 mt-1">{l.adminRemark}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {current.length === 0 && (
            <div className="bg-white border border-dashed border-gray-200 rounded-[32px] p-12 text-center">
              <Activity className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="font-black text-gray-900">No requests</p>
              <p className="text-sm text-gray-400 mt-1">Your leave history will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

