"use client";

import React from "react";
import { CheckCircle2, AlertCircle, HelpCircle, X } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function GlobalModal() {
  const { modal, hideModal } = useApp();

  if (!modal) return null;

  const isConfirm = modal.type === "confirm";
  const isError = modal.type === "error";
  const isSuccess = modal.type === "success";

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md animate-fade-in" 
        onClick={isConfirm ? undefined : hideModal} 
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-sm bg-white rounded-[40px] p-8 shadow-2xl animate-scale-in border border-gray-100">
        {!isConfirm && (
          <button 
            onClick={hideModal}
            className="absolute right-6 top-6 w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 active:scale-90 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex flex-col items-center text-center">
          <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center mb-6 shadow-lg ${
            isSuccess ? "bg-emerald-50 text-emerald-500 shadow-emerald-100" : 
            isError ? "bg-rose-50 text-rose-500 shadow-rose-100" : 
            "bg-indigo-50 text-indigo-500 shadow-indigo-100"
          }`}>
            {isSuccess && <CheckCircle2 className="w-10 h-10" />}
            {isError && <AlertCircle className="w-10 h-10" />}
            {isConfirm && <HelpCircle className="w-10 h-10" />}
          </div>

          <h3 className="text-2xl font-black text-gray-900 leading-tight px-4">{modal.title}</h3>
          <p className="text-sm text-gray-400 mt-3 font-medium leading-relaxed whitespace-pre-wrap">
            {modal.message}
          </p>

          <div className="mt-10 w-full flex gap-3">
            {isConfirm ? (
              <>
                <button 
                  onClick={hideModal} 
                  className="flex-1 bg-gray-50 text-gray-400 font-black py-5 rounded-[24px] text-xs uppercase tracking-widest active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    modal.onConfirm?.();
                    hideModal();
                  }} 
                  className="flex-1 bg-[#1E1E26] text-white font-black py-5 rounded-[24px] text-xs uppercase tracking-widest shadow-xl shadow-gray-200 active:scale-95 transition-all"
                >
                  Confirm
                </button>
              </>
            ) : (
              <button 
                onClick={hideModal} 
                className={`w-full font-black py-5 rounded-[24px] text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all ${
                  isSuccess ? "bg-emerald-600 text-white shadow-emerald-100" : 
                  isError ? "bg-rose-600 text-white shadow-rose-100" : 
                  "bg-[#1E1E26] text-white shadow-gray-200"
                }`}
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
