"use client";

import React from "react";
import { Bell, ArrowLeft, X } from "lucide-react";
import { useApp, NotificationItem } from "@/context/AppContext";

export default function NotificationsScreen() {
  const { user, students, notifications, setActiveTab } = useApp();
  const [selectedNotification, setSelectedNotification] = React.useState<NotificationItem | null>(null);
  const [showDetail, setShowDetail] = React.useState(false);

  if (!user) return null;

  const currentStudent = user.role === "parent" ? students.find((s) => s.parentId === user.id) : null;

  const filteredNotifications = currentStudent
    ? notifications.filter((n) =>
        (n.targetType === "student" && n.targetId === currentStudent.id) ||
        (n.targetType === "class" && n.targetId === currentStudent.classId)
      )
    : [];

  return (
    <div className="pb-36 px-5 pt-4">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setActiveTab("home")}
          className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-gray-900 leading-none">Notifications</h2>
          <p className="text-sm text-gray-400 font-medium mt-1">Latest updates & reminders</p>
        </div>
      </div>

      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications
            .slice()
            .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
            .map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  setSelectedNotification(n);
                  setShowDetail(true);
                }}
                className="w-full text-left bg-white border border-gray-100 rounded-[24px] p-5 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all active:scale-[0.99]"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      n.type === "fee"
                        ? "bg-amber-100"
                        : n.type === "instruction"
                          ? "bg-violet-100"
                          : "bg-indigo-100"
                    }`}
                  >
                    <Bell
                      className={`w-5 h-5 ${
                        n.type === "fee"
                          ? "text-amber-700"
                          : n.type === "instruction"
                            ? "text-violet-700"
                            : "text-indigo-700"
                      }`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-black text-gray-900 truncate">{n.title}</p>
                      <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                        {new Date(n.createdAt.seconds * 1000).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium mt-1 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-gray-400 font-medium mt-2">
                      by {n.createdByName} ({n.createdByRole})
                    </p>
                  </div>
                </div>
              </button>
            ))
        ) : (
          <div className="bg-white border border-dashed border-gray-200 rounded-[32px] p-10 text-center">
            <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-xs text-gray-400 font-medium">No notifications yet.</p>
          </div>
        )}
      </div>

      {showDetail && selectedNotification && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-[40px] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-gray-900">Notification</h3>
              <button
                onClick={() => setShowDetail(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm font-black text-gray-900">{selectedNotification.title}</p>
            <p className="text-sm text-gray-600 font-medium mt-3 leading-relaxed">{selectedNotification.message}</p>

            <div className="mt-5 bg-gray-50 rounded-[24px] p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sent By</p>
              <p className="text-sm font-bold text-gray-900 mt-1">
                {selectedNotification.createdByName} ({selectedNotification.createdByRole})
              </p>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Date</p>
                  <p className="text-sm font-bold text-gray-900 mt-1">
                    {new Date(selectedNotification.createdAt.seconds * 1000).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Time</p>
                  <p className="text-sm font-bold text-gray-900 mt-1">
                    {new Date(selectedNotification.createdAt.seconds * 1000).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Type</p>
                <p className="text-sm font-bold text-gray-900 mt-1">{selectedNotification.type}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
