// src/__tests__/syncService.test.ts
import { syncService } from '../services/syncService';
import { Issue } from '../types';

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() =>
    Promise.resolve({
      isConnected: true,
      isInternetReachable: true,
    }),
  ),
}));

// Mock API
jest.mock('../services/api', () => ({
  mockApi: {
    createIssue: jest.fn((issue: any) =>
      Promise.resolve({
        ...issue,
        id: `server-${Date.now()}`,
        isLocalOnly: false,
        pendingSync: false,
      }),
    ),
    updateIssue: jest.fn((id: string, issue: any) =>
      Promise.resolve({
        ...issue,
        id,
        pendingSync: false,
      }),
    ),
  },
}));

describe('SyncService', () => {
  const mockLocalIssue: Issue = {
    id: 'local-123',
    title: 'Test Issue',
    description: 'Test description',
    priority: 'high',
    status: 'open',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isLocalOnly: true,
    pendingSync: true,
  };

  const mockServerIssue: Issue = {
    id: 'server-456',
    title: 'Server Issue',
    description: 'Server description',
    priority: 'medium',
    status: 'in_progress',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pendingSync: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should sync pending issues successfully', async () => {
    const issues = [mockLocalIssue, mockServerIssue];
    const syncQueue = ['local-123', 'server-456'];

    const result = await syncService.syncPendingIssues(issues, syncQueue);

    expect(result.success).toBe(true);
    expect(result.syncedCount).toBe(2);
    expect(result.failedCount).toBe(0);
    expect(result.errors).toHaveLength(0);
  });

  it('should handle empty sync queue', async () => {
    const result = await syncService.syncPendingIssues([], []);

    expect(result.success).toBe(true);
    expect(result.syncedCount).toBe(0);
    expect(result.failedCount).toBe(0);
  });

  it('should resolve conflicts using local strategy', () => {
    const localIssue: Issue = {
      ...mockLocalIssue,
      title: 'Local Title',
      updatedAt: new Date().toISOString(),
    };

    const serverIssue: Issue = {
      ...mockLocalIssue,
      title: 'Server Title',
      updatedAt: new Date(Date.now() - 10000).toISOString(),
    };

    const resolved = syncService.resolveConflict(localIssue, serverIssue, 'local');

    expect(resolved.title).toBe('Local Title');
    expect(resolved.pendingSync).toBe(false);
  });

  it('should resolve conflicts using server strategy', () => {
    const localIssue: Issue = {
      ...mockLocalIssue,
      title: 'Local Title',
    };

    const serverIssue: Issue = {
      ...mockLocalIssue,
      title: 'Server Title',
    };

    const resolved = syncService.resolveConflict(localIssue, serverIssue, 'server');

    expect(resolved.title).toBe('Server Title');
    expect(resolved.pendingSync).toBe(false);
  });

  it('should resolve conflicts using merge strategy (local newer)', () => {
    const localIssue: Issue = {
      ...mockLocalIssue,
      title: 'Local Title',
      updatedAt: new Date().toISOString(),
    };

    const serverIssue: Issue = {
      ...mockLocalIssue,
      title: 'Server Title',
      updatedAt: new Date(Date.now() - 10000).toISOString(),
    };

    const resolved = syncService.resolveConflict(localIssue, serverIssue, 'merge');

    expect(resolved.title).toBe('Local Title');
  });

  it('should resolve conflicts using merge strategy (server newer)', () => {
    const localIssue: Issue = {
      ...mockLocalIssue,
      title: 'Local Title',
      updatedAt: new Date(Date.now() - 10000).toISOString(),
    };

    const serverIssue: Issue = {
      ...mockLocalIssue,
      title: 'Server Title',
      updatedAt: new Date().toISOString(),
    };

    const resolved = syncService.resolveConflict(localIssue, serverIssue, 'merge');

    expect(resolved.title).toBe('Server Title');
  });

  it('should notify listeners on sync complete', async () => {
    const listener = jest.fn();
    const unsubscribe = syncService.onSyncComplete(listener);

    const issues = [mockLocalIssue];
    const syncQueue = ['local-123'];

    await syncService.syncPendingIssues(issues, syncQueue);

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        syncedCount: 1,
      }),
    );

    unsubscribe();
  });

  it('should track syncing state', () => {
    expect(syncService.getIsSyncing()).toBe(false);
  });
});
