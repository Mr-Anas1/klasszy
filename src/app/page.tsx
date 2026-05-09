"use client";

import { AppProvider, useApp } from "@/context/AppContext";
import LoginScreen from "@/components/screens/LoginScreen";
import SchoolSelectionScreen from "@/components/screens/SchoolSelectionScreen";
import AppShell from "@/components/AppShell";
import { isMobileApp } from "@/configs/appConfig";

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
      {isLoggedIn ? (
        <AppShell />
      ) : (
        // For web, show school selection screen; for mobile app, show regular login screen
        isMobileApp ? <LoginScreen /> : <SchoolSelectionScreen />
      )}
      <GlobalModal />
    </>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <div className="h-[100dvh] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-violet-100 lg:bg-[#f5f5f7]">
        <div className="h-full w-full flex flex-col bg-white relative overflow-hidden lg:bg-transparent lg:overflow-visible">
          <RootContent />
        </div>
      </div>
    </AppProvider>
  );
}
