// src/__tests__/issueStore.test.ts
// Note: Run with Jest + a mock for AsyncStorage
// jest.mock('@react-native-async-storage/async-storage', () =>
//   require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
// );

import { useIssueStore } from '../store/issueStore';

// Reset store between tests
beforeEach(() => {
  useIssueStore.setState({
    issues: [],
    syncQueue: [],
    isLoading: false,
    error: null,
    filters: { search: '', status: 'all', priority: 'all' },
    lastSynced: null,
    isSyncing: false,
  });
});

describe('IssueStore - filters', () => {
  beforeEach(() => {
    useIssueStore.setState({
      issues: [
        {
          id: '1',
          title: 'Login bug on Android',
          description: 'Crashes on tap',
          priority: 'high',
          status: 'open',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Dashboard loading slow',
          description: 'Takes 5 seconds',
          priority: 'medium',
          status: 'in_progress',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          title: 'Dark mode contrast',
          description: 'Text not readable',
          priority: 'low',
          status: 'resolved',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    });
  });

  it('returns all issues with default filters', () => {
    const filtered = useIssueStore.getState().getFilteredIssues();
    expect(filtered).toHaveLength(3);
  });

  it('filters by status', () => {
    useIssueStore.getState().setFilters({ status: 'open' });
    const filtered = useIssueStore.getState().getFilteredIssues();
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('1');
  });

  it('filters by priority', () => {
    useIssueStore.getState().setFilters({ priority: 'medium' });
    const filtered = useIssueStore.getState().getFilteredIssues();
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('2');
  });

  it('filters by search text (title match)', () => {
    useIssueStore.getState().setFilters({ search: 'login' });
    const filtered = useIssueStore.getState().getFilteredIssues();
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('1');
  });

  it('clears filters correctly', () => {
    useIssueStore.getState().setFilters({ status: 'open', priority: 'high' });
    useIssueStore.getState().clearFilters();
    const { filters } = useIssueStore.getState();
    expect(filters.status).toBe('all');
    expect(filters.priority).toBe('all');
    expect(filters.search).toBe('');
  });
});

describe('IssueStore - dashboard counts', () => {
  it('counts issues by status correctly', () => {
    useIssueStore.setState({
      issues: [
        { id: '1', title: 'A', description: 'B', priority: 'high', status: 'open', createdAt: '', updatedAt: '' },
        { id: '2', title: 'C', description: 'D', priority: 'medium', status: 'open', createdAt: '', updatedAt: '' },
        { id: '3', title: 'E', description: 'F', priority: 'low', status: 'resolved', createdAt: '', updatedAt: '' },
      ],
    } as any);

    const counts = useIssueStore.getState().getDashboardCounts();
    expect(counts.open).toBe(2);
    expect(counts.resolved).toBe(1);
    expect(counts.in_progress).toBe(0);
    expect(counts.total).toBe(3);
  });
});
