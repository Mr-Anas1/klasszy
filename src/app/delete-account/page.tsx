"use client";

import React from "react";
import { ArrowLeft, Trash2, Mail, Phone, Clock, Shield, FileText, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DeleteAccountPage() {
  const router = useRouter();
  
  // Default school name since we can't access context
  const schoolName = "Klasszy";

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-[#f5f5f7]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-4 px-5 py-4">
          <button
            onClick={handleBack}
            className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-black text-gray-900">Account & Data Deletion</h1>
            <p className="text-xs text-gray-500 font-medium">Request account removal</p>
          </div>
        </div>
        
        {/* Quick Navigation */}
        <div className="px-5 pb-3 flex gap-2 overflow-x-auto no-scrollbar bg-gray-50 border-t border-gray-100">
          {[
            { id: "how-to-request", label: "How to Request" },
            { id: "what-deleted", label: "What's Deleted" },
            { id: "what-retained", label: "What's Retained" },
            { id: "processing-time", label: "Processing Time" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all border bg-white border-gray-200 text-gray-600 hover:border-gray-300"
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-5 py-6 max-w-3xl mx-auto w-full">
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 pt-6 pb-5 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-50 via-white to-orange-50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center shadow-lg shadow-rose-200/60">
                <Trash2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-rose-500">{schoolName}</p>
                <h2 className="text-2xl font-black text-gray-900 mt-1">Account & Data Deletion Request</h2>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  {schoolName} School App allows schools, parents, students, and teachers to request account or data deletion.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button onClick={() => scrollToSection("how-to-request")} className="px-3 py-2 rounded-2xl bg-white/80 border border-gray-100 text-xs font-black text-gray-700 active:scale-[0.99] transition">
                How to Request
              </button>
              <button onClick={() => scrollToSection("what-deleted")} className="px-3 py-2 rounded-2xl bg-white/80 border border-gray-100 text-xs font-black text-gray-700 active:scale-[0.99] transition">
                What Gets Deleted
              </button>
              <button onClick={() => scrollToSection("what-retained")} className="px-3 py-2 rounded-2xl bg-white/80 border border-gray-100 text-xs font-black text-gray-700 active:scale-[0.99] transition">
                What's Retained
              </button>
              <button onClick={() => scrollToSection("processing-time")} className="px-3 py-2 rounded-2xl bg-white/80 border border-gray-100 text-xs font-black text-gray-700 active:scale-[0.99] transition">
                Processing Time
              </button>
            </div>
          </div>

          <div className="px-6 pb-6">
            <section id="how-to-request" className="mt-6 scroll-mt-28">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">How to Request Deletion</h3>
                  <p className="text-xs text-gray-500 font-semibold">Contact information required</p>
                </div>
              </div>

              <div className="mt-4 rounded-[24px] border border-gray-100 bg-white p-4">
                <p className="text-sm text-gray-700">To request deletion of your account or associated data, please contact your school administrator or email us at:</p>
                
                <div className="mt-4 rounded-[20px] bg-blue-50 border border-blue-100 p-4">
                  <a 
                    href="mailto:support@klasszy.in" 
                    className="flex items-center gap-3 text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    <div>
                      <p className="font-black text-sm">support@klasszy.in</p>
                      <p className="text-xs text-blue-600/70">Click to email</p>
                    </div>
                  </a>
                </div>

                <div className="mt-4">
                  <p className="font-black text-gray-900 text-sm mb-3">Please include:</p>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Your name</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Registered phone number or email</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>School name</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Reason for deletion request (optional)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="what-deleted" className="mt-7 scroll-mt-28">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-2xl flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">What Data May Be Deleted</h3>
                  <p className="text-xs text-gray-500 font-semibold">Upon verification and approval</p>
                </div>
              </div>

              <div className="mt-4 rounded-[24px] border border-gray-100 bg-white p-4">
                <p className="text-sm text-gray-700">Upon verification and approval, we may delete:</p>
                <ul className="mt-3 text-sm text-gray-700 space-y-2">
                  <li className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <span>User profile information</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <span>Attendance records</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <span>Homework-related data</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <span>Uploaded files and attachments</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <span>Notifications and related account data</span>
                  </li>
                </ul>
              </div>
            </section>

            <section id="what-retained" className="mt-7 scroll-mt-28">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">Data That May Be Retained</h3>
                  <p className="text-xs text-gray-500 font-semibold">Legal and security requirements</p>
                </div>
              </div>

              <div className="mt-4 rounded-[24px] border border-gray-100 bg-white p-4 space-y-3">
                <p className="text-sm text-gray-700">Certain records may be retained for:</p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span>Legal compliance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span>School administrative requirements</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span>Security and fraud prevention</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span>Backup and audit purposes</span>
                  </li>
                </ul>
                <p className="text-sm text-gray-700 mt-3">Retained data will be securely stored and handled according to applicable policies.</p>
              </div>
            </section>

            <section id="processing-time" className="mt-7 scroll-mt-28">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-2xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">Processing Time</h3>
                  <p className="text-xs text-gray-500 font-semibold">Verification timeline</p>
                </div>
              </div>

              <div className="mt-4 rounded-[24px] border border-gray-100 bg-white p-4">
                <p className="text-sm text-gray-700">Deletion requests are typically processed within <strong>7–30 business days</strong> depending on school verification requirements.</p>
              </div>
            </section>

            <section id="contact" className="mt-7 scroll-mt-28">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center">
                  <Mail className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">Contact</h3>
                  <p className="text-xs text-gray-500 font-semibold">Questions about deletion</p>
                </div>
              </div>

              <div className="mt-4 rounded-[24px] border border-gray-100 bg-white p-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-black text-gray-900">Klasszy</p>
                    <div className="mt-2 grid gap-2">
                      <a className="text-sm font-bold text-indigo-600 hover:text-indigo-700" href="http://www.klasszy.in" target="_blank" rel="noreferrer">
                        Website: www.klasszy.in
                      </a>
                      <a className="text-sm font-bold text-indigo-600 hover:text-indigo-700" href="mailto:support@klasszy.in">
                        Email: support@klasszy.in
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="text-center mt-8">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.25em]">{schoolName}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
