"use client";

import React, { useState } from "react";
import { ArrowLeft, Users, Plus, Mail, ShieldCheck, User, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function ManageAdminsScreen() {
  const { usersList, setActiveTab, showAlert, onboardUser } = useApp();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: ""
  });

  const admins = usersList.filter(u => u.role === "admin");

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      showAlert("Missing Info", "Please fill all required fields.", "error");
      return;
    }

    if (formData.password.length < 6) {
      showAlert("Weak Password", "Password must be at least 6 characters.", "error");
      return;
    }

    setLoading(true);
    try {
      await onboardUser(formData.name, formData.email, "admin", formData.password);
      setFormData({ name: "", email: "", password: "", phone: "" });
      setShowCreateForm(false);
    } catch (error) {
      showAlert("Error", "Failed to create admin account. Please try again.", "error");
    }
    setLoading(false);
  };

  const handleDeleteAdmin = async (adminId: string, adminName: string) => {
    if (!confirm(`Are you sure you want to remove admin access for ${adminName}?`)) {
      return;
    }
    
    // Note: In production, you should also disable the Firebase Auth user
    // For now, we'll just show a message
    showAlert("Info", "Admin deletion requires additional setup. Please contact support.", "error");
  };

  return (
    <div className="pb-36 px-5 pt-6 animate-fade-slide-up">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900 leading-none">Manage Admins</h2>
          <p className="text-sm text-gray-400 font-medium mt-1">Create and manage administrator accounts</p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{admins.length}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Admins</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-black">Add Admin</span>
          </button>
        </div>
      </div>

      {/* Admins List */}
      <div className="space-y-3">
        {admins.length > 0 ? (
          admins.map((admin) => (
            <div
              key={admin.id}
              className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
                    <User className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-gray-900">{admin.name}</h3>
                    <p className="text-sm text-gray-400">{admin.email}</p>
                    {admin.phone && <p className="text-xs text-gray-400 mt-0.5">{admin.phone}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-black">
                    ADMIN
                  </div>
                  <button
                    onClick={() => handleDeleteAdmin(admin.id, admin.name)}
                    className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 text-red-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-400 font-medium">No admin accounts found</p>
            <p className="text-sm text-gray-400 mt-1">Create your first admin account to get started</p>
          </div>
        )}
      </div>

      {/* Create Admin Modal/Bottom Sheet */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-md md:bg-black/60"
            onClick={() => setShowCreateForm(false)}
          />
          
          {/* Form Container */}
          <div className="relative bg-white rounded-t-[32px] md:rounded-2xl w-full max-w-md md:max-w-lg p-6 md:p-8 animate-slide-up md:animate-scale-in">
            {/* Handle for mobile */}
            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6 md:hidden" />
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-gray-900">Create Admin Account</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter admin's full name"
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@school.com"
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1234567890"
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimum 6 characters"
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 pr-12"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-purple-200 active:scale-95 transition-transform disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
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
          </div>
        </div>
      )}
    </div>
  );
}
