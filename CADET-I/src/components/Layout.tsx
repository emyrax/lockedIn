import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="flex items-center justify-between bg-green-800 px-6 py-3 text-white shadow">
        <div className="flex items-center gap-6">
          <Link to="/admin/dashboard" className="text-lg font-bold tracking-wide">
            CADET I
          </Link>
          <span className="text-sm text-green-200">Enugu Nsukka Chapter</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/admin/register"
            className="rounded bg-green-600 px-3 py-1.5 text-sm transition hover:bg-green-500"
          >
            + Register Cadet
          </Link>
          <button
            onClick={handleLogout}
            className="rounded bg-red-700 px-3 py-1.5 text-sm transition hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </nav>
      <main className="mx-auto max-w-6xl p-6">
        <Outlet />
      </main>
    </div>
  );
}
