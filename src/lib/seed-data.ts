import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  Timestamp,
  doc,
  setDoc,
  deleteDoc
} from "firebase/firestore";
import { 
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { db, auth } from "./firebase";

// Helper to clear existing collections (for a fresh start as requested)
async function clearCollections() {
  const collections = ["schools", "users", "students", "classes", "announcements", "homework", "attendance"];
  for (const c of collections) {
    const snap = await getDocs(collection(db, c));
    for (const d of snap.docs) {
      await deleteDoc(doc(db, c, d.id));
    }
  }
}

export async function seedDatabase() {
  try {
    console.log("Clearing old data...");
    await clearCollections();

    console.log("Seeding multi-tenant database...");

    // 1. Create Schools
    const school1Id = "school1";
    await setDoc(doc(db, "schools", school1Id), {
      id: school1Id,
      name: "Sunrise International School",
      code: "SCH001",
      themeColor: "#4F46E5",
      createdAt: Timestamp.now()
    });

    const school2Id = "school2";
    await setDoc(doc(db, "schools", school2Id), {
      id: school2Id,
      name: "Blue Valley Academy",
      code: "SCH002",
      themeColor: "#0891B2",
      createdAt: Timestamp.now()
    });

    const password = "password123";

    // 2. Create Users (Admins, Teachers, Parents)
    const users = [
      { email: "admin@school1.edu", role: "admin", name: "Principal Sarah", schoolId: school1Id },
      { email: "teacher1@school1.edu", role: "teacher", name: "John Smith", schoolId: school1Id },
      { email: "parent1@school1.edu", role: "parent", name: "Robert Sharma", schoolId: school1Id },
      { email: "admin@school2.edu", role: "admin", name: "Director Mike", schoolId: school2Id },
    ];

    for (const u of users) {
      try {
        const fbUser = await createUserWithEmailAndPassword(auth, u.email, password);
        await setDoc(doc(db, "users", fbUser.user.uid), {
          ...u,
          phone: "+91 99999 00000",
          createdAt: Timestamp.now()
        });
      } catch (e: any) {
        if (e.code === 'auth/email-already-in-use') {
          console.log(`${u.email} already exists`);
        }
      }
    }

    // 3. Create Classes
    const class1Id = "class1_s1";
    await setDoc(doc(db, "classes", class1Id), {
      id: class1Id,
      schoolId: school1Id,
      name: "10",
      section: "A"
    });

    // 4. Create Students
    const student1Id = "student1_s1";
    await setDoc(doc(db, "students", student1Id), {
      id: student1Id,
      schoolId: school1Id,
      name: "Aryan Sharma",
      classId: class1Id,
      parentId: "parent1_uid" // Placeholder, in real it would be parent user's uid
    });

    // 5. Create Announcements
    await addDoc(collection(db, "announcements"), {
      schoolId: school1Id,
      title: "Annual Sports Meet",
      message: "The annual sports meet will be held on 20th May.",
      createdBy: "admin1_uid",
      createdAt: Timestamp.now()
    });

    // 6. Create Homework
    await addDoc(collection(db, "homework"), {
      schoolId: school1Id,
      classId: class1Id,
      className: "10-A",
      subject: "Mathematics",
      content: "Complete quadratic equations worksheet.",
      createdBy: "teacher1_uid",
      createdAt: Timestamp.now()
    });

    // 7. Create Attendance (1 doc per class per day)
    await addDoc(collection(db, "attendance"), {
      schoolId: school1Id,
      classId: class1Id,
      date: new Date().toISOString().split('T')[0],
      records: [
        { studentId: student1Id, status: "present" }
      ],
      markedBy: "teacher1_uid",
      createdAt: Timestamp.now()
    });

    console.log("Seeding complete!");
    await signOut(auth);
    return true;
  } catch (error) {
    console.error("Error seeding database:", error);
    return false;
  }
}
