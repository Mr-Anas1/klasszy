"use client";

import React, { useState } from "react";
import { 
  BookOpen, 
  ArrowRight, 
  Loader2,
  Mail,
  Lock,
  AlertCircle,
  School,
  ArrowLeft
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { seedDatabase } from "@/lib/seed-data";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import type { School as SchoolType } from "@/context/AppContext";

export default function LoginScreen() {
  const { login, showAlert } = useApp();
  const [schoolCode, setSchoolCode] = useState("");
  const [school, setSchool] = useState<SchoolType | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"school" | "credentials">("school");

  const loadSchoolBranding = async (code: string): Promise<SchoolType | null> => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return null;

    const schoolQ = query(collection(db, "schools"), where("code", "==", trimmed));
    const schoolSnap = await getDocs(schoolQ);
    if (schoolSnap.empty) return null;
    const d = schoolSnap.docs[0];
    return { id: d.id, ...(d.data() as any) } as SchoolType;
  };

  const handleSchoolContinue = async () => {
    setLoading(true);
    setError("");
    try {
      const s = await loadSchoolBranding(schoolCode);
      if (!s) {
        setError("Invalid school code");
        return;
      }
      setSchool(s);
      setStep("credentials");
    } catch {
      setError("Failed to verify school code");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSchool = () => {
    setStep("school");
    setSchool(null);
    setEmail("");
    setPassword("");
    setError("");
  };

  const handleSeed = async () => {
    setSeeding(true);
    const ok = await seedDatabase();
    if (ok) {
      showAlert(
        "Database Ready", 
        "Multi-school Demo initialized!\n\nSchool Code: SCH001\nAdmin: admin@school1.edu\nPassword: password123", 
        "success"
      );
    } else {
      showAlert("Setup Failed", "Failed to seed database. Please check your Firebase configuration and console logs.", "error");
    }
    setSeeding(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolCode || !email || !password) {
      setError("Please fill all fields");
      return;
    }
    setLoading(true);
    setError("");
    const success = await login(schoolCode, email, password);
    if (!success) {
      setError("Invalid credentials or school code");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-full bg-white animate-fade-in">
      <div
        className="relative flex flex-col items-center justify-center pt-24 pb-12 px-8 overflow-hidden"
        style={{ backgroundColor: school?.themeColor ?? "#1E1E26" }}
      >
        <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-white/10 blur-3xl -translate-x-1/2 -translate-y-1/2" />

        <div className="w-full max-w-md">
          {step === "credentials" && (
            <button
              type="button"
              onClick={handleBackToSchool}
              className="mb-6 inline-flex items-center gap-2 text-white/80 hover:text-white text-xs font-black uppercase tracking-widest"
            >
              <ArrowLeft className="w-4 h-4" />
              Change School
            </button>
          )}

          <div className="flex items-center gap-4">
            <div className="animate-scale-in w-16 h-16 bg-white/15 rounded-[24px] flex items-center justify-center shadow-2xl shrink-0 overflow-hidden">
              {school?.logoUrl ? (
                <img src={school.logoUrl} alt={school.name} className="w-full h-full object-cover" />
              ) : (
                <BookOpen className="w-8 h-8 text-white" />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-black text-white tracking-tight truncate">
                {school?.name ?? "Klasszy LMS"}
              </h1>
              <p className="mt-1 text-xs text-white/70 font-black uppercase tracking-widest">
                {step === "school" ? "Select your school" : "Sign in"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 px-8 py-8 space-y-6">
        {error && (
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-start gap-3 animate-shake">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <p className="text-xs font-bold text-rose-600 leading-tight">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="group">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">School Code</label>
            <div className="relative">
              <School className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                value={schoolCode}
                onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
                placeholder="e.g. SCH001"
                className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-[24px] py-5 pl-14 pr-6 text-sm font-bold text-gray-900 transition-all outline-none"
                required
                disabled={step === "credentials"}
              />
            </div>
          </div>

          {step === "credentials" && (
            <>
              <div className="group">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-indigo-500 transition-colors" />
                  <input 
                    type="text" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Username or Email"
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-[24px] py-5 pl-14 pr-6 text-sm font-bold text-gray-900 transition-all outline-none"
                    required
                  />
                </div>
              </div>

              <div className="group">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-indigo-500 transition-colors" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-[24px] py-5 pl-14 pr-6 text-sm font-bold text-gray-900 transition-all outline-none"
                    required
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {step === "school" ? (
          <button 
            type="button"
            onClick={handleSchoolContinue}
            disabled={loading || !schoolCode.trim()}
            className="w-full bg-[#1E1E26] text-white py-6 rounded-[28px] font-black text-sm uppercase tracking-widest shadow-xl shadow-gray-200 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>Continue <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        ) : (
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#1E1E26] text-white py-6 rounded-[28px] font-black text-sm uppercase tracking-widest shadow-xl shadow-gray-200 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>Sign In <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        )}

        <button 
          type="button"
          onClick={handleSeed}
          disabled={seeding}
          className="w-full mt-4 py-4 rounded-[24px] border-2 border-dashed border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:border-indigo-200 hover:text-indigo-400 transition-all flex items-center justify-center gap-2"
        >
          {seeding ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
          {seeding ? "Initializing Multi-school..." : "Setup New Multi-school DB"}
        </button>
      </form>
    </div>
  );
}
