/**
 * Seed Firebase with initial issues
 * Run this once after Firebase setup to populate test data
 */

import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Issue } from '../types';

const SEED_ISSUES = [
  {
    title: 'Login page crashes on invalid email format',
    description: 'When user enters an email without the @ symbol and submits, the app crashes instead of showing a validation error.',
    priority: 'critical',
    status: 'open',
    assignee: 'Bihara D.',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    title: 'Dashboard counts not updating in real time',
    description: 'After resolving an issue, the status count on the dashboard still shows the old numbers until you refresh manually.',
    priority: 'high',
    status: 'in_progress',
    assignee: 'Maleesha P.',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    title: 'Search filter does not reset on navigate back',
    description: 'If the user applies a filter and navigates to a detail screen, returning to the list clears the filters unexpectedly.',
    priority: 'medium',
    status: 'open',
    assignee: 'Kavindi R.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    title: 'Add pagination to issue list endpoint',
    description: 'The API currently returns all issues at once. We need to implement cursor-based pagination to improve performance at scale.',
    priority: 'medium',
    status: 'open',
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  {
    title: 'Dark mode text contrast fails WCAG AA',
    description: 'Several text elements in dark mode do not meet the minimum contrast ratio for accessibility. Audit and fix all affected components.',
    priority: 'low',
    status: 'resolved',
    assignee: 'Bihara D.',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    title: 'Memory leak in image picker component',
    description: 'After repeated use of the image picker, memory usage climbs without being released. Likely an unsubscribed listener.',
    priority: 'high',
    status: 'in_progress',
    assignee: 'Maleesha P.',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    title: 'Implement CSV export for issue reports',
    description: 'Product wants users to be able to export their issue list to CSV for weekly reporting. Needs to include all fields.',
    priority: 'low',
    status: 'open',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    title: 'Offline sync queue drops items on app kill',
    description: 'If the app is force-killed while there are pending sync items in the queue, those items are lost on next launch.',
    priority: 'critical',
    status: 'closed',
    assignee: 'Kavindi R.',
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

export const seedFirebase = async () => {
  try {
    console.log('🌱 Seeding Firebase with initial issues...');
    const issuesRef = collection(db, 'issues');
    
    for (const issue of SEED_ISSUES) {
      await addDoc(issuesRef, issue);
      console.log(`✅ Added: ${issue.title}`);
    }
    
    console.log('🎉 Firebase seeding complete!');
    return { success: true, count: SEED_ISSUES.length };
  } catch (error: any) {
    console.error('❌ Firebase seeding failed:', error);
    return { success: false, error: error.message };
  }
};

// Uncomment to run seed function (call this from a screen or component once)
// seedFirebase();
