import NetInfo from '@react-native-community/netinfo';
import { Issue } from '../types';
import { api } from './api';
import { storage } from './storage';

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  errors: Array<{ issueId: string; error: string }>;
}

export interface ConflictResolution {
  strategy: 'local' | 'server' | 'merge';
  issue: Issue;
}

class SyncService {
  private isOnline: boolean = true;
  private isSyncing: boolean = false;
  private syncListeners: Array<(result: SyncResult) => void> = [];
  private networkListeners: Array<(isOnline: boolean) => void> = [];

  constructor() {
    this.initNetworkListener();
  }

  /**
   * Initialize network state listener
   */
  private initNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;

      // Notify listeners
      this.networkListeners.forEach(listener => listener(this.isOnline));

      // Note: Auto-sync is handled by the store's network listener
      // See issueStore.ts for auto-sync implementation
    });
  }

  /**
   * Get current network status
   */
  async getNetworkStatus(): Promise<boolean> {
    const state = await NetInfo.fetch();
    this.isOnline = state.isConnected ?? false;
    return this.isOnline;
  }

  /**
   * Subscribe to network status changes
   */
  onNetworkChange(listener: (isOnline: boolean) => void): () => void {
    this.networkListeners.push(listener);
    return () => {
      this.networkListeners = this.networkListeners.filter(l => l !== listener);
    };
  }

  /**
   * Subscribe to sync completion events
   */
  onSyncComplete(listener: (result: SyncResult) => void): () => void {
    this.syncListeners.push(listener);
    return () => {
      this.syncListeners = this.syncListeners.filter(l => l !== listener);
    };
  }

  /**
   * Check if currently syncing
   */
  getIsSyncing(): boolean {
    return this.isSyncing;
  }

  /**
   * Sync all pending issues to the server
   */
  async syncPendingIssues(
    issues: Issue[],
    syncQueue: string[],
  ): Promise<SyncResult> {
    if (this.isSyncing) {
      console.log('[SyncService] Sync already in progress, skipping');
      return {
        success: false,
        syncedCount: 0,
        failedCount: 0,
        errors: [{ issueId: 'system', error: 'Sync already in progress' }],
      };
    }

    if (!this.isOnline) {
      console.log('[SyncService] Device is offline, skipping sync');
      return {
        success: false,
        syncedCount: 0,
        failedCount: 0,
        errors: [{ issueId: 'system', error: 'Device is offline' }],
      };
    }

    if (syncQueue.length === 0) {
      console.log('[SyncService] No pending items to sync');
      return { success: true, syncedCount: 0, failedCount: 0, errors: [] };
    }

    this.isSyncing = true;
    const result: SyncResult = {
      success: true,
      syncedCount: 0,
      failedCount: 0,
      errors: [],
    };

    console.log(`[SyncService] Starting sync for ${syncQueue.length} items`);

    for (const issueId of syncQueue) {
      const issue = issues.find(i => i.id === issueId);
      if (!issue) {
        console.warn(`[SyncService] Issue ${issueId} not found in local store`);
        continue;
      }

      try {
        if (issue.isLocalOnly) {
          // Create new issue on server
          await this.createIssueOnServer(issue);
          console.log(`[SyncService] Created issue ${issueId} on server`);
        } else {
          // Update existing issue on server
          await this.updateIssueOnServer(issue);
          console.log(`[SyncService] Updated issue ${issueId} on server`);
        }
        result.syncedCount++;
      } catch (error: any) {
        console.error(`[SyncService] Failed to sync issue ${issueId}:`, error);
        result.failedCount++;
        result.errors.push({
          issueId,
          error: error.message || 'Unknown error',
        });
        result.success = false;
      }
    }

    this.isSyncing = false;

    // Notify listeners
    this.syncListeners.forEach(listener => listener(result));

    console.log(
      `[SyncService] Sync complete: ${result.syncedCount} synced, ${result.failedCount} failed`,
    );

    return result;
  }

  /**
   * Create a new issue on the server
   */
  private async createIssueOnServer(issue: Issue): Promise<Issue> {
    // Use the API create method
    return api.createIssue(issue);
  }

  /**
   * Update an existing issue on the server
   */
  private async updateIssueOnServer(issue: Issue): Promise<Issue> {
    // Use the API update method
    return api.updateIssue(issue.id, issue);
  }

  /**
   * Resolve conflicts between local and server versions
   */
  resolveConflict(
    localIssue: Issue,
    serverIssue: Issue,
    strategy: 'local' | 'server' | 'merge' = 'local',
  ): Issue {
    switch (strategy) {
      case 'local':
        // Keep local changes
        return { ...localIssue, pendingSync: false };

      case 'server':
        // Use server version
        return { ...serverIssue, pendingSync: false };

      case 'merge':
        // Merge: use most recent updatedAt for each field
        const localTime = new Date(localIssue.updatedAt).getTime();
        const serverTime = new Date(serverIssue.updatedAt).getTime();

        if (localTime > serverTime) {
          // Local is newer, keep local changes
          return { ...localIssue, pendingSync: false };
        } else {
          // Server is newer, use server version
          return { ...serverIssue, pendingSync: false };
        }

      default:
        return localIssue;
    }
  }

  /**
   * Retry failed sync items
   */
  async retryFailedSync(
    issues: Issue[],
    failedIds: string[],
  ): Promise<SyncResult> {
    console.log(`[SyncService] Retrying sync for ${failedIds.length} failed items`);
    return this.syncPendingIssues(issues, failedIds);
  }

  /**
   * Force sync even if offline (will fail but useful for testing)
   */
  async forceSyncPendingIssues(
    issues: Issue[],
    syncQueue: string[],
  ): Promise<SyncResult> {
    const wasOnline = this.isOnline;
    this.isOnline = true; // Temporarily override
    const result = await this.syncPendingIssues(issues, syncQueue);
    this.isOnline = wasOnline;
    return result;
  }
}

// Export singleton instance
export const syncService = new SyncService();
