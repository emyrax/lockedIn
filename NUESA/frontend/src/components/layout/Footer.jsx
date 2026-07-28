import { Link } from 'react-router-dom';
import GearDecoration from '../common/GearDecoration';

const quickLinks = [
  { to: '/about', label: 'About' },
  { to: '/departments', label: 'Departments' },
  { to: '/news', label: 'News' },
  { to: '/events', label: 'Events' },
  { to: '/projects', label: 'Projects' },
];

const studentLinks = [
  { to: '/elections', label: 'Elections' },
  { to: '/alumni', label: 'Alumni Directory' },
  { to: '/jobs', label: 'Job Board' },
  { to: '/projects/submit', label: 'Submit Project' },
  { to: '/contact', label: 'Contact' },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden" style={{ background: 'var(--emerald-dark)' }}>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(217,119,6,0.06) 0%, transparent 30%, transparent 70%, rgba(217,119,6,0.04) 100%)' }} />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <GearDecoration size="small" color="gold" className="absolute top-4 right-6 opacity-20" />
      <GearDecoration size="medium" color="gold" className="absolute bottom-4 left-6 opacity-15" />
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(217,119,6,0.7), rgba(217,119,6,0.3), transparent)' }} />
      <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(217,119,6,0.5), rgba(5,150,105,0.3), transparent)' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-white/15 flex items-center justify-center">
                <img src="/images/logo.png" alt="NUESA" className="h-6 w-auto brightness-0 invert" onError={e => { e.target.style.display = 'none' }} />
              </div>
              <div>
                <div className="text-sm font-bold tracking-wide text-white">NUESA UNN</div>
                <div className="text-[10px] font-medium tracking-wider uppercase text-white/50">Faculty of Engineering</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-white/70 max-w-xs">
              University of Nigeria, Nsukka. Bridging innovation and industry since 1964.
            </p>
            <div className="flex items-center gap-2 mt-6">
              {[
                { icon: 'fab fa-linkedin-in', href: '#' },
                { icon: 'fab fa-twitter', href: '#' },
                { icon: 'fab fa-instagram', href: '#' },
                { icon: 'fab fa-youtube', href: '#' },
              ].map((s, i) => (
                <a key={i} href={s.href}
                  className="h-8 w-8 rounded-full flex items-center justify-center text-xs transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.color = 'white' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}>
                  <i className={s.icon} />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h6 className="text-xs font-semibold tracking-wider uppercase mb-4" style={{ color: 'var(--gold)' }}>Quick Links</h6>
            <ul className="space-y-2.5">
              {quickLinks.map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-white/60 hover:text-white transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h6 className="text-xs font-semibold tracking-wider uppercase mb-4" style={{ color: 'var(--gold)' }}>Students</h6>
            <ul className="space-y-2.5">
              {studentLinks.map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-white/60 hover:text-white transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h6 className="text-xs font-semibold tracking-wider uppercase mb-4" style={{ color: 'var(--gold)' }}>Contact</h6>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2 text-sm text-white/60">
                <i className="fas fa-map-marker-alt mt-0.5" style={{ width: 14, color: 'var(--gold)' }} />
                <span>Nsukka, Enugu State, Nigeria</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-white/60">
                <i className="fas fa-envelope" style={{ width: 14, color: 'var(--gold)' }} />
                <a href="mailto:info@nuesaunn.ng" className="text-white/60 hover:text-white transition-colors">info@nuesaunn.ng</a>
              </li>
              <li className="flex items-center gap-2 text-sm text-white/60">
                <i className="fas fa-globe" style={{ width: 14, color: 'var(--gold)' }} />
                <span>nuesaunn.ng</span>
              </li>
            </ul>
            <div className="mt-6">
              <a href="#sponsor"
                className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-200"
                style={{ background: 'var(--gold)', color: 'white' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(217,119,6,0.35)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}>
                <i className="fas fa-handshake" /> Partner With Us
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 text-center" style={{ borderTop: '1px solid rgba(217,119,6,0.12)' }}>
          <p className="text-xs text-white/40">
            Built with <span style={{ color: 'var(--gold)' }}>&#9829;</span> by the NUESA UNN Team &mdash; &copy; {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
