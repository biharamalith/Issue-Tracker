# 🔥 Firebase Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `issuetracker` (or your choice)
4. Disable Google Analytics (optional for this project)
5. Click **"Create project"**

---

## Step 2: Register the App

1. In Firebase Console, click the **Web icon** (</>) to add a web app
2. Enter app nickname: `IssueTracker App`
3. **Don't** check "Firebase Hosting" (not needed)
4. Click **"Register app"**
5. **Copy the Firebase configuration** (you'll need this in Step 4)

The config looks like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

---

## Step 3: Enable Authentication

1. In Firebase Console, go to **"Build" → "Authentication"**
2. Click **"Get started"**
3. Click **"Sign-in method"** tab
4. Click **"Email/Password"**
5. **Enable** the first toggle (Email/Password)
6. Click **"Save"**

---

## Step 4: Enable Firestore Database

1. In Firebase Console, go to **"Build" → "Firestore Database"**
2. Click **"Create database"**
3. Select **"Start in test mode"** (for development)
4. Choose a location (closest to you)
5. Click **"Enable"**

### Set Firestore Rules (Important!)

1. Go to **"Rules"** tab in Firestore
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /issues/{issueId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click **"Publish"**

---

## Step 5: Configure Your App

1. Open `src/services/firebase.ts` in your project
2. Replace the placeholder config with your Firebase config from Step 2:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",              // Replace with your actual values
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

---


## Toggle Between Mock and Firebase

In `src/services/api.ts`, you can switch between mock and Firebase:

```typescript
// Set to true for Firebase, false for mock API
const USE_FIREBASE = true;
```

---


## What's Implemented

✅ **Real Authentication**
- Email/password login
- User registration
- Session persistence
- Logout functionality

✅ **Real Database**
- Create issues in Firestore
- Read all issues
- Update existing issues
- Delete issues

✅ **Offline Support**
- Local caching with AsyncStorage
- Sync queue for offline changes
- Auto-sync when online

---
