import { useState, useEffect } from "react";
import { GOOGLE_SHEETS_API } from "../config/firebase";
import { RANKS, DEPARTMENTS, APPOINTMENTS } from "../utils";

const NIGERIA_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT (Abuja)", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

const APPOINTMENT_CATEGORIES = Object.keys(APPOINTMENTS);

const TERMS_TEXT = `C.A.D.E.T.I OFFICER REVALIDATION – TERMS AND CONDITIONS

1. DECLARATION: I hereby declare that all information provided in this revalidation form is true, complete, and accurate to the best of my knowledge.

2. DATA UPDATE: I confirm that my personal details, contact information, and service records are up to date.

3. SERVICE NUMBER: I acknowledge that my Service Number remains unique and permanent throughout my membership in the Corps.

4. PASSPORT COMPLIANCE: I confirm that the uploaded passport photograph meets the prescribed standards (uniform on a white background).

5. DATA CONSENT: I consent to the storage and processing of my updated data for official Corps administration.

6. CODE OF CONDUCT: I reaffirm my commitment to abide by the C.A.D.E.T.I Code of Conduct and all regulations governing the Corps.

7. AMENDMENTS: The National Command Council reserves the right to amend these terms. Members shall be notified of changes.

By submitting this form, I confirm my acceptance of all terms and conditions herein.`;

export default function MemberRevalidation() {
  const [form, setForm] = useState({
    category: "Revalidation",
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
    serviceNumber: "",
    rank: "",
    department: "",
    postCategory: "None",
    postHeld: "None",
    intakeYear: "2026",
    serialNumber: "001",
    areaOC: "",
    nokName: "",
    nokRelation: "",
    nokPhone: "",
    nokAddress: "",
  });
  const [areas, setAreas] = useState<string[]>([]);
  const [passportData, setPassportData] = useState<string | null>(null);
  const [passportPreview, setPassportPreview] = useState<string | null>(null);
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

  useEffect(() => {
    const state = form.state ? form.state.substring(0, 3).toUpperCase() : "STT";
    const area = form.area ? form.area.substring(0, 4).toUpperCase() : "AREA";
    const sn = form.serialNumber.padStart(3, "0");
    setForm((prev) => ({
      ...prev,
      serviceNumber: `CAD/${state}/${area}/${form.intakeYear}/${sn}`,
    }));
  }, [form.state, form.area, form.intakeYear, form.serialNumber]);

  const update = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
        body: JSON.stringify({ ...form, passportData, action: "revalidateMember" }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSuccess(true);
    } catch {
      setError("Revalidation submission failed. Please try again.");
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
            <h2>C.A.D.E.T.I DATABASE DRIVE 2026</h2>
            <p className="subtitle">Official Officer Revalidation Portal</p>
            <div className="success-box" style={{ display: "block" }}>
              <h3>Revalidation Successful!</h3>
              <p>Your records have been updated successfully. Thank you for participating in the C.A.D.E.T.I Database Drive 2026.</p>
            </div>
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
          <h2>C.A.D.E.T.I DATABASE DRIVE 2026</h2>
          <p className="subtitle">Official Officer Revalidation Portal</p>

          <form id="revalidationForm" onSubmit={handleSubmit}>
            <input type="hidden" name="category" value="Revalidation" />

            <input className="final-number" readOnly value={form.serviceNumber} />

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
              <input required placeholder="Area Officer in Charge *" value={form.areaOC} onChange={update("areaOC")} />
              <select required value={form.rank} onChange={update("rank")}>
                <option value="">Select Rank *</option>
                {RANKS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="grid">
              <select required value={form.department} onChange={update("department")}>
                <option value="">Select Department *</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <select required value={form.intakeYear} onChange={update("intakeYear")}>
                <option value="2026">2026</option>
              </select>
            </div>

            <div className="grid">
              <select value={form.postCategory} onChange={update("postCategory")}>
                {APPOINTMENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select value={form.postHeld} onChange={update("postHeld")}>
                {(APPOINTMENTS[form.postCategory] || ["None"]).map((app) => (
                  <option key={app} value={app}>{app}</option>
                ))}
              </select>
            </div>

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
              <select required value={form.serialNumber} onChange={update("serialNumber")}>
                <option value="">Serial *</option>
                {Array.from({ length: 500 }, (_, i) => String(i + 1).padStart(3, "0")).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
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
                    I have read and agree to the Terms &amp; Conditions.
                  </label>
                </div>
                {error && <p style={{ color: "red", fontSize: 12, marginTop: 8 }}>{error}</p>}
                <button type="submit" disabled={!agreed || submitting} className={submitting ? "loading" : ""}>
                  <span className="btn-text">{submitting ? "Submitting..." : "Submit Revalidation"}</span>
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
