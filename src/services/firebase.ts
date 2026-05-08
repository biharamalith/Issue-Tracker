import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCZ2XusrqaYEBU_ys7ECnFOTP6D76x08as",
  authDomain: "issuetracker-451f7.firebaseapp.com",
  projectId: "issuetracker-451f7",
  storageBucket: "issuetracker-451f7.firebasestorage.app",
  messagingSenderId: "65904374496",
  appId: "1:65904374496:web:ab1f223867d25696291685"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
// Note: Persistence warning only appears when Firebase is actually used
// For assignment submission (USE_FIREBASE = false), Firebase is not initialized
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
