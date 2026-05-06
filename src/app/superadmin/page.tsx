"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SuperAdminProvider, useSuperAdmin } from "@/context/SuperAdminContext";
import SAShell from "@/components/superadmin/SAShell";
import { Loader2, ShieldCheck } from "lucide-react";

function SAGate() {
  const { isLoggedIn, loading } = useSuperAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.replace("/superadmin/login");
    }
  }, [loading, isLoggedIn, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/40">
          <ShieldCheck className="w-7 h-7 text-white" />
        </div>
        <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
        <p className="text-slate-500 text-xs uppercase tracking-widest">Klasszy Admin</p>
      </div>
    );
  }

  if (!isLoggedIn) return null;

  return <SAShell />;
}

export default function SuperAdminPage() {
  return (
    <SuperAdminProvider>
      <SAGate />
    </SuperAdminProvider>
  );
}
