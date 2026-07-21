import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { signInWithEmailAndPassword } from "firebase/auth"
import { collection, addDoc, doc, getDoc, Timestamp, serverTimestamp } from "firebase/firestore"
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

  const [showModal, setShowModal] = useState(false)
  const [fpServiceNum, setFpServiceNum] = useState("")
  const [fpStep, setFpStep] = useState(1)
  const [fpOfficerName, setFpOfficerName] = useState("")
  const [fpContactEmail, setFpContactEmail] = useState("")
  const [fpLoading, setFpLoading] = useState(false)
  const [fpMessage, setFpMessage] = useState("")

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
  }

  async function handleVerifyRecord() {
    if (!fpServiceNum.trim()) {
      setFpMessage("Enter your service number.")
      return
    }
    setFpLoading(true)
    setFpMessage("")
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
      }
    } catch {
      setFpMessage("Unable to verify record. Check connection.")
    } finally {
      setFpLoading(false)
    }
  }

  async function handleSendRecovery() {
    setFpLoading(true)
    setFpMessage("")
    try {
      await addDoc(collection(db, "password_resets"), {
        serviceNumber: fpServiceNum.trim(),
        officerName: fpOfficerName,
        contactEmail: fpContactEmail,
        status: "pending",
        requestedAt: serverTimestamp(),
      })
      setFpMessage("Recovery request submitted. Check your email for further instructions.")
      setFpStep(3)
    } catch {
      setFpMessage("Failed to submit request. Try again.")
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
      sessionStorage.setItem("auth_session", "active")
      navigate("/dashboard", { replace: true })
    } catch (err: any) {
      switch (err.code) {
        case "auth/user-not-found":
        case "auth/invalid-credential":
          setError("Invalid credentials. Verify your Service Number or Admin email.")
          break
        case "auth/wrong-password":
          setError("Incorrect password.")
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
          <img src="/logo.png" alt="CADET-I" className="logo" />
          <h1 className="title">SECURE PORTAL</h1>
          <p className="subtitle">Official Personnel Authorization</p>

          <form id="loginForm" onSubmit={handleLogin}>
            <div className="input-group">
              <input
                type="text"
                placeholder="Service Number or Admin Email"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                disabled={loading}
              />
              <span className="hint">Officers: Use CAD/XX/XXX/... | Admins: Use email</span>
            </div>

            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : "SIGN IN"}
            </button>

            {error && <div className="error-message">{error}</div>}
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
            <button className="modal-close" onClick={resetForgotPassword}>
              &times;
            </button>

            <h2>Password Recovery</h2>

            {fpStep === 1 && (
              <>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Enter Service Number"
                    value={fpServiceNum}
                    onChange={(e) => setFpServiceNum(e.target.value)}
                    disabled={fpLoading}
                  />
                </div>
                <button
                  className="btn-primary"
                  onClick={handleVerifyRecord}
                  disabled={fpLoading}
                >
                  {fpLoading ? <span className="spinner" /> : "Verify Record"}
                </button>
              </>
            )}

            {fpStep === 2 && (
              <>
                <p className="fp-details">
                  <strong>{fpOfficerName}</strong>
                  {fpContactEmail && <> &mdash; {fpContactEmail}</>}
                </p>
                <button
                  className="btn-primary"
                  onClick={handleSendRecovery}
                  disabled={fpLoading}
                >
                  {fpLoading ? <span className="spinner" /> : "Send Recovery Request"}
                </button>
              </>
            )}

            {fpStep === 3 && (
              <p className="success-message">{fpMessage}</p>
            )}

            {fpMessage && fpStep !== 3 && (
              <div className="error-message">{fpMessage}</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
