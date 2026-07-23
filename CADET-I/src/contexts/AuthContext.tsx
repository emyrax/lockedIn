import { createContext, useContext, useEffect, useState, useRef } from "react";
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import type { User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import type { OfficerUser } from "../types";

const IDLE_TIMEOUT = 30 * 60 * 1000;
const MAX_SESSION = 2 * 60 * 60 * 1000;

interface AuthContextType {
  user: User | null;
  profile: OfficerUser | null;
  loading: boolean;
  profileLoading: boolean;
  isAdmin: boolean;
  isMediaAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, profile: null, loading: true, profileLoading: true, isAdmin: false, isMediaAdmin: false,
  login: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (!auth || !db) {
    return (
      <div className="portal-shell">
        <section className="section-padding" style={{ textAlign: "center", minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div>
            <h1>Configuration Error</h1>
            <p>Firebase is not initialized. The application cannot start.</p>
            <p style={{ fontSize: 13, color: "#888", marginTop: 8 }}>Missing or invalid environment variables. Check Vercel project settings.</p>
          </div>
        </section>
      </div>
    );
  }
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<OfficerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMediaAdmin, setIsMediaAdmin] = useState(false);
  const idleRef = useRef<number>();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        setProfileLoading(true);
        sessionStorage.setItem("cadeti_session_started_at", String(Date.now()));
        updateActivity();
        try {
          const snap = await getDoc(doc(db, "users", u.uid));
          if (snap.exists()) setProfile(snap.data() as OfficerUser);
          const adminRef = doc(db, "admins", u.uid);
          const adminSnap = await getDoc(adminRef);
          if (adminSnap.exists()) {
            const adminData = adminSnap.data();
            setIsAdmin(true);
            setIsMediaAdmin(String(adminData.role || adminData.Role || "").toLowerCase().includes("media"));
          } else {
            if (u.email === "ekwuemesat@gmail.com") {
              setIsAdmin(true);
              setIsMediaAdmin(false);
              setDoc(adminRef, {
                email: "ekwuemesat@gmail.com",
                role: "super-admin",
                createdAt: serverTimestamp(),
              }).catch(err => console.error("Failed to create admin doc:", err));
            } else {
              setIsAdmin(false);
              setIsMediaAdmin(false);
            }
          }
        } catch (err) { console.error("Auth check error:", err); }
        setProfileLoading(false);
      } else {
        setProfile(null);
        setIsAdmin(false);
        setIsMediaAdmin(false);
        setProfileLoading(false);
        sessionStorage.removeItem("cadeti_session_started_at");
        sessionStorage.removeItem("cadeti_session_last_activity_at");
      }
    });
    const events = ["click", "keydown", "mousemove", "scroll", "touchstart"];
    const handler = () => updateActivity();
    events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
    return () => {
      unsub();
      events.forEach((e) => window.removeEventListener(e, handler));
      if (idleRef.current) clearInterval(idleRef.current);
    };
  }, []);

  function updateActivity() {
    sessionStorage.setItem("cadeti_session_last_activity_at", String(Date.now()));
  }

  function checkSession() {
    const startedAt = Number(sessionStorage.getItem("cadeti_session_started_at") || 0);
    const lastActivity = Number(sessionStorage.getItem("cadeti_session_last_activity_at") || 0);
    const now = Date.now();
    if (!startedAt || !lastActivity) return;
    if (now - lastActivity > IDLE_TIMEOUT) {
      forceLogout("idle");
    } else if (now - startedAt > MAX_SESSION) {
      forceLogout("max");
    }
  }

  function forceLogout(reason: string) {
    signOut(auth).catch(() => {});
    console.warn(reason === "idle"
      ? "Session expired due to inactivity."
      : "Max session duration reached.");
    window.location.replace("/login");
  }

  useEffect(() => {
    if (user) {
      idleRef.current = window.setInterval(checkSession, 30000);
    }
    return () => { if (idleRef.current) clearInterval(idleRef.current); };
  }, [user]);

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }

  async function logout() {
    sessionStorage.removeItem("cadeti_session_started_at");
    sessionStorage.removeItem("cadeti_session_last_activity_at");
    await signOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, profileLoading, isAdmin, isMediaAdmin, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
