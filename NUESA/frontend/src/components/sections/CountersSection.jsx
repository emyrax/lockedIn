import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import EngineeringToolReveal from '../common/EngineeringToolReveal';
import SectionFloatingBg from '../common/SectionFloatingBg';

gsap.registerPlugin(ScrollTrigger);

export default function CountersSection({ content }) {
  const c = content || {};
  const items = c.items || [
    { target: '60', suffix: '+', label: 'Years of Excellence', icon: 'fa-building-columns' },
    { target: '25', suffix: 'k+', label: 'Alumni Worldwide', icon: 'fa-globe' },
    { target: '10', suffix: '', label: 'Departments', icon: 'fa-flask' },
    { target: '100', suffix: '+', label: 'Industry Partners', icon: 'fa-handshake' },
    { target: '500', suffix: '+', label: 'Research Projects', icon: 'fa-microscope' },
    { target: '50', suffix: '+', label: 'Startup Founders', icon: 'fa-rocket' },
  ];
  const gridRef = useRef(null);

  useEffect(() => {
    if (!gridRef.current) return;
    const ctx = gsap.context(() => {
      const cards = gridRef.current.querySelectorAll('.counter-card');
      gsap.set(cards, { opacity: 0, scale: 0.5, rotation: gsap.utils.random(-5, 5) });

      ScrollTrigger.create({
        trigger: gridRef.current,
        start: 'top 80%',
        onEnter: () => {
          gsap.to(cards, {
            opacity: 1, scale: 1, rotation: 0,
            duration: 0.6, stagger: 0.06,
            ease: 'back.out(1.7)',
            onComplete: () => {
              cards.forEach((card, i) => {
                const valueEl = card.querySelector('.counter-value');
                const raw = valueEl.getAttribute('data-target') || '0';
                const parsed = parseInt(raw);
                const suffix = valueEl.getAttribute('data-suffix') || '';
                const obj = { val: 0 };

                const tl = gsap.timeline({ delay: i * 0.5 });

                tl.to(card, {
                  scale: 1.15, y: -8,
                  boxShadow: '0 16px 40px rgba(217,119,6,0.15), 0 0 0 2px var(--gold)',
                  duration: 0.35,
                  ease: 'back.out(2)',
                });

                tl.to(obj, {
                  val: parsed,
                  duration: 1.2,
                  ease: 'power3.out',
                  onUpdate: () => {
                    valueEl.textContent = Math.round(obj.val) + suffix;
                  },
                }, '-=0.1');

                tl.to(card, {
                  scale: 1, y: 0,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  duration: 0.4,
                  ease: 'power2.inOut',
                });
              });
            },
          });
        },
        once: true,
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section className="relative bg-grid-engineering" style={{ backgroundColor: 'var(--bg-alt)', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
      <SectionFloatingBg />
      <div className="relative z-[2]">
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(217,119,6,0.15), transparent)' }} />
        <EngineeringToolReveal index={1} style={{ top: '8%', right: '5%' }} />
        <EngineeringToolReveal index={4} style={{ bottom: '8%', left: '5%' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {items.map((item, i) => (
              <div
                key={i}
                className="counter-card card-nuesa text-center p-5 lg:p-6"
                style={{ borderTop: i % 2 === 0 ? '3px solid var(--emerald)' : '3px solid var(--gold)', cursor: 'default', transition: 'box-shadow 0.3s' }}
              >
                <div className="mb-2">
                  <i className={`fas ${item.icon}`} style={{ fontSize: 22, color: i % 2 === 0 ? 'var(--emerald)' : 'var(--gold)', opacity: 0.5 }} />
                </div>
                <div className="font-bold" style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)' }}>
                  <span
                    className="counter-value"
                    data-target={item.target}
                    data-suffix={item.suffix}
                    style={{ color: i % 2 === 0 ? 'var(--emerald)' : 'var(--gold)' }}
                  >0</span>
                </div>
                <p className="text-xs font-medium mt-1.5 mb-0" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
