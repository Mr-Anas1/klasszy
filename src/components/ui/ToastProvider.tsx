"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { registerToastHandler, type ToastPayload, type ToastVariant } from "@/lib/toast-bus";

const VARIANT_STYLES: Record<
  ToastVariant,
  { bar: string; iconWrap: string; Icon: typeof CheckCircle2 }
> = {
  success: {
    bar: "border-emerald-100 bg-white shadow-emerald-100/40",
    iconWrap: "bg-emerald-50 text-emerald-600",
    Icon: CheckCircle2,
  },
  error: {
    bar: "border-rose-100 bg-white shadow-rose-100/40",
    iconWrap: "bg-rose-50 text-rose-600",
    Icon: AlertCircle,
  },
  info: {
    bar: "border-indigo-100 bg-white shadow-indigo-100/40",
    iconWrap: "bg-indigo-50 text-indigo-600",
    Icon: Info,
  },
};

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<(ToastPayload & { id: number })[]>([]);

  const push = useCallback((payload: ToastPayload) => {
    const id = Date.now() + Math.random();
    const item = { ...payload, id, variant: payload.variant ?? "info" };
    setQueue((q) => [...q, item]);
    const ms = payload.durationMs ?? 4000;
    window.setTimeout(() => {
      setQueue((q) => q.filter((x) => x.id !== id));
    }, ms);
  }, []);

  useEffect(() => {
    registerToastHandler(push);
    return () => registerToastHandler(null);
  }, [push]);

  return (
    <>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[1200] flex flex-col items-center gap-2 px-4 pb-[calc(env(safe-area-inset-bottom)+5.5rem)] md:pb-8 md:items-end md:pr-8"
        aria-live="polite"
      >
        {queue.map((t) => {
          const v = (t.variant ?? "info") as ToastVariant;
          const styles = VARIANT_STYLES[v];
          const Icon = styles.Icon;
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex w-full max-w-md animate-[toast-in_0.35s_ease-out] items-start gap-3 rounded-3xl border px-4 py-3.5 shadow-xl md:max-w-sm ${styles.bar}`}
              role="status"
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${styles.iconWrap}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                {t.title && (
                  <p className="text-[11px] font-black uppercase tracking-widest text-gray-800">
                    {t.title}
                  </p>
                )}
                <p className="text-sm font-semibold leading-snug text-gray-700">{t.message}</p>
              </div>
              <button
                type="button"
                onClick={() => setQueue((q) => q.filter((x) => x.id !== t.id))}
                className="shrink-0 rounded-xl p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
