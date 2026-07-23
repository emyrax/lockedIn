import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  collection, query, where, getDocs
} from "firebase/firestore";
import { db } from "../config/firebase";
import { escapeHtml, formatDate, getGoogleDriveUrl } from "../utils";

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

function InfoBlock({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="v-info-block">
      <span className="v-label">{label}</span>
      <span className="v-value">{escapeHtml(value)}</span>
    </div>
  );
}

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="v-section">
      <h3 className="v-section-title">{title}</h3>
      <div className="v-section-grid">{children}</div>
    </div>
  );
}

function OfficerProfile({ officer, courses, serviceNumber }: { officer: any; courses: any[]; serviceNumber: string }) {
  const passportSrc = officer.passportUrl || officer.passportURL || "";
  const signatureSrc = officer.signatureUrl || "";
  const { src: imgSrc, handleError } = useImageFallback(passportSrc);
  const { src: sigSrc, handleError: sigError } = useImageFallback(signatureSrc);

  return (
    <main className="verify-shell">
      <div className="verify-card">
        <div className="verify-inner">
          <header className="verify-header">
            <img src="/logo.png" alt="CADETI logo" />
            <h1>COMMUNITY AMBASSADOR FOR DEVELOPMENTAL AND ENGAGEMENT TECHNIQUES INITIATIVE</h1>
          </header>

          <div className="verify-banner">ID VERIFIED</div>

          <div className="v-photo-row">
            <div className="verify-passport">
              {passportSrc ? (
                <img src={imgSrc} alt="Passport" onError={handleError} />
              ) : (
                <span>NO PHOTO</span>
              )}
            </div>
            {signatureSrc && (
              <div className="v-signature">
                <img src={sigSrc} alt="Signature" onError={sigError} />
              </div>
            )}
          </div>

          <div className="v-badge-row">
            <span className="v-rank-badge">{escapeHtml(officer.rank || "")}</span>
            <span className="v-sn-badge">{escapeHtml(serviceNumber)}</span>
          </div>

          <div className="v-full-name">
            {escapeHtml(`${officer.firstName || ""} ${officer.surname || ""}${officer.otherName ? ` ${officer.otherName}` : ""}`)}
          </div>

          <ProfileSection title="Personal Information">
            <InfoBlock label="Surname" value={officer.surname} />
            <InfoBlock label="First Name" value={officer.firstName} />
            <InfoBlock label="Other Name" value={officer.otherName} />
            <InfoBlock label="Gender" value={officer.gender} />
            <InfoBlock label="Date of Birth" value={officer.dateOfBirth} />
            <InfoBlock label="Blood Group" value={officer.bloodGroup} />
            <InfoBlock label="Marital Status" value={officer.maritalStatus} />
          </ProfileSection>

          <ProfileSection title="Contact">
            <InfoBlock label="Phone" value={officer.phone} />
            <InfoBlock label="Email" value={officer.email} />
            <InfoBlock label="Address" value={officer.address} />
          </ProfileSection>

          <ProfileSection title="Service Details">
            <InfoBlock label="Service Number" value={officer.serviceNumber} />
            <InfoBlock label="Rank" value={officer.rank} />
            <InfoBlock label="Department" value={officer.department} />
            <InfoBlock label="Post Held" value={officer.postHeld} />
            <InfoBlock label="Appointment" value={officer.appointment} />
            <InfoBlock label="State" value={officer.state} />
            <InfoBlock label="Area" value={officer.area} />
            <InfoBlock label="Zone" value={officer.zone} />
            <InfoBlock label="Commander" value={officer.commander} />
            <InfoBlock label="LGA" value={officer.lga} />
          </ProfileSection>

          <ProfileSection title="Professional">
            <InfoBlock label="Occupation" value={officer.occupation} />
            <InfoBlock label="Employer" value={officer.employer} />
            <InfoBlock label="Education" value={officer.education} />
          </ProfileSection>

          <ProfileSection title="Next of Kin">
            <InfoBlock label="Name" value={officer.nokName} />
            <InfoBlock label="Relation" value={officer.nokRelation} />
            <InfoBlock label="Phone" value={officer.nokPhone} />
            <InfoBlock label="Address" value={officer.nokAddress} />
          </ProfileSection>

          {(officer.bloodGroup || officer.genotype || officer.allergies || officer.medicalConditions || officer.emergencyPhone) && (
            <div className="v-section v-section-emergency">
              <h3 className="v-section-title v-title-emergency">
                <i className="fas fa-exclamation-triangle" style={{ marginRight: 6 }}></i>
                IN CASE OF EMERGENCY
              </h3>
              <div className="v-section-grid">
                {officer.bloodGroup && (
                  <div className="v-info-block">
                    <span className="v-label">Blood Group</span>
                    <span className="v-value v-value-emerg">{escapeHtml(officer.bloodGroup)}</span>
                  </div>
                )}
                {officer.genotype && (
                  <div className="v-info-block">
                    <span className="v-label">Genotype</span>
                    <span className="v-value v-value-emerg">{escapeHtml(officer.genotype)}</span>
                  </div>
                )}
                {officer.allergies && (
                  <div className="v-info-block">
                    <span className="v-label">Allergies</span>
                    <span className="v-value">{escapeHtml(officer.allergies)}</span>
                  </div>
                )}
                {officer.medicalConditions && (
                  <div className="v-info-block">
                    <span className="v-label">Medical Conditions</span>
                    <span className="v-value">{escapeHtml(officer.medicalConditions)}</span>
                  </div>
                )}
                {officer.emergencyPhone && (
                  <div className="v-info-block" style={{ gridColumn: "1 / -1" }}>
                    <span className="v-label">Emergency Phone</span>
                    <span className="v-value">{escapeHtml(officer.emergencyPhone)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {courses.length > 0 && (
            <div className="v-section">
              <h3 className="v-section-title">Completed Courses</h3>
              <div className="course-badges">
                {courses.map(c => (
                  <div key={c.id} className="course-badge">
                    {c.badgeUrl && (
                      <img src={getGoogleDriveUrl(c.badgeUrl)} alt={c.title} />
                    )}
                    <span>{escapeHtml(c.title)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="v-footer">
            <p>Verified via CADET-I Digital Verification System</p>
            <p className="v-stamp">{formatDate(new Date().toISOString())}</p>
          </div>
        </div>
      </div>
    </main>
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
        const q = query(collection(db, "users"), where("serviceNumber", "==", serviceNumber));
        const snap = await getDocs(q);
        if (cancelled) return;

        if (snap.empty) {
          setError("Officer record not found.");
          setLoading(false);
          return;
        }

        const doc = snap.docs[0];
        const data = { id: doc.id, ...doc.data() };
        setOfficer(data);

        const uid = doc.id;
        const sn = data.serviceNumber || serviceNumber;

        const enrollQuery = query(
          collection(db, "enrollments"),
          where("status", "==", "completed"),
          where("officerUID", "in", [uid, sn])
        );
        const enrollSnap = await getDocs(enrollQuery);
        const courseIds: string[] = [];
        enrollSnap.forEach(e => { if (e.data().courseID) courseIds.push(e.data().courseID); });

        if (courseIds.length > 0) {
          const coursesSnap = await getDocs(collection(db, "courses"));
          const matched: any[] = [];
          coursesSnap.forEach(c => { if (courseIds.includes(c.id)) matched.push({ id: c.id, ...c.data() }); });
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

    return () => { cancelled = true; };
  }, [serviceNumber]);

  if (loading) {
    return (
      <main className="verify-shell">
        <div className="verify-card">
          <div className="verify-inner">
            <div className="v-loading">
              <div className="spinner" style={{ borderColor: "#078f3b40", borderTopColor: "#078f3b", width: 32, height: 32, margin: "0 auto 16px" }}></div>
              <p>Loading officer verification...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="verify-shell">
        <div className="verify-card verify-card-error">
          <div className="verify-inner">
            <div className="v-notfound">
              <i className="fas fa-exclamation-triangle" style={{ fontSize: 48, color: "#e0271e", marginBottom: 16 }}></i>
              <h2>Not Found</h2>
              <p>No officer record matches the provided service number.</p>
              <div className="v-sn-display">{escapeHtml(serviceNumber)}</div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!officer) return null;

  return <OfficerProfile officer={officer} courses={courses} serviceNumber={serviceNumber} />;
}
