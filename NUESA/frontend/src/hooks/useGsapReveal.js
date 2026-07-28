import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useGsapReveal(ref, options = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { type = 'fadeUp', delay = 0, duration = 0.8, stagger = 0, trigger, start = 'top 85%' } = options;
    const children = el.children;

    const ctx = gsap.context(() => {
      if (type === 'explode') {
        gsap.set(children, { opacity: 0, scale: 0.3, x: gsap.utils.random(-80, 80, true), y: gsap.utils.random(-80, 80, true) });
        ScrollTrigger.create({
          trigger: trigger || el,
          start,
          onEnter: () => {
            gsap.to(children, {
              opacity: 1, scale: 1, x: 0, y: 0,
              duration, delay, stagger: stagger || 0.08,
              ease: 'back.out(1.7)',
            });
          },
          once: true,
        });
      } else if (type === 'particleBurst') {
        const particles = el.querySelectorAll('.particle');
        gsap.set(particles, { opacity: 0, scale: 0 });
        ScrollTrigger.create({
          trigger: trigger || el,
          start,
          onEnter: () => {
            particles.forEach((p, i) => {
              const angle = (i / particles.length) * 360;
              const dist = gsap.utils.random(40, 120);
              gsap.to(p, {
                opacity: 1, scale: 1, x: Math.cos(angle) * dist, y: Math.sin(angle) * dist,
                duration: 0.6, delay: delay + i * 0.03, ease: 'back.out(2)',
              });
            });
          },
          once: true,
        });
      } else if (type === 'staggerScale') {
        gsap.set(children, { opacity: 0, scale: 0.5, rotateX: 15 });
        ScrollTrigger.create({
          trigger: trigger || el,
          start,
          onEnter: () => {
            gsap.to(children, {
              opacity: 1, scale: 1, rotateX: 0,
              duration, delay, stagger: stagger || 0.06,
              ease: 'elastic.out(1, 0.5)',
            });
          },
          once: true,
        });
      } else if (type === 'slideBlast') {
        gsap.set(children, { opacity: 0, x: (i) => (i % 2 === 0 ? -120 : 120), scale: 0.8 });
        ScrollTrigger.create({
          trigger: trigger || el,
          start,
          onEnter: () => {
            gsap.to(children, {
              opacity: 1, x: 0, scale: 1,
              duration: 0.7, delay, stagger: stagger || 0.07,
              ease: 'power4.out',
            });
          },
          once: true,
        });
      } else {
        gsap.set(children.length ? children : el, { opacity: 0, y: 30 });
        ScrollTrigger.create({
          trigger: trigger || el,
          start,
          onEnter: () => {
            gsap.to(children.length ? children : el, {
              opacity: 1, y: 0, duration, delay, stagger: stagger || 0.05, ease: 'power3.out',
            });
          },
          once: true,
        });
      }
    });

    return () => ctx.revert();
  }, [ref, options.type, options.delay, options.duration, options.stagger, options.start]);
}

export function useGsapExplosion(ref, options = {}) {
  const { trigger, start = 'top 85%', duration = 0.8, particles = false } = options;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.set(el.children, { opacity: 0, scale: 0.3 });
      if (particles) {
        for (let i = 0; i < 12; i++) {
          const dot = document.createElement('div');
          dot.className = 'particle';
          Object.assign(dot.style, {
            position: 'absolute', width: 4, height: 4, borderRadius: '50%',
            background: i % 2 === 0 ? 'var(--emerald)' : 'var(--gold)',
            pointerEvents: 'none',
          });
          el.appendChild(dot);
        }
      }
      ScrollTrigger.create({
        trigger: trigger || el,
        start,
        onEnter: () => {
          gsap.to(el.children, {
            opacity: 1, scale: 1, duration, stagger: 0.06, ease: 'back.out(2)',
          });
        },
        once: true,
      });
    });
    return () => ctx.revert();
  }, [ref, trigger, start, duration, particles]);
}
