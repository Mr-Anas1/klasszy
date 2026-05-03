"use client";

import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft, Plus, Bell, Megaphone, Trash2, X, BookOpen,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

type AudienceFilter = "teachers" | "parents" | "both";

export default function AdminAnnouncementsScreen() {
  const {
    circulars, classes, students,
    sendCircular, deleteCircular, sendNotification,
    setActiveTab, setSelectedCircular, showAlert,
  } = useApp();

  const [showAddCircular, setShowAddCircular] = useState(false);
  const [showSendNotif, setShowSendNotif] = useState(false);

  const [circData, setCircData] = useState({
    title: "", content: "", imageUrl: "",
    targetAudience: "both" as AudienceFilter,
  });
  const [nData, setNData] = useState({
    title: "", message: "",
    type: "general" as "fee" | "general" | "instruction",
    targetType: "class" as "student" | "class",
    targetId: "",
  });

  const portalTarget = useMemo(
    () => (typeof document !== "undefined" ? document.body : null),
    []
  );

  const handleSendCircular = async () => {
    if (!circData.title || !circData.content) {
      showAlert("Missing Info", "Title and content are required.", "error");
      return;
    }
    await sendCircular(circData);
    showAlert("Posted!", "Circular has been published.", "success");
    setCircData({ title: "", content: "", imageUrl: "", targetAudience: "both" });
    setShowAddCircular(false);
  };

  const handleSendNotif = async () => {
    if (!nData.title || !nData.message || !nData.targetId) {
      showAlert("Missing Info", "Fill in all required fields.", "error");
      return;
    }
    await sendNotification(nData);
    showAlert("Sent!", "Notification delivered.", "success");
    setNData({ title: "", message: "", type: "general", targetType: "class", targetId: "" });
    setShowSendNotif(false);
  };

  const audienceColor = (a: string) =>
    a === "both" ? "indigo" : a === "teachers" ? "amber" : "rose";

  return (
    <>
      <div className="pb-36 px-5 pt-6 animate-fade-slide-up">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setActiveTab("home")}
            className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm active:scale-90 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1">
            <h2 className="text-2xl font-black text-gray-900 leading-none">Announcements</h2>
            <p className="text-sm text-gray-400 font-medium mt-0.5">Circulars & Notifications</p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <button
            onClick={() => setShowAddCircular(true)}
            className="bg-amber-500 text-white rounded-[24px] p-5 flex flex-col gap-3 active:scale-95 transition-transform shadow-lg shadow-amber-200 text-left"
          >
            <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-black leading-tight">Post Circular</p>
              <p className="text-[10px] text-white/70 mt-0.5">Official school notice</p>
            </div>
          </button>
          <button
            onClick={() => setShowSendNotif(true)}
            className="bg-indigo-600 text-white rounded-[24px] p-5 flex flex-col gap-3 active:scale-95 transition-transform shadow-lg shadow-indigo-200 text-left"
          >
            <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-black leading-tight">Send Notification</p>
              <p className="text-[10px] text-white/70 mt-0.5">To class or student</p>
            </div>
          </button>
        </div>

        {/* Circulars List */}
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">
          Recent Circulars ({circulars.length})
        </p>

        <div className="space-y-3">
          {circulars.map(c => {
            const col = audienceColor(c.targetAudience);
            return (
              <div
                key={c.id}
                onClick={() => { setSelectedCircular(c); setActiveTab("view_circular"); }}
                className="bg-white border border-gray-100 rounded-[28px] p-5 flex items-start gap-4 shadow-sm group cursor-pointer hover:border-indigo-100 transition-all active:scale-[0.99]"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-${col}-50`}>
                  <BookOpen className={`w-5 h-5 text-${col}-600`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-${col}-50 text-${col}-600`}>
                      {c.targetAudience}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold shrink-0">
                      {new Date(c.createdAt.seconds * 1000).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-gray-900 truncate">{c.title}</h4>
                  <p className="text-xs text-gray-400 font-medium line-clamp-1 mt-0.5">{c.content}</p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); deleteCircular(c.id); }}
                  className="w-8 h-8 bg-rose-50 text-rose-400 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}

          {circulars.length === 0 && (
            <div className="bg-white border border-dashed border-gray-200 rounded-[32px] p-16 text-center">
              <Megaphone className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="font-black text-gray-900">No circulars yet</p>
              <p className="text-sm text-gray-400 mt-1">Post your first circular above</p>
            </div>
          )}
        </div>
      </div>

      {/* Post Circular Modal */}
      {showAddCircular && portalTarget && createPortal(
        <BottomSheet title="Post Circular" onClose={() => setShowAddCircular(false)}>
          <div className="space-y-3">
            <Field placeholder="Title *" value={circData.title} onChange={v => setCircData(p => ({ ...p, title: v }))} />
            <textarea
              placeholder="Content *"
              value={circData.content}
              onChange={e => setCircData(p => ({ ...p, content: e.target.value }))}
              rows={4}
              className="w-full bg-gray-50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
            />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Audience</p>
              <div className="flex gap-2">
                {(["both", "teachers", "parents"] as AudienceFilter[]).map(a => (
                  <button
                    key={a}
                    onClick={() => setCircData(p => ({ ...p, targetAudience: a }))}
                    className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      circData.targetAudience === a ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {a === "both" ? "Everyone" : a}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <ActionButton label="Post Circular" onClick={handleSendCircular} />
        </BottomSheet>,
        portalTarget
      )}

      {/* Send Notification Modal */}
      {showSendNotif && portalTarget && createPortal(
        <BottomSheet title="Send Notification" onClose={() => setShowSendNotif(false)}>
          <div className="space-y-3">
            <Field placeholder="Title *" value={nData.title} onChange={v => setNData(p => ({ ...p, title: v }))} />
            <textarea
              placeholder="Message *"
              value={nData.message}
              onChange={e => setNData(p => ({ ...p, message: e.target.value }))}
              rows={3}
              className="w-full bg-gray-50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
            />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Send to</p>
              <div className="flex gap-2 mb-3">
                {(["class", "student"] as const).map(tt => (
                  <button
                    key={tt}
                    onClick={() => setNData(p => ({ ...p, targetType: tt, targetId: "" }))}
                    className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      nData.targetType === tt ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {tt === "class" ? "A Class" : "A Student"}
                  </button>
                ))}
              </div>
              {nData.targetType === "class" && (
                <select
                  value={nData.targetId}
                  onChange={e => setNData(p => ({ ...p, targetId: e.target.value }))}
                  className="w-full bg-gray-50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">Select Class *</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}-{c.section}</option>)}
                </select>
              )}
              {nData.targetType === "student" && (
                <select
                  value={nData.targetId}
                  onChange={e => setNData(p => ({ ...p, targetId: e.target.value }))}
                  className="w-full bg-gray-50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">Select Student *</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              )}
            </div>
          </div>
          <ActionButton label="Send Notification" onClick={handleSendNotif} />
        </BottomSheet>,
        portalTarget
      )}
    </>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function BottomSheet({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-end">
      <div className="bg-white w-full rounded-t-[40px] p-8 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-gray-900">{title}</h3>
          <button onClick={onClose} className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-gray-50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200"
    />
  );
}

function ActionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full mt-5 bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-indigo-200 active:scale-95 transition-transform"
    >
      {label}
    </button>
  );
}
