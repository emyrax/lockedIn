import { createContext, useContext, useEffect, useState, useRef } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import type { OfficerUser } from "../types";

const IDLE_TIMEOUT = 30 * 60 * 1000;
const MAX_SESSION = 2 * 60 * 60 * 1000;

interface AuthContextType {
  user: User | null;
  profile: OfficerUser | null;
  loading: boolean;
  isAdmin: boolean;
  isMediaAdmin: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, profile: null, loading: true, isAdmin: false, isMediaAdmin: false,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<OfficerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMediaAdmin, setIsMediaAdmin] = useState(false);
  const idleRef = useRef<number>();
  const activityRef = useRef<number>();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        sessionStorage.setItem("cadeti_session_started_at", String(Date.now()));
        updateActivity();
        try {
          const snap = await getDoc(doc(db, "users", u.uid));
          if (snap.exists()) {
            const data = snap.data() as OfficerUser;
            setProfile(data);
          }
          const adminSnap = await getDoc(doc(db, "admins", u.uid));
          if (adminSnap.exists()) {
            const adminData = adminSnap.data();
            setIsAdmin(true);
            setIsMediaAdmin(String(adminData.role || adminData.Role || "").toLowerCase().includes("media"));
          } else {
            setIsAdmin(false);
            setIsMediaAdmin(false);
          }
        } catch { /* ignore */ }
      } else {
        setProfile(null);
        setIsAdmin(false);
        setIsMediaAdmin(false);
        sessionStorage.removeItem("cadeti_session_started_at");
        sessionStorage.removeItem("cadeti_session_last_activity_at");
      }
      setLoading(false);
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
    alert(reason === "idle"
      ? "Your session expired due to inactivity. Please sign in again."
      : "Your secure session expired. Please sign in again.");
    window.location.replace("/login");
  }

  useEffect(() => {
    if (user) {
      idleRef.current = window.setInterval(checkSession, 30000);
    }
    return () => { if (idleRef.current) clearInterval(idleRef.current); };
  }, [user]);

  async function logout() {
    sessionStorage.removeItem("cadeti_session_started_at");
    sessionStorage.removeItem("cadeti_session_last_activity_at");
    await signOut(auth);
    window.location.replace("/login");
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, isMediaAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
