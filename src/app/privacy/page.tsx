import React from "react";
import { 
  Shield, Lock, Database, Globe, Mail, 
  FileText, Smartphone, CheckCircle2 
} from "lucide-react";

export default function PrivacyPolicyPage() {
  const schoolName = "Klasszy";
  const effectiveDateLabel = "May 11, 2026";

  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-indigo-100">
      {/* 1. STICKY HEADER - High Z-Index & Glassmorphism */}
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
        <div className="max-w-3xl mx-auto px-5 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-base font-bold text-slate-900">Privacy Policy</h1>
                <p className="text-[11px] text-slate-500 font-medium">Effective: {effectiveDateLabel}</p>
              </div>
            </div>
            <div className="hidden xs:block">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full border border-indigo-100 uppercase tracking-wider">
                Official
              </span>
            </div>
          </div>

          {/* Horizontal Quick Navigation */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: "info-we-collect", label: "Collection" },
              { id: "how-we-use", label: "Usage" },
              { id: "security", label: "Security" },
              { id: "contact", label: "Contact" }
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all border bg-white border-slate-200 text-slate-600 hover:border-slate-300"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTENT */}
      <main className="max-w-3xl mx-auto px-5 py-8 space-y-8">
        
        {/* Hero Card */}
        <div className="relative overflow-hidden bg-slate-900 rounded-[32px] p-8 shadow-2xl shadow-slate-200">
          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg mb-4 border border-white/10">
              <Shield className="w-4 h-4 text-indigo-300" />
              <span className="text-[10px] font-bold text-indigo-100 uppercase tracking-[0.2em]">{schoolName} Trust</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight">Your data is <span className="text-indigo-400">protected.</span></h2>
            <p className="text-slate-300 text-sm leading-relaxed max-w-xl">
              Welcome to the {schoolName} School App. This policy explains how we collect, use, and protect your information to provide a safe educational environment.
            </p>
          </div>
        </div>

        {/* Section 1: Information We Collect */}
        <section id="info-we-collect" className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm scroll-mt-32">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">1. Information We Collect</h3>
              <p className="text-xs text-slate-500 font-semibold">Necessary data for app functionality</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">Personal Details</h4>
              <ul className="space-y-3">
                {['Full Name & Student ID', 'Contact Number', 'Email Address', 'Attendance Records', 'Class & Section'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">Technical Logs</h4>
              <ul className="space-y-3">
                {['Device OS & Model', 'App Version Info', 'Crash Diagnostics', 'Interaction Data'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                    <Smartphone className="w-4 h-4 text-slate-400 flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Section 2: How We Use Information */}
        <section id="how-we-use" className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm scroll-mt-32">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 border border-green-100">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">2. How We Use Data</h3>
              <p className="text-xs text-slate-500 font-semibold">Processing for education</p>
            </div>
          </div>
          <div className="bg-slate-50 rounded-2xl p-5 space-y-3">
            <p className="text-sm text-slate-700 leading-relaxed">We use the collected information solely to:</p>
            <ul className="grid gap-2">
              {[
                "Provide LMS & Management features",
                "Enable Teacher-Parent communication",
                "Improve app performance and security",
                "Manage homework & circular distribution"
              ].map((text, i) => (
                <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Section 3: Security */}
        <section id="security" className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm scroll-mt-32">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 border border-purple-100">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">3. Security & Storage</h3>
              <p className="text-xs text-slate-500 font-semibold">Encryption and Cloud safety</p>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              We use <span className="font-bold text-slate-900">end-to-end HTTPS encryption</span>. Your data is stored on secure cloud infrastructure managed by global leaders.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Firebase DB', 'Cloudinary SSL', 'AES-256', 'Strict Auth'].map((tag) => (
                <span key={tag} className="px-3 py-1 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-lg border border-purple-100">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="bg-indigo-600 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden scroll-mt-32">
          <div className="absolute bottom-0 right-0 opacity-10">
            <Mail className="w-32 h-32 translate-y-8 translate-x-8" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Have questions?</h3>
            <p className="text-indigo-100 text-sm mb-6 opacity-90">If you have any concerns regarding your privacy, our team is here to help.</p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="mailto:support@klasszy.in" className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-2xl font-black text-sm hover:bg-indigo-50 transition-all active:scale-95">
                <Mail className="w-4 h-4" />
                Email Support
              </a>
              <a href="https://www.klasszy.in" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-2xl font-black text-sm hover:bg-indigo-400 transition-all active:scale-95 border border-indigo-400">
                <Globe className="w-4 h-4" />
                Visit Website
              </a>
            </div>
          </div>
        </section>

        {/* Footer Branding */}
        <footer className="pt-8 pb-12 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{schoolName}</p>
        </footer>
      </main>
    </div>
  );
}