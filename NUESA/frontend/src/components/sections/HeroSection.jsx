import { useRef, useEffect } from 'react';
import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import GearDecoration from '../common/GearDecoration';

gsap.registerPlugin(ScrollTrigger);

const HeroCanvas = lazy(() => import('../hero/HeroCanvas'));
const HeroFloatingElements = lazy(() => import('../hero/HeroFloatingElements'));

const bgGears = (() => {
  const gears = [];
  const pairs = [
    { size: 'xxl', top: '10%', left: '2%' },
    { size: 'xl', top: '5%', right: '5%' },
    { size: 'xl', bottom: '8%', left: '8%' },
    { size: 'xxl', bottom: '5%', right: '3%' },
    { size: 'large', top: '35%', left: '0%' },
    { size: 'large', top: '25%', right: '1%' },
    { size: 'large', bottom: '30%', left: '3%' },
    { size: 'large', bottom: '35%', right: '2%' },
    { size: 'medium', top: '50%', left: '30%' },
    { size: 'medium', top: '45%', right: '25%' },
    { size: 'medium', bottom: '50%', left: '45%' },
    { size: 'medium', bottom: '40%', right: '40%' },
    { size: 'small', top: '15%', left: '35%' },
    { size: 'small', top: '18%', right: '30%' },
    { size: 'small', bottom: '15%', left: '55%' },
    { size: 'small', bottom: '12%', right: '50%' },
    { size: 'xxl', top: '60%', left: '0%' },
    { size: 'xl', top: '0%', right: '35%' },
    { size: 'xl', bottom: '0%', left: '30%' },
    { size: 'xxl', top: '75%', right: '0%' },
  ];
  const colors = ['#ea580c', '#f97316', '#059669', '#34d399', '#fdba74'];
  pairs.forEach((p, i) => {
    gears.push({
      ...p,
      color: colors[i % colors.length],
      opacity: 0.06 + (i % 4) * 0.04,
    });
  });
  return gears;
})();

export default function HeroSection({ content }) {
  const c = content || {};
  const headline = c.headline || 'WELCOME TO ENGINEERING';
  const subtitle = c.subtitle || 'Engineering the Future, from Nigeria to the World.';
  const ctaPrimary = c.cta_primary || { text: 'Explore Departments', link: '#departments' };
  const ctaSecondary = c.cta_secondary || { text: 'Partner With Us', link: '#sponsor' };
  const statsRef = useRef(null);

  useEffect(() => {
    if (!statsRef.current) return;
    const ctx = gsap.context(() => {
      const items = statsRef.current.querySelectorAll('.stat-item');
      const counters = statsRef.current.querySelectorAll('.stat-value');

      gsap.set(items, { opacity: 0, scale: 0.3, x: gsap.utils.random(-40, 40, true) });

      counters.forEach(el => {
        const raw = el.getAttribute('data-target') || '0';
        const parsed = parseInt(raw);
        const suffix = el.getAttribute('data-suffix') || '';
        const obj = { val: 0 };
        gsap.to(obj, {
          val: parsed,
          duration: 1.8,
          ease: 'power3.out',
          onUpdate: () => {
            el.textContent = Math.round(obj.val) + suffix;
          },
          scrollTrigger: {
            trigger: statsRef.current,
            start: 'top 90%',
          },
        });
      });

      ScrollTrigger.create({
        trigger: statsRef.current,
        start: 'top 90%',
        onEnter: () => {
          gsap.to(items, {
            opacity: 1, scale: 1, x: 0,
            duration: 0.8, stagger: 0.12,
            ease: 'back.out(1.7)',
          });
        },
        once: true,
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <header
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background: 'var(--bg)',
        backgroundImage: `
          radial-gradient(ellipse at 30% 20%, rgba(234,88,12,0.08) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 80%, rgba(5,150,105,0.05) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, rgba(234,88,12,0.03) 0%, transparent 60%)
        `,
      }}
    >
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `
          radial-gradient(circle at 25% 35%, #ea580c 1px, transparent 1px),
          radial-gradient(circle at 75% 65%, #059669 1px, transparent 1px)
        `,
        backgroundSize: '36px 36px, 28px 28px',
      }} />

      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(234,88,12,0.12) 50px, rgba(234,88,12,0.12) 51px),
          repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(234,88,12,0.12) 50px, rgba(234,88,12,0.12) 51px)
        `,
      }} />

      {bgGears.map((g, i) => (
        <GearDecoration
          key={i}
          size={g.size}
          color={g.color}
          style={{
            position: 'absolute',
            top: g.top,
            left: g.left,
            right: g.right,
            bottom: g.bottom,
            opacity: g.opacity,
          }}
        />
      ))}

      <Suspense fallback={null}><HeroCanvas /></Suspense>
      <Suspense fallback={null}><HeroFloatingElements /></Suspense>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-6" style={{ background: 'rgba(234,88,12,0.08)', color: '#ea580c' }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#ea580c' }} />
              Faculty of Engineering — UNN
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-heading font-bold leading-[1.05] tracking-tight"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: 'var(--emerald)' }}
          >
            {headline}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 text-lg md:text-xl leading-relaxed"
            style={{ color: 'var(--text-muted)', maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}
          >
            {subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <a href={ctaSecondary.link} className="btn-nuesa btn-primary text-base !px-6 !py-3.5 shadow-lg" style={{ boxShadow: '0 4px 20px rgba(234,88,12,0.25)' }}>
              <i className="fas fa-handshake" />{ctaSecondary.text}
            </a>
            <a href={ctaPrimary.link} className="btn-nuesa text-base !px-6 !py-3.5" style={{ background: 'rgba(255,255,255,0.7)', color: 'var(--emerald)', border: '1px solid rgba(5,150,105,0.2)' }}>
              {ctaPrimary.text} <i className="fas fa-arrow-right text-sm" />
            </a>
          </motion.div>
        </div>

        <div ref={statsRef} className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {[
            { target: '60', suffix: '+', label: 'Years of Excellence', color: 'var(--emerald)' },
            { target: '25', suffix: 'k+', label: 'Alumni Worldwide', color: '#ea580c' },
            { target: '10', suffix: '', label: 'Departments', color: 'var(--emerald)' },
            { target: '500', suffix: '+', label: 'Research Projects', color: '#ea580c' },
          ].map((s, i) => (
            <div key={i} className="stat-item flex items-center gap-4">
              <div className="text-center">
                <div className="font-bold text-2xl lg:text-3xl" style={{ color: s.color }}>
                  <span className="stat-value" data-target={s.target} data-suffix={s.suffix}>0</span>
                </div>
                <div className="text-xs font-medium" style={{ color: 'var(--text-light)' }}>{s.label}</div>
              </div>
              {i < 3 && <div className="hidden sm:block w-px h-6" style={{ background: i % 2 === 0 ? 'rgba(5,150,105,0.15)' : 'rgba(234,88,12,0.15)' }} />}
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
