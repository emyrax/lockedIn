import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/admin/dashboard");
    } catch {
      setError("Invalid email or password");
    }
  };

  const handleGoogle = async () => {
    setError("");
    try {
      await loginWithGoogle();
      navigate("/admin/dashboard");
    } catch {
      setError("Google sign-in failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-green-950">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-green-800">CADET I</h1>
          <p className="mt-1 text-sm text-gray-500">Enugu Nsukka Chapter</p>
          <p className="mt-4 text-lg font-semibold text-gray-700">Admin Login</p>
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
              placeholder="admin@cadet-i.org"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-green-700 py-2.5 font-semibold text-white transition hover:bg-green-600"
          >
            Sign In
          </button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-300" />
          <span className="text-sm text-gray-400">or</span>
          <div className="h-px flex-1 bg-gray-300" />
        </div>

        <button
          onClick={handleGoogle}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-100"
        >
          <svg className="h-5 w-5" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.54 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.99 23.99 0 0 0 0 24c0 3.77.87 7.35 2.56 10.56l7.98-5.97z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 5.97C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
