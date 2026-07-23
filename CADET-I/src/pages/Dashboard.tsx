import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db, auth, GOOGLE_SHEETS_API } from "../config/firebase";
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

  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/login");
  }, [logout, navigate]);

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

    fetchData();
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

  const getStatusBadge = (status: string) => {
    const base = "badge badge-";
    switch (status) {
      case "active": return base + "active";
      case "completed": return base + "completed";
      case "pending": return base + "pending";
      default: return base + "default";
    }
  };

  return (
    <main className="portal-shell">
      <section className="portal-hero">
        <div className="container">
          <div className="portal-greeting">
            <h1>Welcome back, {escapeHtml(userProfile?.surname || "Officer")}</h1>
            <p className="portal-greeting-sub">
              National Portal — {userProfile?.rank || ""} &bull; {userProfile?.serviceNumber || ""}
            </p>
          </div>
          <div className="portal-stats">
            <div className="stat-card">
              <span className="stat-number">{enrollments.length}</span>
              <span>Enrollments</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{pendingResults}</span>
              <span>Results</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{userProfile?.dateOfBirth ? calculateAge(userProfile.dateOfBirth) : "\u2014"}</span>
              <span>Age</span>
            </div>
          </div>
        </div>
      </section>

      <section className="portal-main section-padding">
        <div className="container">
          <div className="portal-grid">
            <div className="portal-card profile-card">
              <div className="profile-photo">
                <img
                  src={getGoogleDriveUrl(userProfile?.passportUrl) || "/logo.png"}
                  alt="Passport"
                />
              </div>
              <div className="profile-info">
                <h2 className="profile-name">
                  {escapeHtml(userProfile?.surname)} {escapeHtml(userProfile?.firstName)}
                </h2>
                <p className="profile-rank">{userProfile?.rank || ""}</p>
                <div className="profile-details">
                  <div><strong>Service No:</strong> {escapeHtml(userProfile?.serviceNumber)}</div>
                  <div><strong>State:</strong> {escapeHtml(userProfile?.state)}</div>
                  <div><strong>Area:</strong> {escapeHtml(userProfile?.area)}</div>
                  <div><strong>Department:</strong> {escapeHtml(userProfile?.department)}</div>
                </div>
              </div>
            </div>

            <div className="portal-card enrollments-card">
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

            <div className="portal-card quick-actions-card">
              <h3>Quick Actions</h3>
              <div className="quick-actions">
                <Link to="/events" className="action-btn">Register for Course</Link>
                <Link to="/publications" className="action-btn">View Publications</Link>
                <Link to={`/verify?id=${userProfile?.serviceNumber}`} className="action-btn">My ID Card</Link>
                <button onClick={handleLogout} className="action-btn logout-btn">Logout</button>
              </div>
            </div>

            <div className="portal-card activity-card">
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
          </div>
        </div>
      </section>
    </main>
  );
}
