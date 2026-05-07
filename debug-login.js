// Debug script to test login functionality
// This helps verify the admin login fix

const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');
const { initializeApp } = require('firebase/app');

// Firebase config (same as in your app)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function testAdminLogin() {
  console.log('Testing admin login functionality...\n');
  
  try {
    // Test 1: Check if school exists
    const schoolCode = 'SCH001'; // Replace with your actual school code
    console.log(`1. Checking school code: ${schoolCode}`);
    
    const schoolQ = query(collection(db, "schools"), where("code", "==", schoolCode));
    const schoolSnap = await getDocs(schoolQ);
    
    if (schoolSnap.empty) {
      console.log('❌ School not found');
      return;
    }
    
    const school = schoolSnap.docs[0].data();
    console.log(`✅ School found: ${school.name}`);
    
    // Test 2: Check admin users for this school
    console.log(`\n2. Checking admin users for school: ${school.id}`);
    
    const usersQ = query(collection(db, "users"), where("schoolId", "==", school.id), where("role", "==", "admin"));
    const usersSnap = await getDocs(usersQ);
    
    if (usersSnap.empty) {
      console.log('❌ No admin users found for this school');
      return;
    }
    
    console.log(`✅ Found ${usersSnap.size} admin user(s):`);
    usersSnap.docs.forEach(doc => {
      const user = doc.data();
      console.log(`   - Email: ${user.email}, Name: ${user.name}`);
    });
    
    // Test 3: Try login with admin credentials
    const adminUser = usersSnap.docs[0].data();
    console.log(`\n3. Testing login with admin credentials:`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Password: [the password you set]`);
    
    // Note: You'll need to provide the actual password to test this
    console.log('\n📝 To complete the test:');
    console.log('1. Start your app with npm run dev');
    console.log(`2. Go to login page`);
    console.log(`3. Use school code: ${schoolCode}`);
    console.log(`4. Use email: ${adminUser.email}`);
    console.log(`5. Use the password you created`);
    console.log('\nIf login works, the fix is successful! 🎉');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  }
}

// Run the test
testAdminLogin().then(() => {
  console.log('\nDebug script completed.');
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
