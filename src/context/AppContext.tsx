"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  onSnapshot, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc, 
  query, 
  where,
  getDocs,
  setDoc,
  arrayUnion,
  Timestamp,
  orderBy,
  limit
} from "firebase/firestore";
import { initializeApp, getApp, getApps } from "firebase/app";
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  getAuth,
  User as FirebaseUser 
} from "firebase/auth";
import { db, auth } from "@/lib/firebase";

// Secondary Auth instance to onboard users without logging out the admin
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const secondaryApp = getApps().length > 1 ? getApp("onboarder") : initializeApp(firebaseConfig, "onboarder");
const onboardAuth = getAuth(secondaryApp);

export type UserRole = "admin" | "teacher" | "parent";

export const STANDARD_GRADES = ["LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];

// --- NEW DATA MODELS ---

export interface School {
  id: string;
  name: string;
  code: string;
  logoUrl?: string;
  themeColor?: string;
  createdAt: Timestamp;
}

export interface UserProfile {
  id: string;
  schoolId: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  classIds?: string[]; // for teachers
  studentIds?: string[]; // for parents
  deviceToken?: string;
  createdAt: Timestamp;
}

export interface Student {
  id: string;
  schoolId: string;
  name: string;
  classId: string;
  parentId: string; // userId
  username?: string;
  password?: string;
}

export interface StudentPersonalDetails {
  id: string;
  studentId: string;
  fatherName: string;
  motherName: string;
  bloodGroup: string;
  dateOfBirth: string;
  parentPhone: string;
  address: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Remark {
  id: string;
  studentId: string;
  teacherId: string;
  teacherName: string;
  message: string;
  type: "academic" | "behavior" | "general";
  createdAt: Timestamp;
}

export interface RemarkReply {
  id: string;
  schoolId: string;
  remarkId: string;
  studentId: string;
  createdById: string;
  createdByName: string;
  createdByRole: UserRole;
  message: string;
  createdAt: Timestamp;
}

export type LeaveApplicationStatus =
  | "pending_teacher"
  | "rejected_by_teacher"
  | "pending_admin"
  | "rejected_by_admin"
  | "approved";

export interface LeaveApplication {
  id: string;
  schoolId: string;
  studentId: string;
  classId: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: LeaveApplicationStatus;

  createdById: string;
  createdByName: string;
  createdByRole: UserRole;
  createdAt: Timestamp;

  teacherId?: string;
  teacherName?: string;
  teacherRemark?: string;
  teacherActionAt?: Timestamp;

  adminId?: string;
  adminName?: string;
  adminRemark?: string;
  adminActionAt?: Timestamp;
}

export interface NotificationItem {
  id: string;
  schoolId: string;
  title: string;
  message: string;
  type: "fee" | "general" | "instruction";
  targetType: "student" | "class";
  targetId: string;
  createdById: string;
  createdByName: string;
  createdByRole: UserRole;
  createdAt: Timestamp;
  isRead?: boolean;
}

export interface ClassRoom {
  id: string;
  schoolId: string;
  name: string; // e.g. "10"
  section: string; // e.g. "A"
}

export interface Announcement {
  id: string;
  schoolId: string;
  title: string;
  message: string;
  createdBy: string;
  createdAt: Timestamp;
}
export interface Circular {
  id: string;
  schoolId: string;
  title: string;
  content: string;
  targetAudience: "teachers" | "parents" | "both";
  imageUrl?: string;
  createdBy: string;
  createdAt: Timestamp;
}

export interface Homework {
  id: string;
  schoolId: string;
  classId: string;
  className: string;
  subject: string;
  task: string;
  dueDate: string;
  priority: "High" | "Medium" | "Low";
  color: string;
  createdBy: string;
  createdAt: Timestamp;
}

export interface HomeworkStatus {
  id: string; // studentId_homeworkId
  status: "Pending" | "Completed";
}

export interface AttendanceRecord {
  id: string;
  schoolId: string;
  classId: string;
  date: string; // YYYY-MM-DD
  records: { studentId: string; status: "present" | "absent" | "late" }[];
  markedBy: string;
}

export interface DiaryEntry {
  id: string;
  schoolId: string;
  subject: string;
  task: string;
  dueDate: string;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "Completed";
  color: string;
}

export interface SkillStat {
  label: string;
  value: number;
  color: string;
  bgColor: string;
}

interface AppContextType {
  isLoggedIn: boolean;
  userRole: UserRole | null;
  user: UserProfile | null;
  school: School | null;
  activeTab: string;
  students: Student[];
  classes: ClassRoom[];
  announcements: Announcement[];
  homework: Homework[];
  homeworkStatus: Record<string, "Pending" | "Completed">;
  attendance: AttendanceRecord[];
  diaryEntries: DiaryEntry[];
  usersList: UserProfile[];
  circulars: Circular[];
  skillStats: SkillStat[];
  studentDetails: StudentPersonalDetails[];
  remarks: Remark[];
  remarkReplies: RemarkReply[];
  leaveApplications: LeaveApplication[];
  notifications: NotificationItem[];
  selectedStudent: Student | null;
  selectedTeacher: UserProfile | null;
  selectedHomework: Homework | null;
  loading: boolean;
  login: (schoolCode: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setActiveTab: (tab: string) => void;
  setSelectedStudent: (student: Student | null) => void;
  setSelectedTeacher: (teacher: UserProfile | null) => void;
  setSelectedHomework: (homework: Homework | null) => void;
  addStudent: (data: { name: string; classId: string; username: string; password?: string }) => Promise<void>;
  addClass: (c: Omit<ClassRoom, "id" | "schoolId">) => Promise<void>;
  sendAnnouncement: (title: string, message: string) => Promise<void>;
  assignHomework: (data: Omit<Homework, "id" | "schoolId" | "createdBy" | "createdAt">) => Promise<void>;
  markAttendance: (classId: string, date: string, records: AttendanceRecord["records"]) => Promise<void>;
  toggleDiaryEntry: (id: string) => Promise<void>;
  updateTeacherClasses: (teacherId: string, classIds: string[]) => Promise<void>;
  onboardUser: (name: string, email: string, role: UserRole, password?: string, classIds?: string[]) => Promise<void>;
  updateStudent: (id: string, data: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  updateClass: (id: string, data: Partial<ClassRoom>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
  updateUserProfile: (id: string, data: Partial<UserProfile>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  sendCircular: (data: Omit<Circular, "id" | "schoolId" | "createdBy" | "createdAt">) => Promise<void>;
  deleteCircular: (id: string) => Promise<void>;
  selectedCircular: Circular | null;
  setSelectedCircular: (c: Circular | null) => void;
  updateStudentPersonalDetails: (studentId: string, data: Omit<StudentPersonalDetails, "id" | "studentId" | "createdAt" | "updatedAt">) => Promise<void>;
  sendRemark: (studentId: string, message: string, type: "academic" | "behavior" | "general") => Promise<void>;
  getStudentRemarks: (studentId: string) => Remark[];
  sendRemarkReply: (remarkId: string, studentId: string, message: string) => Promise<void>;
  getRemarkReplies: (remarkId: string) => RemarkReply[];
  applyLeave: (data: { studentId: string; fromDate: string; toDate: string; reason: string }) => Promise<void>;
  teacherReviewLeave: (leaveId: string, data: { decision: "approve" | "reject"; remark?: string }) => Promise<void>;
  adminReviewLeave: (leaveId: string, data: { decision: "approve" | "reject"; remark?: string }) => Promise<void>;
  sendNotification: (data: {
    title: string;
    message: string;
    type: "fee" | "general" | "instruction";
    targetType: "student" | "class";
    targetId: string;
  }) => Promise<void>;
  markNotificationsAsRead: (notificationIds?: string[]) => Promise<void>;
  showAlert: (title: string, message: string, type?: "success" | "error") => void;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
  modal: { title: string; message: string; type: "success" | "error" | "confirm"; onConfirm?: () => void } | null;
  hideModal: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [loading, setLoading] = useState(true);
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [selectedCircular, setSelectedCircular] = useState<Circular | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [homeworkStatus, setHomeworkStatus] = useState<Record<string, "Pending" | "Completed">>({});
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [studentDetails, setStudentDetails] = useState<StudentPersonalDetails[]>([]);
  const [remarks, setRemarks] = useState<Remark[]>([]);
  const [remarkReplies, setRemarkReplies] = useState<RemarkReply[]>([]);
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<UserProfile | null>(null);

  const skillStats: SkillStat[] = [
    { label: "Concept Clarity", value: 88, color: "text-indigo-600", bgColor: "bg-indigo-50" },
    { label: "Critical Thinking", value: 72, color: "text-violet-600", bgColor: "bg-violet-50" },
    { label: "Consistency", value: 95, color: "text-blue-600", bgColor: "bg-blue-50" },
    { label: "Application", value: 80, color: "text-emerald-600", bgColor: "bg-emerald-50" },
  ];

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      console.log("Auth State Changed:", fbUser?.email);
      if (fbUser) {
        try {
          // Fetch user profile from Firestore
          const userQ = query(collection(db, "users"), where("email", "==", fbUser.email || ""));
          const userDoc = await getDocs(userQ);
          
          if (!userDoc.empty) {
            const userData = { id: userDoc.docs[0].id, ...userDoc.docs[0].data() } as UserProfile;
            console.log("User Data Loaded:", userData.role, "School:", userData.schoolId);
            setUser(userData);
            setUserRole(userData.role);
            
            if (userData.schoolId) {
              // Fetch school data - using the document ID directly if possible, or querying by 'id' field
              const schoolQ = query(collection(db, "schools"), where("id", "==", userData.schoolId));
              const schoolDoc = await getDocs(schoolQ);
              
              if (!schoolDoc.empty) {
                const schoolData = { id: schoolDoc.docs[0].id, ...schoolDoc.docs[0].data() } as School;
                setSchool(schoolData);
                setIsLoggedIn(true);
              } else {
                console.warn("School not found for ID:", userData.schoolId);
              }
            } else {
              console.warn("User has no schoolId:", userData.id);
            }
          } else {
            console.warn("No user profile found for email:", fbUser.email);
            // If no profile, we can't really do much in a multi-tenant app
            setIsLoggedIn(false);
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
        setUserRole(null);
        setSchool(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Data Listeners (Scoped by School)
  useEffect(() => {
    if (!isLoggedIn || !school) return;

    const qOptions = [where("schoolId", "==", school.id)];

    const unsubStudents = onSnapshot(query(collection(db, "students"), ...qOptions), (snap) => {
      setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() } as Student)));
    });

    const unsubClasses = onSnapshot(query(collection(db, "classes"), ...qOptions), (snap) => {
      setClasses(snap.docs.map(d => ({ id: d.id, ...d.data() } as ClassRoom)));
    });

    const unsubAnnouncements = onSnapshot(query(collection(db, "announcements"), ...qOptions), (snap) => {
      setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() } as Announcement)));
    });

    const unsubHomework = onSnapshot(query(collection(db, "homework"), ...qOptions), (snap) => {
      setHomework(snap.docs.map(d => ({ id: d.id, ...d.data() } as Homework)));
    });

    const unsubAttendance = onSnapshot(query(collection(db, "attendance"), ...qOptions), (snap) => {
      setAttendance(snap.docs.map(d => ({ id: d.id, ...d.data() } as AttendanceRecord)));
    });

    // Listen to homework status for this user (if parent/student)
    const unsubStatus = user ? onSnapshot(query(collection(db, "homeworkStatus"), where("userId", "==", user.id)), (snap) => {
      const statusMap: Record<string, "Pending" | "Completed"> = {};
      snap.docs.forEach(d => {
        const data = d.data();
        statusMap[data.homeworkId] = data.status;
      });
      setHomeworkStatus(statusMap);
    }) : () => {};

    // Compute diaryEntries based on homework and status
    const unsubDiary = () => {
      // We'll use a useEffect to update diaryEntries whenever homework or homeworkStatus changes
    };

    // Fetch all users in school for admin/management purposes
    const unsubUsers = onSnapshot(query(collection(db, "users"), ...qOptions), (snap) => {
      setUsersList(snap.docs.map(d => ({ id: d.id, ...d.data() } as UserProfile)));
    });

    const unsubCirculars = onSnapshot(query(collection(db, "circulars"), ...qOptions), (snap) => {
      const sorted = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Circular))
        .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
      setCirculars(sorted);
    });

    const unsubStudentDetails = onSnapshot(query(collection(db, "studentDetails"), ...qOptions), (snap) => {
      setStudentDetails(snap.docs.map(d => ({ id: d.id, ...d.data() } as StudentPersonalDetails)));
    });

    const unsubRemarks = onSnapshot(query(collection(db, "remarks"), ...qOptions), (snap) => {
      const sorted = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Remark))
        .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
      setRemarks(sorted);
    });

    const unsubRemarkReplies = onSnapshot(query(collection(db, "remarkReplies"), ...qOptions), (snap) => {
      const sorted = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as RemarkReply))
        .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
      setRemarkReplies(sorted);
    });

    const unsubLeaveApplications = onSnapshot(query(collection(db, "leaveApplications"), ...qOptions), (snap) => {
      const sorted = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as LeaveApplication))
        .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
      setLeaveApplications(sorted);
    });

    const unsubNotifications = onSnapshot(query(collection(db, "notifications"), ...qOptions), (snap) => {
      const sorted = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as NotificationItem))
        .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
      setNotifications(sorted);
    });

    return () => {
      unsubStudents(); unsubClasses(); unsubAnnouncements(); unsubHomework(); unsubAttendance(); unsubStatus(); unsubUsers(); unsubCirculars(); unsubStudentDetails(); unsubRemarks(); unsubRemarkReplies(); unsubLeaveApplications(); unsubNotifications();
    };
  }, [isLoggedIn, school, user]);

  // Derived diaryEntries logic
  useEffect(() => {
    if (!user) {
      setDiaryEntries([]);
      return;
    }

    let targetClassId = "";
    if (userRole === "parent") {
      const student = students.find(s => s.parentId === user.id);
      targetClassId = student?.classId || "";
    } else if (userRole === "teacher") {
      // Teachers see all homework assigned in their classes
      setDiaryEntries(homework.filter(h => user.classIds?.includes(h.classId)).map(h => ({
        ...h,
        status: "Pending" // Teachers don't have a personal status
      } as DiaryEntry)));
      return;
    }

    if (targetClassId) {
      const entries = homework
        .filter(h => h.classId === targetClassId)
        .map(h => ({
          ...h,
          status: homeworkStatus[h.id] || "Pending"
        } as DiaryEntry));
      setDiaryEntries(entries);
    } else if (homework.length > 0 && userRole === "parent") {
       // Fallback for demo if students list is still loading
       setDiaryEntries(homework.map(h => ({ ...h, status: homeworkStatus[h.id] || "Pending" } as DiaryEntry)));
    }
  }, [homework, homeworkStatus, user, userRole, students]);

  const login = async (schoolCode: string, email: string, password: string): Promise<boolean> => {
    if (!schoolCode || !email) return false;
    try {
      // 1. Verify school code
      const schoolQ = query(collection(db, "schools"), where("code", "==", schoolCode));
      const schoolSnap = await getDocs(schoolQ);
      if (schoolSnap.empty) {
        console.error("Invalid school code");
        return false;
      }

      // 2. Authenticate (Handle username login)
      const finalEmail = email.includes("@") ? email : `${email.toLowerCase()}@${schoolCode.toLowerCase()}.com`;
      await signInWithEmailAndPassword(auth, finalEmail, password);
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

  // --- CRUD FUNCTIONS ---

  const addStudent = async (data: { name: string; classId: string; username: string; password?: string }) => {
    if (!school) return;
    const pass = data.password || "password123";
    
    if (pass.length < 6) {
      showAlert("Weak Password", "Password must be at least 6 characters.", "error");
      throw new Error("Weak password");
    }

    try {
      const email = `${data.username.toLowerCase().replace(/\s/g, "")}@${school.code.toLowerCase()}.com`;

      // 1. Create Parent Auth Account
      const userCred = await createUserWithEmailAndPassword(onboardAuth, email, pass);
      const parentUid = userCred.user.uid;

      // 2. Create Parent Profile
      await setDoc(doc(db, "users", parentUid), {
        schoolId: school.id,
        name: `${data.name}'s Parent`,
        email: email,
        role: "parent",
        studentIds: [], // We'll fill this or just use parentId in student doc
        createdAt: Timestamp.now()
      });

      // 3. Create Student Doc
      await addDoc(collection(db, "students"), {
        schoolId: school.id,
        classId: data.classId,
        name: data.name,
        parentId: parentUid,
        createdAt: Timestamp.now()
      });

      showAlert("Student Added", `Account created for ${data.name}!\n\nUsername: ${data.username}\nPassword: ${pass}`, "success");
    } catch (err: any) {
      console.error(err);
      showAlert("Failed to add student", err.message, "error");
      throw err;
    }
  };

  const addClass = async (c: Omit<ClassRoom, "id" | "schoolId">) => {
    if (!school) return;
    await addDoc(collection(db, "classes"), { ...c, schoolId: school.id });
  };

  const sendAnnouncement = async (title: string, message: string) => {
    if (!school || !user) return;
    await addDoc(collection(db, "announcements"), {
      schoolId: school.id,
      title,
      message,
      createdBy: user.id,
      createdAt: Timestamp.now()
    });
  };

  const assignHomework = async (data: Omit<Homework, "id" | "schoolId" | "createdBy" | "createdAt">) => {
    if (!school || !user) return;
    await addDoc(collection(db, "homework"), {
      ...data,
      schoolId: school.id,
      createdBy: user.id,
      createdAt: Timestamp.now()
    });
  };

  const markAttendance = async (classId: string, date: string, records: AttendanceRecord["records"]) => {
    if (!school || !user) return;
    // Follow the "one doc per class per day" rule
    const q = query(collection(db, "attendance"), where("schoolId", "==", school.id), where("classId", "==", classId), where("date", "==", date));
    const snap = await getDocs(q);
    
    if (snap.empty) {
      await addDoc(collection(db, "attendance"), {
        schoolId: school.id,
        classId,
        date,
        records,
        markedBy: user.id,
        createdAt: Timestamp.now()
      });
    } else {
      await updateDoc(doc(db, "attendance", snap.docs[0].id), { records, markedBy: user.id });
    }
  };

  const toggleDiaryEntry = async (id: string) => {
    if (!user) return;
    const currentStatus = homeworkStatus[id] || "Pending";
    const newStatus = currentStatus === "Completed" ? "Pending" : "Completed";

    // Store status in a document keyed by userId_homeworkId
    const statusId = `${user.id}_${id}`;
    await setDoc(doc(db, "homeworkStatus", statusId), {
      userId: user.id,
      homeworkId: id,
      status: newStatus,
      updatedAt: Timestamp.now()
    });
  };

  const updateTeacherClasses = async (teacherId: string, classIds: string[]) => {
    if (!school) return;
    await updateDoc(doc(db, "users", teacherId), { classIds });
  };

  const onboardUser = async (name: string, email: string, role: UserRole, password?: string, classIds: string[] = []) => {
    if (!school) return;
    const pass = password || "password123";
    
    if (pass.length < 6) {
      showAlert("Weak Password", "Password must be at least 6 characters.", "error");
      throw new Error("Weak password");
    }

    try {
      // 1. Create real Auth account
      const userCred = await createUserWithEmailAndPassword(onboardAuth, email, pass);
      const uid = userCred.user.uid;

      // 2. Create profile in 'users' collection
      await setDoc(doc(db, "users", uid), {
        schoolId: school.id,
        name,
        email,
        role,
        classIds: classIds,
        studentIds: [],
        createdAt: Timestamp.now()
      });
      console.log(`Successfully onboarded ${role}: ${email}`);
    } catch (err) {
      console.error("Onboarding failed:", err);
      throw err;
    }
  };

  const updateStudent = async (id: string, data: Partial<Student>) => {
    await updateDoc(doc(db, "students", id), data);
  };

  const deleteStudent = async (id: string) => {
    await deleteDoc(doc(db, "students", id));
  };

  const updateClass = async (id: string, data: Partial<ClassRoom>) => {
    await updateDoc(doc(db, "classes", id), data);
  };

  const deleteClass = async (id: string) => {
    await deleteDoc(doc(db, "classes", id));
  };

  const updateUserProfile = async (id: string, data: Partial<UserProfile>) => {
    await updateDoc(doc(db, "users", id), data);
  };

  const deleteUser = async (id: string) => {
    await deleteDoc(doc(db, "users", id));
  };

  const sendCircular = async (data: Omit<Circular, "id" | "schoolId" | "createdBy" | "createdAt">) => {
    if (!school || !user) return;
    await addDoc(collection(db, "circulars"), {
      ...data,
      schoolId: school.id,
      createdBy: user.id,
      createdAt: Timestamp.now()
    });
  };

  const deleteCircular = async (id: string) => {
    await deleteDoc(doc(db, "circulars", id));
  };

  const updateStudentPersonalDetails = async (studentId: string, data: Omit<StudentPersonalDetails, "id" | "studentId" | "createdAt" | "updatedAt">) => {
    if (!school) return;
    
    const existingDoc = await getDocs(query(collection(db, "studentDetails"), where("studentId", "==", studentId)));
    
    if (!existingDoc.empty) {
      // Update existing document
      await updateDoc(doc(db, "studentDetails", existingDoc.docs[0].id), {
        ...data,
        updatedAt: Timestamp.now()
      });
    } else {
      // Create new document
      await addDoc(collection(db, "studentDetails"), {
        ...data,
        studentId,
        schoolId: school.id,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    }
  };

  const sendRemark = async (studentId: string, message: string, type: "academic" | "behavior" | "general") => {
    if (!school || !user) return;
    
    await addDoc(collection(db, "remarks"), {
      schoolId: school.id,
      studentId,
      teacherId: user.id,
      teacherName: user.name,
      message,
      type,
      createdAt: Timestamp.now()
    });
  };

  const getStudentRemarks = (studentId: string) => {
    return remarks.filter(r => r.studentId === studentId);
  };

  const sendRemarkReply = async (remarkId: string, studentId: string, message: string) => {
    if (!school || !user) return;
    if (!remarkId || !studentId || !message.trim()) return;

    await addDoc(collection(db, "remarkReplies"), {
      schoolId: school.id,
      remarkId,
      studentId,
      createdById: user.id,
      createdByName: user.name,
      createdByRole: user.role,
      message: message.trim(),
      createdAt: Timestamp.now()
    });
  };

  const getRemarkReplies = (remarkId: string) => {
    return remarkReplies.filter(r => r.remarkId === remarkId);
  };

  const applyLeave = async (data: { studentId: string; fromDate: string; toDate: string; reason: string }) => {
    if (!school || !user) return;
    const student = students.find(s => s.id === data.studentId);
    if (!student) return;
    if (!data.fromDate || !data.toDate || !data.reason.trim()) return;

    await addDoc(collection(db, "leaveApplications"), {
      schoolId: school.id,
      studentId: data.studentId,
      classId: student.classId,
      fromDate: data.fromDate,
      toDate: data.toDate,
      reason: data.reason.trim(),
      status: "pending_teacher" as LeaveApplicationStatus,
      createdById: user.id,
      createdByName: user.name,
      createdByRole: user.role,
      createdAt: Timestamp.now()
    });
  };

  const teacherReviewLeave = async (leaveId: string, data: { decision: "approve" | "reject"; remark?: string }) => {
    if (!school || !user) return;
    if (user.role !== "teacher") return;
    if (!leaveId) return;

    const leave = leaveApplications.find(l => l.id === leaveId);
    if (!leave) return;
    if (leave.status !== "pending_teacher") return;

    const newStatus: LeaveApplicationStatus = data.decision === "approve" ? "pending_admin" : "rejected_by_teacher";

    await updateDoc(doc(db, "leaveApplications", leaveId), {
      status: newStatus,
      teacherId: user.id,
      teacherName: user.name,
      teacherRemark: (data.remark || "").trim(),
      teacherActionAt: Timestamp.now()
    });
  };

  const adminReviewLeave = async (leaveId: string, data: { decision: "approve" | "reject"; remark?: string }) => {
    if (!school || !user) return;
    if (user.role !== "admin") return;
    if (!leaveId) return;

    const leave = leaveApplications.find(l => l.id === leaveId);
    if (!leave) return;
    if (leave.status !== "pending_admin") return;

    const newStatus: LeaveApplicationStatus = data.decision === "approve" ? "approved" : "rejected_by_admin";

    await updateDoc(doc(db, "leaveApplications", leaveId), {
      status: newStatus,
      adminId: user.id,
      adminName: user.name,
      adminRemark: (data.remark || "").trim(),
      adminActionAt: Timestamp.now()
    });
  };

  const sendNotification = async (data: {
    title: string;
    message: string;
    type: "fee" | "general" | "instruction";
    targetType: "student" | "class";
    targetId: string;
  }) => {
    if (!school || !user) return;
    await addDoc(collection(db, "notifications"), {
      ...data,
      schoolId: school.id,
      targetType: data.targetType,
      targetId: data.targetId,
      createdById: user.id,
      createdByName: user.name,
      createdByRole: user.role,
      createdAt: Timestamp.now(),
      isRead: false
    });
  };

  const markNotificationsAsRead = async (notificationIds?: string[]) => {
    if (!school || !user) return;
    
    const currentStudent = students.find(s => s.parentId === user?.id);
    if (!currentStudent) return;
    
    // If no specific IDs provided, mark all notifications for this student as read
    const notificationsToMark = notificationIds 
      ? notifications.filter(n => notificationIds.includes(n.id))
      : notifications.filter(n => 
          (n.targetType === "student" && n.targetId === currentStudent.id) ||
          (n.targetType === "class" && n.targetId === currentStudent.classId)
        );
    
    for (const notification of notificationsToMark) {
      if (!notification.isRead) {
        await updateDoc(doc(db, "notifications", notification.id), {
          isRead: true
        });
      }
    }
  };

  const [modal, setModal] = useState<AppContextType["modal"]>(null);

  const showAlert = (title: string, message: string, type: "success" | "error" = "success") => {
    setModal({ title, message, type });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setModal({ title, message, type: "confirm", onConfirm });
  };

  const hideModal = () => setModal(null);

  return (
    <AppContext.Provider
      value={{
        isLoggedIn, userRole, user, school, activeTab, students, classes, announcements, homework, homeworkStatus, attendance, diaryEntries, usersList, circulars, skillStats, studentDetails, remarks, remarkReplies, leaveApplications, notifications, selectedStudent, selectedTeacher, selectedHomework, loading,
        login, logout, setActiveTab, setSelectedStudent, setSelectedTeacher, setSelectedHomework, addStudent, addClass, sendAnnouncement, assignHomework, markAttendance, toggleDiaryEntry, updateTeacherClasses, onboardUser,
        updateStudent, deleteStudent, updateClass, deleteClass, updateUserProfile, deleteUser,
        sendCircular, deleteCircular,
        selectedCircular, setSelectedCircular,
        updateStudentPersonalDetails, sendRemark, getStudentRemarks, sendRemarkReply, getRemarkReplies, applyLeave, teacherReviewLeave, adminReviewLeave, sendNotification, markNotificationsAsRead,
        showAlert, showConfirm, modal, hideModal
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
