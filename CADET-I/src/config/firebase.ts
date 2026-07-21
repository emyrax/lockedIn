import { initializeApp } from "firebase/app";
import { getAuth, browserSessionPersistence, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDMIuQlbHvXq518Y7ipnS5iVMs1m2uYME4",
  authDomain: "cadeti-officer-portal.firebaseapp.com",
  projectId: "cadeti-officer-portal",
  storageBucket: "cadeti-officer-portal.firebasestorage.app",
  messagingSenderId: "340417714927",
  appId: "1:340417714927:web:cac5a2cd172c42effa191a",
};

const app = initializeApp(firebaseConfig);
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
