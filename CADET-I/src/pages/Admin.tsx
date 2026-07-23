import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection, query, orderBy, getDocs, getDoc, setDoc, addDoc,
  updateDoc, deleteDoc, doc, Timestamp, where
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../contexts/AuthContext";
import {
  escapeHtml, formatDate, truncate, getGoogleDriveUrl, RANKS, DEPARTMENTS
} from "../utils";
import { QRCodeSVG } from "qrcode.react";

function statusBadgeClass(status: string) {
  const s = String(status).toLowerCase();
  if (s === "active" || s === "completed" || s === "read") return "badge-green";
  if (s === "pending" || s === "unread") return "badge-gold";
  if (s === "cancelled" || s === "inactive" || s === "suspended") return "badge-red";
  return "badge-green";
}

const ADMIN_ROLES = ["super-admin", "manager", "media-admin"];

export default function Admin() {
  const { user, profile, loading: authLoading, profileLoading, isAdmin, login, loginWithGoogle, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("officers");
  const [officers, setOfficers] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: "", description: "", duration: "", badgeUrl: "" });
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [courseMap, setCourseMap] = useState<Record<string, { title: string; badgeUrl?: string }>>({});

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [admins, setAdmins] = useState<any[]>([]);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [addAdminSearch, setAddAdminSearch] = useState("");
  const [adminSearchResults, setAdminSearchResults] = useState<any[]>([]);
  const [selectedAdminUser, setSelectedAdminUser] = useState<any | null>(null);
  const [addAdminRole, setAddAdminRole] = useState("manager");
  const [addAdminLoading, setAddAdminLoading] = useState(false);
  const [addAdminError, setAddAdminError] = useState("");

  const [qrOfficer, setQrOfficer] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [editOfficer, setEditOfficer] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const [showAddOfficer, setShowAddOfficer] = useState(false);
  const [addForm, setAddForm] = useState<Record<string, string>>({});
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState("");

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    document.title = "Admin Panel — CADETI";
  }, []);

  useEffect(() => {
    if (!user || !isAdmin) return;
    if (activeTab === "officers") fetchOfficers();
    else if (activeTab === "enrollments") fetchEnrollments();
    else if (activeTab === "messages") fetchMessages();
    else if (activeTab === "courses") fetchCourses();
    else if (activeTab === "admins") fetchAdmins();
  }, [activeTab, user, isAdmin]);

  async function fetchOfficers() {
    setLoading(true);
    setError(null);
    try {
      const q = collection(db, "users");
      const snap = await getDocs(q);
      const list: any[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setOfficers(list);
    } catch (err: any) {
      setError(err.message || "Failed to load officers");
    } finally {
      setLoading(false);
    }
  }

  async function fetchEnrollments() {
    setLoading(true);
    setError(null);
    try {
      const [enrollSnap, usersSnap, coursesSnap] = await Promise.all([
        getDocs(query(collection(db, "enrollments"), orderBy("createdAt", "desc"))),
        getDocs(collection(db, "users")),
        getDocs(collection(db, "courses"))
      ]);
      const uMap: Record<string, string> = {};
      usersSnap.forEach(d => {
        const data = d.data();
        const name = `${data.firstName || ""} ${data.surname || ""}`.trim();
        if (name) uMap[d.id] = name;
      });
      setUserMap(uMap);
      const cMap: Record<string, { title: string; badgeUrl?: string }> = {};
      coursesSnap.forEach(d => {
        const data = d.data();
        cMap[d.id] = { title: data.title || data.name || "", badgeUrl: data.badgeUrl };
      });
      setCourseMap(cMap);
      const list: any[] = [];
      enrollSnap.forEach(d => list.push({ id: d.id, ...d.data() }));
      setEnrollments(list);
    } catch (err: any) {
      setError(err.message || "Failed to load enrollments");
    } finally {
      setLoading(false);
    }
  }

  async function fetchMessages() {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, "contact_messages"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const list: any[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      setMessages(list);
    } catch (err: any) {
      setError(err.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }

  async function fetchCourses() {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, "courses"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const list: any[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      setCourses(list);
    } catch (err: any) {
      setError(err.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }

  async function fetchAdmins() {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, "admins"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const list: any[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      setAdmins(list);
    } catch (err: any) {
      setError(err.message || "Failed to load admins");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenEdit(o: any) {
    const fields: Record<string, string> = {};
    const map = ["firstName","surname","otherName","gender","dateOfBirth","bloodGroup","genotype","allergies","medicalConditions","emergencyPhone","maritalStatus","phone","email","address","serviceNumber","rank","department","postHeld","appointment","state","area","lga","occupation","employer","education","nokName","nokRelation","nokPhone","nokAddress","passportUrl","signatureUrl"];
    map.forEach(k => fields[k] = o[k] || "");
    setEditForm(fields);
    setEditOfficer(o);
    setEditError("");
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editOfficer) return;
    setEditSaving(true);
    setEditError("");
    try {
      await updateDoc(doc(db, "users", editOfficer.id), editForm);
      setEditOfficer(null);
      setToast({ message: "Officer updated successfully", type: "success" });
      fetchOfficers();
    } catch (err: any) {
      setEditError(err.message || "Failed to update");
      setToast({ message: err.message || "Failed to update", type: "error" });
    } finally {
      setEditSaving(false);
    }
  }

  async function handleAddOfficer(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.firstName || !addForm.surname || !addForm.serviceNumber || !addForm.phone || !addForm.rank) {
      setAddError("Required fields: First Name, Surname, Service Number, Phone, Rank");
      return;
    }
    setAddSaving(true);
    setAddError("");
    try {
      const data = { ...addForm, createdAt: Timestamp.now() };
      Object.keys(data).forEach(k => { if (!data[k]) delete data[k]; });
      await addDoc(collection(db, "users"), data);
      setShowAddOfficer(false);
      setAddForm({});
      setToast({ message: "Officer added successfully", type: "success" });
      fetchOfficers();
    } catch (err: any) {
      setAddError(err.message || "Failed to add officer");
      setToast({ message: err.message || "Failed to add officer", type: "error" });
    } finally {
      setAddSaving(false);
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!window.confirm("Delete this officer permanently?")) return;
    try {
      await deleteDoc(doc(db, "users", userId));
      setOfficers(prev => prev.filter(o => o.id !== userId));
      setToast({ message: "Officer deleted successfully", type: "success" });
    } catch (err: any) {
      setToast({ message: "Failed to delete: " + err.message, type: "error" });
    }
  }

  async function handleUpdateEnrollmentStatus(enrollmentId: string, status: string) {
    try {
      await updateDoc(doc(db, "enrollments", enrollmentId), { status });
      setEnrollments(prev =>
        prev.map(e => (e.id === enrollmentId ? { ...e, status } : e))
      );
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    }
  }

  async function handleDeleteEnrollment(enrollmentId: string) {
    if (!window.confirm("Delete this enrollment record?")) return;
    try {
      await deleteDoc(doc(db, "enrollments", enrollmentId));
      setEnrollments(prev => prev.filter(e => e.id !== enrollmentId));
    } catch (err: any) {
      alert("Failed to delete: " + err.message);
    }
  }

  async function handleMarkAsRead(messageId: string) {
    try {
      await updateDoc(doc(db, "contact_messages", messageId), { status: "read" });
      setMessages(prev =>
        prev.map(m => (m.id === messageId ? { ...m, status: "read" } : m))
      );
    } catch (err: any) {
      alert("Failed to update message: " + err.message);
    }
  }

  async function handleAddCourse(e: React.FormEvent) {
    e.preventDefault();
    if (!newCourse.title.trim()) return;
    try {
      await addDoc(collection(db, "courses"), {
        title: newCourse.title.trim(),
        description: newCourse.description.trim(),
        duration: newCourse.duration.trim(),
        badgeUrl: newCourse.badgeUrl.trim(),
        createdAt: Timestamp.now()
      });
      setShowAddCourse(false);
      setNewCourse({ title: "", description: "", duration: "", badgeUrl: "" });
      fetchCourses();
    } catch (err: any) {
      alert("Failed to add course: " + err.message);
    }
  }

  async function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedAdminUser) return;
    setAddAdminLoading(true);
    setAddAdminError("");
    try {
      const userRef = doc(db, "admins", selectedAdminUser.id);
      const existing = await getDoc(userRef);
      if (existing.exists()) {
        setAddAdminError("User is already an admin");
        setAddAdminLoading(false);
        return;
      }
      await setDoc(userRef, {
        email: selectedAdminUser.email || "",
        role: addAdminRole,
        createdAt: Timestamp.now(),
      });
      setShowAddAdmin(false);
      setAddAdminSearch("");
      setAdminSearchResults([]);
      setSelectedAdminUser(null);
      setAddAdminRole("manager");
      fetchAdmins();
    } catch (err: any) {
      setAddAdminError(err.message || "Failed to add admin");
    } finally {
      setAddAdminLoading(false);
    }
  }

  async function handleRemoveAdmin(adminId: string) {
    if (!window.confirm("Remove this admin?")) return;
    try {
      await deleteDoc(doc(db, "admins", adminId));
      setAdmins(prev => prev.filter(a => a.id !== adminId));
    } catch (err: any) {
      alert("Failed to remove: " + err.message);
    }
  }

  async function handleUpdateAdminRole(adminId: string, role: string) {
    try {
      await updateDoc(doc(db, "admins", adminId), { role });
      setAdmins(prev => prev.map(a => (a.id === adminId ? { ...a, role } : a)));
    } catch (err: any) {
      alert("Failed to update role: " + err.message);
    }
  }

  function handleAdminSearch(val: string) {
    setAddAdminSearch(val);
    const t = val.toLowerCase();
    const results = officers.filter(o => {
      const name = `${o.firstName || ""} ${o.surname || ""} ${o.otherName || ""}`.toLowerCase();
      const sn = String(o.serviceNumber || "").toLowerCase();
      return name.includes(t) || sn.includes(t) || String(o.email || "").toLowerCase().includes(t);
    });
    setAdminSearchResults(results);
  }

  function selectAdminUser(o: any) {
    setSelectedAdminUser(o);
    setAddAdminSearch(`${o.firstName || ""} ${o.surname || ""} (${o.serviceNumber || ""})`);
    setAdminSearchResults([]);
  }

  const filteredOfficers = officers.filter(o => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    const name = `${o.firstName || ""} ${o.surname || ""} ${o.otherName || ""}`.toLowerCase();
    const sn = String(o.serviceNumber || "").toLowerCase();
    return name.includes(t) || sn.includes(t);
  });

  const isSuperAdmin = isAdmin && user?.email === "ekwuemesat@gmail.com";

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      await login(loginEmail, loginPassword);
    } catch {
      setLoginError("Invalid email or password");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoginError("");
    setLoginLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      const c = err.code;
      if (c === "auth/popup-blocked")
        setLoginError("Pop-up was blocked. Allow pop-ups and try again.");
      else if (c === "auth/popup-closed-by-user")
        setLoginError("Sign-in cancelled. Try again or use email/password.");
      else if (c === "auth/unauthorized-domain")
        setLoginError("This domain is not authorized for Google sign-in.");
      else if (c === "auth/account-exists-with-different-credential")
        setLoginError("An account already exists with this email using a different sign-in method.");
      else
        setLoginError(`Google sign-in failed${c ? ` (${c})` : ""}. Try email/password instead.`);
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleLogout() {
    await logout();
  }

  async function copyIdLink(sn: string) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/verify-id?sn=${sn}`);
      setCopiedId(sn);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  }

  if (authLoading) {
    return (
      <div className="login-overlay">
        <div className="spinner"></div>
        <p>Establishing Secure Command Link...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="overlay">
        <div className="form-section">
          <div className="form-container">
            <img src="/logo.png" alt="CADET-I" className="form-logo" />
            <h2>ADMIN PORTAL</h2>
            <p className="subtitle">Authorized Personnel Only</p>

            <form onSubmit={handleLoginSubmit}>
              <div className="input-group">
                <i className="fas fa-envelope input-icon" />
                <input
                  type="email" required placeholder="Admin Email"
                  value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                  disabled={loginLoading}
                />
              </div>

              <div className="input-group">
                <i className="fas fa-lock input-icon" />
                <input
                  type={showPass ? "text" : "password"} required placeholder="Password"
                  value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                  disabled={loginLoading}
                />
                <span className="toggle-pass" onClick={() => setShowPass(!showPass)}>
                  <i className={`fas ${showPass ? "fa-eye-slash" : "fa-eye"}`} />
                </span>
              </div>

              <button type="submit" className={loginLoading ? "loading" : ""} disabled={loginLoading} style={{
                width: "100%", padding: "14px", border: "none", borderRadius: 8,
                background: "var(--cmd-green)", color: "#fff", fontSize: 15,
                fontWeight: 700, cursor: loginLoading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10
              }}>
                <span className="btn-text">SIGN IN</span>
                {loginLoading && <span className="spinner" />}
              </button>

              {loginError && (
                <div className="status-box" style={{ background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", marginTop: 16 }}>
                  <i className="fas fa-exclamation-circle" style={{ marginRight: 8 }} />
                  {loginError}
                </div>
              )}
            </form>

            <div className="auth-footer">
              <div className="divider-row">
                <span className="divider-line" />
                <span className="divider-text">or continue with</span>
                <span className="divider-line" />
              </div>
              <button onClick={handleGoogleLogin} className="google-btn" disabled={loginLoading}>
                <svg className="google-icon" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.54 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.99 23.99 0 0 0 0 24c0 3.77.87 7.35 2.56 10.56l7.98-5.97z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 5.97C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Sign in with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="login-overlay">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <main className="portal-shell">
        <section className="section-padding" style={{
          textAlign: "center", minHeight: "60vh",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div>
            <h1>Access Denied</h1>
            <p>You do not have administrative privileges.</p>
            <button onClick={async () => { await logout(); navigate("/"); }} style={{ background: "none", border: "none", color: "var(--cmd-green)", cursor: "pointer", textDecoration: "underline", fontSize: "inherit", padding: 0 }}>
              Return to Home
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="data-deck">
        <div className="deck-content">
          <div className="deck-header">
            <div className="header-title">
              <h1>Command Admin Panel</h1>
              <div className="status-indicator">
                <span className="pulse-dot"></span>
                <span>System Online</span>
              </div>
            </div>
            <button onClick={handleLogout} className="cmd-btn-small" style={{ background: "#991b1b", whiteSpace: "nowrap" }}>
              <i className="fas fa-sign-out-alt" style={{ marginRight: 6 }} /> Logout
            </button>
          </div>

          <nav className="filter-strip" style={{ display: "flex", gap: "6px", padding: "6px 8px", overflowX: "auto" }}>
            {["officers", "enrollments", "messages", "courses", "admins"].map(tab => (
              <button
                key={tab}
                className={`cmd-btn-small${activeTab === tab ? " active" : ""}`}
                onClick={() => setActiveTab(tab)}
                style={activeTab === tab ? { background: "var(--cmd-green)" } : { background: "var(--cmd-blue)" }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>

          {loading && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div className="spinner" style={{ display: "inline-block", margin: "0 auto 12px", borderColor: "var(--cmd-green)", borderTopColor: "transparent", width: 30, height: 30 }}></div>
              <p>Loading admin dashboard...</p>
            </div>
          )}

          {error && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#be123c" }}>
              <p>{error}</p>
              <button className="cmd-btn-small" onClick={() => setActiveTab(activeTab)} style={{ marginTop: 12 }}>Retry</button>
            </div>
          )}

          {!loading && !error && activeTab === "officers" && (
            <section>
              <div className="registry-split-head">
                <h3>All Officers</h3>
                <button
                  className="cmd-btn-small"
                  style={{ background: "var(--cmd-green)" }}
                  onClick={() => { setShowAddOfficer(true); setAddForm({}); setAddError(""); }}
                >
                  + Add Officer
                </button>
              </div>
              <div className="filter-strip">
                <div className="filter-controls" style={{ gridTemplateColumns: "1fr" }}>
                  <div className="search-bar">
                    <i className="fas fa-search"></i>
                    <input
                      type="text"
                      placeholder="Search by name or service number..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {filteredOfficers.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "#667085" }}>
                  <p>{searchTerm ? "No officers match your search." : "No officers found."}</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="registry-table">
                    <thead>
                      <tr>
                        <th>S/N</th>
                        <th>Service Number</th>
                        <th>Name</th>
                        <th>Rank</th>
                        <th>State</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOfficers.map((o, idx) => (
                        <tr key={o.id}>
                          <td>{idx + 1}</td>
                          <td>{escapeHtml(o.serviceNumber || "")}</td>
                          <td>{escapeHtml(`${o.firstName || ""} ${o.surname || ""}`)}</td>
                          <td><span className="rank-badge">{escapeHtml(o.rank || "")}</span></td>
                          <td>{escapeHtml(o.state || "")}</td>
                          <td>
                            {o.status ? (
                              <span className={`rank-badge ${statusBadgeClass(o.status)}`}>
                                {escapeHtml(o.status)}
                              </span>
                            ) : (
                              <span className="rank-badge badge-green">Active</span>
                            )}
                          </td>
                          <td>{formatDate(o.createdAt)}</td>
                          <td>
                            <div className="row-actions">
                              <button
                                className="action-icon"
                                style={{ color: "#0891b2", borderColor: "#cffafe", background: "#ecfeff" }}
                                onClick={() => handleOpenEdit(o)}
                                title="Edit officer"
                              >
                                <i className="fas fa-pen"></i>
                              </button>
                              <button
                                className="action-icon"
                                style={{ color: "#2563eb", borderColor: "#bfdbfe", background: "#eff6ff" }}
                                onClick={() => copyIdLink(o.serviceNumber)}
                                title="Copy ID verification link"
                              >
                                <i className={`fas ${copiedId === o.serviceNumber ? "fa-check" : "fa-link"}`}></i>
                              </button>
                              <button
                                className="action-icon"
                                style={{ color: "#7c3aed", borderColor: "#ddd6fe", background: "#f5f3ff" }}
                                onClick={() => setQrOfficer(o)}
                                title="Show QR code"
                              >
                                <i className="fas fa-qrcode"></i>
                              </button>
                              <button
                                className="action-icon"
                                style={{ color: "#be123c", borderColor: "#fecdd3", background: "#fff1f2" }}
                                onClick={() => handleDeleteUser(o.id)}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {!loading && !error && activeTab === "enrollments" && (
            <section>
              {enrollments.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "#667085" }}>
                  <p>No enrollments found.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="registry-table">
                    <thead>
                      <tr>
                        <th>S/N</th>
                        <th>Service No</th>
                        <th>Name</th>
                        <th>Course</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrollments.map((e, idx) => (
                        <tr key={e.id}>
                          <td>{idx + 1}</td>
                          <td>{escapeHtml(e.officerUID || e.serviceNumber || "")}</td>
                          <td>{escapeHtml(userMap[e.officerUID] || "")}</td>
                          <td>{escapeHtml(courseMap[e.courseID]?.title || e.courseTitle || "")}</td>
                          <td>
                            <select
                              value={e.status || "pending"}
                              onChange={ev => handleUpdateEnrollmentStatus(e.id, ev.target.value)}
                              className="rank-badge"
                              style={{ cursor: "pointer", border: "1px solid #ddd" }}
                            >
                              <option value="pending">Pending</option>
                              <option value="active">Active</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td>{formatDate(e.createdAt || e.enrolledAt)}</td>
                          <td>
                            <div className="row-actions">
                              <button
                                className="action-icon"
                                style={{ color: "#be123c", borderColor: "#fecdd3", background: "#fff1f2" }}
                                onClick={() => handleDeleteEnrollment(e.id)}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {!loading && !error && activeTab === "messages" && (
            <section>
              {messages.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "#667085" }}>
                  <p>No messages found.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 16 }}>
                  {messages.map(m => {
                    const isExpanded = expandedMessage === m.id;
                    return (
                      <div
                        key={m.id}
                        className="table-container"
                        style={{ padding: 20, cursor: "pointer" }}
                        onClick={() => setExpandedMessage(isExpanded ? null : m.id)}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
                          <div>
                            <strong>{escapeHtml(m.name || "")}</strong>
                            <span style={{ color: "#667085", marginLeft: 10, fontSize: 12 }}>
                              {escapeHtml(m.email || "")}
                            </span>
                          </div>
                          <span className={`rank-badge ${statusBadgeClass(m.status || "unread")}`}>
                            {escapeHtml(m.status || "unread")}
                          </span>
                        </div>
                        <h4 style={{ margin: "4px 0 8px", fontSize: 14, color: "var(--cmd-green)" }}>
                          {escapeHtml(m.subject || "")}
                        </h4>
                        <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, marginBottom: 8 }}>
                          {isExpanded
                            ? escapeHtml(m.message || m.body || "")
                            : truncate(m.message || m.body || "", 150)}
                        </p>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "#888" }}>
                          <span>{formatDate(m.createdAt)}</span>
                          {(m.status || "unread").toLowerCase() !== "read" && (
                            <button
                              className="cmd-btn-small"
                              style={{ padding: "6px 14px", fontSize: 10, background: "var(--cmd-blue)" }}
                              onClick={e => { e.stopPropagation(); handleMarkAsRead(m.id); }}
                            >
                              Mark as Read
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {!loading && !error && activeTab === "courses" && (
            <section>
              <div className="registry-split-head">
                <h3>Course Catalog</h3>
                <button
                  className="cmd-btn-small"
                  style={{ background: "var(--cmd-green)" }}
                  onClick={() => setShowAddCourse(!showAddCourse)}
                >
                  {showAddCourse ? "Cancel" : "+ Add Course"}
                </button>
              </div>

              {showAddCourse && (
                <div className="table-container" style={{ padding: 20, marginBottom: 20 }}>
                  <form onSubmit={handleAddCourse} className="modal-form">
                    <div className="grid-2">
                      <div className="input-group-modal">
                        <label>Course Name</label>
                        <input
                          required
                          value={newCourse.title}
                          onChange={e => setNewCourse(p => ({ ...p, title: e.target.value }))}
                        />
                      </div>
                      <div className="input-group-modal">
                        <label>Duration</label>
                        <input
                          value={newCourse.duration}
                          onChange={e => setNewCourse(p => ({ ...p, duration: e.target.value }))}
                          placeholder="e.g. 12 weeks"
                        />
                      </div>
                    </div>
                    <div className="input-group-modal">
                      <label>Description</label>
                      <textarea
                        rows={3}
                        value={newCourse.description}
                        onChange={e => setNewCourse(p => ({ ...p, description: e.target.value }))}
                      />
                    </div>
                    <div className="input-group-modal">
                      <label>Badge Image URL</label>
                      <input
                        value={newCourse.badgeUrl}
                        onChange={e => setNewCourse(p => ({ ...p, badgeUrl: e.target.value }))}
                        placeholder="https://..."
                      />
                    </div>
                    <button type="submit" className="cmd-btn-small" style={{ background: "var(--cmd-green)", alignSelf: "flex-start" }}>
                      Create Course
                    </button>
                  </form>
                </div>
              )}

              {courses.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "#667085" }}>
                  <p>No courses found. Add your first course above.</p>
                </div>
              ) : (
                <div className="course-grid">
                  {courses.map(c => (
                    <div key={c.id} className="table-container" style={{ padding: 20 }}>
                      {c.badgeUrl && (
                        <div className="admin-course-badge">
                          <img src={getGoogleDriveUrl(c.badgeUrl)} alt={escapeHtml(c.title || c.name || "")} />
                        </div>
                      )}
                      <h4 style={{ color: "var(--cmd-green)", marginBottom: 6, fontSize: 14 }}>
                        {escapeHtml(c.title || c.name || "")}
                      </h4>
                      {c.duration && (
                        <span style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 6 }}>
                          {escapeHtml(c.duration)}
                        </span>
                      )}
                      <p style={{ fontSize: 12, color: "#555", lineHeight: 1.5 }}>
                        {truncate(c.description || "", 120)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {!loading && !error && activeTab === "admins" && (
            <section>
              <div className="registry-split-head">
                <h3>Admin Management</h3>
                {isSuperAdmin && (
                  <button
                    className="cmd-btn-small"
                    style={{ background: "var(--cmd-green)" }}
                    onClick={() => {
                      setShowAddAdmin(true);
                      setAddAdminError("");
                      setSelectedAdminUser(null);
                      setAddAdminSearch("");
                      setAdminSearchResults([]);
                      if (officers.length === 0) fetchOfficers();
                    }}
                  >
                    + Add Admin
                  </button>
                )}
              </div>

              {showAddAdmin && (
                <div className="table-container" style={{ padding: 20, marginBottom: 20 }}>
                  <form onSubmit={handleAddAdmin}>
                    <div className="input-group-modal">
                      <label>Search for User</label>
                      <input
                        required
                        placeholder="Type name, service number, or email..."
                        value={addAdminSearch}
                        onChange={e => { handleAdminSearch(e.target.value); setSelectedAdminUser(null); }}
                      />
                      {adminSearchResults.length > 0 && !selectedAdminUser && (
                        <div style={{
                          maxHeight: 200, overflowY: "auto", border: "1px solid #ddd",
                          borderRadius: 6, marginTop: 4
                        }}>
                          {adminSearchResults.map(o => (
                            <div
                              key={o.id}
                              style={{
                                padding: "8px 12px", cursor: "pointer", fontSize: 13,
                                borderBottom: "1px solid #eee", display: "flex",
                                justifyContent: "space-between"
                              }}
                              onClick={() => selectAdminUser(o)}
                            >
                              <span>{o.firstName || ""} {o.surname || ""}</span>
                              <span style={{ color: "#888" }}>{o.serviceNumber || ""}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="input-group-modal">
                      <label>Role</label>
                      <select
                        value={addAdminRole}
                        onChange={e => setAddAdminRole(e.target.value)}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid #ddd" }}
                      >
                        {ADMIN_ROLES.filter(r => r !== "super-admin").map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                    {addAdminError && (
                      <p style={{ color: "#be123c", fontSize: 13, marginBottom: 8 }}>{addAdminError}</p>
                    )}
                    <div style={{ display: "flex", gap: 8 }}>
                      <button type="submit" className="cmd-btn-small" style={{ background: "var(--cmd-green)" }} disabled={!selectedAdminUser || addAdminLoading}>
                        {addAdminLoading ? "Adding..." : "Add Admin"}
                      </button>
                      <button type="button" className="cmd-btn-small" style={{ background: "var(--cmd-blue)" }} onClick={() => setShowAddAdmin(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {admins.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "#667085" }}>
                  <p>No admins found.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="registry-table">
                    <thead>
                      <tr>
                        <th>S/N</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Created</th>
                        {isSuperAdmin && <th>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map((a, idx) => (
                        <tr key={a.id}>
                          <td>{idx + 1}</td>
                          <td>{escapeHtml(a.email || "")}</td>
                          <td>
                            {isSuperAdmin ? (
                              <select
                                value={a.role || "manager"}
                                onChange={ev => handleUpdateAdminRole(a.id, ev.target.value)}
                                className="rank-badge"
                                style={{ cursor: "pointer", border: "1px solid #ddd" }}
                              >
                                {ADMIN_ROLES.map(r => (
                                  <option key={r} value={r}>{r}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="rank-badge">{escapeHtml(a.role || "manager")}</span>
                            )}
                          </td>
                          <td>{formatDate(a.createdAt)}</td>
                          {isSuperAdmin && (
                            <td>
                              <div className="row-actions">
                                <button
                                  className="action-icon"
                                  style={{ color: "#be123c", borderColor: "#fecdd3", background: "#fff1f2" }}
                                  onClick={() => handleRemoveAdmin(a.id)}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      {showAddOfficer && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 16, maxWidth: 700, width: "100%", maxHeight: "90vh", overflowY: "auto", padding: 28, boxShadow: "0 40px 100px #00000080" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>Add New Officer</h3>
              <button onClick={() => setShowAddOfficer(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#888" }}>&times;</button>
            </div>
            <form onSubmit={handleAddOfficer} className="modal-form">
              <div className="grid-2">
                <div className="input-group-modal">
                  <label>First Name *</label>
                  <input required value={addForm.firstName || ""} onChange={e => setAddForm(p => ({ ...p, firstName: e.target.value }))} />
                </div>
                <div className="input-group-modal">
                  <label>Surname *</label>
                  <input required value={addForm.surname || ""} onChange={e => setAddForm(p => ({ ...p, surname: e.target.value }))} />
                </div>
                <div className="input-group-modal">
                  <label>Other Name</label>
                  <input value={addForm.otherName || ""} onChange={e => setAddForm(p => ({ ...p, otherName: e.target.value }))} />
                </div>
                <div className="input-group-modal">
                  <label>Gender</label>
                  <select value={addForm.gender || ""} onChange={e => setAddForm(p => ({ ...p, gender: e.target.value }))}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="input-group-modal">
                  <label>Date of Birth</label>
                  <input type="date" value={addForm.dateOfBirth || ""} onChange={e => setAddForm(p => ({ ...p, dateOfBirth: e.target.value }))} />
                </div>
                <div className="input-group-modal">
                  <label>Blood Group</label>
                  <select value={addForm.bloodGroup || ""} onChange={e => setAddForm(p => ({ ...p, bloodGroup: e.target.value }))}>
                    <option value="">Select</option>
                    {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="input-group-modal">
                  <label>Genotype</label>
                  <select value={addForm.genotype || ""} onChange={e => setAddForm(p => ({ ...p, genotype: e.target.value }))}>
                    <option value="">Select</option>
                    {["AA","AS","SS","AC"].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="input-group-modal">
                  <label>Allergies</label>
                  <input value={addForm.allergies || ""} onChange={e => setAddForm(p => ({ ...p, allergies: e.target.value }))} placeholder="e.g. Penicillin, Peanuts" />
                </div>
                <div className="input-group-modal">
                  <label>Medical Conditions</label>
                  <input value={addForm.medicalConditions || ""} onChange={e => setAddForm(p => ({ ...p, medicalConditions: e.target.value }))} placeholder="e.g. Asthma, Diabetes" />
                </div>
                <div className="input-group-modal">
                  <label>Emergency Phone</label>
                  <input type="tel" value={addForm.emergencyPhone || ""} onChange={e => setAddForm(p => ({ ...p, emergencyPhone: e.target.value }))} placeholder="Alternate emergency contact" />
                </div>
                <div className="input-group-modal">
                  <label>Marital Status</label>
                  <select value={addForm.maritalStatus || ""} onChange={e => setAddForm(p => ({ ...p, maritalStatus: e.target.value }))}>
                    <option value="">Select</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
                <div className="input-group-modal">
                  <label>Phone *</label>
                  <input required value={addForm.phone || ""} onChange={e => setAddForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="input-group-modal">
                  <label>Email</label>
                  <input type="email" value={addForm.email || ""} onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="input-group-modal">
                  <label>Service Number *</label>
                  <input required value={addForm.serviceNumber || ""} onChange={e => setAddForm(p => ({ ...p, serviceNumber: e.target.value }))} />
                </div>
                <div className="input-group-modal">
                  <label>Rank *</label>
                  <select required value={addForm.rank || ""} onChange={e => setAddForm(p => ({ ...p, rank: e.target.value }))}>
                    <option value="">Select Rank</option>
                    {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="input-group-modal">
                  <label>Department</label>
                  <select value={addForm.department || ""} onChange={e => setAddForm(p => ({ ...p, department: e.target.value }))}>
                    <option value="">Select</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="input-group-modal">
                  <label>State</label>
                  <input value={addForm.state || ""} onChange={e => setAddForm(p => ({ ...p, state: e.target.value }))} />
                </div>
                <div className="input-group-modal">
                  <label>LGA</label>
                  <input value={addForm.lga || ""} onChange={e => setAddForm(p => ({ ...p, lga: e.target.value }))} />
                </div>
                <div className="input-group-modal">
                  <label>Occupation</label>
                  <input value={addForm.occupation || ""} onChange={e => setAddForm(p => ({ ...p, occupation: e.target.value }))} />
                </div>
                <div className="input-group-modal">
                  <label>Employer</label>
                  <input value={addForm.employer || ""} onChange={e => setAddForm(p => ({ ...p, employer: e.target.value }))} />
                </div>
                <div className="input-group-modal" style={{ gridColumn: "1 / -1" }}>
                  <label>Address</label>
                  <textarea rows={2} value={addForm.address || ""} onChange={e => setAddForm(p => ({ ...p, address: e.target.value }))} />
                </div>
              </div>
              {addError && <p style={{ color: "#be123c", fontSize: 13 }}>{addError}</p>}
              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" className="cmd-btn-small" style={{ background: "var(--cmd-green)" }} disabled={addSaving}>
                  {addSaving ? "Saving..." : "Add Officer"}
                </button>
                <button type="button" className="cmd-btn-small" style={{ background: "var(--cmd-blue)" }} onClick={() => setShowAddOfficer(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editOfficer && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 16, maxWidth: 700, width: "100%", maxHeight: "90vh", overflowY: "auto", padding: 28, boxShadow: "0 40px 100px #00000080" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>Edit Officer</h3>
              <button onClick={() => setEditOfficer(null)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#888" }}>&times;</button>
            </div>
            <form onSubmit={handleEditSave} className="modal-form">
              <div className="grid-2">
                <div className="input-group-modal">
                  <label>First Name</label>
                  <input required value={editForm.firstName || ""} onChange={e => setEditForm(p => ({ ...p, firstName: e.target.value }))} />
                </div>
                <div className="input-group-modal">
                  <label>Surname</label>
                  <input required value={editForm.surname || ""} onChange={e => setEditForm(p => ({ ...p, surname: e.target.value }))} />
                </div>
                <div className="input-group-modal">
                  <label>Other Name</label>
                  <input value={editForm.otherName || ""} onChange={e => setEditForm(p => ({ ...p, otherName: e.target.value }))} />
                </div>
                <div className="input-group-modal">
                  <label>Gender</label>
                  <select value={editForm.gender || ""} onChange={e => setEditForm(p => ({ ...p, gender: e.target.value }))}>
                    <option value="">Select</option>
                    <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                  </select>
                </div>
                <div className="input-group-modal">
                  <label>Date of Birth</label>
                  <input type="date" value={editForm.dateOfBirth || ""} onChange={e => setEditForm(p => ({ ...p, dateOfBirth: e.target.value }))} />
                </div>
                <div className="input-group-modal">
                  <label>Blood Group</label>
                  <select value={editForm.bloodGroup || ""} onChange={e => setEditForm(p => ({ ...p, bloodGroup: e.target.value }))}>
                    <option value="">Select</option>
                    {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="input-group-modal">
                  <label>Genotype</label>
                  <select value={editForm.genotype || ""} onChange={e => setEditForm(p => ({ ...p, genotype: e.target.value }))}>
                    <option value="">Select</option>
                    {["AA","AS","SS","AC"].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="input-group-modal">
                  <label>Allergies</label>
                  <input value={editForm.allergies || ""} onChange={e => setEditForm(p => ({ ...p, allergies: e.target.value }))} placeholder="e.g. Penicillin, Peanuts" />
                </div>
                <div className="input-group-modal">
                  <label>Medical Conditions</label>
                  <input value={editForm.medicalConditions || ""} onChange={e => setEditForm(p => ({ ...p, medicalConditions: e.target.value }))} placeholder="e.g. Asthma, Diabetes" />
                </div>
                <div className="input-group-modal">
                  <label>Emergency Phone</label>
                  <input type="tel" value={editForm.emergencyPhone || ""} onChange={e => setEditForm(p => ({ ...p, emergencyPhone: e.target.value }))} placeholder="Alternate emergency contact" />
                </div>
                <div className="input-group-modal">
                  <label>Marital Status</label>
                  <select value={editForm.maritalStatus || ""} onChange={e => setEditForm(p => ({ ...p, maritalStatus: e.target.value }))}>
                    <option value="">Select</option>
                    <option value="Single">Single</option><option value="Married">Married</option><option value="Divorced">Divorced</option><option value="Widowed">Widowed</option>
                  </select>
                </div>
                <div className="input-group-modal">
                  <label>Phone</label>
                  <input required value={editForm.phone || ""} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="input-group-modal">
                  <label>Email</label>
                  <input type="email" value={editForm.email || ""} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="input-group-modal">
                  <label>Service Number</label>
                  <input required value={editForm.serviceNumber || ""} onChange={e => setEditForm(p => ({ ...p, serviceNumber: e.target.value }))} />
                </div>
                <div className="input-group-modal">
                  <label>Rank</label>
                  <select required value={editForm.rank || ""} onChange={e => setEditForm(p => ({ ...p, rank: e.target.value }))}>
                    <option value="">Select Rank</option>
                    {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="input-group-modal">
                  <label>Department</label>
                  <select value={editForm.department || ""} onChange={e => setEditForm(p => ({ ...p, department: e.target.value }))}>
                    <option value="">Select</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="input-group-modal">
                  <label>Post Held</label>
                  <input value={editForm.postHeld || ""} onChange={e => setEditForm(p => ({ ...p, postHeld: e.target.value }))} />
                </div>
                <div className="input-group-modal">
                  <label>Appointment</label>
                  <input value={editForm.appointment || ""} onChange={e => setEditForm(p => ({ ...p, appointment: e.target.value }))} />
                </div>
                <div className="input-group-modal">
                  <label>State</label>
                  <input value={editForm.state || ""} onChange={e => setEditForm(p => ({ ...p, state: e.target.value }))} />
                </div>
                <div className="input-group-modal">
                  <label>LGA</label>
                  <input value={editForm.lga || ""} onChange={e => setEditForm(p => ({ ...p, lga: e.target.value }))} />
                </div>
                <div className="input-group-modal">
                  <label>Occupation</label>
                  <input value={editForm.occupation || ""} onChange={e => setEditForm(p => ({ ...p, occupation: e.target.value }))} />
                </div>
                <div className="input-group-modal">
                  <label>Employer</label>
                  <input value={editForm.employer || ""} onChange={e => setEditForm(p => ({ ...p, employer: e.target.value }))} />
                </div>
                <div className="input-group-modal">
                  <label>Education</label>
                  <input value={editForm.education || ""} onChange={e => setEditForm(p => ({ ...p, education: e.target.value }))} />
                </div>
                <div className="input-group-modal">
                  <label>Next of Kin Name</label>
                  <input value={editForm.nokName || ""} onChange={e => setEditForm(p => ({ ...p, nokName: e.target.value }))} />
                </div>
                <div className="input-group-modal">
                  <label>Next of Kin Relation</label>
                  <input value={editForm.nokRelation || ""} onChange={e => setEditForm(p => ({ ...p, nokRelation: e.target.value }))} />
                </div>
                <div className="input-group-modal">
                  <label>Next of Kin Phone</label>
                  <input value={editForm.nokPhone || ""} onChange={e => setEditForm(p => ({ ...p, nokPhone: e.target.value }))} />
                </div>
                <div className="input-group-modal" style={{ gridColumn: "1 / -1" }}>
                  <label>Next of Kin Address</label>
                  <textarea rows={2} value={editForm.nokAddress || ""} onChange={e => setEditForm(p => ({ ...p, nokAddress: e.target.value }))} />
                </div>
                <div className="input-group-modal">
                  <label>Passport URL</label>
                  <input value={editForm.passportUrl || ""} onChange={e => setEditForm(p => ({ ...p, passportUrl: e.target.value }))} />
                </div>
                <div className="input-group-modal">
                  <label>Signature URL</label>
                  <input value={editForm.signatureUrl || ""} onChange={e => setEditForm(p => ({ ...p, signatureUrl: e.target.value }))} />
                </div>
              </div>
              {editError && <p style={{ color: "#be123c", fontSize: 13 }}>{editError}</p>}
              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" className="cmd-btn-small" style={{ background: "var(--cmd-green)" }} disabled={editSaving}>
                  {editSaving ? "Saving..." : "Save Changes"}
                </button>
                <button type="button" className="cmd-btn-small" style={{ background: "var(--cmd-blue)" }} onClick={() => setEditOfficer(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {qrOfficer && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)" }}>
          <div className="w-80 rounded-xl bg-white p-6 text-center shadow-2xl">
            <h3 className="mb-2 text-lg font-bold text-gray-800">Officer QR Code</h3>
            <p className="mb-4 text-sm text-gray-500">
              {qrOfficer.firstName || ""} {qrOfficer.surname || ""}
            </p>
            <div id="qr-content" className="mb-4 flex justify-center">
              <QRCodeSVG value={`${window.location.origin}/verify-id?sn=${qrOfficer.serviceNumber}`} size={200} />
            </div>
            <p className="mb-4 break-all text-xs text-gray-400">
              {window.location.origin}/verify-id?sn={qrOfficer.serviceNumber}
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  const pw = window.open("", "_blank");
                  if (!pw) return;
                  pw.document.write(`
                    <html><head><title>QR - ${qrOfficer.firstName || ""} ${qrOfficer.surname || ""}</title></head>
                    <body style="text-align:center;font-family:sans-serif;padding-top:40px;">
                      <h2>CADET I - Enugu Nsukka Chapter</h2>
                      <h3>${qrOfficer.firstName || ""} ${qrOfficer.surname || ""}</h3>
                      <p>${qrOfficer.rank || ""} &middot; ${qrOfficer.serviceNumber || ""}</p>
                      <div id="qr">${document.getElementById("qr-content")?.innerHTML ?? ""}</div>
                      <p style="margin-top:20px;color:#666;font-size:12px;">${window.location.origin}/verify-id?sn=${qrOfficer.serviceNumber}</p>
                      <script>window.onload=function(){window.print();window.close();};<\/script>
                    </body></html>
                  `);
                  pw.document.close();
                }}
                className="rounded-lg bg-purple-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-purple-600"
              >
                Print
              </button>
              <button
                onClick={() => {
                  const svg = document.getElementById("qr-content")?.querySelector("svg");
                  if (!svg) return;
                  const svgData = new XMLSerializer().serializeToString(svg);
                  const img = new Image();
                  const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
                  const url = URL.createObjectURL(blob);
                  img.onload = () => {
                    const c = document.createElement("canvas");
                    c.width = 500; c.height = 500;
                    const ctx = c.getContext("2d");
                    if (ctx) { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, 500, 500); ctx.drawImage(img, 0, 0, 500, 500); }
                    c.toBlob(pngBlob => {
                      if (pngBlob) { const a = document.createElement("a"); a.href = URL.createObjectURL(pngBlob); a.download = `qr-${qrOfficer.serviceNumber || "officer"}.png`; a.click(); }
                      URL.revokeObjectURL(url);
                    });
                  };
                  img.src = url;
                }}
                className="rounded-lg bg-green-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-600"
              >
                Download PNG
              </button>
              <button
                onClick={() => setQrOfficer(null)}
                className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{
          position: "fixed", top: 24, right: 24, zIndex: 9999,
          padding: "14px 24px", borderRadius: 10,
          background: toast.type === "success" ? "#065f46" : "#991b1b",
          color: "#fff", fontSize: 14, fontWeight: 600,
          boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
          display: "flex", alignItems: "center", gap: 10,
          animation: "fadeIn 0.3s ease-out"
        }}>
          <i className={`fas ${toast.type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}`} />
          {toast.message}
        </div>
      )}
    </div>
  );
}
