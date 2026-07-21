import { useState, useEffect } from "react";
import { GOOGLE_SHEETS_API } from "../config/firebase";
import { RANKS, APPOINTMENTS } from "../utils";

const NIGERIA_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT (Abuja)", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

const APPOINTMENT_CATEGORIES = Object.keys(APPOINTMENTS);

const TERMS_TEXT = `C.A.D.E.T.I OFFICER VALIDATION – TERMS AND CONDITIONS

1. DECLARATION: I hereby declare that all information provided in this validation form is true, complete, and accurate.

2. SERVICE NUMBER: I understand that the Service Number assigned is unique and permanent, and shall be used for all official communications and identification within the Corps.

3. IDENTITY VERIFICATION: I consent to identity verification procedures as prescribed by the National Command Council.

4. DATA USE: I authorize the use of my data for official Corps administration, records, and communication purposes.

5. OATH OF ALLEGIANCE: Upon validation, I pledge to uphold the values, objectives, and standards of the Cadet I Corps.

6. AMENDMENTS: The National Command Council reserves the right to amend these terms. Members shall be notified of changes accordingly.

By submitting this form, I confirm my acceptance of all terms and conditions herein.`;

export default function MemberValidation() {
  const [step, setStep] = useState(1);
  const [recId, setRecId] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [recruitData, setRecruitData] = useState<any>(null);

  const [form, setForm] = useState({
    serviceNumber: "",
    state: "",
    area: "",
    intakeYear: "2026",
    serialNumber: "001",
    areaOC: "",
    rank: "",
    appointmentCategory: "None",
    appointment: "None",
    nokName: "",
    nokRelation: "",
    nokPhone: "",
    nokAddress: "",
  });
  const [areas, setAreas] = useState<string[]>([]);
  const [passportData, setPassportData] = useState<string | null>(null);
  const [passportPreview, setPassportPreview] = useState<string | null>(null);
  const [tcOpen, setTcOpen] = useState(false);
  const [timer, setTimer] = useState(15);
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

  const handleSearch = async () => {
    if (!recId.trim()) { setSearchError("Please enter a Recruit ID."); return; }
    setSearching(true);
    setSearchError("");
    setRecruitData(null);
    try {
      const res = await fetch(`${GOOGLE_SHEETS_API}?action=searchRecruit&id=${encodeURIComponent(recId.trim())}`);
      const data = await res.json();
      if (data.error) { setSearchError(data.error); return; }
      setRecruitData(data);
      setForm((prev) => ({
        ...prev,
        state: data.state || "",
        area: data.area || "",
        intakeYear: data.intakeYear || "2026",
      }));
      setStep(2);
    } catch {
      setSearchError("Search failed. Check the ID and try again.");
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passportData) { setError("Please upload a passport photograph."); return; }
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        ...form,
        action: "validateMember",
        recruitId: recId.trim(),
        passportData,
      };
      const res = await fetch(GOOGLE_SHEETS_API, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSuccess(true);
    } catch {
      setError("Validation submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetTc = () => {
    setTcOpen(false);
    setTimer(15);
    setTimerActive(false);
    setAgreed(false);
  };

  if (success) {
    return (
      <div className="overlay">
        <section className="form-section">
          <div className="form-container animate-up">
            <img src="/logo.png" alt="Logo" className="form-logo" />
            <h2>OFFICER VALIDATION</h2>
            <p className="subtitle">Assign Service Number &amp; Verify Identity</p>
            <div className="success-box" style={{ display: "block" }}>
              <h3>Validation Successful!</h3>
              <p>Officer record has been validated and Service Number assigned: <strong>{form.serviceNumber}</strong></p>
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
          <h2>OFFICER VALIDATION</h2>
          <p className="subtitle">Assign Service Number &amp; Verify Identity</p>

          {step === 1 && (
            <div>
              <div className="search-box-container">
                <input
                  placeholder="Enter Recruit ID (e.g. REC-001)"
                  value={recId}
                  onChange={(e) => setRecId(e.target.value)}
                />
                <button id="lookupBtn" onClick={handleSearch} disabled={searching}>
                  {searching ? "..." : "Verify ID"}
                </button>
              </div>
              {searchError && <p style={{ color: "red", fontSize: 12 }}>{searchError}</p>}
            </div>
          )}

          {step === 2 && recruitData && (
            <form onSubmit={handleSubmit}>
              <div className="profile-preview-card">
                <div className="preview-header">Recruit Bio Data</div>
                <p style={{ fontSize: 13, marginBottom: 4 }}><strong>Name:</strong> {recruitData.firstName} {recruitData.surname} {recruitData.otherName || ""}</p>
                <p style={{ fontSize: 13, marginBottom: 4 }}><strong>Phone:</strong> {recruitData.phone}</p>
                <p style={{ fontSize: 13, marginBottom: 4 }}><strong>Email:</strong> {recruitData.email}</p>
                <p style={{ fontSize: 13, marginBottom: 4 }}><strong>State:</strong> {recruitData.state}</p>
                <p style={{ fontSize: 13 }}><strong>Department:</strong> {recruitData.department}</p>
              </div>

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

              <input className="final-number" readOnly value={form.serviceNumber} />

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
                <select required value={form.serialNumber} onChange={update("serialNumber")}>
                  <option value="">Serial *</option>
                  {Array.from({ length: 500 }, (_, i) => String(i + 1).padStart(3, "0")).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <input required placeholder="Area Officer in Charge *" value={form.areaOC} onChange={update("areaOC")} />

              <select required value={form.rank} onChange={update("rank")}>
                <option value="">Select Rank *</option>
                {RANKS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>

              <div className="grid">
                <select value={form.appointmentCategory} onChange={update("appointmentCategory")}>
                  {APPOINTMENT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <select value={form.appointment} onChange={update("appointment")}>
                  {(APPOINTMENTS[form.appointmentCategory] || ["None"]).map((app) => (
                    <option key={app} value={app}>{app}</option>
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
                    <div className="timer-bar" style={{ width: `${((15 - timer) / 15) * 100}%` }} />
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
                    <span className="btn-text">{submitting ? "Validating..." : "Submit Validation"}</span>
                    <span className="spinner" />
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
