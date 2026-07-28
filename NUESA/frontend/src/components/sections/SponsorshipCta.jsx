import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import GearDecoration from '../common/GearDecoration';

export default function SponsorshipCta() {
  return (
    <section
      id="sponsor"
      className="relative overflow-hidden bg-dots"
      style={{
        background: 'linear-gradient(135deg, #047857 0%, #059669 40%, #b45309 70%, #92400e 100%)',
      }}
    >
      <div className="absolute top-0 left-1/4 right-1/4 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(217,119,6,0.5), transparent)' }} />
      <GearDecoration size="large" color="gold" className="absolute top-6 left-6 opacity-20" />
      <GearDecoration size="medium" color="gold" className="absolute bottom-6 right-8 opacity-25" />
      <GearDecoration size="small" color="gold" className="absolute top-1/2 right-4 opacity-15" />

      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }} />
      <div className="absolute" style={{ top: '20%', left: '15%', width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(217,119,6,0.08) 0%, transparent 70%)' }} />
      <div className="absolute" style={{ bottom: '15%', right: '20%', width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(217,119,6,0.06) 0%, transparent 70%)' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2
            className="font-heading font-bold text-white leading-tight"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}
          >
            Partner with Africa&apos;s Premier Engineering Faculty
          </h2>
          <p className="text-white/80 mt-4 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Access top talent, collaborate on research, and shape the future of innovation.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg text-sm font-semibold transition-all duration-300"
              style={{ background: 'white', color: 'var(--emerald)' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
            >
              <i className="fas fa-handshake" /> Become a Sponsor
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg text-sm font-semibold transition-all duration-300"
              style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.4)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'white' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)' }}
            >
              Partner With Us <i className="fas fa-arrow-right text-xs" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
