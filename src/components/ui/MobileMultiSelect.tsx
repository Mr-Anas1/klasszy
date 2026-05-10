"use client";

import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search, X } from "lucide-react";
import type { MobileSelectOption } from "./MobileSelect";

type Props = {
  options: MobileSelectOption[];
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  searchable?: boolean;
};

export default function MobileMultiSelect({
  options,
  values,
  onChange,
  placeholder = "Select…",
  label,
  disabled,
  searchable = true,
}: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!searchable || !q.trim()) return options;
    const qq = q.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(qq));
  }, [options, q, searchable]);

  const summary =
    values.length === 0
      ? placeholder
      : values
          .map((v) => options.find((o) => o.value === v)?.label)
          .filter(Boolean)
          .slice(0, 2)
          .join(", ") + (values.length > 2 ? ` +${values.length - 2}` : "");

  const portal = typeof document !== "undefined" ? document.body : null;

  const toggle = (id: string) => {
    if (values.includes(id)) onChange(values.filter((x) => x !== id));
    else onChange([...values, id]);
  };

  return (
    <div className="w-full">
      {label && (
        <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
          {label}
        </p>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(true)}
        className="flex w-full items-center justify-between gap-3 rounded-2xl bg-gray-50 px-5 py-4 text-left text-sm font-bold ring-indigo-200 transition-all focus:outline-none focus:ring-2 disabled:opacity-50"
      >
        <span className={`min-w-0 truncate ${values.length ? "text-gray-900" : "text-gray-400"}`}>
          {summary}
        </span>
        <ChevronDown className="h-5 w-5 shrink-0 text-gray-400" />
      </button>

      {open &&
        portal &&
        createPortal(
          <div className="fixed inset-0 z-[500] flex items-end justify-center">
            <button
              type="button"
              className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
              aria-label="Close"
              onClick={() => {
                setOpen(false);
                setQ("");
              }}
            />
            <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-[40px] bg-white shadow-2xl animate-[toast-in_0.3s_ease-out]">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <p className="text-lg font-black text-gray-900">{placeholder}</p>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setQ("");
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-50 text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {searchable && (
                <div className="border-b border-gray-50 px-6 py-3">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />
                    <input
                      autoFocus
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search…"
                      className="w-full rounded-2xl border border-gray-100 bg-gray-50 py-3 pl-11 pr-4 text-sm font-semibold focus:border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>
              )}

              <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2 pb-10">
                {filtered.map((o) => {
                  const isOn = values.includes(o.value);
                  return (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => toggle(o.value)}
                      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-colors ${
                        isOn ? "bg-indigo-50 text-indigo-900" : "hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 ${
                          isOn ? "border-indigo-600 bg-indigo-600" : "border-gray-200 bg-white"
                        }`}
                      >
                        {isOn && <Check className="h-3.5 w-3.5 text-white" />}
                      </div>
                      <span className="flex-1 text-sm font-bold">{o.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-gray-100 px-6 py-4">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setQ("");
                  }}
                  className="w-full rounded-2xl bg-indigo-600 py-3.5 text-sm font-black text-white shadow-lg shadow-indigo-200"
                >
                  Done ({values.length})
                </button>
              </div>
            </div>
          </div>,
          portal
        )}
    </div>
  );
}
