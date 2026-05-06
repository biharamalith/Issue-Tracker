import { Issue, Priority, Status } from '../types';
import { firebaseApi } from './firebaseApi';

// Toggle between mock and Firebase API
// Set to false for assignment submission (uses mock API as required)
// Set to true to enable Firebase backend (optional bonus feature)
const USE_FIREBASE = false;  // ← Change to true for Firebase

const MOCK_DELAY = 800;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Seeded mock issues from "API"
const SEED_ISSUES: Issue[] = [
  {
    id: 'api-1',
    title: 'Login page crashes on invalid email format',
    description: 'When user enters an email without the @ symbol and submits, the app crashes instead of showing a validation error.',
    priority: 'critical',
    status: 'open',
    assignee: 'Bihara D.',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'api-2',
    title: 'Dashboard counts not updating in real time',
    description: 'After resolving an issue, the status count on the dashboard still shows the old numbers until you refresh manually.',
    priority: 'high',
    status: 'in_progress',
    assignee: 'Maleesha P.',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'api-3',
    title: 'Search filter does not reset on navigate back',
    description: 'If the user applies a filter and navigates to a detail screen, returning to the list clears the filters unexpectedly.',
    priority: 'medium',
    status: 'open',
    assignee: 'Kavindi R.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'api-4',
    title: 'Add pagination to issue list endpoint',
    description: 'The API currently returns all issues at once. We need to implement cursor-based pagination to improve performance at scale.',
    priority: 'medium',
    status: 'open',
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  {
    id: 'api-5',
    title: 'Dark mode text contrast fails WCAG AA',
    description: 'Several text elements in dark mode do not meet the minimum contrast ratio for accessibility. Audit and fix all affected components.',
    priority: 'low',
    status: 'resolved',
    assignee: 'Bihara D.',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'api-6',
    title: 'Memory leak in image picker component',
    description: 'After repeated use of the image picker, memory usage climbs without being released. Likely an unsubscribed listener.',
    priority: 'high',
    status: 'in_progress',
    assignee: 'Maleesha P.',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'api-7',
    title: 'Implement CSV export for issue reports',
    description: 'Product wants users to be able to export their issue list to CSV for weekly reporting. Needs to include all fields.',
    priority: 'low',
    status: 'open',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'api-8',
    title: 'Offline sync queue drops items on app kill',
    description: 'If the app is force-killed while there are pending sync items in the queue, those items are lost on next launch.',
    priority: 'critical',
    status: 'closed',
    assignee: 'Kavindi R.',
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

const mockApi = {
  login: async (email: string, _password: string) => {
    await sleep(MOCK_DELAY);
    // Mock: any email + password works
    if (!email || !_password) throw new Error('Invalid credentials');
    return {
      id: 'user-1',
      email,
      name: email.split('@')[0],
      token: 'mock-jwt-token-' + Date.now(),
    };
  },

  register: async (email: string, _password: string) => {
    await sleep(MOCK_DELAY);
    // Mock: any email + password works for registration
    if (!email || !_password) throw new Error('Invalid credentials');
    return {
      id: 'user-' + Date.now(),
      email,
      name: email.split('@')[0],
      token: 'mock-jwt-token-' + Date.now(),
    };
  },

  fetchIssues: async (): Promise<Issue[]> => {
    await sleep(MOCK_DELAY);
    // Simulate occasional network error (10% chance) — uncomment to test error state
    // if (Math.random() < 0.1) throw new Error('Network Error');
    return [...SEED_ISSUES];
  },

  createIssue: async (issue: Omit<Issue, 'id'>): Promise<Issue> => {
    await sleep(MOCK_DELAY);
    // Simulate server assigning a real ID
    const serverIssue: Issue = {
      ...issue,
      id: `server-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isLocalOnly: false,
      pendingSync: false,
    };
    console.log('[MockAPI] Created issue:', serverIssue.id);
    return serverIssue;
  },

  updateIssue: async (id: string, updates: Partial<Issue>): Promise<Issue> => {
    await sleep(MOCK_DELAY);
    // In real API, this would update the issue on the server
    const updatedIssue: Issue = {
      ...(updates as Issue),
      id,
      updatedAt: new Date().toISOString(),
      pendingSync: false,
    };
    console.log('[MockAPI] Updated issue:', id);
    return updatedIssue;
  },

  deleteIssue: async (id: string): Promise<void> => {
    await sleep(MOCK_DELAY);
    console.log('[MockAPI] Deleted issue:', id);
  },
};

// Export the appropriate API based on configuration
export const api = USE_FIREBASE ? firebaseApi : mockApi;

// Keep mockApi export for backward compatibility
export { mockApi };
