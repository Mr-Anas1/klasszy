"use client";

import React, { useState } from "react";
import { Mail, User, Phone, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useSuperAdmin } from "@/context/SuperAdminContext";

interface Props {
  schoolId: string;
  onSuccess: () => void;
}

export default function AdminCreationForm({ schoolId, onSuccess }: Props) {
  const { createSchoolAdmin, showAlert } = useSuperAdmin();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      showAlert("Error", "Please fill all required fields.", "error");
      return;
    }

    if (formData.password.length < 6) {
      showAlert("Error", "Password must be at least 6 characters.", "error");
      return;
    }

    setLoading(true);
    try {
      await createSchoolAdmin(schoolId, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      
      showAlert("Success", "Admin account created successfully!", "success");
      setFormData({ name: "", email: "", phone: "", password: "" });
      onSuccess();
    } catch (error) {
      showAlert("Error", "Failed to create admin account. Please try again.", "error");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 block">
          Full Name *
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter admin's full name"
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-0 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 block">
          Email Address *
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="admin@school.com"
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-0 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 block">
          Phone Number
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1234567890"
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-0 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 block">
          Password *
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Minimum 6 characters"
            className="w-full pl-10 pr-12 py-3 bg-slate-50 border-0 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-transform disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Creating Admin...
          </>
        ) : (
          "Create Admin Account"
        )}
      </button>
    </form>
  );
}
