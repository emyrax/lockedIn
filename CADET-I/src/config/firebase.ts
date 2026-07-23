import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, browserSessionPersistence, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let app: ReturnType<typeof initializeApp> | null = null;
let analytics: ReturnType<typeof getAnalytics> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;
let storage: ReturnType<typeof getStorage> | null = null;

try {
  app = initializeApp(firebaseConfig);
  analytics = getAnalytics(app);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  setPersistence(auth, browserSessionPersistence).catch(e =>
    console.error("Session persistence setup failed:", e)
  );
} catch (e) {
  console.error("Firebase initialization failed — check VITE_* env vars:", e);
}

export { analytics, auth, db, storage };

export const GOOGLE_SHEETS_API =
  "https://script.google.com/macros/s/AKfycbwiFWaoQwjsvjzm_aIJT-BLgbgvZRLBRbMfRptRHYNeJHW3-PJV_9QaCPWjqeAYGMxg-Q/exec";
export const FORMSPREE_URL = "https://formspree.io/f/xpqbzgoj";

export function generateEmail(serviceNumber: string) {
  return `${serviceNumber.replace(/\//g, "").toLowerCase().trim()}@cadeti.org`;
}
