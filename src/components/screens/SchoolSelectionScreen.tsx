"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  Loader2,
  GraduationCap,
  MapPin,
  Users,
  Building,
  ChevronRight
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import type { School as SchoolType } from "@/context/AppContext";

export default function SchoolSelectionScreen() {
  const { login, showAlert } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<SchoolType[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<SchoolType | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState<"search" | "credentials">("search");

  // Load all schools on mount
  useEffect(() => {
    loadSchools();
  }, []);

  // Filter schools based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSchools(schools);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredSchools(
        schools.filter(school => 
          school.name.toLowerCase().includes(query) ||
          school.code.toLowerCase().includes(query) ||
          school.name.toLowerCase().includes(query.split(' ')[0])
        )
      );
    }
  }, [searchQuery, schools]);

  const loadSchools = async () => {
    setLoadingText("Loading schools...");
    setLoading(true);
    setError("");

    try {
      const schoolsQuery = query(collection(db, "schools"), orderBy("name"), limit(50));
      const schoolsSnap = await getDocs(schoolsQuery);
      const schoolsList = schoolsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SchoolType[];
      
      setSchools(schoolsList);
      setFilteredSchools(schoolsList);
    } catch (err) {
      console.error("Failed to load schools:", err);
      setError("Failed to load schools. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSchoolSelect = (school: SchoolType) => {
    setSelectedSchool(school);
    setStep("credentials");
  };

  const handleBackToSearch = () => {
    setStep("search");
    setSelectedSchool(null);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchool) return;

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      setError("Please fill in your credentials");
      return;
    }
    
    setLoadingText("Authenticating...");
    setLoading(true);
    setError("");
    
    const success = await login(selectedSchool.code, email, password);
    if (!success) {
      setError("Invalid email or password");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-white overflow-hidden flex flex-col font-sans">
      
      {/* Decorative Background */}
      <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[40%] bg-[#F0F5FF] rounded-[100px] -rotate-45 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[80%] h-[40%] bg-[#F0F5FF] rounded-[100px] -rotate-45 pointer-events-none" />
      <div className="absolute top-[30%] right-[-30%] w-[60%] h-[20%] bg-[#F8FAFF] rounded-[100px] -rotate-45 pointer-events-none" />

      {/* Full Screen Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center animate-fade-in bg-gradient-to-br from-indigo-600 to-gray-900">
          <div className="relative flex items-center justify-center w-24 h-24 mb-6">
            <div className="absolute inset-0 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            <GraduationCap className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h2 className="text-white text-xl font-bold tracking-wide animate-pulse">{loadingText}</h2>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 py-12 max-w-md mx-auto w-full">
        
        {step === "search" ? (
          /* School Search Step */
          <div className="animate-fade-slide-up">
            {/* Logo and Title */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-xl shadow-indigo-200 mx-auto">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-black text-gray-900 mb-2">Welcome to Klasszy</h1>
              <p className="text-gray-600 font-medium">Select your school to continue</p>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search schools by name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-3xl pl-12 pr-5 py-4 text-sm font-bold focus:outline-none focus:border-indigo-100 focus:bg-white transition-all shadow-sm"
                autoFocus
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 text-sm font-bold">!</span>
                </div>
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Schools List */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {filteredSchools.length > 0 ? (
                filteredSchools.map((school) => (
                  <button
                    key={school.id}
                    onClick={() => handleSchoolSelect(school)}
                    className="w-full bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4 hover:border-indigo-200 hover:bg-indigo-50 transition-all text-left group"
                  >
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{school.name}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-gray-500 font-medium">Code: {school.code}</span>
                        {school.createdAt && (
                          <span className="text-xs text-gray-400">
                            Est. {new Date(school.createdAt.seconds * 1000).getFullYear()}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors flex-shrink-0" />
                  </button>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">
                    {searchQuery ? "No schools found matching your search" : "No schools available"}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Credentials Step */
          <div className="animate-fade-slide-up">
            {/* Back Button */}
            <button
              type="button"
              onClick={handleBackToSearch}
              className="flex items-center gap-2 font-bold text-indigo-600 mb-6 transition-colors hover:text-indigo-700"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back to school selection
            </button>

            {/* School Info */}
            {selectedSchool && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 mb-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-indigo-900">{selectedSchool.name}</h3>
                  <p className="text-sm text-indigo-700">School Code: {selectedSchool.code}</p>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-indigo-100 focus:bg-white transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-indigo-100 focus:bg-white transition-all"
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 text-sm font-bold">!</span>
                  </div>
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-200 active:scale-95 transition-all hover:bg-indigo-700"
              >
                Sign In
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
