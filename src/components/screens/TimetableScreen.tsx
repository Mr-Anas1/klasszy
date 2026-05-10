"use client";

import React from "react";
import { ArrowLeft, CalendarClock, FileText } from "lucide-react";
import { useApp } from "@/context/AppContext";
import FileAttachmentPreview from "@/components/ui/FileAttachmentPreview";
import { isNavItemEnabled } from "@/lib/feature-registry";

export default function TimetableScreen() {
  const {
    user,
    students,
    classes,
    timetables,
    setActiveTab,
    school,
  } = useApp();

  const myStudents = students.filter((s) => s.parentId === user?.id);
  const currentStudent = myStudents[0];
  const cls = classes.find((c) => c.id === currentStudent?.classId);
  const entry = timetables.find((t) => t.classId === currentStudent?.classId);

  const label = cls ? `${cls.name} · Section ${cls.section}` : "Your class";

  if (!isNavItemEnabled("timetable", school?.features)) {
    return (
      <div className="flex flex-col items-center justify-center px-6 pb-36 pt-16 text-center">
        <p className="text-sm font-bold text-gray-500">Timetable is disabled for this school.</p>
        <button
          type="button"
          onClick={() => setActiveTab("home")}
          className="mt-6 rounded-2xl bg-indigo-600 px-6 py-3 text-xs font-black uppercase tracking-widest text-white"
        >
          Back home
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-slide-up px-5 pb-36 pt-4">
      <div className="mb-8 flex items-center gap-4">
        <button
          type="button"
          onClick={() => setActiveTab("home")}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm active:scale-90"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5 text-gray-800" />
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-black leading-none text-gray-900">Timetable</h2>
          <p className="mt-1 text-sm font-medium text-gray-400">{label}</p>
        </div>
      </div>

      {!currentStudent && (
        <div className="rounded-[32px] border border-dashed border-gray-200 bg-white p-12 text-center">
          <CalendarClock className="mx-auto mb-3 h-10 w-10 text-gray-200" />
          <p className="font-black text-gray-900">No student linked</p>
          <p className="mt-1 text-sm text-gray-400">Contact your school admin.</p>
        </div>
      )}

      {currentStudent && !entry && (
        <div className="rounded-[32px] border border-dashed border-gray-200 bg-white p-12 text-center">
          <FileText className="mx-auto mb-3 h-10 w-10 text-gray-200" />
          <p className="font-black text-gray-900">No timetable uploaded yet</p>
          <p className="mt-1 text-sm text-gray-400">
            Your class teacher or admin will publish the timetable here.
          </p>
        </div>
      )}

      {currentStudent && entry && (
        <div className="space-y-4">
          <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Last updated
            </p>
            <p className="mt-1 text-sm font-black text-gray-900">
              {entry.updatedAt?.seconds
                ? new Date(entry.updatedAt.seconds * 1000).toLocaleString()
                : "—"}
            </p>
          </div>
          <FileAttachmentPreview
            url={entry.attachmentUrl}
            type={entry.attachmentType}
            title={`${label} timetable`}
          />
        </div>
      )}
    </div>
  );
}
