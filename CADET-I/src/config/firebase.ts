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

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

setPersistence(auth, browserSessionPersistence).catch(e =>
  console.error("Session persistence setup failed:", e)
);

export const GOOGLE_SHEETS_API =
  "https://script.google.com/macros/s/AKfycbwiFWaoQwjsvjzm_aIJT-BLgbgvZRLBRbMfRptRHYNeJHW3-PJV_9QaCPWjqeAYGMxg-Q/exec";
export const FORMSPREE_URL = "https://formspree.io/f/xpqbzgoj";

export function generateEmail(serviceNumber: string) {
  return `${serviceNumber.replace(/\//g, "").toLowerCase().trim()}@cadeti.org`;
}
