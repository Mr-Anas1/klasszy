"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Loader2,
  AlertCircle,
  GraduationCap
} from "lucide-react";
import { useApp } from "@/context/AppContext";
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
  const [loadingText, setLoadingText] = useState("");
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

  const handleSchoolContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolCode.trim()) return;
    
    setLoadingText("Finding your school...");
    setLoading(true);
    setError("");
    
    try {
      const s = await loadSchoolBranding(schoolCode);
      if (!s) {
        setError("Invalid school code. Please try again.");
        setLoading(false);
        return;
      }
      setSchool(s);
      
      // Artificial delay for smooth UI transition feeling
      setTimeout(() => {
        setStep("credentials");
        setLoading(false);
      }, 600);
    } catch {
      setError("Failed to verify school code");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in your credentials");
      return;
    }
    
    setLoadingText("Authenticating...");
    setLoading(true);
    setError("");
    
    const success = await login(schoolCode, email, password);
    if (!success) {
      setError("Invalid email or password");
      setLoading(false);
    }
    // If successful, the context will update and unmount this screen automatically.
  };

  return (
    <div className="relative min-h-screen bg-white overflow-hidden flex flex-col font-sans">
      
      {/* Decorative Diagonal Background Shapes (Inspired by image) */}
      <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[40%] bg-[#F0F5FF] rounded-[100px] -rotate-45 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[80%] h-[40%] bg-[#F0F5FF] rounded-[100px] -rotate-45 pointer-events-none" />
      <div className="absolute top-[30%] right-[-30%] w-[60%] h-[20%] bg-[#F8FAFF] rounded-[100px] -rotate-45 pointer-events-none" />

      {/* Full Screen Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-800 animate-fade-in">
          <div className="relative flex items-center justify-center w-24 h-24 mb-6">
            <div className="absolute inset-0 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            <GraduationCap className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h2 className="text-white text-xl font-bold tracking-wide animate-pulse">{loadingText}</h2>
        </div>
      )}

      {/* Top Bar (Back Button) */}
      <div className="relative z-10 pt-12 px-6 h-20">
        {step === "credentials" && (
          <button
            type="button"
            onClick={handleBackToSchool}
            className="flex items-center gap-2 text-green-500 font-bold hover:text-green-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 pb-12 w-full max-w-md mx-auto">
        
        {/* Logo Area */}
        <div className="flex flex-col items-center mb-16 animate-fade-slide-up">
          {step === "credentials" && school?.logoUrl ? (
            <img src={school.logoUrl} alt={school.name} className="w-24 h-24 object-contain mb-4 drop-shadow-md rounded-2xl" />
          ) : (
            <img src="/public/Klasszy-logo.png" alt="Klasszy" className="w-24 h-24 object-contain mb-4 drop-shadow-md rounded-2xl" />
          )}
          <h1 className="text-[28px] font-black text-blue-950 tracking-tight text-center leading-tight">
            {step === "school" ? "Welcome" : school?.name}
          </h1>
          <p className="text-sm font-bold text-gray-400 mt-2 uppercase tracking-widest">
            {step === "school" ? "Enter your school code" : "Log In"}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="w-full bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-start gap-3 mb-6 animate-shake">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <p className="text-sm font-bold text-rose-600 leading-tight">{error}</p>
          </div>
        )}

        {/* Forms */}
        <div className="w-full animate-fade-in">
          {step === "school" ? (
            <form onSubmit={handleSchoolContinue} className="flex flex-col gap-10">
              <div className="relative">
                <input 
                  type="text" 
                  value={schoolCode}
                  onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SCH001"
                  className="w-full bg-transparent border-b-2 border-gray-200 py-3 text-lg font-bold text-blue-950 placeholder:text-gray-300 focus:outline-none focus:border-blue-600 transition-colors"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 text-white py-4 rounded-full font-bold text-base shadow-[0_8px_25px_rgba(37,99,235,0.35)] hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(37,99,235,0.45)] active:translate-y-0 transition-all"
              >
                Continue
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              <div className="flex flex-col gap-6">
                <div className="relative">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="mail@example.com"
                    className="w-full bg-transparent border-b-2 border-gray-200 py-3 text-base font-bold text-blue-950 placeholder:text-gray-300 focus:outline-none focus:border-blue-600 transition-colors"
                    required
                  />
                </div>

                <div className="relative">
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••••"
                    className="w-full bg-transparent border-b-2 border-gray-200 py-3 text-xl tracking-widest font-black text-blue-950 placeholder:text-gray-300 placeholder:tracking-normal focus:outline-none focus:border-blue-600 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-start">
                <button 
                  type="button" 
                  onClick={() => {
                    showAlert(
                      "Contact Your School Admin", 
                      "Please contact your school principal or administrator to reset your password.\n\nYou can also reach out via:\n• School office phone\n• Official school email\n• Parent portal access", 
                      "success"
                    );
                  }}
                  className="text-xs font-bold text-green-500 uppercase tracking-wider hover:text-green-600 transition-colors"
                >
                  Forgot your password?
                </button>
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 text-white py-4 rounded-full font-bold text-base shadow-[0_8px_25px_rgba(37,99,235,0.35)] hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(37,99,235,0.45)] active:translate-y-0 transition-all mt-2"
              >
                Log In
              </button>
            </form>
          )}
        </div>

      </div>

          </div>
  );
}