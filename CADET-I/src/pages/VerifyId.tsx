import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, GOOGLE_SHEETS_API } from "../config/firebase";
import { escapeHtml, getGoogleDriveUrl } from "../utils";

function buildCandidates(url: string): string[] {
  return [
    getGoogleDriveUrl(url),
    url.replace(/thumbnail\?id=([^&]+)/, (_, id) =>
      `uc?id=${id}&export=download`
    ),
    url,
    "/logo.png",
  ];
}

function useImageFallback(url: string) {
  const candidates = buildCandidates(url);
  const [src, setSrc] = useState(candidates[0]);
  const [attempt, setAttempt] = useState(0);

  const handleError = () => {
    const next = attempt + 1;
    if (next < candidates.length) {
      setAttempt(next);
      setSrc(candidates[next]);
    }
  };

  useEffect(() => {
    setAttempt(0);
    setSrc(candidates[0]);
  }, [url]);

  return { src, handleError };
}

function CourseBadge({ course }: { course: any }) {
  const badgeUrl = course.badgeUrl || "";
  const { src, handleError } = badgeUrl ? useImageFallback(badgeUrl) : { src: "", handleError: () => {} };
  return (
    <div className="course-badge">
      {badgeUrl ? (
        <img src={src} alt={course.title} onError={handleError} />
      ) : null}
      <span>{escapeHtml(course.title)}</span>
    </div>
  );
}

export default function VerifyId() {
  const [searchParams] = useSearchParams();
  const serviceNumber =
    searchParams.get("sn") || searchParams.get("serviceNumber") || "";

  const [officer, setOfficer] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!serviceNumber) {
      setLoading(false);
      setError("Missing service number.");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(
          `${GOOGLE_SHEETS_API}?action=searchByServiceNumber&serviceNumber=${encodeURIComponent(serviceNumber)}`
        );
        const data = await res.json();

        if (cancelled) return;

        if (data.error || !data || Object.keys(data).length === 0) {
          setError("Officer record not found.");
          setLoading(false);
          return;
        }

        setOfficer(data);

        const uniqueID = data.uniqueID || "";
        const sn = data.serviceNumber || serviceNumber;

        const enrollmentsQuery = query(
          collection(db, "enrollments"),
          where("status", "==", "completed"),
          where("officerUID", "in", uniqueID ? [uniqueID, sn] : [sn])
        );

        const enrollSnapshot = await getDocs(enrollmentsQuery);
        const courseIds: string[] = [];

        enrollSnapshot.forEach((doc) => {
          const d = doc.data();
          if (d.courseID) courseIds.push(d.courseID);
        });

        if (courseIds.length > 0) {
          const coursesSnapshot = await getDocs(collection(db, "courses"));
          const matched: any[] = [];
          coursesSnapshot.forEach((doc) => {
            if (courseIds.includes(doc.id)) {
              matched.push({ id: doc.id, ...doc.data() });
            }
          });
          if (!cancelled) setCourses(matched);
        }

        if (!cancelled) setLoading(false);
      } catch {
        if (!cancelled) {
          setError("Officer record not found.");
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [serviceNumber]);

  if (loading) {
    return (
      <main className="verify-shell">
        <div className="verify-card">
          <div className="verify-inner">
            <p className="verify-state">Loading officer verification...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="verify-shell">
        <div className="verify-card">
          <div className="verify-inner">
            <p className="verify-state">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  const passportSrc = officer.passportUrl || officer.passportURL || "";
  const { src: imgSrc, handleError } = useImageFallback(passportSrc);

  const surname = escapeHtml(officer.surname || "");
  const firstName = escapeHtml(officer.firstName || "");
  const rank = escapeHtml(officer.rank || "");

  return (
    <main className="verify-shell">
      <section className="verify-card">
        <div className="verify-inner">
          <header className="verify-header">
            <img src="/logo.png" alt="CADETI logo" />
            <h1>COMMUNITY AMBASSADOR FOR DEVELOPMENTAL AND ENGAGEMENT TECHNIQUES INITIATIVE</h1>
          </header>

          <div className="verify-banner">ID VERIFIED</div>

          <div className="verify-passport">
            {passportSrc ? (
              <img src={imgSrc} alt="Passport" onError={handleError} />
            ) : (
              <span>NO PHOTO</span>
            )}
          </div>

          <div className="verify-details">
            <div className="verify-row">
              <strong>SERVICE NO:</strong>
              <span>{escapeHtml(serviceNumber)}</span>
            </div>
            <div className="verify-row">
              <strong>RANK:</strong>
              <span>{rank}</span>
            </div>
            <div className="verify-row">
              <strong>NAME:</strong>
              <span>{rank} {surname} {firstName}</span>
            </div>
          </div>

          <section className="course-strip">
            <h2>APPROVED COURSES</h2>
            <div className="course-badges">
              {courses.length > 0 ? (
                courses.map((course) => (
                  <CourseBadge key={course.id} course={course} />
                ))
              ) : (
                <span style={{ gridColumn: "1 / -1", fontSize: 11, color: "#666" }}>
                  No approved courses yet.
                </span>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
