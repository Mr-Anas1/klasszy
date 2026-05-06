# Fix Super Admin Setup

## The Problem
You're getting "Not authorized as super admin" because the Firestore document setup doesn't match what the code expects.

## Required Structure

### 1. Document ID
- Must be the **exact Firebase Auth UID** of your super admin user
- Copy this from Firebase Console → Authentication → Users → UID

### 2. Document Fields
Your document must have these exact fields:

```javascript
{
  email: "your-email@example.com",
  name: "Super Admin", 
  createdAt: Timestamp // Firestore timestamp
}
```

## Step-by-Step Fix

### Step 1: Get the UID
1. Go to Firebase Console
2. Authentication → Users
3. Find your super admin user
4. Copy the UID (looks like: `abc123xyz789...`)

### Step 2: Update Firestore Document
1. Firestore → Database
2. Go to `superAdmins` collection
3. Find the document with your user's UID as ID
4. Update it to have exactly these fields:
   - `email`: string (your super admin email)
   - `name`: string (display name)
   - `createdAt`: Timestamp (use Firestore timestamp)

### Step 3: Verify Document ID
The document ID in the collection must match the UID exactly:
- ❌ Wrong: Using email as document ID
- ❌ Wrong: Using custom ID
- ✅ Correct: Using Firebase Auth UID as document ID

## Common Mistakes
- Adding extra fields like `role` (not needed)
- Using email instead of UID as document ID
- Missing `createdAt` field
- Using string instead of Timestamp for createdAt

## Test Again
After fixing:
1. Go to `/superadmin/login`
2. Login with your super admin credentials
3. Should work now!
