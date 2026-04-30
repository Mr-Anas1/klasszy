"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  onSnapshot, 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where,
  getDocs,
  setDoc,
  arrayUnion,
  Timestamp
} from "firebase/firestore";
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from "firebase/auth";
import { db, auth } from "@/lib/firebase";

export type UserRole = "student" | "teacher" | "admin";

export const STANDARD_GRADES = ["LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];

export interface Student {
  id: string;
  name: string;
  grade: string;
  section: string;
  rollNo: string;
  email: string;
  phone: string;
  avatar: string;
  school: string;
  remarks?: { teacher: string; date: string; content: string; subject: string }[];
}

export interface Teacher {
  id: string;
  empId: string;
  name: string;
  allowedGrades: string[];
  email: string;
  phone: string;
  avatar: string;
  school: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  avatar: string;
  school: string;
}

export interface ClassInfo {
  grade: string;
  sections: string[];
}

interface AppContextType {
  isLoggedIn: boolean;
  userRole: UserRole | null;
  user: Student | Teacher | Admin | null;
  activeTab: string;
  students: Student[];
  teachers: Teacher[];
  grades: ClassInfo[];
  loading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  setActiveTab: (tab: string) => void;
  addStudent: (student: Omit<Student, "id">) => Promise<void>;
  addTeacher: (teacher: Omit<Teacher, "id">) => Promise<void>;
  addClass: (grade: string, section: string) => Promise<void>;
  sendRemark: (studentId: string, remark: string, subject: string) => Promise<void>;
  markAttendance: (grade: string, section: string, status: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [user, setUser] = useState<Student | Teacher | Admin | null>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [loading, setLoading] = useState(true);
  
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [grades, setGrades] = useState<ClassInfo[]>([]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setIsLoggedIn(true);
        // Fetch user profile from Firestore to get role and school
        const userDoc = await getDocs(query(collection(db, "users"), where("email", "==", fbUser.email)));
        if (!userDoc.empty) {
          const userData = userDoc.docs[0].data();
          setUser({ id: userDoc.docs[0].id, ...userData } as any);
          setUserRole(userData.role as UserRole);
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Data Listeners
  useEffect(() => {
    if (!isLoggedIn) return;

    const unsubStudents = onSnapshot(collection(db, "students"), (snapshot) => {
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student)));
    });

    const unsubTeachers = onSnapshot(collection(db, "teachers"), (snapshot) => {
      setTeachers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Teacher)));
    });

    const unsubGrades = onSnapshot(collection(db, "grades"), (snapshot) => {
      // Group sections by grade
      const gradesMap: Record<string, string[]> = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (!gradesMap[data.grade]) gradesMap[data.grade] = [];
        if (data.section) gradesMap[data.grade].push(data.section);
      });
      setGrades(Object.entries(gradesMap).map(([grade, sections]) => ({ grade, sections })));
    });

    return () => {
      unsubStudents();
      unsubTeachers();
      unsubGrades();
    };
  }, [isLoggedIn]);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Role is handled by the auth listener
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setActiveTab("home");
  };

  const addStudent = async (s: Omit<Student, "id">) => {
    await addDoc(collection(db, "students"), {
      ...s,
      createdAt: Timestamp.now()
    });
  };

  const addTeacher = async (t: Omit<Teacher, "id">) => {
    await addDoc(collection(db, "teachers"), {
      ...t,
      createdAt: Timestamp.now()
    });
    // Also create a user record for login
    await addDoc(collection(db, "users"), {
      email: t.email,
      role: "teacher",
      name: t.name,
      school: t.school
    });
  };

  const addClass = async (grade: string, section: string) => {
    // In our model, each grade-section is a doc or we group them. 
    // Let's store each class as a separate doc for simplicity in attendance/etc.
    await addDoc(collection(db, "grades"), {
      grade,
      section,
      createdAt: Timestamp.now()
    });
  };

  const sendRemark = async (studentId: string, content: string, subject: string) => {
    const studentRef = doc(db, "students", studentId);
    const newRemark = {
      teacher: user?.name || "Teacher",
      date: new Date().toLocaleDateString(),
      content,
      subject,
      timestamp: Timestamp.now()
    };
    await updateDoc(studentRef, {
      remarks: arrayUnion(newRemark)
    });
  };

  const markAttendance = async (grade: string, section: string, status: string) => {
    await addDoc(collection(db, "attendance"), {
      grade,
      section,
      status,
      date: new Date().toISOString().split('T')[0],
      markedBy: user?.id,
      timestamp: Timestamp.now()
    });
  };

  return (
    <AppContext.Provider
      value={{
        isLoggedIn, userRole, user, activeTab, students, teachers, grades, loading,
        login, logout, setActiveTab, addStudent, addTeacher, addClass, sendRemark, markAttendance
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
