import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { user, loading: authLoading, login, loginWithGoogle } = useAuth();

  useEffect(() => {
    document.body.classList.add("auth-page")
    return () => document.body.classList.remove("auth-page")
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      switch (err.code) {
        case "auth/popup-blocked":
          setError("Pop-up was blocked. Allow pop-ups for this site and try again.");
          break;
        case "auth/popup-closed-by-user":
          setError("Sign-in cancelled. Try again or use email/password.");
          break;
        case "auth/unauthorized-domain":
          setError("This domain is not authorized for Google sign-in. Contact the admin.");
          break;
        case "auth/operation-not-allowed":
          setError("Google sign-in is not enabled. Contact the admin or use email/password.");
          break;
        case "auth/account-exists-with-different-credential":
          setError("An account already exists with this email using a different sign-in method.");
          break;
        default:
          setError(`Google sign-in failed${err.code ? ` (${err.code})` : ""}. Try email/password instead.`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="authGuardLoader">
        <div className="spinner" />
        <p>Authenticating Command...</p>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="overlay">
      <div className="form-section">
        <div className="form-container">
          <img src="/logo.png" alt="CADET-I" className="form-logo" />
          <h2>ADMIN PORTAL</h2>
          <p className="subtitle">Authorized Personnel Only</p>

          <form id="loginForm" onSubmit={handleSubmit}>
            <div className="input-group">
              <i className="fas fa-envelope input-icon" />
              <input
                type="email"
                required
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="input-group">
              <i className="fas fa-lock input-icon" />
              <input
                type={showPass ? "text" : "password"}
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            <div className="divider-row">
              <span className="divider-line" />
              <span className="divider-text">or continue with</span>
              <span className="divider-line" />
            </div>

            <button onClick={handleGoogle} className="google-btn" disabled={loading}>
              <svg className="google-icon" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.54 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.99 23.99 0 0 0 0 24c0 3.77.87 7.35 2.56 10.56l7.98-5.97z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 5.97C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
