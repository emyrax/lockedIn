import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBL5ajB2nuMNxJaHsxKWk0zS2UgXMdtSMA",
  authDomain: "cadet-1.firebaseapp.com",
  projectId: "cadet-1",
  storageBucket: "cadet-1.firebasestorage.app",
  messagingSenderId: "1029091794371",
  appId: "1:1029091794371:web:0eab0f7aa7f5ada6b43176",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
