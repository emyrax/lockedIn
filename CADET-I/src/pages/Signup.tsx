import { useState, useEffect, useCallback, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth"
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore"
import { auth, db, GOOGLE_SHEETS_API, generateEmail } from "../config/firebase"
import { useAuth } from "../contexts/AuthContext"
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"

const NIGERIA_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT (Abuja)", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
]

const DEPARTMENTS = [
  "Training & Doctrine", "Cadet Police", "Lion Striker Squad",
  "Cadet Special Squad", "Media & Publications", "Admin and Finance",
  "Band", "Medical", "Regular"
]

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
const EDUCATION_LEVELS = ["SSCE", "OND", "HND", "B.Sc", "M.Sc", "PhD", "Other"]
const MARITAL_STATUSES = ["Single", "Married", "Divorced", "Widowed"]
const MAX_IMAGE_SIZE = 2 * 1024 * 1024
const RANKS = [
  "Brigade Commander", "Deputy Brigade Commander", "Assistant Brigade Commander",
  "Commander", "Deputy Commander", "Assistant Commander",
  "Chief Superintendent", "Superintendent", "Deputy Superintendent",
  "Assistant Superintendent I", "Assistant Superintendent II",
  "Inspector", "Deputy Inspector", "Assistant Inspector",
  "Staff Sergeant", "Sergeant", "Corporal", "Lance Corporal", "Private"
]

function getPasswordStrength(pw: string): { label: string; color: string; score: number } {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 2) return { label: "Weak", color: "#ef4444", score }
  if (score <= 3) return { label: "Medium", color: "#f59e0b", score }
  return { label: "Strong", color: "#22c55e", score }
}

async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  )
  if (!res.ok) throw new Error("Upload failed")
  const data = await res.json()
  return data.secure_url
}

export default function Signup() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()

  const [step, setStep] = useState(1)

  const [serviceNumber, setServiceNumber] = useState("")

  const [firstName, setFirstName] = useState("")
  const [surname, setSurname] = useState("")
  const [otherName, setOtherName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [gender, setGender] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [bloodGroup, setBloodGroup] = useState("")
  const [maritalStatus, setMaritalStatus] = useState("")
  const [state, setState] = useState("")
  const [area, setArea] = useState("")
  const [lga, setLga] = useState("")
  const [address, setAddress] = useState("")
  const [department, setDepartment] = useState("")
  const [rank, setRank] = useState("")
  const [occupation, setOccupation] = useState("")
  const [employer, setEmployer] = useState("")
  const [education, setEducation] = useState("")

  const [nokName, setNokName] = useState("")
  const [nokRelation, setNokRelation] = useState("")
  const [nokPhone, setNokPhone] = useState("")
  const [nokAddress, setNokAddress] = useState("")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPass, setShowPass] = useState(false)

  const [passportFile, setPassportFile] = useState<File | null>(null)
  const [signatureFile, setSignatureFile] = useState<File | null>(null)
  const [passportPreview, setPassportPreview] = useState("")
  const [signaturePreview, setSignaturePreview] = useState("")

  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"error" | "success" | "">("")
  const [loading, setLoading] = useState(false)
  const [areas, setAreas] = useState<string[]>([])
  const [snChecking, setSnChecking] = useState(false)
  const objectUrls = useRef<string[]>([])
  const cropImgRef = useRef<HTMLImageElement>(null)

  const [cropSrc, setCropSrc] = useState("")
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()

  useEffect(() => {
    document.body.classList.add("auth-page")
    return () => {
      document.body.classList.remove("auth-page")
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url))
      objectUrls.current = []
    }
  }, [])

  useEffect(() => {
    if (user && profile) {
      navigate("/dashboard", { replace: true })
    }
  }, [user, profile, navigate])

  useEffect(() => {
    if (state) {
      fetch(`${GOOGLE_SHEETS_API}?action=getLocations&state=${encodeURIComponent(state)}`)
        .then((r) => r.json())
        .then((data) => setAreas(data.areas || []))
        .catch(() => setAreas([]))
    } else {
      setAreas([])
    }
  }, [state])

  const strength = getPasswordStrength(password)

  const handlePassportChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_IMAGE_SIZE) {
      setMessage("Passport photo must be less than 2MB.")
      setMessageType("error")
      e.target.value = ""
      return
    }
    setMessage("")
    setMessageType("")
    const reader = new FileReader()
    reader.addEventListener("load", () => {
      setCropSrc(reader.result as string)
    })
    reader.readAsDataURL(file)
  }, [])

  const handleSignatureChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (signaturePreview) URL.revokeObjectURL(signaturePreview)
      const url = URL.createObjectURL(file)
      setSignatureFile(file)
      setSignaturePreview(url)
      objectUrls.current.push(url)
    }
  }, [signaturePreview])

  const handleCropConfirm = useCallback(async () => {
    if (!completedCrop || !cropImgRef.current) return
    const image = cropImgRef.current
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    const canvas = document.createElement("canvas")
    canvas.width = completedCrop.width * scaleX
    canvas.height = completedCrop.height * scaleY
    const ctx = canvas.getContext("2d")!
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0, 0,
      canvas.width, canvas.height
    )
    const blob = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b!), "image/jpeg", 0.95))
    const croppedFile = new File([blob], "passport.jpg", { type: "image/jpeg" })
    setPassportFile(croppedFile)
    setPassportPreview(URL.createObjectURL(croppedFile))
    setCropSrc("")
    setCrop(undefined)
    setCompletedCrop(undefined)
  }, [completedCrop])

  const handleCropCancel = useCallback(() => {
    setCropSrc("")
    setCrop(undefined)
    setCompletedCrop(undefined)
  }, [])

  const SN_REGEX = /^cad\/enu\/nsk\/\d{4}\/\d{3}$/i

  async function handleStep1Submit(e: React.FormEvent) {
    e.preventDefault()
    setMessage("")
    setMessageType("")

    const sn = serviceNumber.trim().toLowerCase()
    if (!sn) {
      setMessage("Official Service Number is required.")
      setMessageType("error")
      return
    }

    if (!SN_REGEX.test(sn)) {
      setMessage("Invalid service number format. Expected: cad/enu/nsk/XXXX/XXX")
      setMessageType("error")
      return
    }

    setSnChecking(true)
    try {
      const q = query(collection(db, "users"), where("serviceNumber", "==", sn))
      const snap = await getDocs(q)
      if (!snap.empty) {
        setMessage("This service number is already registered.")
        setMessageType("error")
        return
      }
      setServiceNumber(sn)
      setStep(2)
    } catch {
      setMessage("Unable to verify service number. Please try again.")
      setMessageType("error")
    } finally {
      setSnChecking(false)
    }
  }

  function handleStep2Submit(e: React.FormEvent) {
    e.preventDefault()
    setMessage("")
    setMessageType("")

    if (!firstName.trim() || !surname.trim()) {
      setMessage("First Name and Surname are required.")
      setMessageType("error")
      return
    }
    if (!phone.trim()) {
      setMessage("Phone number is required.")
      setMessageType("error")
      return
    }
    if (!email.trim()) {
      setMessage("Email address is required.")
      setMessageType("error")
      return
    }
    if (!state) {
      setMessage("Please select your state.")
      setMessageType("error")
      return
    }
    if (!department) {
      setMessage("Please select your department.")
      setMessageType("error")
      return
    }

    setStep(3)
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setMessage("")
    setMessageType("")

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.")
      setMessageType("error")
      return
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.")
      setMessageType("error")
      return
    }

    if (!passportFile) {
      setMessage("Passport photograph is required.")
      setMessageType("error")
      return
    }

    setLoading(true)
    try {
      let passportUrl = ""
      let signatureUrl = ""

      if (passportFile) {
        passportUrl = await uploadToCloudinary(passportFile)
      }
      if (signatureFile) {
        signatureUrl = await uploadToCloudinary(signatureFile)
      }

      const generatedEmail = generateEmail(serviceNumber.trim())
      const userCred = await createUserWithEmailAndPassword(auth, generatedEmail, password)
      const uid = userCred.user.uid
      sendEmailVerification(userCred.user).catch(console.warn)

      try {
        await setDoc(doc(db, "users", uid), {
          serviceNumber: serviceNumber.trim().toLowerCase(),
          firstName: firstName.trim(),
          surname: surname.trim(),
          otherName: otherName.trim(),
          phone: phone.trim(),
          email: email.trim() || generatedEmail,
          gender,
          dateOfBirth,
          bloodGroup,
          maritalStatus,
          rank: rank.trim(),
          state,
          area,
          lga: lga.trim(),
          address: address.trim(),
          department,
          occupation: occupation.trim(),
          employer: employer.trim(),
          education,
          nokName: nokName.trim(),
          nokRelation: nokRelation.trim(),
          nokPhone: nokPhone.trim(),
          nokAddress: nokAddress.trim(),
          passportUrl,
          signatureUrl,
          role: "officer",
          activatedAt: serverTimestamp(),
        })
      } catch {
        await userCred.user.delete().catch(console.warn)
        throw new Error("Profile could not be created. Please try again.")
      }

      setMessage("Portal activated successfully! Redirecting to Command Dashboard...")
      setMessageType("success")
      setTimeout(() => {
        navigate("/dashboard", { replace: true })
      }, 2500)
    } catch (err: any) {
      switch (err.code) {
        case "auth/email-already-in-use":
          setMessage("This Service Number is already registered. Proceed to login.")
          setMessageType("error")
          break
        case "auth/weak-password":
          setMessage("Password too weak. Use a stronger password.")
          setMessageType("error")
          break
        default:
          setMessage(`Activation failed: ${err.message || "Unknown error"}`)
          setMessageType("error")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
    <div className="overlay">
      <div className="form-section">
        <div className="form-container" style={{ maxWidth: 620 }}>
          <img src="/logo.png" alt="CADET-I" className="form-logo" />
          <h2>PORTAL ACTIVATION</h2>
          <p className="subtitle">Initialize your secure officer access</p>

          <div className="step-indicator">
            <div className={`step-dot ${step >= 1 ? "active" : ""}`}>
              <span>1</span>
              <label>Service No</label>
            </div>
            <div className={`step-line ${step >= 2 ? "active" : ""}`} />
            <div className={`step-dot ${step >= 2 ? "active" : ""}`}>
              <span>2</span>
              <label>Profile</label>
            </div>
            <div className={`step-line ${step >= 3 ? "active" : ""}`} />
            <div className={`step-dot ${step >= 3 ? "active" : ""}`}>
              <span>3</span>
              <label>Password</label>
            </div>
          </div>

          {step === 1 && (
            <form onSubmit={handleStep1Submit}>
              <div className="form-section-header">
                <i className="fas fa-id-card" />
                <span>Service Details</span>
              </div>

              <div className="input-group">
                <i className="fas fa-id-card input-icon" />
                <input
                  type="text"
                  required
                  placeholder="Official Service Number * (cad/enu/nsk/XXXX/XXX)"
                  value={serviceNumber}
                  onChange={(e) => setServiceNumber(e.target.value)}
                  disabled={loading}
                />
              </div>

              <button type="submit" id="signupBtn" className={loading || snChecking ? "loading" : ""} disabled={loading || snChecking}>
                <span className="btn-text">{snChecking ? "Checking..." : "Continue"}</span>
                <span className="spinner" />
              </button>

              {message && (
                <div className="status-box" style={messageType === "error" ? { background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" } : { background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }}>
                  {messageType === "success" && <i className="fas fa-check-circle" style={{ marginRight: 8 }} />}
                  {message}
                </div>
              )}

              <div className="auth-footer" style={{ marginTop: 20 }}>
                <p>
                  Already activated? <Link to="/login">Access Portal</Link>
                </p>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleStep2Submit}>
              <div className="form-section-header">
                <i className="fas fa-user" />
                <span>Personal Information</span>
              </div>

              <div className="grid">
                <div className="input-group">
                  <i className="fas fa-user input-icon" />
                  <input required placeholder="First Name *" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={loading} />
                </div>
                <div className="input-group">
                  <i className="fas fa-user input-icon" />
                  <input required placeholder="Surname *" value={surname} onChange={(e) => setSurname(e.target.value)} disabled={loading} />
                </div>
              </div>

              <div className="input-group">
                <i className="fas fa-user-plus input-icon" />
                <input placeholder="Other Name(s)" value={otherName} onChange={(e) => setOtherName(e.target.value)} disabled={loading} />
              </div>

              <div className="grid">
                <div className="input-group">
                  <i className="fas fa-phone input-icon" />
                  <input type="tel" required placeholder="Phone Number *" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={loading} />
                </div>
                <div className="input-group">
                  <i className="fas fa-envelope input-icon" />
                  <input type="email" required placeholder="Email Address *" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
                </div>
              </div>

              <div className="grid">
                <div className="input-group" style={{ flex: 1 }}>
                  <i className="fas fa-venus-mars input-icon" />
                  <select required value={gender} onChange={(e) => setGender(e.target.value)} disabled={loading}>
                    <option value="">Select Gender *</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <i className="fas fa-calendar input-icon" />
                  <input type="date" required placeholder="Date of Birth *" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} disabled={loading} />
                </div>
              </div>

              <div className="grid">
                <div className="input-group" style={{ flex: 1 }}>
                  <i className="fas fa-tint input-icon" />
                  <select required value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} disabled={loading}>
                    <option value="">Blood Group *</option>
                    {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <i className="fas fa-heart input-icon" />
                  <select value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value)} disabled={loading}>
                    <option value="">Marital Status</option>
                    {MARITAL_STATUSES.map((ms) => <option key={ms} value={ms}>{ms}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid">
                <div className="input-group" style={{ flex: 1 }}>
                  <i className="fas fa-tag input-icon" />
                  <select required value={rank} onChange={(e) => setRank(e.target.value)} disabled={loading}>
                    <option value="">Select Rank *</option>
                    {RANKS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-section-header" style={{ marginTop: 24 }}>
                <i className="fas fa-briefcase" />
                <span>Occupation & Education</span>
              </div>

              <div className="grid">
                <div className="input-group" style={{ flex: 1 }}>
                  <i className="fas fa-briefcase input-icon" />
                  <input placeholder="Occupation" value={occupation} onChange={(e) => setOccupation(e.target.value)} disabled={loading} />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <i className="fas fa-building input-icon" />
                  <input placeholder="Employer / Place of Work" value={employer} onChange={(e) => setEmployer(e.target.value)} disabled={loading} />
                </div>
              </div>

              <div className="input-group">
                <i className="fas fa-graduation-cap input-icon" />
                <select value={education} onChange={(e) => setEducation(e.target.value)} disabled={loading}>
                  <option value="">Highest Education Level</option>
                  {EDUCATION_LEVELS.map((el) => <option key={el} value={el}>{el}</option>)}
                </select>
              </div>

              <div className="form-section-header" style={{ marginTop: 24 }}>
                <i className="fas fa-map-marker-alt" />
                <span>Location & Department</span>
              </div>

              <div className="grid">
                <div className="input-group">
                  <i className="fas fa-map input-icon" />
                  <select required value={state} onChange={(e) => setState(e.target.value)} disabled={loading}>
                    <option value="">Select State *</option>
                    {NIGERIA_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <i className="fas fa-location-dot input-icon" />
                  <input required placeholder="Area *" value={area} onChange={(e) => setArea(e.target.value)} disabled={loading} />
                </div>
              </div>

              <div className="grid">
                <div className="input-group" style={{ flex: 1 }}>
                  <i className="fas fa-city input-icon" />
                  <input placeholder="LGA (Local Government Area)" value={lga} onChange={(e) => setLga(e.target.value)} disabled={loading} />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <i className="fas fa-building input-icon" />
                  <select required value={department} onChange={(e) => setDepartment(e.target.value)} disabled={loading}>
                    <option value="">Select Department *</option>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="input-group">
                <i className="fas fa-home input-icon" />
                <input placeholder="Contact Address" value={address} onChange={(e) => setAddress(e.target.value)} disabled={loading} />
              </div>

              <div className="form-section-header" style={{ marginTop: 24 }}>
                <i className="fas fa-users" />
                <span>Next of Kin</span>
              </div>

              <div className="grid">
                <div className="input-group">
                  <i className="fas fa-user-tie input-icon" />
                  <input required placeholder="Full Name *" value={nokName} onChange={(e) => setNokName(e.target.value)} disabled={loading} />
                </div>
                <div className="input-group">
                  <i className="fas fa-link input-icon" />
                  <input required placeholder="Relationship *" value={nokRelation} onChange={(e) => setNokRelation(e.target.value)} disabled={loading} />
                </div>
              </div>

              <div className="grid">
                <div className="input-group">
                  <i className="fas fa-phone input-icon" />
                  <input type="tel" required placeholder="Phone Number *" value={nokPhone} onChange={(e) => setNokPhone(e.target.value)} disabled={loading} />
                </div>
                <div className="input-group">
                  <i className="fas fa-map-pin input-icon" />
                  <input required placeholder="Contact Address *" value={nokAddress} onChange={(e) => setNokAddress(e.target.value)} disabled={loading} />
                </div>
              </div>

              <button type="submit" id="signupBtn" className={loading ? "loading" : ""} disabled={loading}>
                <span className="btn-text">Continue to Password Setup</span>
                <span className="spinner" />
              </button>

              {message && (
                <div className="status-box" style={messageType === "error" ? { background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" } : { background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }}>
                  {messageType === "success" && <i className="fas fa-check-circle" style={{ marginRight: 8 }} />}
                  {message}
                </div>
              )}

              <div className="auth-footer" style={{ marginTop: 20 }}>
                <p>
                  Already activated? <Link to="/login">Access Portal</Link>
                </p>
                <button className="link-btn" onClick={() => { setStep(1); setMessage(""); setMessageType("") }} style={{ marginTop: 8 }}>
                  &larr; Back to Service Number
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleSignup}>
              <div className="form-section-header">
                <i className="fas fa-lock" />
                <span>Set Password</span>
              </div>

              <div className="grid">
                <div className="input-group">
                  <i className="fas fa-key input-icon" />
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    placeholder="Create Password * (min 8 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="input-group">
                  <i className="fas fa-check-circle input-icon" />
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    placeholder="Confirm Password *"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {password && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: "#666" }}>Password strength</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: strength.color }}>{strength.label}</span>
                  </div>
                  <div style={{ background: "#eee", borderRadius: 6, height: 6, overflow: "hidden" }}>
                    <div style={{ width: `${(strength.score / 5) * 100}%`, background: strength.color, height: "100%", borderRadius: 6, transition: "all 0.3s" }} />
                  </div>
                </div>
              )}

              <div className="show-pass-row">
                <label>
                  <input type="checkbox" checked={showPass} onChange={() => setShowPass(!showPass)} />
                  <span>Show passwords</span>
                </label>
              </div>

              <div className="form-section-header" style={{ marginTop: 24 }}>
                <i className="fas fa-camera" />
                <span>Upload Documents</span>
              </div>

              <div className="upload-grid">
                <div className="upload-box">
                  <label className="upload-box-label">Passport Photograph</label>
                  <div className="upload-preview" onClick={() => document.getElementById("passportInput")?.click()}>
                    {passportPreview ? (
                      <img src={passportPreview} alt="Passport" />
                    ) : (
                      <div className="upload-placeholder">
                        <i className="fas fa-camera" />
                        <span>Click to upload</span>
                      </div>
                    )}
                  </div>
                  <input id="passportInput" type="file" accept="image/*" hidden onChange={handlePassportChange} disabled={loading} />
                  <span className="input-hint">Passport photograph (uniform, white background)</span>
                </div>

                <div className="upload-box">
                  <label className="upload-box-label">Signature</label>
                  <div className="upload-preview" onClick={() => document.getElementById("signatureInput")?.click()}>
                    {signaturePreview ? (
                      <img src={signaturePreview} alt="Signature" />
                    ) : (
                      <div className="upload-placeholder">
                        <i className="fas fa-pen" />
                        <span>Click to upload</span>
                      </div>
                    )}
                  </div>
                  <input id="signatureInput" type="file" accept="image/*" hidden onChange={handleSignatureChange} disabled={loading} />
                  <span className="input-hint">Clear signature on white paper</span>
                </div>
              </div>

              <button type="submit" id="signupBtn" className={loading ? "loading" : ""} disabled={loading}>
                <span className="btn-text">{loading ? "ACTIVATING..." : "ACTIVATE PORTAL"}</span>
                <span className="spinner" />
              </button>

              {message && (
                <div className={`status-box ${messageType === "success" ? "success-box-inline" : ""}`}
                  style={messageType === "success"
                    ? { background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }
                    : { background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" }
                  }
                >
                  {messageType === "success" && <i className="fas fa-check-circle" style={{ marginRight: 8 }} />}
                  {message}
                </div>
              )}

              <div className="auth-footer" style={{ marginTop: 20 }}>
                <p>
                  Already activated? <Link to="/login">Access Portal</Link>
                </p>
                <button className="link-btn" onClick={() => { setStep(2); setMessage(""); setMessageType("") }} style={{ marginTop: 8 }}>
                  &larr; Back to Profile
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>

      {cropSrc && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, maxWidth: 520, width: "100%", textAlign: "center" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 18 }}>Crop Passport Photo</h3>
            <p style={{ fontSize: 13, color: "#666", marginBottom: 12 }}>Adjust the crop area to 1:1 square, then confirm.</p>
            <div style={{ maxHeight: "55vh", overflow: "hidden", borderRadius: 8 }}>
              <ReactCrop
                crop={crop}
                onChange={c => setCrop(c)}
                onComplete={c => setCompletedCrop(c)}
                aspect={1}
                minWidth={100}
              >
                <img ref={cropImgRef} src={cropSrc} style={{ maxHeight: "50vh", width: "100%", objectFit: "contain" }} alt="Crop" />
              </ReactCrop>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "center" }}>
              <button type="button" style={{ padding: "10px 24px", background: "#078f3b", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14 }} onClick={handleCropConfirm}>
                Crop & Confirm
              </button>
              <button type="button" style={{ padding: "10px 24px", background: "#888", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 14 }} onClick={handleCropCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
