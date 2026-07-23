import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import About from "./pages/About";
import RecruitReg from "./pages/RecruitReg";
import MemberValidation from "./pages/MemberValidation";
import MemberRevalidation from "./pages/MemberRevalidation";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import News from "./pages/News";
import Events from "./pages/Events";
import Publications from "./pages/Publications";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import SinglePost from "./pages/SinglePost";
import VerifyId from "./pages/VerifyId";

const publicPages = [
  "/", "/about", "/recruit-reg", "/member-validation", "/member-revalidation",
  "/news", "/events", "/publications", "/gallery", "/contact", "/view"
];

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function AppLayout() {
  const location = useLocation();
  const showExtras = publicPages.includes(location.pathname) || location.pathname.startsWith("/view");

  return (
    <AuthProvider>
      {showExtras && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/recruit-reg" element={<RecruitReg />} />
        <Route path="/member-validation" element={<MemberValidation />} />
        <Route path="/member-revalidation" element={<MemberRevalidation />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/news" element={<News />} />
        <Route path="/events" element={<Events />} />
        <Route path="/publications" element={<Publications />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/view" element={<SinglePost />} />
        <Route path="/verify-id" element={<VerifyId />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      {showExtras && <Footer />}
    </AuthProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppLayout />
    </BrowserRouter>
  );
}
