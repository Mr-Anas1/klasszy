"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  onSnapshot,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  query,
  where,
  getDocs,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  getAuth,
} from "firebase/auth";
import { initializeApp, getApps } from "firebase/app";
import { db, auth } from "@/lib/firebase";
import { School, UserProfile, Student, ClassRoom } from "@/context/AppContext";
import { getDefaultFeatures } from "@/lib/feature-registry";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const saCreatorApp =
  getApps().find((a) => a.name === "sa-creator") ??
  initializeApp(firebaseConfig, "sa-creator");
const saCreatorAuth = getAuth(saCreatorApp);

export interface SuperAdminProfile {
  id: string;
  email: string;
  name: string;
  createdAt: Timestamp;
}

export interface SchoolStats {
  schoolId: string;
  studentCount: number;
  teacherCount: number;
  parentCount: number;
  classCount: number;
}

export interface SchoolDetail {
  school: School;
  users: UserProfile[];
  students: Student[];
  classes: ClassRoom[];
}

export interface CreateSchoolData {
  name: string;
  code: string;
  themeColor: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

interface SAAlert {
  title: string;
  message: string;
  type: "success" | "error";
}

interface SuperAdminContextType {
  isLoggedIn: boolean;
  loading: boolean;
  superAdmin: SuperAdminProfile | null;
  schools: School[];
  schoolStats: Record<string, SchoolStats>;
  selectedSchool: School | null;
  setSelectedSchool: (s: School | null) => void;
  schoolDetail: SchoolDetail | null;
  loadSchoolDetail: (school: School) => Promise<void>;
  loadSchoolStats: (schoolId: string) => Promise<void>;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  createSchool: (data: CreateSchoolData) => Promise<void>;
  updateSchool: (id: string, data: { name: string; themeColor: string }) => Promise<void>;
  deleteSchool: (id: string) => Promise<void>;
  updateSchoolFeatures: (schoolId: string, features: Record<string, boolean>) => Promise<void>;
  createSchoolAdmin: (schoolId: string, data: { name: string; email: string; phone: string; password: string }) => Promise<void>;
  alert: SAAlert | null;
  showAlert: (title: string, message: string, type?: "success" | "error") => void;
  hideAlert: () => void;
}

const SuperAdminContext = createContext<SuperAdminContextType | null>(null);

export function SuperAdminProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [superAdmin, setSuperAdmin] = useState<SuperAdminProfile | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolStats, setSchoolStats] = useState<Record<string, SchoolStats>>({});
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [schoolDetail, setSchoolDetail] = useState<SchoolDetail | null>(null);
  const [alert, setAlert] = useState<SAAlert | null>(null);
  const alertTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const showAlert = (title: string, message: string, type: "success" | "error" = "success") => {
    if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    setAlert({ title, message, type });
    alertTimerRef.current = setTimeout(() => setAlert(null), 4000);
  };
  const hideAlert = () => setAlert(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const saSnap = await getDoc(doc(db, "superAdmins", fbUser.uid));
        if (saSnap.exists()) {
          setSuperAdmin({ id: saSnap.id, ...saSnap.data() } as SuperAdminProfile);
          setIsLoggedIn(true);
        } else {
          setSuperAdmin(null);
          setIsLoggedIn(false);
        }
      } else {
        setSuperAdmin(null);
        setIsLoggedIn(false);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    const unsub = onSnapshot(collection(db, "schools"), (snap) => {
      setSchools(
        snap.docs.map((d) => {
          const data = d.data();
          return { ...data, id: data.id ?? d.id } as School;
        })
      );
    });
    return () => unsub();
  }, [isLoggedIn]);

  const login = async (email: string, password: string) => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const saSnap = await getDoc(doc(db, "superAdmins", credential.user.uid));
      if (!saSnap.exists()) {
        await signOut(auth);
        return { ok: false, error: "Not authorized as super admin." };
      }
      return { ok: true };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Login failed";
      const friendly =
        msg.includes("invalid-credential") || msg.includes("wrong-password")
          ? "Invalid email or password."
          : msg.includes("too-many-requests")
          ? "Too many attempts. Try again later."
          : "Login failed. Please try again.";
      return { ok: false, error: friendly };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setSuperAdmin(null);
    setIsLoggedIn(false);
    setSchools([]);
    setSchoolStats({});
    setSelectedSchool(null);
    setSchoolDetail(null);
  };

  const createSchool = async (data: CreateSchoolData) => {
    const credential = await createUserWithEmailAndPassword(
      saCreatorAuth,
      data.adminEmail,
      data.adminPassword
    );

    const schoolId = `school_${Date.now()}`;
    await setDoc(doc(db, "schools", schoolId), {
      id: schoolId,
      name: data.name,
      code: data.code.toUpperCase(),
      themeColor: data.themeColor,
      features: getDefaultFeatures(),
      createdAt: Timestamp.now(),
    });

    await setDoc(doc(db, "users", credential.user.uid), {
      id: credential.user.uid,
      schoolId,
      name: data.adminName,
      email: data.adminEmail,
      phone: "",
      role: "admin",
      createdAt: Timestamp.now(),
    });

    await signOut(saCreatorAuth);
  };

  const updateSchool = async (id: string, data: { name: string; themeColor: string }) => {
    await updateDoc(doc(db, "schools", id), data);
    if (selectedSchool?.id === id) {
      setSelectedSchool((prev) => (prev ? { ...prev, ...data } : null));
    }
  };

  const deleteSchool = async (id: string) => {
    await deleteDoc(doc(db, "schools", id));
    if (selectedSchool?.id === id) {
      setSelectedSchool(null);
      setSchoolDetail(null);
    }
  };

  const updateSchoolFeatures = async (schoolId: string, features: Record<string, boolean>) => {
    await updateDoc(doc(db, "schools", schoolId), { features });
    // Update local selected school state
    if (selectedSchool?.id === schoolId) {
      setSelectedSchool((prev) => (prev ? { ...prev, features } : null));
    }
  };

  const loadSchoolStats = async (schoolId: string) => {
    const [usersSnap, studentsSnap, classesSnap] = await Promise.all([
      getDocs(query(collection(db, "users"), where("schoolId", "==", schoolId))),
      getDocs(query(collection(db, "students"), where("schoolId", "==", schoolId))),
      getDocs(query(collection(db, "classes"), where("schoolId", "==", schoolId))),
    ]);
    setSchoolStats((prev) => ({
      ...prev,
      [schoolId]: {
        schoolId,
        studentCount: studentsSnap.size,
        teacherCount: usersSnap.docs.filter((d) => d.data().role === "teacher").length,
        parentCount: usersSnap.docs.filter((d) => d.data().role === "parent").length,
        classCount: classesSnap.size,
      },
    }));
  };

  const loadSchoolDetail = async (school: School) => {
    const [usersSnap, studentsSnap, classesSnap] = await Promise.all([
      getDocs(query(collection(db, "users"), where("schoolId", "==", school.id))),
      getDocs(query(collection(db, "students"), where("schoolId", "==", school.id))),
      getDocs(query(collection(db, "classes"), where("schoolId", "==", school.id))),
    ]);
    setSchoolDetail({
      school,
      users: usersSnap.docs.map((d) => ({ id: d.id, ...d.data() } as UserProfile)),
      students: studentsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Student)),
      classes: classesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as ClassRoom)),
    });
  };

  const createSchoolAdmin = async (schoolId: string, data: { name: string; email: string; phone: string; password: string }) => {
    // Create Firebase Auth user
    const userCred = await createUserWithEmailAndPassword(saCreatorAuth, data.email, data.password);
    const uid = userCred.user.uid;

    // Create user profile in Firestore
    await setDoc(doc(db, "users", uid), {
      id: uid,
      schoolId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: "admin",
      classIds: [],
      studentIds: [],
      createdAt: Timestamp.now()
    });

    // Sign out from creator auth instance
    await signOut(saCreatorAuth);
  };

  return (
    <SuperAdminContext.Provider
      value={{
        isLoggedIn,
        loading,
        superAdmin,
        schools,
        schoolStats,
        selectedSchool,
        setSelectedSchool,
        schoolDetail,
        loadSchoolDetail,
        loadSchoolStats,
        login,
        logout,
        createSchool,
        updateSchool,
        deleteSchool,
        updateSchoolFeatures,
        createSchoolAdmin,
        alert,
        showAlert,
        hideAlert,
      }}
    >
      {children}
    </SuperAdminContext.Provider>
  );
}

export function useSuperAdmin() {
  const ctx = useContext(SuperAdminContext);
  if (!ctx) throw new Error("useSuperAdmin must be used within SuperAdminProvider");
  return ctx;
}
