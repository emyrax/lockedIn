import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { GOOGLE_SHEETS_API } from "../config/firebase";

const NIGERIA_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT (Abuja)", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

const DEPARTMENTS = [
  "Training & Doctrine", "Cadet Police", "Lion Striker Squad",
  "Cadet Special Squad", "Media & Publications", "Admin and Finance",
  "Band", "Medical", "Regular"
];

const TERMS_TEXT = `C.A.D.E.T.I OFFICER ENROLLMENT – TERMS AND CONDITIONS

1. ELIGIBILITY: By submitting this application, you confirm that you meet all eligibility requirements for enrollment into the Cadet I Corps as prescribed by the National Command Council.

2. ACCURACY OF INFORMATION: You certify that all information provided in this application is true, complete, and accurate to the best of your knowledge. Any false or misleading information may result in immediate disqualification or dismissal.

3. PASSPORT REQUIREMENT: You confirm that the passport photograph uploaded meets the specified requirements (uniform on a white background). Non-compliant photographs will result in application rejection.

4. BACKGROUND VERIFICATION: You authorize the Cadet I Corps to conduct background verification checks. You agree to provide any additional documentation requested to support this process.

5. CODE OF CONDUCT: Upon enrollment, you agree to abide by the C.A.D.E.T.I Code of Conduct, Standing Orders, and all regulations governing the Corps.

6. DATA PRIVACY: You consent to the collection, storage, and processing of your personal data for official Corps purposes in accordance with the Data Protection Policy.

7. SERVICE COMMITMENT: Enrolled members are expected to commit to their duties, training, and responsibilities as assigned by the Corps Command structure.

8. AMENDMENTS: The National Command Council reserves the right to amend these terms and conditions as deemed necessary. Members will be notified of any material changes.

By agreeing and submitting this form, you acknowledge that you have read, understood, and accepted all the above terms and conditions.`;

export default function RecruitReg() {
  const [form, setForm] = useState({
    category: "Recruit",
    firstName: "",
    surname: "",
    otherName: "",
    address: "",
    occupation: "",
    phone: "",
    gender: "",
    email: "",
    state: "",
    area: "",
    intakeYear: "2026",
    department: "",
    nokName: "",
    nokRelation: "",
    nokPhone: "",
    nokAddress: "",
  });
  const [passportData, setPassportData] = useState<string | null>(null);
  const [passportPreview, setPassportPreview] = useState<string | null>(null);
  const [areas, setAreas] = useState<string[]>([]);
  const [tcOpen, setTcOpen] = useState(false);
  const [timer, setTimer] = useState(10);
  const [timerActive, setTimerActive] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!tcOpen || timerActive) return;
    if (timer <= 0) return;
    setTimerActive(true);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [tcOpen, timerActive, timer]);

  useEffect(() => {
    if (form.state) {
      fetch(`${GOOGLE_SHEETS_API}?action=getLocations&state=${encodeURIComponent(form.state)}`)
        .then((r) => r.json())
        .then((data) => setAreas(data.areas || []))
        .catch(() => setAreas([]));
    } else {
      setAreas([]);
    }
  }, [form.state]);

  const update = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handlePassport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPassportPreview(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onloadend = () => setPassportData(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passportData) { setError("Please upload a passport photograph."); return; }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(GOOGLE_SHEETS_API, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ ...form, passportData }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSuccess(true);
    } catch {
      setError("Submission failed. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetTc = () => {
    setTcOpen(false);
    setTimer(10);
    setTimerActive(false);
    setAgreed(false);
  };

  if (success) {
    return (
      <div className="overlay">
        <section className="form-section">
          <div className="form-container animate-up">
            <img src="/logo.png" alt="Logo" className="form-logo" />
            <h2>RECRUIT ENROLLMENT 2026</h2>
            <p className="subtitle">New Member Application Portal</p>
            <div className="success-box" style={{ display: "block" }}>
              <h3>Application Submitted!</h3>
              <p>Your enrollment application has been received successfully. You will be contacted via the email address provided for further instructions.</p>
            </div>
            <Link to="/" style={{ color: "#004d00", fontWeight: 700, fontSize: 13, display: "inline-block", marginTop: 20 }}>Return to Home</Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="overlay">
      <section className="form-section">
        <div className="form-container animate-up">
          <img src="/logo.png" alt="Logo" className="form-logo" />
          <h2>RECRUIT ENROLLMENT 2026</h2>
          <p className="subtitle">New Member Application Portal</p>

          <form id="recruitForm" onSubmit={handleSubmit}>
            <input type="hidden" name="category" value="Recruit" />

            <div className="passport-upload-container">
              <div className="passport-preview">
                {passportPreview ? (
                  <img src={passportPreview} alt="Passport" />
                ) : (
                  <>
                    <i className="fas fa-user" />
                    <span>Photo</span>
                  </>
                )}
              </div>
              <div>
                <label className="upload-btn">
                  Upload Passport
                  <input type="file" accept="image/*" onChange={handlePassport} hidden />
                </label>
                <p className="upload-hint">Must be in UNIFORM on a WHITE BACKGROUND.</p>
              </div>
            </div>

            <div className="grid">
              <input required placeholder="First Name *" value={form.firstName} onChange={update("firstName")} />
              <input required placeholder="Surname *" value={form.surname} onChange={update("surname")} />
            </div>

            <input placeholder="Other Name(s)" value={form.otherName} onChange={update("otherName")} />

            <input required placeholder="Home / Contact Address *" value={form.address} onChange={update("address")} />

            <input required placeholder="Occupation *" value={form.occupation} onChange={update("occupation")} />

            <div className="grid">
              <input type="tel" required placeholder="Phone Number *" value={form.phone} onChange={update("phone")} />
              <div className="gender-wrapper">
                <span className="gender-label">Gender:</span>
                <div className="gender-options">
                  <label><input type="radio" name="gender" value="Male" checked={form.gender === "Male"} onChange={update("gender")} /> Male</label>
                  <label><input type="radio" name="gender" value="Female" checked={form.gender === "Female"} onChange={update("gender")} /> Female</label>
                </div>
              </div>
            </div>

            <input type="email" required placeholder="Email Address *" value={form.email} onChange={update("email")} />

            <div className="grid">
              <select required value={form.state} onChange={update("state")}>
                <option value="">Select State *</option>
                {NIGERIA_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select required value={form.area} onChange={update("area")}>
                <option value="">Select Area *</option>
                {areas.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <div className="grid">
              <select required value={form.intakeYear} onChange={update("intakeYear")}>
                <option value="2026">2026</option>
              </select>
              <select required value={form.department} onChange={update("department")}>
                <option value="">Select Department *</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="nok-section">
              <h3>Next of Kin / Emergency Contact</h3>
              <input required placeholder="Full Name *" value={form.nokName} onChange={update("nokName")} />
              <input required placeholder="Relationship *" value={form.nokRelation} onChange={update("nokRelation")} />
              <input type="tel" required placeholder="Phone Number *" value={form.nokPhone} onChange={update("nokPhone")} />
              <input required placeholder="Contact Address *" value={form.nokAddress} onChange={update("nokAddress")} />
            </div>

            {!tcOpen && (
              <p style={{ marginTop: 20, fontSize: 13, fontWeight: 600 }}>
                <a href="#" onClick={(e) => { e.preventDefault(); setTcOpen(true); }} style={{ color: "#0b3d91" }}>
                  Read Terms &amp; Conditions to Submit
                </a>
              </p>
            )}

            {tcOpen && (
              <div style={{ marginTop: 20 }}>
                <div className="tc-scroll-box">
                  <pre style={{ fontFamily: "Poppins, sans-serif", whiteSpace: "pre-wrap", margin: 0 }}>{TERMS_TEXT}</pre>
                </div>
                <div className="timer-bar-wrap">
                  <div className="timer-bar" style={{ width: `${((10 - timer) / 10) * 100}%` }} />
                </div>
                <p className="timer-label">{timer > 0 ? `Please wait ${timer}s to agree...` : "You may now agree to the terms."}</p>
                <div className="agree-row-checkbox">
                  <input type="checkbox" id="agreeTc" disabled={timer > 0} checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                  <label className="agree-text" htmlFor="agreeTc">
                    I have read and agree to the Terms &amp; Conditions and Privacy Policy.
                  </label>
                </div>
                {error && <p style={{ color: "red", fontSize: 12, marginTop: 8 }}>{error}</p>}
                <button type="submit" disabled={!agreed || submitting} className={submitting ? "loading" : ""}>
                  <span className="btn-text">{submitting ? "Submitting..." : "Submit Application"}</span>
                  <span className="spinner" />
                </button>
              </div>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}
