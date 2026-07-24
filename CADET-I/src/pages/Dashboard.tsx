import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db, auth } from "../config/firebase";
import { useAuth } from "../contexts/AuthContext";
import { escapeHtml, formatDate, truncate, getGoogleDriveUrl, RANKS, DEPARTMENTS, APPOINTMENTS } from "../utils";

interface Enrollment {
  id: string;
  courseId: string;
  serviceNumber: string;
  status: string;
  createdAt: { toDate: () => Date } | null;
  courseName?: string;
}

interface Course {
  id: string;
  name: string;
}

interface ContactMessage {
  id: string;
  subject: string;
  message: string;
  createdAt: { toDate: () => Date } | null;
  read: boolean;
}

function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function Dashboard() {
  const { user: currentUser, profile: userProfile, isAdmin, loading, profileLoading, logout } = useAuth();
  const navigate = useNavigate();

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Record<string, string>>({});
  const [fetching, setFetching] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [activeSection, setActiveSection] = useState("dashboard");

  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/login");
  }, [logout, navigate]);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  useEffect(() => {
    if (!userProfile) return;
    let cancelled = false;

    const fetchData = async () => {
      try {
        const q = query(
          collection(db, "enrollments"),
          where("serviceNumber", "==", userProfile.serviceNumber),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        if (cancelled) return;

        const enrollmentList: Enrollment[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Enrollment[];

        const courseIds = [...new Set(enrollmentList.map((e) => e.courseId).filter(Boolean))];

        const courseMap: Record<string, string> = {};
        if (courseIds.length > 0) {
          const courseSnap = await getDocs(collection(db, "courses"));
          courseSnap.docs.forEach((d) => {
            const data = d.data() as Course;
            courseMap[d.id] = data.name;
          });
        }

        if (!cancelled) {
          setEnrollments(
            enrollmentList.map((e) => ({
              ...e,
              courseName: courseMap[e.courseId] || "Unknown Course",
            }))
          );
          setCourses(courseMap);
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        if (!cancelled) setFetching(false);
      }
    };

    const fetchMessages = async () => {
      try {
        const q = query(
          collection(db, "contact_messages"),
          where("serviceNumber", "==", userProfile.serviceNumber),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        if (!cancelled) {
          setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ContactMessage)));
        }
      } catch {
        // contact_messages may not exist yet
      }
    };

    fetchData();
    fetchMessages();
    return () => { cancelled = true; };
  }, [userProfile]);

  if (profileLoading) {
    return (
      <main className="portal-shell">
        <div className="portal-loading">
          <div className="spinner" />
          <p>Loading your portal...</p>
        </div>
      </main>
    );
  }

  if (!userProfile) {
    if (isAdmin) {
      return <Navigate to="/admin" replace />;
    }
    return (
      <main className="portal-shell">
        <div className="portal-loading">
          <i className="fas fa-user-clock" style={{ fontSize: 48, color: "#d4a017", marginBottom: 16 }} />
          <h2 style={{ color: "#333", marginBottom: 8 }}>Profile Not Found</h2>
          <p>Your officer profile has not been set up yet. Please complete your portal activation to access the dashboard.</p>
          <Link to="/signup" className="action-btn" style={{ marginTop: 16, display: "inline-block" }}>
            Continue Setup
          </Link>
        </div>
      </main>
    );
  }

  const pendingResults = enrollments.filter((e) => e.status !== "completed").length;
  const unreadMessages = messages.filter((m) => !m.read).length;

  const getStatusBadge = (status: string) => {
    const base = "badge badge-";
    switch (status) {
      case "active": return base + "active";
      case "completed": return base + "completed";
      case "pending": return base + "pending";
      default: return base + "default";
    }
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "fa-chart-pie" },
    { id: "courses", label: "Courses", icon: "fa-book", link: "/events" },
    { id: "idcard", label: "My ID Card", icon: "fa-id-card", link: `/verify?id=${userProfile?.serviceNumber}` },
    { id: "publications", label: "Publications", icon: "fa-newspaper", link: "/publications" },
  ];

  return (
    <div className="dashboard-container">
      <div className={`sidebar-backdrop ${sidebarOpen ? "active" : ""}`} onClick={closeSidebar} />
      <aside className={`sidebar ${sidebarOpen ? "active" : ""}`}>
        <div className="sidebar-header">
          <img src="/logo.png" alt="Logo" style={{ width: 34, height: 34, borderRadius: 10 }} />
          <h3>Cadet Portal</h3>
        </div>

        <div className="user-profile-brief">
          <div className="avatar-frame">
            <img
              src={getGoogleDriveUrl(userProfile?.passportUrl) || "/logo.png"}
              alt="Passport"
            />
          </div>
          <h4>{escapeHtml(userProfile?.surname)} {escapeHtml(userProfile?.firstName)}</h4>
          <small>{userProfile?.rank || ""} &bull; {escapeHtml(userProfile?.serviceNumber)}</small>
        </div>

        <nav className="side-nav">
          {navItems.map((item) =>
            item.link ? (
              <Link key={item.id} to={item.link} className={`nav-item ${activeSection === item.id ? "active" : ""}`} onClick={closeSidebar}>
                <i className={`fas ${item.icon}`} />
                {item.label}
              </Link>
            ) : (
              <button key={item.id} className={`nav-item ${activeSection === item.id ? "active" : ""}`} onClick={() => { setActiveSection(item.id); closeSidebar(); }}>
                <i className={`fas ${item.icon}`} />
                {item.label}
              </button>
            )
          )}
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt" /> Logout
        </button>
      </aside>

      <main className="main-content">
        <div className="top-bar">
          <button className="menu-toggle-btn" onClick={() => setSidebarOpen(true)}>
            <i className="fas fa-bars" />
          </button>
          <div className="welcome-text">
            <h1>Welcome back, {escapeHtml(userProfile?.surname || "Officer")}</h1>
            <p>Enugu State Portal &mdash; {userProfile?.rank || ""} &bull; {userProfile?.serviceNumber || ""}</p>
          </div>
        </div>

        <div className="content-wrap">
          <div className="profile-data-grid">
            <div className="data-card">
              <label><i className="fas fa-graduation-cap" /> Enrollments</label>
              <h3>{enrollments.length}</h3>
              <p>Total courses enrolled</p>
            </div>
            <div className="data-card">
              <label><i className="fas fa-spinner" /> Pending Results</label>
              <h3>{pendingResults}</h3>
              <p>Awaiting completion</p>
            </div>
            <div className="data-card">
              <label><i className="fas fa-cake" /> Age</label>
              <h3>{userProfile?.dateOfBirth ? calculateAge(userProfile.dateOfBirth) : "\u2014"}</h3>
              <p>As of today</p>
            </div>
          </div>

          <div className="profile-data-grid">
            <div className="data-card" style={{ gridColumn: "span 2" }}>
              <h3>My Enrollments</h3>
              {enrollments.length === 0 ? (
                <p className="empty-state">No enrollments yet. Register for a course to get started.</p>
              ) : (
                <div className="enrollments-list">
                  {enrollments.map((enr) => (
                    <div key={enr.id} className="enrollment-item">
                      <div className="enrollment-info">
                        <span className="enrollment-course">
                          {escapeHtml(enr.courseName || "Unknown Course")}
                        </span>
                        <span className={getStatusBadge(enr.status)}>
                          {escapeHtml(enr.status)}
                        </span>
                      </div>
                      <span className="enrollment-date">
                        {enr.createdAt ? formatDate(enr.createdAt.toDate()) : ""}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="data-card">
              <h3>Quick Actions</h3>
              <div className="quick-actions">
                <Link to="/events" className="action-btn">Register for Course</Link>
                <Link to="/publications" className="action-btn">View Publications</Link>
                <Link to={`/verify?id=${userProfile?.serviceNumber}`} className="action-btn">My ID Card</Link>
              </div>
            </div>
          </div>

          <div className="profile-data-grid">
            <div className="data-card">
              <h3>Recent Activity</h3>
              {enrollments.length === 0 ? (
                <p className="empty-state">No recent activity.</p>
              ) : (
                <div className="activity-timeline">
                  {enrollments.map((enr) => (
                    <div key={enr.id} className="activity-item">
                      <span className="activity-icon">&#9654;</span>
                      <div className="activity-content">
                        <span className="activity-text">
                          Enrolled in {escapeHtml(enr.courseName || "Unknown Course")}
                        </span>
                        <span className="activity-time">
                          {enr.createdAt ? formatDate(enr.createdAt.toDate()) : ""}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="data-card" style={{ gridColumn: "span 2" }}>
              <h3>Messages {unreadMessages > 0 && <span className="msg-badge">{unreadMessages}</span>}</h3>
              {messages.length === 0 ? (
                <p className="empty-state">No messages yet.</p>
              ) : (
                <div className="messages-list">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`message-item ${!msg.read ? "unread" : ""}`}>
                      <div className="message-subject">
                        {!msg.read && <span className="msg-dot" />}
                        {escapeHtml(msg.subject)}
                      </div>
                      <p className="message-preview">{escapeHtml(truncate(msg.message, 120))}</p>
                      <span className="message-date">
                        {msg.createdAt ? formatDate(msg.createdAt.toDate()) : ""}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="data-card">
            <h3>Profile Information</h3>
            <div className="details-list">
              <div className="detail-item"><strong>Service No:</strong> {escapeHtml(userProfile?.serviceNumber)}</div>
              <div className="detail-item"><strong>State:</strong> {escapeHtml(userProfile?.state)}</div>
              <div className="detail-item"><strong>Area:</strong> {escapeHtml(userProfile?.area)}</div>
              <div className="detail-item"><strong>Department:</strong> {escapeHtml(userProfile?.department)}</div>
              <div className="detail-item"><strong>Blood Group:</strong> {escapeHtml(userProfile?.bloodGroup)}</div>
              <div className="detail-item"><strong>Date of Birth:</strong> {escapeHtml(userProfile?.dateOfBirth)}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
