# Sync Testing Guide

This guide explains how to test the offline sync functionality in the Issue Tracker app.

## 🧪 Testing Scenarios

### 1. Basic Offline Create & Sync

**Steps:**
1. Start the app (should show "online" in network status bar)
2. Turn on Airplane Mode on your device/emulator
3. Network status bar should show "📡 You are offline"
4. Create a new issue:
   - Title: "Test Offline Issue"
   - Description: "Created while offline"
   - Priority: High
   - Tap "Create Issue"
5. Notice the issue is saved locally with a `local-` ID prefix
6. Go to Dashboard - should show "⏳ 1 item pending sync"
7. Turn off Airplane Mode
8. Network status bar should change to "💾 1 item pending sync"
9. Tap "Sync Now" button
10. Watch the sync progress: "⏳ Syncing 1 item..."
11. After sync completes, the banner disappears
12. The issue now has a `server-` ID prefix

**Expected Result:** Issue created offline, synced when online, ID updated from local to server.

---

### 2. Offline Edit & Auto-Sync

**Steps:**
1. Start online, fetch issues (pull to refresh)
2. Open any existing issue
3. Turn on Airplane Mode
4. Tap "Edit Issue"
5. Change the title to "Edited Offline"
6. Save changes
7. Notice "⏳ This issue has unsaved changes pending sync" banner
8. Go to Dashboard - shows pending sync count
9. Turn off Airplane Mode
10. Wait 1-2 seconds
11. Auto-sync should trigger automatically
12. Sync banner disappears

**Expected Result:** Edit saved offline, auto-synced when network restored.

---

### 3. Multiple Offline Operations

**Steps:**
1. Turn on Airplane Mode
2. Create 3 new issues
3. Edit 2 existing issues
4. Dashboard shows "⏳ 5 items pending sync"
5. Turn off Airplane Mode
6. Tap "Sync Now"
7. Watch all 5 items sync

**Expected Result:** All operations queued and synced together.

---

### 4. Sync Failure & Retry

**Steps:**
1. Create an issue offline
2. Turn on Airplane Mode again (before sync completes)
3. Tap "Sync Now"
4. Should show error: "Cannot sync while offline"
5. Turn off Airplane Mode
6. Tap "Retry" button
7. Sync should succeed

**Expected Result:** Failed sync can be retried manually.

---

### 5. Network Flapping (Rapid On/Off)

**Steps:**
1. Create an issue offline
2. Quickly toggle Airplane Mode on/off several times
3. App should handle gracefully without crashing
4. Eventually sync when stable connection

**Expected Result:** No crashes, sync completes when stable.

---

## 🔍 What to Look For

### Network Status Bar States

| Icon | Color | Message | Meaning |
|------|-------|---------|---------|
| 📡 | Red | "You are offline" | No network connection |
| 💾 | Green | "X items pending sync" | Online with pending items |
| ⏳ | Yellow | "Syncing X items..." | Sync in progress |
| ⚠️ | Red | Error message | Sync failed |

### Issue Indicators

- **Local ID**: `local-abc123` = Created offline, not yet synced
- **Server ID**: `server-1234567890-xyz` = Synced to server
- **Pending Sync Banner**: Yellow banner on issue detail screen
- **Sync Queue Count**: Number shown on dashboard and network bar

---

## 🛠️ Developer Testing

### Simulate Network Conditions

**iOS Simulator:**
- Hardware → Network Link Conditioner
- Choose "100% Loss" for offline
- Choose "Wi-Fi" for online

**Android Emulator:**
- Extended Controls (⋮) → Cellular → Data status: Denied
- Or use Airplane Mode

**Physical Device:**
- Use Airplane Mode
- Or disable Wi-Fi/Cellular in settings

### Check Console Logs

Look for these log messages:
```
[SyncService] Network status changed: online/offline
[SyncService] Starting sync for X items
[SyncService] Created issue local-123 on server
[SyncService] Updated issue server-456 on server
[SyncService] Sync complete: X synced, Y failed
[IssueStore] Auto-syncing pending items after fetch
[IssueStore] Network restored, auto-syncing pending items
```

### Inspect AsyncStorage

Use React Native Debugger or Flipper to inspect:
- `@IssueTracker:issues` - All issues
- `@IssueTracker:syncQueue` - Pending IDs
- `@IssueTracker:lastSynced` - Last sync timestamp

---

## 🐛 Common Issues & Solutions

### Issue: Sync doesn't trigger automatically
**Solution:** Check network listener is initialized in App.tsx. Restart app.

### Issue: Sync button doesn't appear
**Solution:** Ensure you're online and have pending items in sync queue.

### Issue: "Sync already in progress" error
**Solution:** Wait for current sync to complete, or restart app.

### Issue: Items stuck in sync queue
**Solution:** Check console for errors. Try manual retry. Check mock API isn't throwing errors.

### Issue: Network status bar doesn't update
**Solution:** NetInfo may not be initialized. Check App.tsx useEffect. Restart app.

---

## ✅ Test Checklist

- [ ] Create issue offline → sync online
- [ ] Edit issue offline → auto-sync on network restore
- [ ] Multiple operations → batch sync
- [ ] Sync failure → manual retry
- [ ] Network status bar shows correct states
- [ ] Pending sync count accurate
- [ ] Issue detail shows pending sync banner
- [ ] Local IDs replaced with server IDs after sync
- [ ] No crashes during network changes
- [ ] Console logs show sync progress
- [ ] AsyncStorage updated correctly
- [ ] Pull-to-refresh triggers sync for pending items

---

## 📊 Performance Expectations

- **Sync Speed**: ~500ms per item (mock API delay)
- **Auto-Sync Delay**: 1 second after network restore
- **Network Detection**: Instant (NetInfo)
- **UI Updates**: Real-time (Zustand reactivity)

---

## 🎯 Success Criteria

✅ All offline operations saved locally
✅ Sync queue tracks all pending items
✅ Network status detected accurately
✅ Auto-sync triggers on network restore
✅ Manual sync works on demand
✅ Failed syncs can be retried
✅ UI shows clear sync status
✅ No data loss during offline/online transitions
✅ App remains responsive during sync
✅ Console logs provide clear debugging info

---
