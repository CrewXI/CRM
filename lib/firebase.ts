import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyC-gmfZlMhm1B8QKy4N4jLQSb38H4ug-3M",
  authDomain: "crm-project-8b83e.firebaseapp.com",
  projectId: "crm-project-8b83e",
  storageBucket: "crm-project-8b83e.firebasestorage.app",
  messagingSenderId: "611628571624",
  appId: "1:611628571624:web:40327ea43309a839de625d",
  measurementId: "G-81ZWQ5E25X"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
let analytics;

if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, auth, db, analytics };
