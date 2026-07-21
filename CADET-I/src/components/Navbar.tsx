import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    document.body.classList.remove("mobile-nav-open");
  }, [location]);

  const isHome = location.pathname === "/";

  function toggleMenu() {
    const next = !menuOpen;
    setMenuOpen(next);
    document.body.classList.toggle("mobile-nav-open", next);
  }

  function closeMenu() {
    setMenuOpen(false);
    document.body.classList.remove("mobile-nav-open");
  }

  function toggleDropdown(name: string) {
    if (window.innerWidth <= 1024) {
      setActiveDropdown(activeDropdown === name ? null : name);
    }
  }

  return (
    <header className={`navbar ${scrolled ? "scrolled" : ""}`} id="mainNavbar">
      <Link to="/" className="logo-title">
        <img src="/logo.png" alt="CADETI Logo" />
        <div className="org-name">
          <span>COMMUNITY AMBASSADOR</span>
          <span>FOR DEVELOPMENTAL AND ENGAGEMENT</span>
          <span>TECHNIQUES INITIATIVE</span>
          <span className="Last_Child">(C.A.D.E.T.I.)</span>
        </div>
      </Link>

      <button className="menu-btn" id="menuBtn" onClick={toggleMenu}>
        <i className={`fa-solid ${menuOpen ? "fa-xmark" : "fa-bars"}`}></i>
      </button>

      <nav className={`icon-nav ${menuOpen ? "active" : ""}`} id="navLinks">
        <Link to="/" className="nav-link" onClick={closeMenu}>
          <i className="fa-solid fa-house"></i> <span>Home</span>
        </Link>
        <Link to="/about" className="nav-link" onClick={closeMenu}>
          <i className="fa-solid fa-circle-info"></i> <span>About</span>
        </Link>
        <Link to="/recruit-reg" className="nav-link cta-link" onClick={closeMenu}>
          <i className="fa-solid fa-user-plus"></i> <span>Join Cadet</span>
        </Link>

        <div className={`nav-dropdown ${activeDropdown === "portal" ? "active" : ""}`}>
          <a href="#" className="nav-link drop-trigger" onClick={(e) => { e.preventDefault(); toggleDropdown("portal"); }}>
            <i className="fa-solid fa-shield-halved"></i> <span>Portal</span> <i className="fa-solid fa-chevron-down chevron"></i>
          </a>
          <div className="dropdown-content">
            <Link to="/member-validation" onClick={closeMenu}><i className="fa-solid fa-check-double"></i> Member Validation</Link>
            <Link to="/member-revalidation" onClick={closeMenu}><i className="fa-solid fa-user-clock"></i> Member Revalidation</Link>
            <Link to="/login" onClick={closeMenu}><i className="fa-solid fa-right-to-bracket"></i> Officer Login</Link>
          </div>
        </div>

        <div className={`nav-dropdown ${activeDropdown === "media" ? "active" : ""}`}>
          <a href="#" className="nav-link drop-trigger" onClick={(e) => { e.preventDefault(); toggleDropdown("media"); }}>
            <i className="fa-solid fa-newspaper"></i> <span>Media & Pubs</span> <i className="fa-solid fa-chevron-down chevron"></i>
          </a>
          <div className="dropdown-content">
            <Link to="/news" onClick={closeMenu}><i className="fa-solid fa-bullhorn"></i> News</Link>
            <Link to="/events" onClick={closeMenu}><i className="fa-solid fa-calendar-days"></i> Events</Link>
            <Link to="/gallery" onClick={closeMenu}><i className="fa-solid fa-images"></i> Photo Gallery</Link>
            <Link to="/publications" onClick={closeMenu}><i className="fa-solid fa-book-open"></i> Articles & Columns</Link>
          </div>
        </div>

        <Link to="/contact" className="nav-link" onClick={closeMenu}>
          <i className="fa-solid fa-envelope"></i> <span>Contact</span>
        </Link>
      </nav>
    </header>
  );
}
