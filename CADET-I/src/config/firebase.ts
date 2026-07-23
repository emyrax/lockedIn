import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, browserSessionPersistence, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBL5ajB2nuMNxJaHsxKWk0zS2UgXMdtSMA",
  authDomain: "cadet-1.firebaseapp.com",
  projectId: "cadet-1",
  storageBucket: "cadet-1.firebasestorage.app",
  messagingSenderId: "1029091794371",
  appId: "1:1029091794371:web:0eab0f7aa7f5ada6b43176",
  measurementId: "G-1Q69WT4C4Y"
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
