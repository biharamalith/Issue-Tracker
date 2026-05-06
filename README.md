# 🐛 IssueTracker - Mobile Issue Tracker with Offline Persistence

A React Native mobile application for tracking and managing issues with full offline support, built with TypeScript, Expo, and Zustand.

## 📱 Features

### Core Functionality
- ✅ **Authentication**: Email/password validation with mock login and session persistence
- ✅ **Issue Management**: Create, view, edit, and resolve issues
- ✅ **Dashboard**: Real-time status counts (Open, In Progress, Resolved, Closed)
- ✅ **Advanced Filtering**: Search by title/description, filter by status and priority
- ✅ **Offline-First**: Full offline support with local persistence and sync queue
- ✅ **Pull-to-Refresh**: Manual refresh from mock API
- ✅ **Dark Mode**: Complete theme system with light/dark mode toggle

### Bonus Features
- ✅ **Export**: Export issues to JSON or CSV format
- ✅ **State Management**: Zustand for clean, performant state handling
- ✅ **Reusable Components**: Modular UI components (IssueCard, StatusBadge, PriorityBadge)
- ✅ **Tests**: Unit tests for validation, store logic, and sync service
- ✅ **Loading States**: Proper loading, empty, and error state handling
- ✅ **Network Detection**: Real-time online/offline status with NetInfo
- ✅ **Auto-Sync**: Automatic sync when network is restored
- ✅ **Retry Logic**: Manual retry for failed sync operations
- ✅ **Conflict Resolution**: Configurable strategies (local, server, merge)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18 or higher ([Download](https://nodejs.org/))
- **npm** or **yarn**: Comes with Node.js
- **Expo CLI**: Will be installed automatically
- **Mobile Device** or **Emulator**:
  - iOS: Xcode Simulator (macOS only)
  - Android: Android Studio Emulator
  - Physical device: Expo Go app ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Installation

1. **Clone or extract the project**
   ```bash
   cd issuetracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup (Optional Bonus Feature)**
   
   **By default, the app uses a mock API as required by the assignment.**
   
   If you want to test the optional Firebase backend integration:
   
   - Follow the detailed guide in **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)**
   - Takes ~15 minutes to set up
   - Provides real user authentication and database
   
   To enable Firebase:
   ```typescript
   // In src/services/api.ts
   const USE_FIREBASE = true;  // Change from false to true
   ```
   
   **Note:** Firebase is NOT required for the assignment. The mock API fulfills all requirements.

3. **Start the development server**
   ```bash
   npm start
   # or
   npx expo start
   ```

4. **Run on your device**
   - **iOS Simulator**: Press `i` in the terminal
   - **Android Emulator**: Press `a` in the terminal
   - **Physical Device**: Scan the QR code with Expo Go app

---

## 📖 Usage

### Login
- **Demo Credentials**: Any valid email format + password (6+ characters)
- Example: `demo@issuetracker.io` / `demo1234`
- The app uses a mock authentication system

### Creating Issues
1. Tap the **"+ Create New Issue"** button on Dashboard or FAB on Issue List
2. Fill in:
   - **Title** (required, min 5 characters)
   - **Description** (required, min 10 characters)
   - **Priority**: Low, Medium, High, Critical
   - **Status**: Open, In Progress, Resolved, Closed (edit only)
   - **Assignee** (optional)
3. Tap **"Create Issue"** - saved locally immediately

### Viewing & Filtering Issues
- **Search**: Type in the search bar to filter by title/description
- **Status Filter**: Tap status chips (All, Open, In Progress, Resolved, Closed)
- **Priority Filter**: Tap priority chips (All, Low, Medium, High, Critical)
- **Pull to Refresh**: Fetch latest data from mock API

### Editing Issues
1. Tap any issue card to view details
2. Tap **"Edit"** button
3. Modify fields and save

### Resolving/Closing Issues
- From issue detail screen, tap **"Mark as Resolved"** or **"Close Issue"**
- Confirmation dialog will appear

### Offline Behavior
- All create/edit operations work offline
- Issues are saved to local storage immediately
- **Network Status Bar**: Shows online/offline status and pending sync count
- **Auto-Sync**: When network is restored, pending changes automatically sync
- **Manual Sync**: Tap "Sync Now" button to manually trigger sync
- **Retry Failed**: If sync fails, tap "Retry" to attempt again
- On refresh, local changes are merged with API data using conflict resolution

### Exporting Data
- Use `exportToJSON()` or `exportToCSV()` methods in `issueStore`
- (UI export button can be added to dashboard/list screen)

---

## 🏗️ Project Structure

```
issuetracker/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── IssueCard.tsx
│   │   ├── PriorityBadge.tsx
│   │   ├── StatusBadge.tsx
│   │   └── NetworkStatusBar.tsx
│   ├── hooks/               # Custom React hooks
│   │   └── useTheme.tsx
│   ├── navigation/          # Navigation configuration
│   │   └── index.tsx
│   ├── screens/             # Screen components
│   │   ├── LoginScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── IssueListScreen.tsx
│   │   ├── IssueDetailScreen.tsx
│   │   └── CreateEditIssueScreen.tsx
│   ├── services/            # External services
│   │   ├── api.ts           # Mock API (with POST/PUT/DELETE)
│   │   ├── storage.ts       # AsyncStorage wrapper
│   │   └── syncService.ts   # Sync logic with network detection
│   ├── store/               # Zustand state management
│   │   ├── authStore.ts
│   │   └── issueStore.ts
│   ├── theme/               # Theme configuration
│   │   └── index.ts
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   └── formatDate.ts
│   └── __tests__/           # Unit tests
│       ├── issueStore.test.ts
│       ├── validation.test.ts
│       └── syncService.test.ts
├── App.tsx                  # Root component
├── index.ts                 # Entry point
├── package.json
└── tsconfig.json
```

---

## 🧪 Testing

### Run Tests
```bash
npm test
# or
npx jest
```

### Test Coverage
- ✅ Email validation
- ✅ Issue form validation (title, description)
- ✅ Issue store filters (search, status, priority)
- ✅ Dashboard count calculations
- ✅ Sync service (create, update, conflict resolution)
- ✅ Network status handling

### Future Test Additions
- Screen navigation flows
- Offline sync behavior
- Authentication flow
- Create/edit issue integration tests

---

## 🛠️ Technologies Used

| Technology | Purpose |
|------------|---------|
| **React Native** | Cross-platform mobile framework |
| **Expo** | Development toolchain and runtime |
| **TypeScript** | Type-safe JavaScript |
| **React Navigation** | Navigation library (Stack + Bottom Tabs) |
| **Zustand** | Lightweight state management |
| **AsyncStorage** | Local data persistence |
| **NetInfo** | Network connectivity detection |
| **Jest** | Testing framework |

---

## 📋 Assumptions & Design Decisions

### Authentication
- Mock authentication accepts any valid email + password (6+ chars)
- No actual backend validation
- Session persists in AsyncStorage until logout

### API Integration
- Mock API provides 8 seed issues
- 800ms simulated network delay
- No actual HTTP requests (can be replaced with real API)

### Offline Sync
- **Sync Queue**: Tracks IDs of locally-created/edited issues
- **Network Detection**: Uses NetInfo to detect online/offline status
- **Auto-Sync**: Automatically syncs when network is restored (1 second delay for stability)
- **Merge Strategy**: On API fetch, local-only issues are preserved, pending edits take precedence
- **Conflict Resolution**: Three strategies available:
  - `local`: Keep local changes (default)
  - `server`: Use server version
  - `merge`: Use most recent based on `updatedAt` timestamp
- **Retry Logic**: Failed syncs can be manually retried via "Retry" button
- **Real API Calls**: Mock API now supports POST (create) and PUT (update) operations

### Data Persistence
- All issues stored in AsyncStorage as JSON
- Sync queue persisted separately
- Auth token persisted for session restoration

### Theme
- Light and dark modes
- Theme preference saved to AsyncStorage
- Toggle available on login and dashboard screens

---

## ✅ Completion Status

### Completed Features
- ✅ All core functionality (auth, CRUD, dashboard, filters, persistence)
- ✅ Offline-first architecture with sync queue
- ✅ **Network detection with NetInfo**
- ✅ **Auto-sync on network restore**
- ✅ **Manual sync with retry logic**
- ✅ **Conflict resolution strategies**
- ✅ **Real POST/PUT API operations**
- ✅ Dark mode support
- ✅ Reusable component structure
- ✅ Comprehensive unit tests
- ✅ Export to JSON/CSV
- ✅ Loading, empty, and error states
- ✅ Pull-to-refresh
- ✅ Network status bar UI component

### Not Implemented
- ❌ **Image attachments**: No image picker or attachment support
- ❌ **Background sync**: Sync only happens when app is in foreground
- ❌ **Push notifications**: No notification system for issue updates

### Future Enhancements
- Add image attachment support (expo-image-picker)
- Implement background sync (when app is closed)
- Add push notifications for issue updates
- Expand test coverage (screen flows, integration tests)
- Add accessibility labels and screen reader support
- Implement optimistic UI updates
- Add batch sync operations for better performance

---

## 🐛 Known Issues

1. **Background Sync**: Sync only works when app is in foreground (iOS/Android background task limitations)
2. **Large Sync Queues**: No batch processing for large numbers of pending items
3. **Network Flapping**: Rapid online/offline changes may trigger multiple sync attempts

---

## 📄 License

This project is for educational/assignment purposes.

---

## 👤 Author

**Assignment Submission**: React Native Issue Tracker

---

## 📞 Support

For questions or issues, please refer to the project documentation or contact the development team.

---

**Built with ❤️ using React Native + Expo**
#   I s s u e - T r a c k e r  
 