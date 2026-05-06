import AsyncStorage from '@react-native-async-storage/async-storage';
import { Issue } from '../types';

const KEYS = {
  ISSUES: '@IssueTracker:issues',
  AUTH: '@IssueTracker:auth',
  SYNC_QUEUE: '@IssueTracker:syncQueue',
  LAST_SYNCED: '@IssueTracker:lastSynced',
  THEME: '@IssueTracker:theme',
};

export const storage = {
  // Issues
  getIssues: async (): Promise<Issue[]> => {
    const raw = await AsyncStorage.getItem(KEYS.ISSUES);
    return raw ? JSON.parse(raw) : [];
  },

  setIssues: async (issues: Issue[]): Promise<void> => {
    await AsyncStorage.setItem(KEYS.ISSUES, JSON.stringify(issues));
  },

  // Sync queue for offline-created/edited issues
  getSyncQueue: async (): Promise<string[]> => {
    const raw = await AsyncStorage.getItem(KEYS.SYNC_QUEUE);
    return raw ? JSON.parse(raw) : [];
  },

  setSyncQueue: async (ids: string[]): Promise<void> => {
    await AsyncStorage.setItem(KEYS.SYNC_QUEUE, JSON.stringify(ids));
  },

  // Last sync timestamp
  getLastSynced: async (): Promise<string | null> => {
    return AsyncStorage.getItem(KEYS.LAST_SYNCED);
  },

  setLastSynced: async (): Promise<void> => {
    await AsyncStorage.setItem(KEYS.LAST_SYNCED, new Date().toISOString());
  },

  // Auth token
  getAuth: async () => {
    const raw = await AsyncStorage.getItem(KEYS.AUTH);
    return raw ? JSON.parse(raw) : null;
  },

  setAuth: async (user: object): Promise<void> => {
    await AsyncStorage.setItem(KEYS.AUTH, JSON.stringify(user));
  },

  clearAuth: async (): Promise<void> => {
    await AsyncStorage.removeItem(KEYS.AUTH);
  },

  clearAll: async (): Promise<void> => {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  },
};
