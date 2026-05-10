"use client";

import React from "react";
import { FileText } from "lucide-react";
import { useApp } from "@/context/AppContext";
import FileAttachmentPreview from "@/components/ui/FileAttachmentPreview";

export default function ExamDetailScreen() {
  const { selectedExam } = useApp();

  if (!selectedExam) {
    return (
      <div className="pb-36 px-5 pt-6 animate-fade-slide-up">
        <div className="bg-white border border-dashed border-gray-200 rounded-[32px] p-16 text-center">
          <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-black text-gray-900">No exam selected</p>
          <p className="text-sm text-gray-400 mt-1">Go back to Exams and pick one.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-36 px-5 pt-6 animate-fade-slide-up">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-gray-900 leading-none">{selectedExam.name}</h2>
        <p className="text-sm text-gray-400 mt-1">
          {selectedExam.fromDate} → {selectedExam.toDate}
        </p>
      </div>

      {selectedExam.attachmentUrl && selectedExam.attachmentType ? (
        <FileAttachmentPreview
          url={selectedExam.attachmentUrl}
          type={selectedExam.attachmentType}
          title={`${selectedExam.name} schedule`}
        />
      ) : (
        <div className="bg-white border border-dashed border-gray-200 rounded-[32px] p-16 text-center">
          <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-black text-gray-900">No attachment</p>
          <p className="text-sm text-gray-400 mt-1">This exam has no schedule uploaded yet.</p>
        </div>
      )}
    </div>
  );
}

