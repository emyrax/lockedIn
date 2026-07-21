import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db, GOOGLE_SHEETS_API, generateEmail } from "../config/firebase"
import { useAuth } from "../contexts/AuthContext"

export default function Signup() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [signupServiceNum, setSignupServiceNum] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [guardLoading] = useState(false)

  if (user) {
    navigate("/dashboard", { replace: true })
    return null
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setMessage("")

    if (!signupServiceNum.trim()) {
      setMessage("Enter your official Service Number.")
      return
    }

    if (signupPassword.length < 8) {
      setMessage("Password must be at least 8 characters.")
      return
    }

    if (signupPassword !== confirmPassword) {
      setMessage("Passwords do not match.")
      return
    }

    setLoading(true)

    try {
      const verifyRes = await fetch(
        `${GOOGLE_SHEETS_API}?action=searchByServiceNumber&serviceNumber=${encodeURIComponent(signupServiceNum.trim())}`
      )
      const sheetData = await verifyRes.json()

      if (!sheetData.found) {
        setMessage("Service Number not found in personnel records. Verify and try again.")
        setLoading(false)
        return
      }

      const email = generateEmail(signupServiceNum.trim())

      const userCred = await createUserWithEmailAndPassword(auth, email, signupPassword)
      const uid = userCred.user.uid

      await setDoc(doc(db, "users", uid), {
        serviceNumber: signupServiceNum.trim(),
        name: sheetData.name || "",
        rank: sheetData.rank || "",
        unit: sheetData.unit || "",
        email: sheetData.email || email,
        role: "officer",
        activatedAt: serverTimestamp(),
      })

      sessionStorage.setItem("auth_session", "active")

      setMessage("Portal activated. Redirecting to Command Dashboard...")
      setTimeout(() => {
        navigate("/dashboard", { replace: true })
      }, 2500)
    } catch (err: any) {
      switch (err.code) {
        case "auth/email-already-in-use":
          setMessage("This Service Number is already registered. Proceed to login.")
          break
        case "auth/weak-password":
          setMessage("Password too weak. Use a stronger password.")
          break
        default:
          setMessage(`Activation failed: ${err.message || "Unknown error"}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="overlay">
      {guardLoading && (
        <div className="authGuardLoader">
          <div className="spinner" />
          <p>Authenticating Command...</p>
        </div>
      )}

      <div className="form-section">
        <div className="form-container">
          <img src="/logo.png" alt="CADET-I" className="logo" />
          <h1 className="title">PORTAL ACTIVATION</h1>
          <p className="subtitle">Initialize your secure officer access</p>

          <form onSubmit={handleSignup}>
            <div className="input-group">
              <input
                type="text"
                placeholder="Official Service Number (CAD/...)"
                value={signupServiceNum}
                onChange={(e) => setSignupServiceNum(e.target.value)}
                disabled={loading}
              />
              <span className="hint">
                Must match your assigned Service Number exactly.
              </span>
            </div>

            <div className="input-group">
              <input
                type="password"
                placeholder="Create Password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="input-group">
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : "ACTIVATE PORTAL"}
            </button>

            {message && (
              <div className={message.includes("Redirecting") ? "success-message" : "error-message"}>
                {message}
              </div>
            )}
          </form>

          <div className="auth-footer">
            <p>
              Already activated? <Link to="/login">Access Portal</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
