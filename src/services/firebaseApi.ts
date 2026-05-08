import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { Issue } from '../types';
import { prepareAttachmentsForFirebase } from '../utils/imageUtils';

const ISSUES_COLLECTION = 'issues';

// Convert Firebase error codes to user-friendly messages
const getErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    'auth/invalid-credential': 'Invalid email or password. Please try again.',
    'auth/user-not-found': 'No account found with this email. Please sign up first.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'This email is already registered. Please login instead.',
    'auth/weak-password': 'Password should be at least 6 characters long.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your internet connection.',
  };
  
  return errorMessages[errorCode] || 'An error occurred. Please try again.';
};

// Convert Firestore timestamp to ISO string
const timestampToISO = (timestamp: any): string => {
  if (!timestamp) return new Date().toISOString();
  if (timestamp.toDate) return timestamp.toDate().toISOString();
  return new Date(timestamp).toISOString();
};

export const firebaseApi = {
  // Authentication
  login: async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken();
      
      return {
        id: user.uid,
        email: user.email || email,
        name: user.email?.split('@')[0] || 'User',
        token,
      };
    } catch (error: any) {
      console.error('[FirebaseAPI] Login error:', error);
      const friendlyMessage = getErrorMessage(error.code);
      throw new Error(friendlyMessage);
    }
  },

  // Register new user
  register: async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken();
      
      return {
        id: user.uid,
        email: user.email || email,
        name: user.email?.split('@')[0] || 'User',
        token,
      };
    } catch (error: any) {
      console.error('[FirebaseAPI] Register error:', error);
      const friendlyMessage = getErrorMessage(error.code);
      throw new Error(friendlyMessage);
    }
  },

  // Sign out
  logout: async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      console.error('[FirebaseAPI] Logout error:', error);
      throw new Error(error.message || 'Logout failed');
    }
  },

  // Fetch all issues
  fetchIssues: async (): Promise<Issue[]> => {
    try {
      const issuesRef = collection(db, ISSUES_COLLECTION);
      const q = query(issuesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const issues: Issue[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          priority: data.priority,
          status: data.status,
          assignee: data.assignee,
          attachments: data.attachments || [], // Attachments already in base64 format
          createdAt: timestampToISO(data.createdAt),
          updatedAt: timestampToISO(data.updatedAt),
        } as Issue;
      });
      
      console.log('[FirebaseAPI] Fetched issues:', issues.length);
      return issues;
    } catch (error: any) {
      console.error('[FirebaseAPI] Fetch issues error:', error);
      throw new Error(error.message || 'Failed to fetch issues');
    }
  },

  // Create new issue
  createIssue: async (issue: Omit<Issue, 'id'>): Promise<Issue> => {
    try {
      const issuesRef = collection(db, ISSUES_COLLECTION);
      const now = new Date().toISOString();
      
      // Convert image attachments to base64 for Firebase storage
      let plainAttachments: any[] = [];
      
      if (issue.attachments && issue.attachments.length > 0) {
        try {
          const preparedAttachments = await prepareAttachmentsForFirebase(issue.attachments);
          // Convert to plain objects for Firestore
          plainAttachments = preparedAttachments.map(att => ({
            id: String(att.id),
            uri: String(att.uri),
            name: String(att.name),
            type: String(att.type),
            size: Number(att.size || 0),
            addedAt: String(att.addedAt),
          }));
        } catch (error) {
          console.error('[FirebaseAPI] Failed to prepare attachments, saving without images:', error);
          plainAttachments = [];
        }
      }
      
      // Create clean data object with only the fields Firestore needs
      const firestoreData = {
        title: String(issue.title),
        description: String(issue.description),
        priority: String(issue.priority),
        status: String(issue.status),
        assignee: issue.assignee ? String(issue.assignee) : null,
        attachments: plainAttachments,
        createdAt: now,
        updatedAt: now,
      };
      
      const docRef = await addDoc(issuesRef, firestoreData);
      
      const newIssue: Issue = {
        id: docRef.id,
        title: issue.title,
        description: issue.description,
        priority: issue.priority,
        status: issue.status,
        assignee: issue.assignee,
        attachments: issue.attachments,
        createdAt: now,
        updatedAt: now,
      };
      
      console.log('[FirebaseAPI] Created issue:', newIssue.id);
      return newIssue;
    } catch (error: any) {
      console.error('[FirebaseAPI] Create issue error:', error);
      throw new Error(error.message || 'Failed to create issue');
    }
  },

  // Update existing issue
  updateIssue: async (id: string, updates: Partial<Issue>): Promise<Issue> => {
    try {
      const issueRef = doc(db, ISSUES_COLLECTION, id);
      const now = new Date().toISOString();
      
      // Convert image attachments to base64 if present
      let plainAttachments: any[] | undefined = undefined;
      
      if (updates.attachments) {
        try {
          const preparedAttachments = await prepareAttachmentsForFirebase(updates.attachments);
          // Convert to plain objects for Firestore
          plainAttachments = preparedAttachments.map(att => ({
            id: String(att.id),
            uri: String(att.uri),
            name: String(att.name),
            type: String(att.type),
            size: Number(att.size || 0),
            addedAt: String(att.addedAt),
          }));
        } catch (error) {
          console.error('[FirebaseAPI] Failed to prepare attachments, keeping existing:', error);
          plainAttachments = undefined;
        }
      }
      
      // Create clean update data
      const updateData: any = {
        updatedAt: now,
      };
      
      // Only add fields that are being updated
      if (updates.title !== undefined) updateData.title = String(updates.title);
      if (updates.description !== undefined) updateData.description = String(updates.description);
      if (updates.priority !== undefined) updateData.priority = String(updates.priority);
      if (updates.status !== undefined) updateData.status = String(updates.status);
      if (updates.assignee !== undefined) updateData.assignee = updates.assignee ? String(updates.assignee) : null;
      if (plainAttachments !== undefined) updateData.attachments = plainAttachments;
      
      await updateDoc(issueRef, updateData);
      
      // Fetch updated document
      const docSnap = await getDoc(issueRef);
      if (!docSnap.exists()) {
        throw new Error('Issue not found after update');
      }
      
      const data = docSnap.data();
      const updatedIssue: Issue = {
        id: docSnap.id,
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        assignee: data.assignee,
        attachments: data.attachments || [],
        createdAt: timestampToISO(data.createdAt),
        updatedAt: timestampToISO(data.updatedAt),
      };
      
      console.log('[FirebaseAPI] Updated issue:', id);
      return updatedIssue;
    } catch (error: any) {
      console.error('[FirebaseAPI] Update issue error:', error);
      throw new Error(error.message || 'Failed to update issue');
    }
  },

  // Delete issue
  deleteIssue: async (id: string): Promise<void> => {
    try {
      const issueRef = doc(db, ISSUES_COLLECTION, id);
      await deleteDoc(issueRef);
      console.log('[FirebaseAPI] Deleted issue:', id);
    } catch (error: any) {
      console.error('[FirebaseAPI] Delete issue error:', error);
      throw new Error(error.message || 'Failed to delete issue');
    }
  },
};
