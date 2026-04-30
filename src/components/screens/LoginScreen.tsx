"use client";

import React, { useState } from "react";
import { 
  BookOpen, 
  ArrowRight, 
  GraduationCap,
  Users,
  ShieldCheck,
  Loader2,
  Mail,
  Lock,
  AlertCircle
} from "lucide-react";
import { useApp, UserRole } from "@/context/AppContext";
import { seedDatabase } from "@/lib/seed-data";

export default function LoginScreen() {
  const { login } = useApp();
  const [role, setRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState("");

  const handleSeed = async () => {
    setSeeding(true);
    const ok = await seedDatabase();
    if (ok) alert("Demo database initialized! Use password123 to login.");
    else alert("Failed to seed. Check console and make sure .env.local is correct.");
    setSeeding(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      setError("Please select a role first");
      return;
    }
    setLoading(true);
    setError("");
    const success = await login(email, password, role);
    if (!success) {
      setError("Invalid email, password, or role mismatch");
    }
    setLoading(false);
  };

  const roles = [
    { id: 'student' as UserRole, label: 'Student', icon: GraduationCap, color: 'bg-indigo-600' },
    { id: 'teacher' as UserRole, label: 'Teacher', icon: Users, color: 'bg-violet-600' },
    { id: 'admin' as UserRole, label: 'Admin', icon: ShieldCheck, color: 'bg-rose-600' },
  ];

  if (!role) {
    return (
      <div className="flex flex-col min-h-full bg-[#f5f5f7] animate-fade-in">
        <div className="relative bg-[#1E1E26] flex flex-col items-center justify-center pt-24 pb-20 px-8 overflow-hidden">
          <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-indigo-600/30 blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          <div className="animate-scale-in w-20 h-20 bg-indigo-600 rounded-[28px] flex items-center justify-center shadow-2xl mb-6">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black text-white tracking-tight">Klasszy LMS</h1>
            <p className="mt-2 text-sm text-white/50 font-medium tracking-wide uppercase px-4 py-1.5 bg-white/5 rounded-full backdrop-blur-sm">
              Select your role
            </p>
          </div>
        </div>

        <div className="flex-1 px-6 py-10 space-y-4">
          {roles.map((r, i) => (
            <button
              key={r.id}
              onClick={() => {
                setRole(r.id);
                // Pre-fill for convenience during setup/testing
                if (r.id === 'admin') setEmail('admin@school.edu');
                if (r.id === 'teacher') setEmail('teacher@school.edu');
                if (r.id === 'student') setEmail('student@school.edu');
              }}
              className="w-full bg-white border border-gray-100 rounded-[32px] p-6 flex items-center gap-5 shadow-sm active:scale-[0.97] transition-all hover:shadow-xl group"
            >
              <div className={`${r.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg`}>
                <r.icon className="w-7 h-7" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-lg font-black text-gray-900 leading-none">{r.label}</h3>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-1.5 opacity-60">Enter Dashboard</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-200 group-hover:text-indigo-500 transition-colors" />
            </button>
          ))}
          
          <button 
            onClick={handleSeed}
            disabled={seeding}
            className="w-full mt-4 py-4 rounded-[24px] border-2 border-dashed border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:border-indigo-200 hover:text-indigo-400 transition-all flex items-center justify-center gap-2"
          >
            {seeding ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
            {seeding ? "Initializing..." : "Setup Demo Database"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-white animate-fade-slide-up">
      <div className="p-8 pt-16">
        <button 
          onClick={() => { setRole(null); setError(""); }}
          className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 hover:text-indigo-600 transition-colors"
        >
          ← Back to roles
        </button>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Welcome Back</h2>
        <p className="text-sm text-gray-400 mt-2 font-medium">Please sign in as <span className="text-indigo-600 font-bold uppercase">{role}</span></p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 px-8 py-4 space-y-6">
        {error && (
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-start gap-3 animate-shake">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <p className="text-xs font-bold text-rose-600 leading-tight">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="group">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@school.edu"
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
        </div>

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

        <div className="text-center pt-4">
          <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest">Forgot your credentials? Contact school IT</p>
        </div>
      </form>
    </div>
  );
}
