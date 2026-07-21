import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  collection, query, orderBy, getDocs, addDoc,
  updateDoc, deleteDoc, doc, Timestamp
} from "firebase/firestore";
import { auth, db, GOOGLE_SHEETS_API } from "../config/firebase";
import { useAuth } from "../contexts/AuthContext";
import {
  escapeHtml, formatDate, truncate, getGoogleDriveUrl,
  RANKS, DEPARTMENTS, APPOINTMENTS
} from "../utils";

function statusBadgeClass(status: string) {
  const s = String(status).toLowerCase();
  if (s === "active" || s === "completed" || s === "read") return "badge-green";
  if (s === "pending" || s === "unread") return "badge-gold";
  if (s === "cancelled" || s === "inactive" || s === "suspended") return "badge-red";
  return "badge-green";
}

export default function Admin() {
  const { user, profile, loading: authLoading, isAdmin, logout } = useAuth();
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

  useEffect(() => {
    document.title = "Admin Panel — CADETI";
  }, []);

  useEffect(() => {
    if (activeTab === "officers") fetchOfficers();
    else if (activeTab === "enrollments") fetchEnrollments();
    else if (activeTab === "messages") fetchMessages();
    else if (activeTab === "courses") fetchCourses();
  }, [activeTab]);

  async function fetchOfficers() {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const list: any[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
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

  async function handleDeleteUser(userId: string) {
    if (!window.confirm("Delete this officer permanently?")) return;
    try {
      await deleteDoc(doc(db, "users", userId));
      setOfficers(prev => prev.filter(o => o.id !== userId));
    } catch (err: any) {
      alert("Failed to delete: " + err.message);
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

  const filteredOfficers = officers.filter(o => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    const name = `${o.firstName || ""} ${o.surname || ""} ${o.otherName || ""}`.toLowerCase();
    const sn = String(o.serviceNumber || "").toLowerCase();
    return name.includes(t) || sn.includes(t);
  });

  if (authLoading) {
    return (
      <div className="login-overlay">
        <div className="spinner"></div>
        <p>Establishing Secure Command Link...</p>
      </div>
    );
  }

  if (!profile || !isAdmin) {
    return (
      <main className="portal-shell">
        <section className="section-padding" style={{
          textAlign: "center", minHeight: "60vh",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div>
            <h1>Access Denied</h1>
            <p>You do not have administrative privileges.</p>
            <Link to="/dashboard">Return to Dashboard</Link>
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
          </div>

          <nav className="filter-strip" style={{ display: "flex", gap: "6px", padding: "6px 8px", overflowX: "auto" }}>
            {["officers", "enrollments", "messages", "courses"].map(tab => (
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
        </div>
      </div>
    </div>
  );
}
