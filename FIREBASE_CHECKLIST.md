# 🔥 Firebase Setup Checklist

Quick checklist to get Firebase running in 15-20 minutes.

---

## ☐ Step 1: Create Firebase Project (3 min)

1. ☐ Go to https://console.firebase.google.com/
2. ☐ Click "Add project"
3. ☐ Name: `issuetracker` (or your choice)
4. ☐ Disable Google Analytics (optional)
5. ☐ Click "Create project"
6. ☐ Wait for project creation
7. ☐ Click "Continue"

---

## ☐ Step 2: Register Web App (2 min)

1. ☐ Click the **Web icon** (</>)
2. ☐ App nickname: `IssueTracker App`
3. ☐ **Don't** check Firebase Hosting
4. ☐ Click "Register app"
5. ☐ **Copy the firebaseConfig object** (you'll need this!)
6. ☐ Click "Continue to console"

---

## ☐ Step 3: Enable Authentication (3 min)

1. ☐ In left sidebar, click "Build" → "Authentication"
2. ☐ Click "Get started"
3. ☐ Click "Sign-in method" tab
4. ☐ Click "Email/Password"
5. ☐ Toggle **Enable** (first switch only)
6. ☐ Click "Save"

---

## ☐ Step 4: Enable Firestore (3 min)

1. ☐ In left sidebar, click "Build" → "Firestore Database"
2. ☐ Click "Create database"
3. ☐ Select **"Start in test mode"**
4. ☐ Choose location (closest to you)
5. ☐ Click "Enable"
6. ☐ Wait for database creation

### Set Firestore Rules

7. ☐ Click "Rules" tab
8. ☐ Replace rules with:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /issues/{issueId} {
      allow read, write: if request.auth != null;
    }
  }
}
```
9. ☐ Click "Publish"

---

## ☐ Step 5: Configure Your App (2 min)

1. ☐ Open `src/services/firebase.ts` in your code editor
2. ☐ Replace the placeholder config with your Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",              // ← Paste your values here
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

3. ☐ Save the file

---

## ☐ Step 6: Enable Firebase in App (1 min)

1. ☐ Open `src/services/api.ts`
2. ☐ Find this line near the top:
```typescript
const USE_FIREBASE = true;
```
3. ☐ Make sure it's set to `true`
4. ☐ Save the file

---

## ☐ Step 7: Create Test User (2 min)

### Option A: In Firebase Console
1. ☐ Go to "Authentication" → "Users" tab
2. ☐ Click "Add user"
3. ☐ Email: `test@issuetracker.io`
4. ☐ Password: `test1234`
5. ☐ Click "Add user"

### Option B: Use App Registration
1. ☐ Start your app
2. ☐ Try logging in with any email
3. ☐ It will fail (user doesn't exist)
4. ☐ Check Firebase Console → Authentication → Users
5. ☐ You can add the user there

---

## ☐ Step 8: Test Your Setup (2 min)

1. ☐ Start your app:
```bash
npm start
```

2. ☐ Try logging in with:
   - Email: `test@issuetracker.io`
   - Password: `test1234`

3. ☐ If successful, you should see the dashboard!

4. ☐ Try creating an issue

5. ☐ Check Firebase Console → Firestore Database → Data
   - ☐ You should see your issue in the `issues` collection

---

## ☐ Step 9: Seed Test Data (Optional, 2 min)

If you want some initial test issues:

1. ☐ In Firebase Console, go to Firestore Database → Data
2. ☐ Click "Start collection"
3. ☐ Collection ID: `issues`
4. ☐ Add documents manually, or
5. ☐ Use the seed function in your app (see `src/utils/seedFirebase.ts`)

---

## ✅ Verification Checklist

After setup, verify everything works:

- ☐ Can log in with Firebase user
- ☐ Can create new issues
- ☐ Issues appear in Firestore Console
- ☐ Can edit existing issues
- ☐ Can delete issues
- ☐ Can log out
- ☐ Session persists after app restart
- ☐ Offline mode still works
- ☐ Auto-sync works when back online

---

## 🆘 Troubleshooting

### Login fails with "invalid-api-key"
☐ Check you copied the full config from Firebase Console
☐ Verify no typos in `firebase.ts`

### "Missing or insufficient permissions"
☐ Make sure Firestore is enabled
☐ Check Firestore rules allow authenticated users
☐ Verify rules are published

### "User not found"
☐ Create a test user in Firebase Console first
☐ Or check the email/password is correct

### App still uses mock API
☐ Check `USE_FIREBASE = true` in `api.ts`
☐ Restart Expo dev server (`npm start`)

### Network request failed
☐ Check internet connection
☐ Verify Firebase project is active
☐ Check Firebase Console for service status

---

## 📚 Need More Help?

- **Quick Guide:** [FIREBASE_QUICK_START.md](./FIREBASE_QUICK_START.md)
- **Complete Guide:** [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
- **Technical Details:** [FIREBASE_IMPLEMENTATION.md](./FIREBASE_IMPLEMENTATION.md)
- **Firebase Docs:** https://firebase.google.com/docs

---

## ⏱️ Time Estimate

- **Minimum:** 15 minutes (if everything goes smoothly)
- **Average:** 20 minutes (with some troubleshooting)
- **Maximum:** 30 minutes (first time, reading docs)

---

## 🎉 Done!

Once all checkboxes are checked, your app is running with Firebase!

**Next:** Build APK or record demo video for assignment submission.

---

**Pro Tip:** Keep the Firebase Console open while testing. You can see data changes in real-time in the Firestore Database tab.
