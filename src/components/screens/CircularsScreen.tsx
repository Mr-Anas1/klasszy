"use client";

import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Info, ChevronRight, ArrowLeft, BookOpen, Search, Megaphone, Paperclip, Loader2, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import {
  attachmentTypeFromFile,
  isCloudinaryConfigured,
  uploadToCloudinary,
} from "@/lib/cloudinary";

type AudienceFilter = "teachers" | "parents" | "both";

export default function CircularsScreen() {
  const { userRole, circulars, setActiveTab, setSelectedCircular, sendCircular, showAlert } = useApp();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "teachers" | "parents">("all");
  const [showCompose, setShowCompose] = useState(false);
  const [circData, setCircData] = useState({
    title: "",
    description: "",
    targetAudience: "both" as AudienceFilter,
  });
  const [circFile, setCircFile] = useState<File | null>(null);
  const [circUploading, setCircUploading] = useState(false);

  const canPostCircular = userRole === "teacher" || userRole === "admin";
  const portalTarget = useMemo(
    () => (typeof document !== "undefined" ? document.body : null),
    []
  );

  const filteredCirculars = circulars.filter(c => {
    // Role based visibility
    if (userRole === "teacher" && c.targetAudience === "parents") return false;
    if (userRole === "parent" && c.targetAudience === "teachers") return false;
    
    // Search
    const body = (c.description || c.content || "").toLowerCase();
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      body.includes(search.toLowerCase());
    
    // Category filter
    const matchesFilter = filter === "all" || c.targetAudience === filter || c.targetAudience === "both";
    
    return matchesSearch && matchesFilter;
  });

  const handleViewCircular = (c: any) => {
    setSelectedCircular(c);
    setActiveTab("view_circular");
  };

  const handleSendCircular = async () => {
    if (!circData.title?.trim() || !circData.description?.trim()) {
      showAlert("Missing Info", "Title and description are required.", "error");
      return;
    }
    if (circFile && !isCloudinaryConfigured()) {
      showAlert(
        "Upload not configured",
        "Add Cloudinary environment variables to attach files.",
        "error"
      );
      return;
    }
    setCircUploading(true);
    try {
      let attachmentUrl: string | undefined;
      let attachmentType: "image" | "pdf" | undefined;
      if (circFile) {
        const up = await uploadToCloudinary(circFile);
        attachmentUrl = up.secureUrl;
        attachmentType = attachmentTypeFromFile(circFile);
      }
      const body = circData.description.trim();
      await sendCircular({
        title: circData.title.trim(),
        description: body,
        content: body,
        targetAudience: circData.targetAudience,
        attachmentUrl,
        attachmentType,
      });
      setCircData({ title: "", description: "", targetAudience: "both" });
      setCircFile(null);
      setShowCompose(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not publish.";
      showAlert("Failed", msg, "error");
    } finally {
      setCircUploading(false);
    }
  };

  return (
    <div className="pb-36 px-5 pt-4 animate-fade-slide-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex-1">
          <h2 className="text-2xl font-black text-gray-900 leading-none">Official Circulars</h2>
          <p className="text-sm text-gray-400 mt-0.5">School notices & updates</p>
        </div>
        {canPostCircular && (
          <button
            onClick={() => setShowCompose(true)}
            className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 active:scale-90 transition-transform"
          >
            <Megaphone className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="space-y-4 mb-8">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
          <input 
            type="text" 
            placeholder="Search circulars..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-3xl px-14 py-4 text-sm font-bold focus:outline-none focus:border-indigo-100 transition-all shadow-sm"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {(["all", "teachers", "parents"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === f 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                  : "bg-white text-gray-400 border border-gray-100"
              }`}
            >
              {f === "all" ? "All Notices" : f === "teachers" ? "For Staff" : "For Parents"}
            </button>
          ))}
        </div>
      </div>

      {/* Circulars List */}
      <div className="space-y-4">
        {filteredCirculars.map((c) => (
          <div
            key={c.id}
            onClick={() => handleViewCircular(c)}
            className="bg-white border border-gray-100 rounded-[32px] p-6 flex items-start gap-5 shadow-sm active:scale-[0.99] transition-all cursor-pointer group hover:shadow-md hover:border-indigo-100"
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover:scale-110 ${
                c.targetAudience === 'both' ? 'bg-indigo-500 shadow-indigo-100' : 
                c.targetAudience === 'teachers' ? 'bg-amber-500 shadow-amber-100' : 
                'bg-rose-500 shadow-rose-100'
              }`}
            >
              <Info className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                  c.targetAudience === 'both' ? 'bg-indigo-50 text-indigo-600' : 
                  c.targetAudience === 'teachers' ? 'bg-amber-50 text-amber-600' : 
                  'bg-rose-50 text-rose-600'
                }`}>
                  {c.targetAudience}
                </span>
                <span className="text-[10px] font-bold text-gray-400">{new Date(c.createdAt.seconds * 1000).toLocaleDateString()}</span>
              </div>
              <h4 className="text-[15px] font-black text-gray-900 mt-2 leading-tight">{c.title}</h4>
              <p className="text-xs text-gray-400 font-medium line-clamp-2 mt-1 leading-relaxed">{c.description || c.content}</p>
              
              <div className="flex items-center gap-2 mt-4 text-indigo-500">
                <BookOpen className="w-3 h-3" />
                <span className="text-[10px] font-black uppercase tracking-widest">Read Full Message</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-200 mt-1 shrink-0 group-hover:text-indigo-300 transition-colors" />
          </div>
        ))}

        {filteredCirculars.length === 0 && (
          <div className="bg-white border border-dashed border-gray-200 rounded-[40px] p-16 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="font-black text-gray-900">No circulars found</h3>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {showCompose && portalTarget && createPortal(
        <div className="fixed inset-0 z-[100] flex items-end bg-black/60">
          <div className="max-h-[85vh] w-full overflow-y-auto rounded-t-[40px] bg-white p-8">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-black text-gray-900">Post Circular</h3>
              <button
                type="button"
                disabled={circUploading}
                onClick={() => setShowCompose(false)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Title *"
                value={circData.title}
                onChange={(e) => setCircData((p) => ({ ...p, title: e.target.value }))}
                className="w-full rounded-2xl bg-gray-50 px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <textarea
                placeholder="Description *"
                value={circData.description}
                onChange={(e) => setCircData((p) => ({ ...p, description: e.target.value }))}
                rows={4}
                className="w-full resize-none rounded-2xl bg-gray-50 px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-4">
                <Paperclip className="h-5 w-5 shrink-0 text-indigo-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-gray-900">Attachment (optional)</p>
                  <p className="truncate text-[11px] font-medium text-gray-400">
                    {circFile ? circFile.name : "Image or PDF · Cloudinary"}
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => setCircFile(e.target.files?.[0] ?? null)}
                />
              </label>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Audience</p>
              <div className="flex gap-2">
                {(["both", "teachers", "parents"] as AudienceFilter[]).map((a) => (
                  <button
                    key={a}
                    type="button"
                    disabled={circUploading}
                    onClick={() => setCircData((p) => ({ ...p, targetAudience: a }))}
                    className={`flex-1 rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                      circData.targetAudience === a ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {a === "both" ? "Everyone" : a}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              disabled={circUploading}
              onClick={handleSendCircular}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 text-sm font-black text-white shadow-lg shadow-indigo-200 disabled:opacity-60"
            >
              {circUploading && <Loader2 className="h-4 w-4 animate-spin" />}
              {circUploading ? "Publishing…" : "Post Circular"}
            </button>
          </div>
        </div>,
        portalTarget
      )}
    </div>
  );
}
