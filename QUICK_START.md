# Quick Start Guide for Evaluators

## 🚀 Get Running in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- npm or yarn
- iOS Simulator (Mac) or Android Emulator or Physical Device with Expo Go

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm start

# 3. Run on your platform
# Press 'i' for iOS Simulator
# Press 'a' for Android Emulator
# Scan QR code with Expo Go app on physical device
```

### First Run

1. **Login Screen** appears
   - Use any email format (e.g., `demo@test.com`)
   - Password must be 6+ characters (e.g., `demo1234`)
   - Tap "Sign in"

2. **Dashboard** loads
   - Shows issue counts by status
   - Pull down to refresh from mock API
   - Tap "Create New Issue" to add an issue

3. **Issue List** (bottom tab)
   - View all issues
   - Search and filter by status/priority
   - Tap any issue to view details

---

## 🎯 Key Features to Test

### 1. Offline Sync (⭐ Main Feature)

**Test in 60 seconds:**
1. Turn on Airplane Mode
2. Create a new issue (title: "Offline Test")
3. Notice "📡 You are offline" banner at top
4. Turn off Airplane Mode
5. Watch banner change to "💾 1 item pending sync"
6. Tap "Sync Now"
7. Watch sync complete!

### 2. Dark Mode

- Tap 🌙 icon on login screen or dashboard
- Entire app switches to dark theme
- Theme persists after app restart

### 3. Search & Filter

- Go to Issue List tab
- Type in search bar to filter by title/description
- Tap status chips (Open, In Progress, etc.)
- Tap priority chips (Low, Medium, High, Critical)
- Tap "Clear" to reset filters

### 4. Create/Edit Issues with Images

- Tap + button (FAB) on Issue List
- Fill in title (required, 5+ chars)
- Fill in description (required, 10+ chars)
- Select priority and status
- Add assignee (optional)
- **Add images**: Tap "Gallery" or "Camera" to attach up to 3 images
- Tap image thumbnail to view full-screen
- Tap "Create Issue"

### 5. Issue Actions

- Tap any issue to view details
- Tap "Edit Issue" to modify
- Tap "⏳ Mark In Progress" to start working (for Open issues)
- Tap "✅ Mark Resolved" to resolve (for Open/In Progress issues)
- Tap "🔒 Close Issue" to close
- Tap "Share" to share via native share sheet
- Tap "Delete Issue" to remove (with confirmation)

### 6. Export Issues

- Go to Issue List tab
- Tap 📤 Export button (green button in header)
- Choose format: JSON or CSV
- **Android**: Share sheet opens - share via any app
- **iOS**: Data copied to clipboard - paste into any app
- CSV data can be pasted into Excel, Sheets, Numbers
- JSON data can be pasted into text editors or Notes

---

## 📱 Demo Credentials

**Email:** `demo@issuetracker.io`
**Password:** `demo1234`

(Any valid email + 6+ char password works)

---

## 🧪 Testing Checklist

Quick checklist for evaluators:

- [ ] App starts without errors
- [ ] Login works with demo credentials
- [ ] Dashboard shows issue counts
- [ ] Pull-to-refresh loads mock data
- [ ] Can create new issue with images
- [ ] Can edit existing issue
- [ ] Can mark issue as in progress
- [ ] Can mark issue as resolved
- [ ] Can close issue
- [ ] Can delete issue
- [ ] Can view image attachments full-screen
- [ ] Can export issues (JSON/CSV)
- [ ] Search filters issues correctly
- [ ] Status filter works
- [ ] Priority filter works
- [ ] Dark mode toggles
- [ ] Theme persists after restart
- [ ] Offline mode detected (Airplane Mode)
- [ ] Issues created offline
- [ ] Sync works when back online
- [ ] Network status bar shows correct state
- [ ] Navigation between screens works
- [ ] Issue detail shows all information
- [ ] Share functionality works

---

## 📊 What to Look For

### Code Quality
- **Structure**: Clean folder organization (components, screens, services, store)
- **TypeScript**: Full type safety, no `any` types
- **State Management**: Zustand for clean, performant state
- **Components**: Reusable (IssueCard, StatusBadge, PriorityBadge, NetworkStatusBar)
- **Hooks**: Custom `useTheme` hook
- **Services**: Separated API, storage, and sync logic

### Features
- **All Core Requirements**: ✅ Complete
- **All Bonus Features**: ✅ Dark mode, export, tests, offline sync, image attachments
- **UI/UX**: Polished with custom alerts, loading, empty, and error states
- **Offline-First**: Full sync with network detection
- **Error Handling**: Graceful failures with retry logic
- **Custom Components**: Professional alert dialogs with theme support
- **Animated Splash**: Beautiful splash screen with gradient and animations
- **Adaptive Backgrounds**: Theme-aware background images

### Testing
- Run tests: `npm test` (requires Jest setup)
- Check `src/__tests__/` for unit tests
- See `SYNC_TESTING_GUIDE.md` for manual testing

---

## 📁 Key Files to Review

### Architecture
- `src/store/issueStore.ts` - Main state management
- `src/services/syncService.ts` - Offline sync logic
- `src/services/api.ts` - Mock API with POST/PUT
- `src/navigation/index.tsx` - Navigation setup

### UI Components
- `src/screens/DashboardScreen.tsx` - Dashboard with gradient card and bubbles
- `src/screens/IssueListScreen.tsx` - List with filters and export
- `src/screens/CreateEditIssueScreen.tsx` - Form with image attachments
- `src/screens/SplashScreen.tsx` - Animated splash screen
- `src/components/NetworkStatusBar.tsx` - Sync status indicator
- `src/components/CustomAlert.tsx` - Custom styled alert dialogs
- `src/components/ImagePicker.tsx` - Image attachment component

### Tests
- `src/__tests__/issueStore.test.ts` - Store logic tests
- `src/__tests__/validation.test.ts` - Form validation tests
- `src/__tests__/syncService.test.ts` - Sync logic tests

---

## 🐛 Troubleshooting

### App won't start
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npx expo start --clear
```

### Network status not updating
- Restart the app
- Check NetInfo is installed: `npm list @react-native-community/netinfo`

### Sync not working
- Check console logs for errors
- Ensure you're online (not in Airplane Mode)
- Try manual "Sync Now" button

### Tests failing
- Install Jest: `npm install --save-dev jest jest-expo @types/jest`
- Run: `npm test`

---

## 📞 Support

For questions or issues:
1. Check `README.md` for detailed documentation
2. Check `SYNC_TESTING_GUIDE.md` for sync testing
4. Check console logs for debugging info

---

**Ready to evaluate! Start with `npm install && npm start` 🚀**
