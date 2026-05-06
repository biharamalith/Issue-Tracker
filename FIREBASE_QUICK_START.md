# 🔥 Firebase Quick Start (5 Minutes)

## What Changed?

Your app now supports **real Firebase authentication** instead of just mock login!

## Quick Setup

### 1. Create Firebase Project (2 min)
1. Go to https://console.firebase.google.com/
2. Click "Add project" → Name it "issuetracker"
3. Disable Analytics → Create

### 2. Enable Services (2 min)
**Authentication:**
- Build → Authentication → Get Started
- Sign-in method → Email/Password → Enable → Save

**Firestore:**
- Build → Firestore Database → Create database
- Start in test mode → Enable

### 3. Get Config (1 min)
1. Project Overview → Web icon (</>)
2. Register app → Copy the config
3. Paste into `src/services/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_ID",
  appId: "YOUR_APP_ID"
};
```

### 4. Create Test User
- Authentication → Users → Add user
- Email: `test@issuetracker.io`
- Password: `test1234`

### 5. Test It!
```bash
npm start
```
Login with: `test@issuetracker.io` / `test1234`

## Toggle Mock/Firebase

In `src/services/api.ts`:
```typescript
const USE_FIREBASE = true;  // Switch here
```

## What Works Now?

✅ **Real Authentication**
- Users must register/login with Firebase
- Sessions persist across app restarts
- Secure token-based auth

✅ **Real Database**
- Issues saved to Firestore
- Multi-device sync
- Real-time updates

✅ **Offline Support**
- Still works offline
- Syncs when back online
- No data loss

## Troubleshooting

**"Invalid API key"**
→ Check you copied the full config from Firebase Console

**"Permission denied"**
→ Make sure Firestore is in "test mode"

**"User not found"**
→ Create a test user in Firebase Console first

## Full Guide

See **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** for detailed instructions.

---

**That's it!** Your app now has real authentication. 🎉
