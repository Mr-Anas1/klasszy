import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  Timestamp
} from "firebase/firestore";
import { 
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { db, auth } from "./firebase";

const MOCK_TEACHERS = [
  { empId: "EMP101", name: "Sarah Jenkins", allowedGrades: ["10th", "7th"], email: "teacher@school.edu", phone: "+91 99887 76655", avatar: "SJ", school: "Sunrise International" },
];

const MOCK_STUDENTS = [
  { name: "Aryan Sharma", grade: "10th", section: "A", rollNo: "24", email: "student@school.edu", phone: "+91 98765 43210", avatar: "AS", school: "Sunrise International", remarks: [] },
  { name: "Ishaan Gupta", grade: "7th", section: "A", rollNo: "12", email: "ishaan2@school.edu", phone: "+91 98765 43211", avatar: "IG", school: "Sunrise International", remarks: [] },
];

const MOCK_GRADES = [
  { grade: "10th", section: "A" },
  { grade: "10th", section: "B" },
  { grade: "7th", section: "A" },
];

export async function seedDatabase() {
  try {
    // 1. Create Admin User
    const adminEmail = "admin@school.edu";
    const password = "password123";

    console.log("Seeding database...");

    // Create Admin in Auth
    try {
      await createUserWithEmailAndPassword(auth, adminEmail, password);
      await addDoc(collection(db, "users"), {
        email: adminEmail,
        role: "admin",
        name: "Principal Sarah",
        school: "Sunrise International",
        createdAt: Timestamp.now()
      });
    } catch (e: any) {
      if (e.code === 'auth/email-already-in-use') {
        console.log("Admin already exists in Auth");
      } else {
        throw e;
      }
    }

    // 2. Create Teachers and their Auth accounts
    // Note: Creating multiple auth accounts from client is tricky because it logs you in.
    // For seeding, we'll just create the Firestore docs and the user should manually create auth accounts or we do it one by one.
    for (const t of MOCK_TEACHERS) {
      const q = query(collection(db, "teachers"), where("email", "==", t.email));
      const snap = await getDocs(q);
      if (snap.empty) {
        await addDoc(collection(db, "teachers"), { ...t, createdAt: Timestamp.now() });
        await addDoc(collection(db, "users"), {
          email: t.email,
          role: "teacher",
          name: t.name,
          school: t.school,
          createdAt: Timestamp.now()
        });
        // Try creating auth account
        try { await createUserWithEmailAndPassword(auth, t.email, password); } catch(e) {}
      }
    }

    // 3. Create Students
    for (const s of MOCK_STUDENTS) {
      const q = query(collection(db, "students"), where("email", "==", s.email));
      const snap = await getDocs(q);
      if (snap.empty) {
        await addDoc(collection(db, "students"), { ...s, createdAt: Timestamp.now() });
        await addDoc(collection(db, "users"), {
          email: s.email,
          role: "student",
          name: s.name,
          school: s.school,
          createdAt: Timestamp.now()
        });
        try { await createUserWithEmailAndPassword(auth, s.email, password); } catch(e) {}
      }
    }

    // 4. Create Grades
    for (const g of MOCK_GRADES) {
      const q = query(collection(db, "grades"), where("grade", "==", g.grade), where("section", "==", g.section));
      const snap = await getDocs(q);
      if (snap.empty) {
        await addDoc(collection(db, "grades"), { ...g, createdAt: Timestamp.now() });
      }
    }

    console.log("Seeding complete!");
    await signOut(auth);
    return true;
  } catch (error) {
    console.error("Error seeding database:", error);
    return false;
  }
}
