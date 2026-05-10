"use client";

import React from "react";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { ExternalLink, FileText, Image as ImageIcon, Download } from "lucide-react";

type Props = {
  url: string;
  type: "image" | "pdf";
  title?: string;
  className?: string;
};

export default function FileAttachmentPreview({ url, type, title, className = "" }: Props) {
  const withCloudinaryAttachmentFlag = (u: string) => {
    // Cloudinary supports forcing download via the fl_attachment flag in the delivery URL.
    // We inject it right after `/upload/`.
    if (!u.includes("/upload/")) return u;
    if (u.includes("/upload/fl_attachment/")) return u;
    return u.replace("/upload/", "/upload/fl_attachment/");
  };

  const openExternal = async (targetUrl: string) => {
    if (Capacitor.isNativePlatform()) {
      try {
        await Browser.open({ url: targetUrl });
        return;
      } catch {
        // Fallback to in-app navigation
      }
    }

    // Web fallback
    window.location.assign(targetUrl);
  };

  const handleDownload = (downloadUrl: string) => {
    // Navigate directly; Cloudinary will respond with Content-Disposition: attachment.
    void openExternal(downloadUrl);
  };

  const downloadViaBlob = async (fileUrl: string, filename: string) => {
    const res = await fetch(fileUrl, { method: "GET" });
    if (!res.ok) {
      throw new Error(`Download failed (${res.status})`);
    }

    const contentType = res.headers.get("content-type") || "";
    // If Cloudinary returns an HTML error page or something unexpected, avoid saving garbage.
    if (contentType.includes("text/html")) {
      throw new Error("Unexpected response type");
    }

    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
  };

  if (type === "pdf") {
    const filenameBase = (title || "document").replace(/[^a-zA-Z0-9_-]+/g, "_");

    return (
      <button
        onClick={async () => {
          try {
            if (Capacitor.isNativePlatform()) {
              await openExternal(withCloudinaryAttachmentFlag(url));
              return;
            }
            // Use the exact secure_url bytes and save locally (works even if fl_attachment is broken).
            await downloadViaBlob(url, `${filenameBase}.pdf`);
          } catch {
            // Fallback: try Cloudinary forced download if the blob path is blocked.
            await openExternal(withCloudinaryAttachmentFlag(url));
          }
        }}
        className={`flex items-center gap-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-indigo-100 hover:shadow-md ${className}`}
      >
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <FileText className="h-7 w-7" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">PDF attachment</p>
          <p className="truncate text-sm font-black text-gray-900">{title || "View document"}</p>
          <p className="mt-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-indigo-500">
            Download <ExternalLink className="h-3 w-3" />
          </p>
        </div>
      </button>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-gray-100 bg-gray-50 shadow-inner ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={title || "Attachment"} className="max-h-[420px] w-full object-contain" />
      <div className="absolute bottom-4 right-4">
        <button
          onClick={() => handleDownload(withCloudinaryAttachmentFlag(url))}
          className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-200 hover:bg-white transition-all hover:shadow-md"
        >
          <Download className="w-4 h-4 text-gray-700" />
          <span className="text-xs font-bold text-gray-700">Download</span>
        </button>
      </div>
    </div>
  );
}

export function AttachmentBadge({ type }: { type: "image" | "pdf" }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-gray-600">
      {type === "pdf" ? <FileText className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
      {type === "pdf" ? "PDF" : "Image"}
    </span>
  );
}
