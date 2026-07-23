import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { auth, db, GOOGLE_SHEETS_API, generateEmail } from "../config/firebase"
import { useAuth } from "../contexts/AuthContext"

export default function Login() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [loginUser, setLoginUser] = useState("")
  const [loginPass, setLoginPass] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [guardLoading, setGuardLoading] = useState(true)
  const [showPass, setShowPass] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [fpServiceNum, setFpServiceNum] = useState("")
  const [fpStep, setFpStep] = useState(1)
  const [fpOfficerName, setFpOfficerName] = useState("")
  const [fpContactEmail, setFpContactEmail] = useState("")
  const [fpLoading, setFpLoading] = useState(false)
  const [fpMessage, setFpMessage] = useState("")
  const [fpMessageType, setFpMessageType] = useState<"error" | "success" | "">("")

  useEffect(() => {
    document.body.classList.add("auth-page")
    return () => document.body.classList.remove("auth-page")
  }, [])

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true })
    } else {
      setGuardLoading(false)
    }
  }, [user, navigate])

  function resetForgotPassword() {
    setShowModal(false)
    setFpStep(1)
    setFpServiceNum("")
    setFpOfficerName("")
    setFpContactEmail("")
    setFpLoading(false)
    setFpMessage("")
    setFpMessageType("")
  }

  async function handleVerifyRecord() {
    if (!fpServiceNum.trim()) {
      setFpMessage("Enter your service number.")
      setFpMessageType("error")
      return
    }
    setFpLoading(true)
    setFpMessage("")
    setFpMessageType("")
    try {
      const res = await fetch(
        `${GOOGLE_SHEETS_API}?action=searchByServiceNumber&serviceNumber=${encodeURIComponent(fpServiceNum.trim())}`
      )
      const data = await res.json()
      if (data.found && data.name) {
        setFpOfficerName(data.name)
        setFpContactEmail(data.email || "")
        setFpStep(2)
        setFpMessage("")
      } else {
        setFpMessage("Service number not found. Verify and try again.")
        setFpMessageType("error")
      }
    } catch {
      setFpMessage("Unable to verify record. Check connection.")
      setFpMessageType("error")
    } finally {
      setFpLoading(false)
    }
  }

  async function handleSendRecovery() {
    setFpLoading(true)
    setFpMessage("")
    setFpMessageType("")
    try {
      const email = fpContactEmail || generateEmail(fpServiceNum.trim())
      await sendPasswordResetEmail(auth, email)
      setFpMessage("Password reset email sent. Check your inbox (and spam folder).")
      setFpMessageType("success")
      setFpStep(3)
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setFpMessage("No account found for this service number.")
        setFpMessageType("error")
      } else {
        try {
          await addDoc(collection(db, "password_resets"), {
            serviceNumber: fpServiceNum.trim(),
            officerName: fpOfficerName,
            contactEmail: fpContactEmail,
            status: "pending",
            requestedAt: serverTimestamp(),
          })
          setFpMessage("Recovery request submitted. An admin will process it shortly.")
          setFpMessageType("success")
          setFpStep(3)
        } catch {
          setFpMessage("Failed to submit request. Try again.")
          setFpMessageType("error")
        }
      }
    } finally {
      setFpLoading(false)
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      let email = loginUser.trim()
      if (!email.includes("@")) {
        email = generateEmail(email)
      }
      await signInWithEmailAndPassword(auth, email, loginPass)
      navigate("/dashboard", { replace: true })
    } catch (err: any) {
      switch (err.code) {
        case "auth/invalid-credential":
          setError("Invalid credentials. Verify your Service Number or Admin email.")
          break
        case "auth/too-many-requests":
          setError("Access temporarily locked. Try again later.")
          break
        default:
          setError("Authentication error. Contact support.")
      }
    } finally {
      setLoading(false)
    }
  }

  if (guardLoading) {
    return (
      <div className="authGuardLoader">
        <div className="spinner" />
        <p>Authenticating Command...</p>
      </div>
    )
  }

  return (
    <div className="overlay">
      <div className="form-section">
        <div className="form-container">
          <img src="/logo.png" alt="CADET-I" className="form-logo" />
          <h2>SECURE PORTAL</h2>
          <p className="subtitle">Official Personnel Authorization</p>

          <form id="loginForm" onSubmit={handleLogin}>
            <div className="input-group">
              <i className="fas fa-id-card input-icon" />
              <input
                type="text"
                placeholder="Service Number or Admin Email"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                disabled={loading}
              />
            </div>
            <span className="input-hint">Officers: Use CAD/XX/XXX/... | Admins: Use email</span>

            <div className="input-group">
              <i className="fas fa-lock input-icon" />
              <input
                type={showPass ? "text" : "password"}
                placeholder="Password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                disabled={loading}
              />
              <span className="toggle-pass" onClick={() => setShowPass(!showPass)}>
                <i className={`fas ${showPass ? "fa-eye-slash" : "fa-eye"}`} />
              </span>
            </div>

            <button type="submit" id="loginBtn" className={loading ? "loading" : ""} disabled={loading}>
              <span className="btn-text">SIGN IN</span>
              <span className="spinner" />
            </button>

            {error && (
              <div className="status-box" style={{ background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" }}>
                <i className="fas fa-exclamation-circle" style={{ marginRight: 8 }} />
                {error}
              </div>
            )}
          </form>

          <div className="auth-footer">
            <p>
              Need access? <Link to="/signup">Activate Portal</Link>
            </p>
            <button className="link-btn" onClick={() => setShowModal(true)}>
              Forgot Password?
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay-auth" onClick={resetForgotPassword}>
          <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="auth-modal-header">
              <h3>Password Recovery</h3>
              <button onClick={resetForgotPassword}>&times;</button>
            </div>

            {fpStep === 1 && (
              <div className="auth-modal-body">
                <p style={{ color: "#667085", fontSize: 13, marginBottom: 4 }}>Enter your service number to verify your identity.</p>
                <div className="input-group">
                  <i className="fas fa-search input-icon" />
                  <input
                    type="text"
                    placeholder="Enter Service Number"
                    value={fpServiceNum}
                    onChange={(e) => setFpServiceNum(e.target.value)}
                    disabled={fpLoading}
                  />
                </div>
                <button
                  id="verifyForgotBtn"
                  className={fpLoading ? "loading" : ""}
                  onClick={handleVerifyRecord}
                  disabled={fpLoading}
                >
                  <span className="btn-text">Verify Record</span>
                  <span className="spinner" />
                </button>
              </div>
            )}

            {fpStep === 2 && (
              <div className="auth-modal-body">
                <div id="forgotDetails" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: 16, marginBottom: 12 }}>
                  <p style={{ fontWeight: 700, color: "#166534" }}>{fpOfficerName}</p>
                  {fpContactEmail && <p style={{ color: "#166534", fontSize: 13 }}>{fpContactEmail}</p>}
                </div>
                <button
                  id="submitForgotBtn"
                  className={fpLoading ? "loading" : ""}
                  onClick={handleSendRecovery}
                  disabled={fpLoading}
                >
                  <span className="btn-text">Send Recovery Request</span>
                  <span className="spinner" />
                </button>
              </div>
            )}

            {fpStep === 3 && (
              <div className="auth-modal-body">
                <div className={`status-box ${fpMessageType === "success" ? "success-box-inline" : ""}`}
                  style={
                    fpMessageType === "success"
                      ? { background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }
                      : { background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" }
                  }
                >
                  {fpMessageType === "success" && <i className="fas fa-check-circle" style={{ marginRight: 8 }} />}
                  {fpMessage}
                </div>
              </div>
            )}

            {fpMessage && fpStep !== 3 && (
              <div className="status-box"
                style={
                  fpMessageType === "success"
                    ? { background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", marginTop: 12 }
                    : { background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", marginTop: 12 }
                }
              >
                {fpMessageType === "success" && <i className="fas fa-check-circle" style={{ marginRight: 8 }} />}
                {fpMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
