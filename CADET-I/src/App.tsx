import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AdminRoute from "./components/AdminRoute";
import Layout from "./components/Layout";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import RegisterCadet from "./pages/RegisterCadet";
import EditCadet from "./pages/EditCadet";
import CadetDetails from "./pages/CadetDetails";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Layout />
              </AdminRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="register" element={<RegisterCadet />} />
            <Route path="edit/:id" element={<EditCadet />} />
          </Route>
          <Route path="/cadet/:cadetId" element={<CadetDetails />} />
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
