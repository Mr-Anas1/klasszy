# Admin Login Test Guide

## Issues Fixed
1. **Login Function**: Fixed email handling for admin accounts (was constructing wrong email format)
2. **Auth State Listener**: Fixed school lookup to use direct document reference
3. **Added Debugging**: Enhanced logging to track authentication flow

## How to Test

### Step 1: Start the App
```bash
npm run dev
```

### Step 2: Open Browser Console
- Open Developer Tools (F12)
- Go to Console tab
- Clear the console

### Step 3: Attempt Login
1. Go to the login page
2. Enter your **school code** (e.g., SCH001)
3. Enter the **admin email** you created in SuperAdmin
4. Enter the **password** you set for that admin
5. Click "Sign In"

### Step 4: Check Console Messages
You should see these messages in order:
```
Auth State Changed: admin@your-school.com
User Data Loaded: admin School: school_1234567890
Full user data: {id: "...", schoolId: "...", role: "admin", ...}
School data loaded: Your School Name
Login successful! User is now logged in.
```

### Step 5: Verify Dashboard
- The login screen should disappear
- You should see the admin dashboard with sidebar navigation
- The sidebar should show admin options like "Dashboard", "Users", "Students", etc.

## Troubleshooting

### If you see "Auth State Changed" but nothing else:
- **Issue**: User profile not found in Firestore
- **Check**: Was the admin user created properly in SuperAdmin?

### If you see user data but "School not found":
- **Issue**: School ID mismatch
- **Check**: Does the user's `schoolId` match the actual school document ID?

### If you see "No user profile found":
- **Issue**: Email mismatch between Firebase Auth and Firestore
- **Check**: Is the authenticated email the same as the email in the users collection?

### If login succeeds but dashboard doesn't load:
- **Issue**: Component rendering problem
- **Check**: Browser console for React errors

## Expected Behavior
✅ Login button shows loading state  
✅ Authentication succeeds  
✅ User profile is fetched  
✅ School data is loaded  
✅ `isLoggedIn` becomes `true`  
✅ Admin dashboard appears with navigation  

## Debug Commands
If issues persist, check these in the browser console:
```javascript
// Check current auth state
firebase.auth().currentUser

// Check user context (if app is running)
// This will be available through React DevTools
```

The fixes should resolve the login issue and properly load the admin dashboard!
