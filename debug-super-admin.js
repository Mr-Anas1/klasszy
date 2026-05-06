// Debug script to check super admin setup
// Run with: node debug-super-admin.js

const { initializeApp } = require("firebase/app");
const { getFirestore, doc, getDoc, collection, getDocs } = require("firebase/firestore");
require("dotenv").config();

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugSuperAdmin() {
  console.log("=== Debugging Super Admin Setup ===\n");
  
  // 1. List all documents in superAdmins collection
  console.log("1. Documents in 'superAdmins' collection:");
  const superAdminsSnapshot = await getDocs(collection(db, "superAdmins"));
  if (superAdminsSnapshot.empty) {
    console.log("   ❌ No documents found in superAdmins collection");
  } else {
    superAdminsSnapshot.forEach((doc) => {
      console.log(`   ✅ Document ID: ${doc.id}`);
      console.log(`   📧 Email: ${doc.data().email}`);
      console.log(`   📝 Data:`, doc.data());
      console.log("");
    });
  }
  
  // 2. Check if you're using the right UID
  console.log("2. To fix the issue:");
  console.log("   a) Get the exact UID from Firebase Authentication");
  console.log("   b) Make sure the Firestore document ID matches this UID exactly");
  console.log("   c) The document should have fields: email, name, createdAt");
  
  console.log("\n=== Common Issues ===");
  console.log("❌ Document ID doesn't match Firebase Auth UID");
  console.log("❌ Missing required fields (email, name, createdAt)");
  console.log("❌ Using wrong Firebase project");
  console.log("❌ Firestore rules blocking access");
}

debugSuperAdmin().catch(console.error);
