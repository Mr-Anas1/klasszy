"use client";

import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarClock, FileText, Plus, X, Paperclip, Loader2, Trash2 } from "lucide-react";
import { useApp, Exam } from "@/context/AppContext";
import FileAttachmentPreview from "@/components/ui/FileAttachmentPreview";
import { attachmentTypeFromFile, isCloudinaryConfigured, uploadToCloudinary } from "@/lib/cloudinary";
import { getLocalISODate, isActiveBetween, isExpiredAfter } from "@/lib/date-window";

type Tab = "upcoming" | "active" | "previous";

export default function ExamsScreen() {
  const { userRole, exams, setSelectedExam, setActiveTab, createExam, deleteExam, showAlert } = useApp();
  const canManage = userRole === "admin" || userRole === "teacher";

  const today = useMemo(() => getLocalISODate(new Date()), []);
  const [tab, setTab] = useState<Tab>("active");

  const { upcoming, active, previous } = useMemo(() => {
    const up: Exam[] = [];
    const act: Exam[] = [];
    const prev: Exam[] = [];
    for (const e of exams) {
      if (isExpiredAfter(today, e.toDate)) prev.push(e);
      else if (isActiveBetween(today, e.fromDate, e.toDate)) act.push(e);
      else up.push(e);
    }
    return { upcoming: up, active: act, previous: prev };
  }, [exams, today]);

  const current = tab === "upcoming" ? upcoming : tab === "active" ? active : previous;

  const portalTarget = useMemo(() => (typeof document !== "undefined" ? document.body : null), []);
  const [showCompose, setShowCompose] = useState(false);
  const [data, setData] = useState({ name: "", fromDate: today, toDate: today });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const submit = async () => {
    if (!data.name.trim() || !data.fromDate || !data.toDate) {
      showAlert("Missing Info", "Exam name, From date and To date are required.", "error");
      return;
    }
    if (file && !isCloudinaryConfigured()) {
      showAlert("Upload not configured", "Add Cloudinary environment variables to attach files.", "error");
      return;
    }
    setUploading(true);
    try {
      let attachmentUrl: string | undefined;
      let attachmentType: "image" | "pdf" | undefined;
      if (file) {
        const up = await uploadToCloudinary(file);
        attachmentUrl = up.secureUrl;
        attachmentType = attachmentTypeFromFile(file);
      }
      await createExam({
        name: data.name.trim(),
        fromDate: data.fromDate,
        toDate: data.toDate,
        attachmentUrl,
        attachmentType,
      });
      setData({ name: "", fromDate: today, toDate: today });
      setFile(null);
      setShowCompose(false);
    } catch (e: unknown) {
      showAlert("Failed", e instanceof Error ? e.message : "Could not publish exam.", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="pb-36 px-5 pt-6 animate-fade-slide-up">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-black text-gray-900 leading-none">Exams</h2>
          <p className="text-sm text-gray-400 mt-0.5">Schedules & exam timetables</p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowCompose(true)}
            className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 active:scale-90 transition-transform"
            aria-label="Add exam"
          >
            <Plus className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="bg-white border border-gray-100 rounded-3xl p-2 shadow-sm flex gap-2">
          {(
            [
              { id: "upcoming", label: "Upcoming", count: upcoming.length },
              { id: "active", label: "Active", count: active.length },
              { id: "previous", label: "Previous", count: previous.length },
            ] as const
          ).map((t) => {
            const activeOn = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex-1 rounded-2xl px-4 py-3 transition-all active:scale-[0.99] ${
                  activeOn ? "bg-gray-900 text-white shadow-md" : "bg-transparent text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest">{t.label}</span>
                  <span className={`min-w-7 px-2 py-0.5 rounded-full text-[10px] font-black tabular-nums ${activeOn ? "bg-white/15" : "bg-gray-100 text-gray-700"}`}>
                    {t.count}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {current.map((e) => (
          <div key={e.id} className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm">
            <button
              className="w-full text-left"
              onClick={() => {
                setSelectedExam(e);
                setActiveTab("exam_detail");
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-gray-900 truncate">{e.name}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {e.fromDate} → {e.toDate}
                  </p>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-gray-50 text-gray-600">
                  {tab === "active" ? "Active" : tab === "upcoming" ? "Upcoming" : "Previous"}
                </span>
              </div>
              {e.attachmentUrl && e.attachmentType && (
                <div className="mt-4">
                  <FileAttachmentPreview url={e.attachmentUrl} type={e.attachmentType} title={`${e.name} schedule`} />
                </div>
              )}
              {!e.attachmentUrl && (
                <div className="mt-4 flex items-center gap-2 text-gray-400">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs font-medium">No attachment</span>
                </div>
              )}
            </button>
            {canManage && (
              <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end">
                <button
                  onClick={() => deleteExam(e.id)}
                  className="px-4 py-2 rounded-2xl bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}

        {current.length === 0 && (
          <div className="bg-white border border-dashed border-gray-200 rounded-[32px] p-16 text-center">
            <CalendarClock className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="font-black text-gray-900">No exams</p>
            <p className="text-sm text-gray-400 mt-1">Exams will appear here once published.</p>
          </div>
        )}
      </div>

      {/* Compose bottom sheet */}
      {showCompose && portalTarget && createPortal(
        <div className="fixed inset-0 z-100 flex items-end bg-black/60">
          <div className="max-h-[85vh] w-full overflow-y-auto rounded-t-[40px] bg-white p-8">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-black text-gray-900">Publish Exam</h3>
              <button
                type="button"
                disabled={uploading}
                onClick={() => setShowCompose(false)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Exam name *"
                value={data.name}
                onChange={(e) => setData((p) => ({ ...p, name: e.target.value }))}
                className="w-full rounded-2xl bg-gray-50 px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">From *</p>
                  <input
                    type="date"
                    value={data.fromDate}
                    onChange={(e) => setData((p) => ({ ...p, fromDate: e.target.value }))}
                    className="w-full rounded-2xl bg-gray-50 px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">To *</p>
                  <input
                    type="date"
                    value={data.toDate}
                    onChange={(e) => setData((p) => ({ ...p, toDate: e.target.value }))}
                    className="w-full rounded-2xl bg-gray-50 px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-4">
                <Paperclip className="h-5 w-5 shrink-0 text-indigo-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-gray-900">Schedule attachment (optional)</p>
                  <p className="truncate text-[11px] font-medium text-gray-400">
                    {file ? file.name : "Image or PDF · Cloudinary"}
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            <button
              type="button"
              disabled={uploading}
              onClick={submit}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 text-sm font-black text-white shadow-lg shadow-indigo-200 disabled:opacity-60"
            >
              {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
              {uploading ? "Publishing…" : "Publish Exam"}
            </button>
          </div>
        </div>,
        portalTarget
      )}
    </div>
  );
}

