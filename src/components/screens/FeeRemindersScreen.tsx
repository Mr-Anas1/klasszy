"use client";

import React, { useMemo, useState } from "react";
import { Bell, Calendar, IndianRupee, X } from "lucide-react";
import { useApp, NotificationItem } from "@/context/AppContext";

export default function FeeRemindersScreen() {
  const { user, students, notifications } = useApp();
  const [selected, setSelected] = useState<NotificationItem | null>(null);

  const currentStudent = useMemo(() => {
    if (!user || user.role !== "parent") return null;
    return students.find((s) => s.parentId === user.id) ?? null;
  }, [students, user]);

  const feeNotifs = useMemo(() => {
    if (!currentStudent) return [];
    return notifications
      .filter((n) =>
        n.type === "fee" &&
        ((n.targetType === "student" && n.targetId === currentStudent.id) ||
          (n.targetType === "class" && n.targetId === currentStudent.classId))
      )
      .slice()
      .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
  }, [currentStudent, notifications]);

  return (
    <div className="pb-36 px-5 pt-6 animate-fade-slide-up">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-gray-900 leading-none">Fee Reminders</h2>
        <p className="text-sm text-gray-400 mt-0.5">Payment notices from your school</p>
      </div>

      <div className="space-y-3">
        {feeNotifs.map((n) => (
          <button
            key={n.id}
            onClick={() => setSelected(n)}
            className="w-full text-left bg-white border border-gray-100 rounded-[24px] p-5 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all active:scale-[0.99]"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-emerald-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-black text-gray-900 truncate">{n.title}</p>
                  <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                    {new Date(n.createdAt.seconds * 1000).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium mt-1 line-clamp-2">{n.message}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {typeof n.feeAmount === "number" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                      <IndianRupee className="w-3 h-3" />
                      {n.feeAmount}
                    </span>
                  )}
                  {n.dueDate && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-amber-700">
                      <Calendar className="w-3 h-3" />
                      Due {n.dueDate}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}

        {feeNotifs.length === 0 && (
          <div className="bg-white border border-dashed border-gray-200 rounded-[32px] p-12 text-center">
            <Bell className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="font-black text-gray-900">No fee reminders</p>
            <p className="text-sm text-gray-400 mt-1">Any fee messages will appear here.</p>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-1000 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-[40px] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-gray-900">Fee Reminder</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm font-black text-gray-900">{selected.title}</p>
            <p className="text-sm text-gray-600 font-medium mt-3 leading-relaxed whitespace-pre-wrap">{selected.message}</p>

            {(selected.feeAmount != null || selected.dueDate || selected.paymentNote) && (
              <div className="mt-5 bg-gray-50 rounded-[24px] p-4 space-y-3">
                {typeof selected.feeAmount === "number" && (
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Amount</p>
                    <p className="text-sm font-black text-gray-900">₹{selected.feeAmount}</p>
                  </div>
                )}
                {selected.dueDate && (
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Due date</p>
                    <p className="text-sm font-black text-gray-900">{selected.dueDate}</p>
                  </div>
                )}
                {selected.paymentNote && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Payment note</p>
                    <p className="text-sm font-bold text-gray-900 mt-1 whitespace-pre-wrap">{selected.paymentNote}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

