"use client";

import { AppProvider, useApp } from "@/context/AppContext";
import LoginScreen from "@/components/screens/LoginScreen";
import AppShell from "@/components/AppShell";

import GlobalModal from "@/components/GlobalModal";

function RootContent() {
  const { isLoggedIn, loading } = useApp();
  
  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center animate-pulse">
        <div className="w-16 h-16 bg-indigo-600 rounded-[2rem] flex items-center justify-center mb-4 shadow-xl shadow-indigo-200">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-900/40">Initializing Klasszy</p>
      </div>
    );
  }
  
  return (
    <>
      {isLoggedIn ? <AppShell /> : <LoginScreen />}
      <GlobalModal />
    </>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <div className="h-[100dvh] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-violet-100 flex items-center justify-center p-0 sm:p-6 lg:p-0 lg:bg-[#f5f5f7]">
        <div className="h-full w-full max-w-md mx-auto shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] flex flex-col bg-white relative overflow-hidden sm:rounded-[3rem] border-8 border-white lg:max-w-none lg:rounded-none lg:border-0 lg:shadow-none lg:overflow-visible">
          <RootContent />
        </div>
      </div>
    </AppProvider>
  );
}
