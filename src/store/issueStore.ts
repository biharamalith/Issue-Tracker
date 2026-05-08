import { create } from 'zustand';
import { Issue, Priority, Status, FilterOptions, DashboardCounts } from '../types';
import { api } from '../services/api';
import { storage } from '../services/storage';
import { syncService, SyncResult } from '../services/syncService';
import uuid from 'react-native-uuid';

interface IssueState {
  issues: Issue[];
  syncQueue: string[];         // IDs of locally-created/edited items pending sync
  isLoading: boolean;
  isSyncing: boolean;
  isOnline: boolean;
  error: string | null;
  syncError: string | null;
  filters: FilterOptions;
  lastSynced: string | null;
  lastSyncResult: SyncResult | null;

  // Actions
  loadFromStorage: () => Promise<void>;
  fetchFromApi: () => Promise<void>;
  syncPendingIssues: () => Promise<SyncResult>;
  retrySyncFailed: () => Promise<SyncResult>;
  createIssue: (data: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'isLocalOnly' | 'pendingSync'>) => Promise<Issue>;
  updateIssue: (id: string, data: Partial<Issue>) => Promise<void>;
  markInProgress: (id: string) => Promise<void>;
  resolveIssue: (id: string) => Promise<void>;
  closeIssue: (id: string) => Promise<void>;
  deleteIssue: (id: string) => Promise<void>;
  setFilters: (filters: Partial<FilterOptions>) => void;
  clearFilters: () => void;
  getFilteredIssues: () => Issue[];
  getDashboardCounts: () => DashboardCounts;
  getIssueById: (id: string) => Issue | undefined;
  exportToJSON: () => string;
  exportToCSV: () => string;
  setOnlineStatus: (isOnline: boolean) => void;
  initNetworkListener: () => void;
}

const DEFAULT_FILTERS: FilterOptions = {
  search: '',
  status: 'all',
  priority: 'all',
};

const persist = async (issues: Issue[], syncQueue: string[]) => {
  await storage.setIssues(issues);
  await storage.setSyncQueue(syncQueue);
};

export const useIssueStore = create<IssueState>((set, get) => ({
  issues: [],
  syncQueue: [],
  isLoading: false,
  isSyncing: false,
  isOnline: true,
  error: null,
  syncError: null,
  filters: DEFAULT_FILTERS,
  lastSynced: null,
  lastSyncResult: null,

  loadFromStorage: async () => {
    const [issues, queue, lastSynced] = await Promise.all([
      storage.getIssues(),
      storage.getSyncQueue(),
      storage.getLastSynced(),
    ]);
    set({ issues, syncQueue: queue, lastSynced });
  },

  fetchFromApi: async () => {
    set({ isLoading: true, error: null });
    try {
      const apiIssues = await api.fetchIssues();
      const { issues: localIssues, syncQueue } = get();

      // Merge: keep local-only issues (offline created), update rest from API
      const localOnlyIds = new Set(localIssues.filter(i => i.isLocalOnly).map(i => i.id));
      const localOnly = localIssues.filter(i => localOnlyIds.has(i.id));

      // For issues in syncQueue (edited offline), prefer local version
      const pendingIds = new Set(syncQueue);
      const merged = apiIssues.map(apiIssue => {
        if (pendingIds.has(apiIssue.id)) {
          return localIssues.find(l => l.id === apiIssue.id) ?? apiIssue;
        }
        return apiIssue;
      });

      const finalIssues = [...merged, ...localOnly];
      await storage.setLastSynced();
      const lastSynced = new Date().toISOString();
      await storage.setIssues(finalIssues);

      set({ issues: finalIssues, isLoading: false, lastSynced });

      // Auto-sync pending items after successful fetch
      if (syncQueue.length > 0) {
        console.log('[IssueStore] Auto-syncing pending items after fetch');
        get().syncPendingIssues();
      }
    } catch (err: any) {
      set({ error: err.message ?? 'Failed to fetch issues', isLoading: false });
    }
  },

  syncPendingIssues: async () => {
    const { issues, syncQueue, isOnline } = get();

    if (!isOnline) {
      const result: SyncResult = {
        success: false,
        syncedCount: 0,
        failedCount: syncQueue.length,
        errors: [{ issueId: 'system', error: 'Device is offline' }],
      };
      set({ syncError: 'Cannot sync while offline', lastSyncResult: result });
      return result;
    }

    if (syncQueue.length === 0) {
      const result: SyncResult = {
        success: true,
        syncedCount: 0,
        failedCount: 0,
        errors: [],
      };
      set({ lastSyncResult: result });
      return result;
    }

    set({ isSyncing: true, syncError: null });

    try {
      const result = await syncService.syncPendingIssues(issues, syncQueue);

      if (result.success) {
        // Remove successfully synced items from queue
        const failedIds = result.errors.map(e => e.issueId);
        const newQueue = syncQueue.filter(id => failedIds.includes(id));

        // Update issues to remove pendingSync flag for successful syncs
        const updatedIssues = issues.map(issue => {
          if (syncQueue.includes(issue.id) && !failedIds.includes(issue.id)) {
            return { ...issue, pendingSync: false, isLocalOnly: false };
          }
          return issue;
        });

        await persist(updatedIssues, newQueue);
        await storage.setLastSynced();

        set({
          issues: updatedIssues,
          syncQueue: newQueue,
          isSyncing: false,
          lastSynced: new Date().toISOString(),
          lastSyncResult: result,
          syncError: null,
        });
      } else {
        // Partial or complete failure
        const errorMsg =
          result.failedCount === syncQueue.length
            ? 'All sync attempts failed'
            : `${result.failedCount} items failed to sync`;

        set({
          isSyncing: false,
          syncError: errorMsg,
          lastSyncResult: result,
        });
      }

      return result;
    } catch (err: any) {
      const result: SyncResult = {
        success: false,
        syncedCount: 0,
        failedCount: syncQueue.length,
        errors: [{ issueId: 'system', error: err.message || 'Sync failed' }],
      };

      set({
        isSyncing: false,
        syncError: err.message ?? 'Sync failed',
        lastSyncResult: result,
      });

      return result;
    }
  },

  retrySyncFailed: async () => {
    const { issues, lastSyncResult } = get();

    if (!lastSyncResult || lastSyncResult.errors.length === 0) {
      return {
        success: true,
        syncedCount: 0,
        failedCount: 0,
        errors: [],
      };
    }

    const failedIds = lastSyncResult.errors
      .map(e => e.issueId)
      .filter(id => id !== 'system');

    console.log(`[IssueStore] Retrying ${failedIds.length} failed items`);
    return syncService.retryFailedSync(issues, failedIds);
  },

  createIssue: async (data) => {
    const now = new Date().toISOString();
    const newIssue: Issue = {
      ...data,
      id: `local-${uuid.v4()}`,
      createdAt: now,
      updatedAt: now,
      isLocalOnly: true,
      pendingSync: true,
    };

    const { issues, syncQueue } = get();
    const updatedIssues = [newIssue, ...issues];
    const updatedQueue = [...syncQueue, newIssue.id];

    set({ issues: updatedIssues, syncQueue: updatedQueue });
    await persist(updatedIssues, updatedQueue);
    return newIssue;
  },

  updateIssue: async (id, data) => {
    const { issues, syncQueue } = get();
    const updatedIssues = issues.map(issue =>
      issue.id === id
        ? { ...issue, ...data, updatedAt: new Date().toISOString(), pendingSync: true }
        : issue,
    );
    const updatedQueue = syncQueue.includes(id) ? syncQueue : [...syncQueue, id];

    set({ issues: updatedIssues, syncQueue: updatedQueue });
    await persist(updatedIssues, updatedQueue);
  },

  markInProgress: async (id) => {
    await get().updateIssue(id, { status: 'in_progress' });
  },

  resolveIssue: async (id) => {
    await get().updateIssue(id, { status: 'resolved' });
  },

  closeIssue: async (id) => {
    await get().updateIssue(id, { status: 'closed' });
  },

  deleteIssue: async (id) => {
    const { issues, syncQueue } = get();
    const updatedIssues = issues.filter(i => i.id !== id);
    const updatedQueue = syncQueue.filter(qId => qId !== id);
    set({ issues: updatedIssues, syncQueue: updatedQueue });
    await persist(updatedIssues, updatedQueue);
  },

  setFilters: (filters) => {
    set(state => ({ filters: { ...state.filters, ...filters } }));
  },

  clearFilters: () => set({ filters: DEFAULT_FILTERS }),

  getFilteredIssues: () => {
    const { issues, filters } = get();
    return issues.filter(issue => {
      const matchesSearch =
        !filters.search ||
        issue.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        issue.description.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus = filters.status === 'all' || issue.status === filters.status;
      const matchesPriority = filters.priority === 'all' || issue.priority === filters.priority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  },

  getDashboardCounts: (): DashboardCounts => {
    const { issues } = get();
    return {
      open: issues.filter(i => i.status === 'open').length,
      in_progress: issues.filter(i => i.status === 'in_progress').length,
      resolved: issues.filter(i => i.status === 'resolved').length,
      closed: issues.filter(i => i.status === 'closed').length,
      total: issues.length,
    };
  },

  getIssueById: (id) => get().issues.find(i => i.id === id),

  exportToJSON: () => {
    return JSON.stringify(get().issues, null, 2);
  },

  exportToCSV: () => {
    const { issues } = get();
    const headers = 'ID,Title,Status,Priority,Assignee,Created,Updated\n';
    const rows = issues.map(i =>
      [
        i.id,
        `"${i.title.replace(/"/g, '""')}"`,
        i.status,
        i.priority,
        i.assignee ?? '',
        i.createdAt,
        i.updatedAt,
      ].join(','),
    );
    return headers + rows.join('\n');
  },

  setOnlineStatus: (isOnline: boolean) => {
    set({ isOnline });
  },

  initNetworkListener: () => {
    // Subscribe to network changes
    syncService.onNetworkChange(isOnline => {
      console.log(`[IssueStore] Network status changed: ${isOnline ? 'online' : 'offline'}`);
      set({ isOnline });

      // Auto-sync when coming online
      if (isOnline) {
        const { syncQueue } = get();
        if (syncQueue.length > 0) {
          console.log('[IssueStore] Network restored, auto-syncing pending items');
          setTimeout(() => {
            get().syncPendingIssues();
          }, 1000); // Small delay to ensure connection is stable
        }
      }
    });

    // Subscribe to sync completion
    syncService.onSyncComplete(result => {
      console.log('[IssueStore] Sync completed:', result);
    });

    // Initialize online status
    syncService.getNetworkStatus().then(isOnline => {
      set({ isOnline });
    });
  },
}));
