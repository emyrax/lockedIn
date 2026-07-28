import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import EngineeringToolReveal from '../common/EngineeringToolReveal';

gsap.registerPlugin(ScrollTrigger);

export default function PageShell({
  title,
  subtitle,
  children,
  className = '',
  dark = false,
  adminLink,
  adminLabel,
  toolIndex,
  showTool = true,
  maxWidth,
}) {
  const headerRef = useRef(null);

  useEffect(() => {
    if (!headerRef.current) return;
    const ctx = gsap.context(() => {
      const els = headerRef.current.children;
      gsap.set(els, { opacity: 0, y: 30 });
      ScrollTrigger.create({
        trigger: headerRef.current,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(els, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' });
        },
        once: true,
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className={`relative ${dark ? 'bg-nuesa-dark text-white' : ''} ${className}`}>
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(90deg, var(--gold), var(--emerald), var(--gold))' }} />
      {showTool && toolIndex !== undefined && (
        <EngineeringToolReveal index={toolIndex} style={{ top: '5%', left: '3%' }} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16" style={maxWidth ? { maxWidth } : {}}>
        <div ref={headerRef}>
          {title && (
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-2">
              <div>
                <h1 className="font-heading font-bold leading-tight" style={{
                  fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                  color: 'var(--emerald)',
                }}>
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-1.5 text-sm md:text-base" style={{ color: 'var(--text-muted)' }}>
                    {subtitle}
                  </p>
                )}
              </div>
              {adminLink && (
                <Link to={adminLink} className="btn-nuesa btn-primary text-xs flex-shrink-0">
                  <i className="fas fa-cog" />{adminLabel || 'Manage'}
                </Link>
              )}
            </div>
          )}
          <div className="flex items-center gap-2 mt-3 mb-8">
            <div className="h-0.5 w-16 rounded-full" style={{ background: 'var(--gold)' }} />
            <div className="h-0.5 w-8 rounded-full" style={{ background: 'linear-gradient(90deg, var(--gold), transparent)' }} />
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
