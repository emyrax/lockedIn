import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../stores/auth';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/departments', label: 'Departments' },
  { to: '/news', label: 'News' },
  { to: '/events', label: 'Events' },
  { to: '/projects', label: 'Projects' },
  { to: '/alumni', label: 'Alumni' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300`}
      style={{
        background: scrolled ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid rgba(217,119,6,0.1)' : '1px solid transparent',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
            <div className="h-10 w-10 rounded-lg bg-[var(--emerald)] flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <img src="/images/logo.png" alt="NUESA" className="h-6 w-auto brightness-0 invert" onError={(e) => { e.target.style.display = 'none' }} />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-bold tracking-wide" style={{ color: 'var(--emerald)' }}>NUESA UNN</div>
              <div className="text-[10px] font-medium tracking-wider uppercase" style={{ color: 'var(--text-light)' }}>Faculty of Engineering</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="relative px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
                  style={{ color: active ? 'var(--gold)' : 'var(--text)' }}
                >
                  {link.label}
                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                      style={{ background: 'var(--gold)' }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}

            <div className="ml-3 pl-3" style={{ borderLeft: '1px solid var(--border)' }}>
              {user ? (
                <div className="flex items-center gap-2">
                  {isAdmin() && (
                    <Link to="/admin" className="btn-nuesa btn-ghost text-xs !py-1.5 !px-3">
                      <i className="fas fa-cog text-xs" />Admin
                    </Link>
                  )}
                  <Link to="/dashboard" className="btn-nuesa btn-ghost text-xs !py-1.5 !px-3">
                    <i className="fas fa-user text-xs" style={{ color: 'var(--emerald)' }} />{user.full_name?.split(' ')[0]}
                  </Link>
                  <button onClick={logout} className="btn-nuesa btn-ghost text-xs !py-1.5 !px-3">
                    <i className="fas fa-sign-out-alt text-xs" />Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="btn-nuesa btn-ghost text-xs !py-1.5 !px-3">
                    <i className="fa-solid fa-right-to-bracket text-xs" />Login
                  </Link>
                  <a href="#sponsor" className="btn-nuesa btn-primary text-xs !py-1.5 !px-4">
                    <i className="fas fa-handshake text-xs" />Sponsor Us
                  </a>
                </div>
              )}
            </div>
          </nav>

          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: 'var(--text)' }}
            aria-label="Toggle menu"
          >
            <div className="w-5 h-4 relative flex flex-col justify-between">
              <span className={`block h-0.5 w-full rounded transition-all duration-300 ${open ? 'rotate-45 translate-y-[7px]' : ''}`} style={{ background: 'var(--text)' }} />
              <span className={`block h-0.5 w-full rounded transition-all duration-300 ${open ? 'opacity-0' : ''}`} style={{ background: 'var(--text)' }} />
              <span className={`block h-0.5 w-full rounded transition-all duration-300 ${open ? '-rotate-45 -translate-y-[7px]' : ''}`} style={{ background: 'var(--text)' }} />
            </div>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="lg:hidden overflow-hidden border-t border-gray-100"
            style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)' }}
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => {
                const active = isActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      color: active ? 'var(--gold)' : 'var(--text)',
                      background: active ? 'rgba(217,119,6,0.06)' : 'transparent',
                    }}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <hr className="my-3" style={{ borderColor: 'var(--border)' }} />
              {user ? (
                <div className="space-y-2">
                  {isAdmin() && (
                    <Link to="/admin" className="btn-nuesa btn-ghost w-full justify-center text-xs">Admin</Link>
                  )}
                  <Link to="/dashboard" className="btn-nuesa btn-ghost w-full justify-center text-xs">
                    <i className="fas fa-user text-xs" style={{ color: 'var(--emerald)' }} /> Dashboard
                  </Link>
                  <button onClick={logout} className="btn-nuesa btn-ghost w-full justify-center text-xs">Logout</button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link to="/login" className="btn-nuesa btn-ghost w-full justify-center text-xs">Login</Link>
                  <a href="#sponsor" className="btn-nuesa btn-primary w-full justify-center text-xs">Sponsor Us</a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
